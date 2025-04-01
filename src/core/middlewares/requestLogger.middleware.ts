/**
 * requestLogger.middleware.ts
 *
 * HTTP request/response logging middleware using Morgan and Winston.
 * Logs the incoming requests in the 'combined' format and passes them to a custom logger.
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
const httpLogger = morgan(logFormat, {
  stream: {
    write: (message: string) => logger.info(message.trim()), // Log via Winston
  },
});
export default httpLogger;
