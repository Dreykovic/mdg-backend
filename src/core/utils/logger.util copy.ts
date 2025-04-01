/**
 * logger.util.ts
 *
 * Enhanced Pino logger configuration with performance optimizations
 * and environment-specific settings.
 */

import pino from 'pino';
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

// Determine log level based on environment
const logLevel = config.isProd ? 'info' : 'debug';

// Determine current environment safely
const currentEnv = (config.nodeEnv || 'development') as Environment;

// Configure base logger options
const loggerOptions: pino.LoggerOptions = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    // service: pkg.name || 'api-service',
    // env: config.nodeEnv || 'development',
    // pid: process.pid,
  },
  redact: {
    paths: ['password', 'secret', 'authorization', '*.password', '*.secret'],
    censor: '[REDACTED]',
  },
};

// Créer le logger avec la configuration appropriée selon l'environnement
let logger: pino.Logger;

if (currentEnv === 'development' && !config.isTest) {
  // Pour le développement, utiliser pino-pretty pour la console et des fichiers
  const transport = pino.transport({
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
        level: logLevel,
      },
      {
        target: 'pino/file',
        level: logLevel,
        options: { destination: resolve(logsDir, 'application.log') },
      },
      {
        target: 'pino/file',
        level: 'error',
        options: { destination: resolve(logsDir, 'error.log') },
      },
    ],
  });

  logger = pino(loggerOptions, transport);
} else if (config.isTest) {
  // En test, logger minimal
  logger = pino({
    ...loggerOptions,
    level: 'silent',
  });
} else {
  // En production, utiliser les destinations multiples natives de Pino
  const streams = [
    { stream: process.stdout },
    {
      stream: pino.destination({
        dest: resolve(logsDir, 'application.log'),
        sync: false,
      }),
    },
    {
      level: 'error',
      stream: pino.destination({
        dest: resolve(logsDir, 'error.log'),
        sync: true,
      }),
    },
  ];

  // Utiliser la fonctionnalité multi-stream intégrée de Pino
  logger = pino(loggerOptions, pino.multistream(streams));
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  fs.appendFileSync(
    resolve(logsDir, 'exceptions.log'),
    `${new Date().toISOString()} FATAL: Uncaught exception: ${err.message}\n${err.stack}\n`
  );
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection at Promise');
});

// Export the logger
export default logger;
