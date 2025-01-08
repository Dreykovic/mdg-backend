/**
 * AdminAuth.service.ts
 *
 * This file defines the AdminAuthService class, which provides methods for handling
 * user authentication and session management, including signing in, refreshing tokens,
 * retrieving active sessions, and logging out.
 *
 * Dependencies:
 * - Prisma ORM for database operations
 * - JWT utilities for token generation and validation
 * - Bcrypt for password hashing and verification
 * - TypeDI for dependency injection
 * - Lodash for object manipulation
 * - Configuration, logging, and date utilities
 */

import {
  AccessTokenPayload,
  ClientInfo,
  RefreshTokenPayload,
  UserLogin,
} from '@/core/types';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID function for generating unique identifiers
import { Service } from 'typedi';
import ServiceDefinition from '../definitions/service';
import BcryptUtil from '../../core/utils/bcrypt.util';
import _ from 'lodash';
import config from '@/config';
import JwtUtil from '@/core/utils/jwt.util';
import DateUtil from '@/core/utils/date.util';
import { log } from 'console';
import { Prisma } from '@prisma/client';

@Service()
export default class AdminAuthService extends ServiceDefinition {
  /**
   * Handles user login by verifying credentials, generating tokens, and returning session data.
   * @param data - The user login credentials (username and password).
   * @param clientInfo - Client metadata (IP address, user agent, etc.).
   * @returns An object containing access and refresh tokens along with user data.
   */
  async signIn(data: UserLogin, clientInfo: ClientInfo) {
    try {
      const cleanData = data;

      // Find the user by username
      const user = await this.db.user.findFirstOrThrow({
        where: { username: cleanData.username },
      });

      if (!user) {
        throw new Error('Username or password incorrect');
      }

      // Validate the user's password
      if (user.password && cleanData.password) {
        const isPwdCorrect = await BcryptUtil.comparePassword(
          cleanData.password,
          user.password
        );
        if (!isPwdCorrect) {
          throw new Error('Username or password incorrect');
        }
      }

      // Prepare token payloads
      const accessTokenPayload: AccessTokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        profiles: user.profiles.join(),
      };

      const tokenFamilyCreateData: Prisma.TokenFamilyUncheckedCreateInput = {
        family: uuidv4(),
        ...clientInfo,
        userId: user.id,
      };

      const tokenFamily = await this.createTokenFamily(tokenFamilyCreateData);

      const refreshTokenPayload: RefreshTokenPayload = {
        userId: user.id,
        profiles: user.profiles.join(),
      };

      // Generate tokens
      const userData = _.omit(user, ['password', 'profile']);
      const accessToken = JwtUtil.generateToken(accessTokenPayload);
      const refreshToken = await this.generateRefreshToken(
        null,
        tokenFamily.id,
        refreshTokenPayload
      );

      return { tokens: { accessToken, refreshToken }, userData };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handles refreshing tokens by validating the refresh token and generating new ones.
   * @param refreshToken - The refresh token to validate and replace.
   * @returns An object containing a new access token and refresh token.
   */
  async refreshToken(refreshToken: string) {
    try {
      log('Refresh Token received:', refreshToken);

      const result = await this.validateRefreshToken(refreshToken);
      const decoded = result.refreshTokenContent;
      const tokenRecord = result.adminToken;

      // Find the associated user
      const foundAdminUser = await this.db.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!foundAdminUser) {
        throw new Error('Unauthorized');
      }

      // Generate new tokens
      const newRefreshToken = await this.generateRefreshToken(
        tokenRecord.id,
        tokenRecord.familyId,
        decoded
      );

      const accessToken = JwtUtil.generateToken({
        userId: foundAdminUser.id,
        username: foundAdminUser.username,
        email: foundAdminUser.email,
        profiles: foundAdminUser.profiles.join(),
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Error ' + (error as Error).message);
    }
  }

  /**
   * Retrieves all active sessions for a given user.
   * @param userId - The ID of the user.
   * @returns A list of active sessions.
   */
  async getActiveSessions(userId: string) {
    try {
      const activeSessions = await this.db.tokenFamily.findMany({
        where: { userId, status: 'ACTIVE' },
      });
      return { activeSessions };
    } catch (error) {
      throw new Error(
        'Error retrieving active sessions: ' + (error as Error).message
      );
    }
  }

  /**
   * Logs out a single session by revoking the specified refresh token.
   * @param refreshToken - The refresh token to revoke.
   */
  async logout(refreshToken: string) {
    try {
      const adminToken = await this.db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!adminToken) {
        throw new Error('Token not found');
      }

      // Revoke tokens and associated family
      await this.db.refreshToken.updateMany({
        where: {
          OR: [{ id: adminToken.id }, { parentTokenId: adminToken.id }],
        },
        data: { status: 'REVOKED' },
      });

      await this.revokeTokenFamily(adminToken.familyId);
    } catch (error) {
      throw new Error('Error logging out: ' + (error as Error).message);
    }
  }

  /**
   * Logs out all sessions for a user by revoking all active token families.
   * @param userId - The ID of the user.
   * @returns A boolean indicating success.
   */
  async logoutAll(userId: string) {
    try {
      const activeFamilies = await this.db.tokenFamily.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });

      for (const activeFamily of activeFamilies) {
        await this.revokeTokenFamily(activeFamily.id);
      }

      return true;
    } catch (error) {
      throw new Error(
        'Error logging out all sessions: ' + (error as Error).message
      );
    }
  }

  /**
   * Creates a new token family and revokes old ones if the maximum number of connections is exceeded.
   * @param data - The data to create a token family.
   * @returns The newly created token family.
   */
  private async createTokenFamily(
    data: Prisma.TokenFamilyUncheckedCreateInput
  ) {
    try {
      const activeFamilies = await this.db.tokenFamily.findMany({
        where: { userId: data.userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });

      // Check if there are active families and if their count exceeds the max allowed
      if (activeFamilies && activeFamilies.length >= config.jwt.maxConnexions) {
        // Revoke the oldest family if necessary
        if (activeFamilies[0]) {
          await this.revokeTokenFamily(activeFamilies[0].id);
        }
      }

      return await this.db.tokenFamily.create({ data });
    } catch (error) {
      throw new Error(
        'Error creating token family: ' + (error as Error).message
      );
    }
  }

  /**
   * Revokes a token family and all associated tokens.
   * @param familyId - The ID of the token family to revoke.
   */
  private async revokeTokenFamily(familyId: number) {
    try {
      log('Revoke token family');

      await this.db.tokenFamily.update({
        where: { id: familyId },
        data: { status: 'REVOKED' },
      });

      // Revoke all associated refresh tokens
      await this.db.refreshToken.updateMany({
        where: { familyId },
        data: { status: 'REVOKED' },
      });
    } catch (error) {
      throw new Error(
        'Error revoking token family: ' + (error as Error).message
      );
    }
  }

  /**
   * Validates a refresh token and checks its status and expiration.
   * @param refreshToken - The refresh token to validate.
   * @returns The decoded token payload and associated database record.
   */
  private async validateRefreshToken(refreshToken: string) {
    try {
      const adminToken = await this.db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!adminToken) {
        throw new Error('Token not found');
      }

      if (adminToken.status !== 'ACTIVE') {
        await this.revokeTokenFamily(adminToken.familyId);
        throw new Error('Token is revoked or expired');
      }

      if (new Date(adminToken.expiresAt) < new Date()) {
        await this.revokeTokenFamily(adminToken.familyId);
        throw new Error('Token expired');
      }

      const refreshTokenContent: RefreshTokenPayload =
        JwtUtil.verifyRefreshToken(refreshToken);
      return { refreshTokenContent, adminToken };
    } catch (error) {
      throw new Error('Error validating token: ' + (error as Error).message);
    }
  }

  /**
   * Generates a new refresh token and revokes the parent token if specified.
   * @param parentTokenId - The ID of the parent token to revoke.
   * @param familyId - The ID of the token family.
   * @param payload - The refresh token payload.
   * @returns A new refresh token.
   */
  private async generateRefreshToken(
    parentTokenId: number | null,
    familyId: number,
    payload: RefreshTokenPayload
  ): Promise<string> {
    try {
      if (parentTokenId) {
        await this.db.refreshToken.update({
          where: { id: parentTokenId },
          data: { status: 'REVOKED' },
        });
      }

      const newPayload: RefreshTokenPayload = {
        userId: payload.userId,
        profiles: payload.profiles,
      };

      const newRefreshToken = JwtUtil.generateRefreshToken(newPayload);
      const expiresAt = DateUtil.getDateToInterval(
        DateUtil.parseDurationToMilliseconds(config.jwt.refreshExpiresIn)
      );

      await this.db.refreshToken.create({
        data: {
          token: newRefreshToken,
          parentTokenId,
          familyId,
          expiresAt,
        },
      });

      return newRefreshToken;
    } catch (error) {
      throw new Error(
        'Error generating refresh token: ' + (error as Error).message
      );
    }
  }
}
