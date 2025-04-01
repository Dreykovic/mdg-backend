/**
 * JwtUtil: Utility class for handling JSON Web Tokens (JWT).
 * This class provides methods to generate and verify both access and refresh tokens.
 * It also includes functionality for adding a unique identifier (jti) and a timestamp (lat) to the token payload.
 *
 * Methods:
 * - generateToken: Generates an access token for user authentication.
 * - generateRefreshToken: Generates a refresh token to obtain a new access token.
 * - verifyAccessToken: Verifies the validity of an access token.
 * - verifyRefreshToken: Verifies the validity of a refresh token.
 *
 * Dependencies:
 * - jsonwebtoken (jwt): For creating and verifying JWTs.
 * - uuid (v4): For generating unique identifiers for each token.
 * - config: Configuration object that contains secrets and expiration times.
 */
import jwt, {
  JwtPayload,
  VerifyOptions,
  SignOptions,
  Secret,
} from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import config from '@/config';
import { AccessTokenPayload, RefreshTokenPayload } from '../types';

// Getting env variables
const {
  jwt: {
    accessToken: accessTokenSecret,
    refreshToken: refreshTokenSecret,
    expiredIn: expiresIn,
    refreshExpiresIn,
  },
} = config;

export default class JwtUtil {
  /**
   * Adds common token metadata to any payload
   * @param payload - Base payload to enrich
   * @returns Enriched payload with timestamp and unique ID
   */
  private static enrichPayload<T>(
    payload: T
  ): T & { lat: number; jti: string } {
    return {
      ...payload,
      lat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }

  /**
   * Generates an access token with the specified payload.
   * Adds the current timestamp (lat) and a unique identifier (jti) to the payload.
   *
   * @param payload - The data to be included in the access token.
   * @returns The generated access token.
   */
  static generateToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      this.enrichPayload(payload),
      accessTokenSecret as Secret,
      { expiresIn } as SignOptions
    );
  }

  /**
   * Generates a refresh token with the specified payload.
   * Adds the current timestamp (lat) and a unique identifier (jti) to the payload.
   *
   * @param payload - The data to be included in the refresh token.
   * @returns The generated refresh token.
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(
      this.enrichPayload(payload),
      refreshTokenSecret as Secret,
      { expiresIn: refreshExpiresIn } as SignOptions
    );
  }

  /**
   * Verifies the validity of an access token.
   *
   * @param token - The access token to verify.
   * @param options - Optional verification options
   * @returns The decoded payload of the token if valid.
   * @throws Will throw an error if the token is invalid or expired.
   */
  static verifyAccessToken<T = JwtPayload>(
    token: string,
    options?: VerifyOptions
  ): T & JwtPayload {
    return jwt.verify(token, accessTokenSecret as Secret, options) as T &
      JwtPayload;
  }

  /**
   * Verifies the validity of a refresh token.
   *
   * @param token - The refresh token to verify.
   * @param options - Optional verification options
   * @returns The decoded payload of the token if valid.
   * @throws Will throw an error if the token is invalid or expired.
   */
  static verifyRefreshToken<T = JwtPayload>(
    token: string,
    options?: VerifyOptions
  ): T & JwtPayload {
    return jwt.verify(token, refreshTokenSecret as Secret, options) as T &
      JwtPayload;
  }
}
