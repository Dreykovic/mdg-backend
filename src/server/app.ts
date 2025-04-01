/**
 * Main application file for the Express app. This file sets up the necessary
 * configurations, middlewares, routes, and integrations required for the
 * application to function securely and efficiently.
 */

import expressInstance from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Service } from 'typedi';
import logger from '@/core/utils/logger.util';

// Middlewares
import errorHandler from '@/core/middlewares/error.middleware';
import morganMiddleware from '@/core/middlewares/morgan.middleware';
import preventCrossSiteScripting from '@/core/middlewares/preventCrossScripting.middleware';
import { rateLimiter } from '@/core/middlewares/rateLimiter.middleware';
import xssMiddleware from '@/core/middlewares/xss.middleware';
import { clientInfoMiddleware } from '@/core/middlewares/clientInfo.middleware';

// Configurations
import corsOptions from '@/config/cors.config';
import config from '@/config';

// Routes and documentation
import { generateSwaggerDocument } from './swaggerLoader';
import apiRouter from './routes';

/**
 * Main class that sets up and configures the Express application
 */
@Service()
class App {
  public express: expressInstance.Application;
  private readonly baseApiUrl: string;
  private swaggerInitialized = false;

  /**
   * Constructor to initialize the Express application and configure middlewares and routes.
   */
  constructor() {
    this.baseApiUrl = '/' + config.api.prefix.replace(/^\/+/, '');
    this.express = expressInstance();

    // Initialize the application in the proper order
    this.setupSecurity();
    this.setupParsers();
    this.setupAPIRoutes();

    // Always add error handler last
    this.express.use(errorHandler);
  }

  /**
   * Set up security-related middlewares
   */
  private setupSecurity(): void {
    // Capture client information
    this.express.use(clientInfoMiddleware);

    // Security headers
    this.express.use(
      helmet({
        contentSecurityPolicy: config.isProd ? undefined : false,
      })
    );

    // CORS configuration
    this.express.use(cors(corsOptions));

    // XSS protection (combined middleware approach)
    this.express.use(preventCrossSiteScripting);
    this.express.use(xssMiddleware());

    // Rate limiting to prevent abuse
    this.express.use(rateLimiter);

    // Request logging (only in non-testing environments)
    if (!config.isTest) {
      this.express.use(morganMiddleware);
    }
  }

  /**
   * Set up request parsers and body processing middlewares
   */
  private setupParsers(): void {
    // Optimize JSON parsing with appropriate limits
    this.express.use(
      bodyParser.json({
        limit: config.api.jsonLimit,
        strict: true,
        type: 'application/json', // Type de contenu spécifique accepté
      })
    );

    // URL-encoded data parsing
    this.express.use(
      bodyParser.urlencoded({
        extended: config.api.extUrlencoded,
        limit: config.api.jsonLimit,
      })
    );

    // Cookie parsing
    this.express.use(cookieParser());
  }

  /**
   * Set up API routes and documentation
   */
  private setupAPIRoutes(): void {
    // Test error route
    this.express.get('/error', () => {
      throw new Error('This is a test error!');
    });

    // Initialize Swagger documentation lazily
    this.express.use('/api-docs', (req, res, next) => {
      if (!this.swaggerInitialized) {
        const swaggerDocs = generateSwaggerDocument();
        const swaggerSetup = swaggerUi.setup(swaggerDocs);

        // Attach to express instance
        this.express.use('/api-docs', swaggerUi.serve);
        this.swaggerInitialized = true;

        // Continue with the setup
        return swaggerSetup(req, res, next);
      }
      next();
    });

    // Set up API routes
    logger.debug(`API base URL: ${this.baseApiUrl}`);
    this.express.use(this.baseApiUrl, apiRouter);
  }
}

export default App;
