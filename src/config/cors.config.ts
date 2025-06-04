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
import logger from '@/core/utils/logger.util';

// Fetching CORS settings from the main configuration
const { allowOrigins, credentials, methods, maxAge } = config.cors;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Debug en mode développement
    if (config.isDev) {
      logger.debug(`CORS check - Origin: "${origin}", Type: ${typeof origin}`);
    }

    // Autoriser les requêtes sans origin (Postman, server-to-server, cURL, etc.)
    if (origin === undefined || origin === null || origin === '') {
      if (config.isDev) {
        logger.debug(
          'CORS: Allowing request without origin (Postman/server-to-server)'
        );
      }
      callback(null, true);
      return;
    }

    // Vérifier si l'origin est dans la liste autorisée
    if (typeof origin === 'string' && allowOrigins.includes(origin)) {
      if (config.isDev) {
        logger.debug(`CORS: Allowing origin from whitelist: ${origin}`);
      }
      callback(null, true);
      return;
    }

    // En développement, autoriser localhost avec différents ports
    if (config.isDev && typeof origin === 'string') {
      const isLocalhost = origin.match(
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
      );
      if (isLocalhost) {
        logger.debug(`CORS: Allowing localhost in development: ${origin}`);
        callback(null, true);
        return;
      }
    }

    // Rejeter tout autre origin
    if (config.isDev) {
      logger.debug(`CORS rejected origin: ${origin}`);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
  },

  // Autoriser les credentials (cookies, headers d'auth)
  credentials,

  // Méthodes HTTP autorisées
  methods,

  // Durée de cache pour les requêtes preflight
  maxAge,

  // Code de succès pour les requêtes OPTIONS
  optionsSuccessStatus: 200,

  // Headers autorisés dans les requêtes
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key',
    'X-Access-Token',
    'X-Refresh-Token',
    'Cache-Control',
    'Pragma',
  ],

  // Headers exposés au client dans les réponses
  exposedHeaders: [
    'Content-Length',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Total-Count',
    'X-Page-Count',
  ],

  // Gestion des requêtes preflight
  preflightContinue: false,
};

// Log de la configuration CORS en mode développement
if (config.isDev) {
  logger.debug('='.repeat(50));
  logger.debug('CORS configuration loaded:');
  logger.debug(`- Environment: ${config.nodeEnv}`);
  logger.debug(
    `- Allowed origins: ${allowOrigins.length ? allowOrigins.join(', ') : 'None specified (allowing undefined/null origins)'}`
  );
  logger.debug(`- Credentials allowed: ${credentials}`);
  logger.debug(`- Methods allowed: ${methods?.join(', ')}`);
  logger.debug(`- Max age: ${maxAge} seconds`);
  logger.debug(`- Localhost auto-allowed: ${config.isDev ? 'Yes' : 'No'}`);
  logger.debug('='.repeat(50));
}

export default corsOptions;
