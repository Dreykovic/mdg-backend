/**
 * This file defines the configuration for Cross-Origin Resource Sharing (CORS) in the application.
 * CORS is a security feature that allows or restricts resources on a web server to be requested
 * from another domain outside the server's own domain.
 *
 * The settings include:
 * - Defining a list of allowed origins for incoming requests
 * - Configuring which headers and HTTP methods are permitted
 * - Enabling credentials for secure cookie and authentication data sharing
 * - Handling preflight requests with a success status code
 *
 * These configurations ensure secure and controlled access to the application's resources
 * from external domains.
 */
import cors from 'cors';
import config from '.';
import { log } from 'console';

// Fetching CORS settings from the main configuration
const { allowOrigins, credentials, methods, maxAge } = config.cors;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // If origin is undefined (like server-to-server requests) or in the allowed list
    if (
      origin === null ||
      origin === '' ||
      (typeof origin === 'string' && allowOrigins.includes(origin))
    ) {
      callback(null, true);
    } else {
      // Log rejected origins in development mode
      if (config.isDev) {
        log(`CORS rejected origin: ${origin}`);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
    }
  },
  credentials,
  methods,
  maxAge,
  optionsSuccessStatus: 200,
  // Allow standard and custom headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key',
    'X-Access-Token',
  ],
  // Expose these headers to the client
  exposedHeaders: [
    'Content-Length',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
};

// Log CORS configuration in development mode
if (config.isDev) {
  log('CORS configuration loaded:');
  log(`- Allowed origins: ${allowOrigins.join(', ') || 'None specified'}`);
  log(`- Credentials allowed: ${credentials}`);
  log(`- Methods allowed: ${methods?.join(', ')}`);
  log(`- Max age: ${maxAge} seconds`);
}

export default corsOptions;
