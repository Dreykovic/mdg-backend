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
import ServiceDefinition from '../definitions/base_service';
import BcryptUtil from '../../core/utils/bcrypt.util';
import _ from 'lodash';
import config from '@/config';
import JwtUtil from '@/core/utils/jwt.util';
import DateUtil from '@/core/utils/date.util';
import { log } from 'console';
import { Prisma } from '@prisma/client';

// Utilisation dans votre service AdminAuthService
import {
  AuthServiceErrorHandler,
  CriticalServiceErrorHandler,
  ServiceErrorHandler,
} from '@/core/decorators/errorHandler.decorators';

@Service()
export default class AdminAuthService extends ServiceDefinition {
  @AuthServiceErrorHandler('Invalid credentials provided')
  async signIn(
    data: UserLogin,
    clientInfo: ClientInfo
  ): Promise<{
    tokens: { accessToken: string; refreshToken: string };
    userData: any;
  }> {
    const cleanData = data;

    // Find the user by username
    const user = await this.db.user.findFirstOrThrow({
      where: { username: cleanData.username },
    });

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
  }

  @AuthServiceErrorHandler('Token refresh failed')
  async refreshToken(refreshToken: string) {
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
  }

  @ServiceErrorHandler('Failed to retrieve active sessions')
  async getActiveSessions(userId: string) {
    const activeSessions = await this.db.tokenFamily.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    return { activeSessions };
  }

  @AuthServiceErrorHandler('Logout operation failed')
  async logout(refreshToken: string) {
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
  }

  @AuthServiceErrorHandler('Failed to logout from all sessions')
  async logoutAll(userId: string) {
    const activeFamilies = await this.db.tokenFamily.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    for (const activeFamily of activeFamilies) {
      await this.revokeTokenFamily(activeFamily.id);
    }

    return true;
  }

  @CriticalServiceErrorHandler('Failed to create token family')
  private async createTokenFamily(
    data: Prisma.TokenFamilyUncheckedCreateInput
  ) {
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
  }

  @CriticalServiceErrorHandler('Failed to revoke token family')
  private async revokeTokenFamily(familyId: number) {
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
  }

  @CriticalServiceErrorHandler('Token validation failed')
  private async validateRefreshToken(refreshToken: string) {
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
  }

  @ServiceErrorHandler('Failed to generate refresh token')
  private async generateRefreshToken(
    parentTokenId: number | null,
    familyId: number,
    payload: RefreshTokenPayload
  ): Promise<string> {
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
  }
}
