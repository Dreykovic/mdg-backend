/**
 * requestLogger.middleware.ts
 *
 * HTTP request/response logging middleware using Morgan and Winston.
 * Logs every incoming request using the 'combined' format for production and 'dev' format for development.
 */

import morgan from 'morgan';
import logger from '@/core/utils/logger.util'; // Assure-toi que le chemin est correct
import config from '@/config';

const logFormat = config.isDev ? 'dev' : 'combined';

/**
 * Creates an HTTP logging middleware using Morgan and Winston.
 *
 * @returns Express middleware for HTTP logging
 */
export const httpLogger = morgan(logFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim()); // Log via Winston
    },
  },
  skip: () => false, // Logger chaque requête, sans exception
});
export default httpLogger;
