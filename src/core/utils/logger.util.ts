/**
 * logger.util.ts
 *
 * Enhanced Winston logger configuration with performance optimizations
 * and environment-specific settings.
 */

import winston from 'winston';
import { resolve } from 'path';
import appRoot from 'app-root-path';
import fs from 'fs';
import config from '@/config';
// import pkg from '@packages';
// Type pour l'environnement
type Environment = 'development' | 'test' | 'production';

// Create logs directory if it doesn't exist
const logsDir = resolve(appRoot.path, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format configurations
const formats: Record<Environment, winston.Logform.Format> = {
  // Detailed format for development
  development: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.printf(
      ({ level, message, timestamp, ...meta }) =>
        `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`
    )
  ),

  // Minimal format for tests to reduce noise
  test: winston.format.combine(
    winston.format.errors({ stack: false }),
    winston.format.splat(),
    winston.format.simple()
  ),

  // JSON format for production for better log parsing
  production: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
};

// Determine log level based on environment
const logLevel = config.isProd ? 'info' : 'debug';

// Determine current environment safely for format selection
const currentEnv = (config.nodeEnv || 'development') as Environment;
const logFormat = formats[currentEnv] || formats.development;

// Configure transports based on environment
const transports: winston.transport[] = [];

// Console transport (always present but with environment-specific configuration)
transports.push(
  new winston.transports.Console({
    level: logLevel,
    format: logFormat,
    handleExceptions: true,
  })
);

// File transports (not used in test environment)
if (!config.isTest) {
  // Application log
  transports.push(
    new winston.transports.File({
      filename: resolve(logsDir, 'application.log'),
      level: logLevel,
      format: formats.production,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Error log with dedicated configuration
  transports.push(
    new winston.transports.File({
      filename: resolve(logsDir, 'error.log'),
      level: 'error',
      format: formats.production,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: logLevel,
  // defaultMeta: {
  //   service: pkg.name || 'api-service',
  //   environment: config.nodeEnv || 'development',
  // },
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: resolve(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Set silent mode based on environment variable
logger.silent = config.isTest;

// Export the logger
export default logger;
