/**
 * This file contains the main configuration for the application.
 * It consolidates various environment-specific settings, such as:
 * - Application environment (development, testing, staging, production)
 * - API settings, including prefixes and versioning
 * - Security configurations (CORS, JWT, bcrypt, SSL, etc.)
 * - Rate limiting and debugging options
 * - Default user settings
 * - Clustering and performance settings
 */

import { env, nodeEnv } from './env.config';
import { EnvConfig } from './types';
import { ProfileName } from '@prisma/client';
import os from 'os';
import { log } from 'console';
import {
  parseAllowedOrigins,
  parseBooleanEnv,
  parseNumericEnv,
} from '@/core/utils/config.util';

// Configuration object with strongly typed properties
const config: EnvConfig = {
  // Node environment configuration
  nodeEnv,
  isTest: nodeEnv === 'test',
  isDev: nodeEnv === 'development',
  isStage: nodeEnv === 'staging',
  isProd: nodeEnv === 'production',

  // Country-specific configuration
  country: {
    flagUrlBase:
      env.COUNTRY_FLAG_URL ??
      'https://purecatamphetamine.github.io/country-flag-icons/3x2/',
  },

  // Cryptography-related configuration
  crypto: {
    cryptoSecretKey:
      env.CRYPTO_SECRET_KEY ??
      'd0f8a6e9c417f45dbfe5d31942e7d9346c44d46a9799d5cf4c2253ac44d899cd',
  },

  // Application server configuration
  app: {
    host: env.APP_URL_HOST ?? 'localhost',
    port: parseNumericEnv(env.APP_URL_PORT, 8080),
  },

  // Password-related configuration
  pwd: {
    pwdLength: parseNumericEnv(env.PWD_LENGTH, 8),
  },

  // SSL/TLS configuration
  ssl: {
    isHttps: parseBooleanEnv(env.SSL_ALLOW, false),
    privateKey: env.SSL_PRIVATE_KEY ?? '',
    certificate: env.SSL_CERTIFICATE ?? '',
    ca: env.SSL_CA_CERTIFICATE, // Optional CA certificate
    ciphers: env.SSL_CIPHERS, // Optional custom ciphers
    secureProtocol: env.SSL_SECURE_PROTOCOL ?? 'TLSv1_2_method', // TLS protocol version
    dhparam: env.SSL_DHPARAM, // Optional Diffie-Hellman parameters
    preferServerCiphers: parseBooleanEnv(env.SSL_PREFER_SERVER_CIPHERS, true),
    sessionTimeout: parseNumericEnv(env.SSL_SESSION_TIMEOUT, 300), // in seconds
  },

  // API configuration
  api: {
    prefix: env.API_PREFIX ?? 'api',
    version: env.API_VERSION ?? 'v1',
    jsonLimit: env.API_JSON_LIMIT ?? '1mb',
    extUrlencoded: parseBooleanEnv(env.API_EXT_URLENCODED, true),
  },

  // CORS configuration
  cors: {
    allowOrigins: parseAllowedOrigins(env.CORS_ALLOW_ORIGINS as string),
    credentials: parseBooleanEnv(env.CORS_CREDENTIALS, true),
    methods: env.CORS_METHODS?.split(',').map((m) => m.trim()) ?? [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ],
    maxAge: parseNumericEnv(env.CORS_MAX_AGE, 86400), // 24 hours in seconds
  },

  // JWT (JSON Web Token) configuration
  jwt: {
    secretUser: env.JWT_SECRET_USER ?? '',
    secretAdmin: env.JWT_SECRET_ADMIN ?? '',
    secretApp: env.JWT_SECRET_APP ?? '',
    expiredIn: env.JWT_EXPIRED_IN ?? '24h',
    refreshToken: env.JWT_REFRESH_TOKEN_SECRET ?? '',
    refreshExpiresIn: env.JWT_REFRESH_EXPIRED_IN ?? '1d',
    accessToken: env.JWT_ACCESS_TOKEN_SECRET ?? '',
    mobileExpiredIn: env.JWT_MOBILE_EXPIRED_IN ?? '30d',
    maxConnexions: parseNumericEnv(env.JWT_MAX_CONNEXION, 2),
    algorithm: env.JWT_ALGORITHM ?? 'HS256', // Algorithm used for JWT signing
  },

  // OTP (One-Time Password) configuration
  otp: {
    expiredIn: env.OTP_EXPIRED_IN ?? '3min',
    hashSecret: env.OTP_HASH_SECRET ?? '',
  },

  // Bcrypt configuration
  bcrypt: {
    saltRounds: parseNumericEnv(env.BCRYPT_SALTROUNDS, 10),
  },

  // Rate limiter configuration
  rateLimiter: {
    max: env.RATE_LIMIT_MAX ?? '100',
    window: env.RATE_LIMIT_WINDOW ?? '15',
    skipSuccessfulRequests: parseBooleanEnv(env.RATE_LIMIT_SKIP_SUCCESS, false),
    trustProxy: parseBooleanEnv(env.RATE_LIMIT_TRUST_PROXY, true),
  },

  // Debugging configuration
  debug: {
    http_request: parseBooleanEnv(env.DEBUG_HTTP_REQUEST, true),
    http_connection: parseBooleanEnv(env.DEBUG_HTTP_CONNECTION, false),
    monitor_interval: parseNumericEnv(env.DEBUG_MONITOR_INTERVAL, 30000), // Monitoring interval in ms
  },

  // Default user configuration
  defaultUser: {
    name: env.DEFAULT_USER_NAME ?? 'Birewa',
    contact: env.DEFAULT_USER_CONTACT ?? '22870478925',
    password: env.DEFAULT_USER_PASSWORD ?? 'secret',
    email: env.DEFAULT_USER_EMAIL ?? 'amonaaudrey16@gmail.com',
    profiles: (env.DEFAULT_USER_PROFILES as ProfileName) ?? 'ADMIN',
  },

  // Server clustering and performance
  cluster: parseBooleanEnv(env.ENABLE_CLUSTER, false), // Enable clustering
  clusterWorkers: parseNumericEnv(env.CLUSTER_WORKERS, os.cpus().length), // Number of workers

  // Server connection settings
  keepAliveTimeout: parseNumericEnv(env.KEEP_ALIVE_TIMEOUT, 5000), // TCP keep-alive in ms
  headerTimeout: parseNumericEnv(env.HEADER_TIMEOUT, 60000), // Header timeout in ms
  maxRequestSize: env.MAX_REQUEST_SIZE ?? '50mb', // Max request body size
  trustProxy: parseBooleanEnv(env.TRUST_PROXY, true), // Trust proxy headers

  // Database settings
  database: {
    connectionPoolSize: parseNumericEnv(env.DATABASE_POOL_SIZE, 10),
    connectionTimeout: parseNumericEnv(env.DATABASE_TIMEOUT, 30000),
    queryTimeout: parseNumericEnv(env.DATABASE_QUERY_TIMEOUT, 60000),
  },

  // Mail configuration
  mail: {
    enabled: parseBooleanEnv(env.MAIL_ENABLED, false),
    service: env.EMAIL_SMTP_SERVICE ?? 'gmail',
    host: env.EMAIL_SMTP_HOST ?? 'smtp.gmail.com',
    port: parseNumericEnv(env.EMAIL_SMTP_PORT, 587),
    secure: parseBooleanEnv(env.EMAIL_SMTP_SECURE, false),
    user: env.EMAIL_SMTP_USER,
    pass: env.EMAIL_SMTP_PASSWORD,
  },
};

// Log configuration info in development
if (config.isDev) {
  log(`Server configuration loaded for ${config.nodeEnv} environment`);
  log(`SSL enabled: ${config.ssl.isHttps}`);
  log(
    `Clustering enabled: ${config.cluster} (${config.clusterWorkers} workers)`
  );
}
log('Config loaded:', typeof config !== 'undefined' && config !== null);
log(
  'Config keys:',
  config !== undefined && config !== null ? Object.keys(config) : 'undefined'
);

export default config;
