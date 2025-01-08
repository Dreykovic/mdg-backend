// types.d.ts

import { ProfileName } from '@prisma/client';

// Global Environment Configuration export Interface
export interface EnvConfig {
  nodeEnv: string;
  isTest: boolean;
  isDev: boolean;
  isStage: boolean;
  isProd: boolean;

  crypto: CryptoConfig;
  app: AppConfig;
  pwd: PwdConfig;
  ssl: SSLConfig;
  api: ApiConfig;
  cors: CorsConfig;
  jwt: JwtConfig;
  otp: OtpConfig;
  bcrypt: BcryptConfig;
  rateLimiter: RateLimiterConfig;
  debug: DebugConfig;
  defaultUser: DefaultUserConfig;
  country: CountryConfig;
}

// Crypto configuration
export interface CryptoConfig {
  cryptoSecretKey: string;
}

// Application configuration
export interface AppConfig {
  host: string;
  port: number;
}

// Password configuration
export interface PwdConfig {
  pwdLength: number;
}

// SSL configuration
export interface SSLConfig {
  isHttps: boolean;
  privateKey: string;
  certificate: string;
}

// API configuration
export interface ApiConfig {
  prefix: string;
  version: string;
  jsonLimit: string;
  extUrlencoded: boolean;
}

// CORS configuration
export interface CorsConfig {
  allowOrigins: string[];
}

// JWT configuration
export interface JwtConfig {
  secretUser: string;
  secretAdmin: string;
  secretApp: string;
  expiredIn: string;
  refreshToken: string;
  refreshExpiresIn: string;
  accessToken: string; // Typo correction
  mobileExpiredIn: string;
  maxConnexions: number;
}

// OTP configuration
export interface OtpConfig {
  expiredIn: string;
  hashSecret: string;
}

// Bcrypt configuration
export interface BcryptConfig {
  saltRounds: number;
}

// Rate limiter configuration
export interface RateLimiterConfig {
  max: string;
  window: string;
}

// Debug configuration
export interface DebugConfig {
  http_request: boolean;
  http_connection: boolean;
}

// Default user configuration
export interface DefaultUserConfig {
  name: string;
  contact: string;
  password: string;
  email: string;
  profiles: ProfileName;
}
