/**
 * This file contains the main configuration for the application.
 * It consolidates various environment-specific settings, such as:
 * - Application environment (development, testing, staging, production)
 * - API settings, including prefixes and versioning
 * - Security configurations (CORS, JWT, bcrypt, SSL, etc.)
 * - Rate limiting and debugging options
 * - Default user settings
 *
 * The configuration values are derived from environment variables and include sensible defaults
 * to ensure smooth application functionality even when certain variables are missing.
 */

import { env, nodeEnv } from './env.config'; // Importing environment variables and the current node environment
import { parseAllowedOrigins } from '@/core/utils/cors.util'; // Utility function to parse allowed CORS origins
import { EnvConfig } from './types'; // Importing the type definition for environment configuration
import { ProfileName } from '@prisma/client'; // Importing the ProfileName type from Prisma client
import { log } from 'console'; // Importing the logging utility

// Configuration object with strongly typed properties
const config: EnvConfig = {
  // Node environment configuration
  nodeEnv,
  isTest: nodeEnv === 'test', // Check if the environment is set to 'test'
  isDev: nodeEnv === 'development', // Check if the environment is 'development'
  isStage: nodeEnv === 'staging', // Check if the environment is 'staging'
  isProd: nodeEnv === 'production', // Check if the environment is 'production'

  // Country-specific configuration
  country: {
    // Base URL for fetching country flag icons
    flagUrlBase:
      env.COUNTRY_FLAG_URL ??
      'https://purecatamphetamine.github.io/country-flag-icons/3x2/',
  },

  // Cryptography-related configuration
  crypto: {
    // Secret key for cryptographic operations, with a default fallback
    cryptoSecretKey:
      env.CRYPTO_SECRET_KEY ??
      'd0f8a6e9c417f45dbfe5d31942e7d9346c44d46a9799d5cf4c2253ac44d899cd',
  },

  // Application server configuration
  app: {
    host: env.APP_URL_HOST ?? 'localhost', // Host for the application
    port: (env.APP_URL_PORT && parseInt(env.APP_URL_PORT, 10)) || 8080, // Port with a default of 8080
  },

  // Password-related configuration
  pwd: {
    pwdLength: parseInt(env.PWD_LENGTH ?? '') ?? 8, // Minimum password length, default is 8
  },

  // SSL/TLS configuration
  ssl: {
    isHttps: env.SSL_ALLOW === 'true' || false, // Enable HTTPS if explicitly allowed
    privateKey: env.SSL_PRIVATE_KEY ?? '', // Path to the SSL private key
    certificate: env.SSL_CERTIFICATE ?? '', // Path to the SSL certificate
  },

  // API configuration
  api: {
    prefix: env.API_PREFIX ?? 'api', // API base prefix
    version: env.API_VERSION ?? 'v1', // API version
    jsonLimit: env.API_JSON_LIMIT ?? '5mb', // Maximum JSON payload size
    extUrlencoded: env.API_EXT_URLENCODED === 'false' || true, // Extended URL encoding setting
  },

  // CORS configuration
  cors: {
    allowOrigins: parseAllowedOrigins(env.CORS_ALLOW_ORIGINS as string), // Allowed origins for CORS requests
  },

  // JWT (JSON Web Token) configuration
  jwt: {
    secretUser: env.JWT_SECRET_USER ?? '', // Secret for user-related tokens
    secretAdmin: env.JWT_SECRET_ADMIN ?? '', // Secret for admin-related tokens
    secretApp: env.JWT_SECRET_APP ?? '', // Secret for app-related tokens
    expiredIn: env.JWT_EXPIRED_IN ?? '24h', // Expiration time for access tokens
    refreshToken: env.JWT_REFRESH_TOKEN_SECRET ?? '', // Secret for refresh tokens
    refreshExpiresIn: env.JWT_REFRSH_EXPIRED_IN ?? '1d', // Expiration time for refresh tokens
    accessToken: env.JWT_ACCESS_TOKEN_SECRET ?? '', // Secret for access tokens
    mobileExpiredIn: env.JWT_MOBILE_EXPIRED_IN ?? '30d', // Expiration for mobile-specific tokens
    maxConnexions: parseInt(env.JWT_MAX_CONNEXION ?? '') ?? 2, // Maximum allowed simultaneous connections
  },

  // OTP (One-Time Password) configuration
  otp: {
    expiredIn: env.OTP_EXPIRED_IN ?? '3min', // OTP expiration time
    hashSecret: env.OTP_HASH_SECRET ?? '', // Secret for hashing OTPs
  },

  // Bcrypt configuration
  bcrypt: {
    saltRounds: parseInt(env.BCRYPT_SALTROUNDS ?? '') ?? 10, // Number of bcrypt salt rounds for hashing passwords
  },

  // Rate limiter configuration
  rateLimiter: {
    max: env.RATE_LIMIT_MAX ?? '100', // Maximum requests allowed per window
    window: env.RATE_LIMIT_WINDOW ?? '15', // Time window in minutes for rate limiting
  },

  // Debugging configuration
  debug: {
    http_request: env.DEBUG_HTTP_REQUEST === 'true' || true, // Enable HTTP request debugging
    http_connection: env.DEBUG_HTTP_CONNECTION === 'true' || false, // Enable HTTP connection debugging
  },

  // Default user configuration
  defaultUser: {
    name: env.DEFAULT_USER_NAME ?? 'Birewa', // Default user name
    contact: env.DEFAULT_USER_CONTACT ?? '22870478925', // Default user contact
    password: env.DEFAULT_USER_PASSWORD ?? 'secret', // Default user password
    email: env.DEFAULT_USER_EMAIL ?? 'amonaaudrey16@gmail.com', // Default user email
    profiles: (env.DEFAULT_USER_PROFILES as ProfileName) ?? 'ADMIN', // Default user profile
  },
};

// Log the parsed CORS allowed origins to the console
log('Allowed Origins :', config.cors.allowOrigins);

export default config; // Exporting the configuration object
