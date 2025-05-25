/**
 * Main application file for the Express app. This file sets up the necessary
 * configurations, middlewares, routes, and integrations required for the
 * application to function securely and efficiently.
 */

import expressInstance from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Service } from 'typedi';
import logger from '@/core/utils/logger.util';
import RoutesDebugUtil from '@/core/utils/routesDebug.util';

// Middlewares
import errorHandler from '@/core/middlewares/error.middleware';
import preventCrossSiteScripting from '@/core/middlewares/preventCrossScripting.middleware';
import { rateLimiter } from '@/core/middlewares/rateLimiter.middleware';
import { clientInfoMiddleware } from '@/core/middlewares/clientInfo.middleware';

// Configurations
import corsOptions from '@/config/cors.config';
import config from '@/config';

// Routes and documentation
import apiRouter from './routes';

import requestLogger from '@/core/middlewares/requestLogger.middleware';

/**
 * Main class that sets up and configures the Express application
 */
@Service()
class App {
  public express: expressInstance.Application;
  private readonly baseApiUrl: string;
  private swaggerDocs = null;

  /**
   * Constructor to initialize the Express application and configure middlewares and routes.
   */
  constructor() {
    this.express = expressInstance();
    this.baseApiUrl = '/' + config.api.prefix.replace(/^\/+/, '');

    // Initialize the application in the proper order
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureDebugTools();

    // Always add error handler last
    this.express.use(errorHandler);
  }

  /**
   * Configure all middlewares in the proper order for optimal security and performance
   */
  private configureMiddlewares(): void {
    // 1. Client information capture (should be early to track request metadata)
    this.express.use(clientInfoMiddleware);

    // 2. Request logging (early to log requests as they come in)
    if (!config.isTest) {
      this.express.use(requestLogger);
    }

    // 3. Security headers (should be set before any content is processed)
    this.express.use(
      helmet({
        contentSecurityPolicy: config.isProd ? undefined : false,
      })
    );

    // 4. Rate limiting (early to reject excessive requests before processing)
    this.express.use(rateLimiter);

    // 5. CORS configuration
    this.express.use(cors(corsOptions));

    // 6. Body parsers (after security checks but before route handlers)
    this.configureBodyParsers();

    // 7. Cookie parsing
    this.express.use(cookieParser());

    // 8. XSS protection (after body parsing but before routes)
    this.express.use(preventCrossSiteScripting);
  }

  /**
   * Configure body parsers with optimized settings
   */
  private configureBodyParsers(): void {
    // JSON parsing with appropriate limits and validations
    this.express.use(
      bodyParser.json({
        limit: config.api.jsonLimit,
        strict: true,
        type: 'application/json',
      })
    );

    // URL-encoded data parsing
    // this.express.use(
    //   bodyParser.urlencoded({
    //     extended: config.api.extUrlencoded,
    //     limit: config.api.jsonLimit,
    //   })
    // );
  }

  /**
   * Configure all application routes and API documentation
   */
  private configureRoutes(): void {
    // Health check route
    this.express.get('/health', (req, res) => {
      res
        .status(200)
        .json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Test error route
    this.express.get('/error', () => {
      throw new Error('This is a test error!');
    });

    // API Documentation with optimized lazy-loading

    // Set up API routes
    logger.debug(`API base URL: ${this.baseApiUrl}`);
    this.express.use(this.baseApiUrl, apiRouter);
  }

  /**
   * Configure debug tools and development utilities
   */
  private configureDebugTools(): void {
    try {
      // Add routes debug endpoint in development
      if (!config.isProd) {
        RoutesDebugUtil.addDebugEndpoint(this.express, {
          enableInProduction: false,
          requireAuth: false,
          logAccess: true,
          customPath: '/debug/routes',
        });
      }

      logger.debug('Debug tools configured successfully');
    } catch (error) {
      logger.error('Error configuring debug tools:', error);
      // Don't throw here to prevent app startup failure
    }
  }

  /**
   * Log application routes to console for development debugging
   * Should be called after all routes are registered
   */
  public logRoutes(): void {
    try {
      if (!config.isProd && !config.isTest) {
        // Use a timeout to ensure all routes are registered
        setTimeout(() => {
          RoutesDebugUtil.logRoutes(this.express, {
            format: 'tree',
            showAnalysis: true,
            showMiddlewares: true,
            colorize: true,
          });
        }, 100);
      }
    } catch (error) {
      logger.error('Error logging routes:', error);
    }
  }

  /**
   * Get route analysis for monitoring or administrative purposes
   * @returns Route analysis data including statistics and patterns
   */
  public getRouteAnalysis() {
    try {
      return RoutesDebugUtil.getRouteAnalysis(this.express);
    } catch (error) {
      logger.error('Error getting route analysis:', error);
      return null;
    }
  }

  /**
   * Get all registered routes for programmatic access
   * @returns Array of route endpoints
   */
  public getRoutes() {
    try {
      return RoutesDebugUtil.getRoutes(this.express);
    } catch (error) {
      logger.error('Error getting routes:', error);
      return [];
    }
  }
}

export default App;
