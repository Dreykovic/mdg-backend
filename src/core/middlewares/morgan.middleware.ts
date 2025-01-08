/**
 * morgan.middleware.ts
 *
 * Custom middleware for logging HTTP requests using Morgan and Winston.
 * Logs the incoming requests in the 'combined' format and passes them to a custom logger.
 */

import morgan from 'morgan';
import logger from '@/core/utils/logger.util'; // Ensure the path is correct

/**
 * Morgan middleware for logging HTTP requests.
 * This middleware uses the 'combined' logging format and sends the logs to the Winston logger.
 * @type {import('morgan').MorganFormat}
 */
const morganMiddleware = morgan('combined', {
  stream: {
    // Custom stream to send logs to Winston (via logger.info)
    write: (message: string) => logger.info(message.trim()), // Log the requests with Winston
  },
});

export default morganMiddleware;
