/**
 * Main application file for the Express app. This file sets up the necessary
 * configurations, middlewares, routes, and integrations required for the
 * application to function securely and efficiently.
 */

import expressInstance from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';

import errorHandler from '@/core/middlewares/error.middleware'; // Middleware for global error handling
import morganMiddleware from '@/core/middlewares/morgan.middleware'; // Middleware to log HTTP requests
import preventCrossSiteScripting from '@/core/middlewares/preventCrossScripting.middleware'; // Middleware to prevent XSS attacks
import { rateLimiter } from '@/core/middlewares/rateLimiter.middleware'; // Middleware to limit request rate and avoid abuse
import xssMiddleware from '@/core/middlewares/xss.middleware'; // Middleware to filter out malicious scripts from inputs

import corsOptions from '@/config/cors.config'; // Custom CORS configuration
import cookieParser from 'cookie-parser'; // Middleware for parsing cookies
import helmet from 'helmet'; // Middleware to secure the application by setting various HTTP headers
import { MailModule } from '@/integrations/nodemailer/nodemailer.module'; // Module for handling email sending
import { MailConfig } from '@/integrations/nodemailer'; // Configuration for the mail service
import { Service } from 'typedi'; // Decorator to manage dependencies with Typedi
import config from '@/config'; // General application configuration
import { generateSwaggerDocument } from './swaggerLoader'; // Swagger documentation generator
import apiRouter from './routes'; // API routes handler
import { log } from 'console';
import { clientInfoMiddleware } from '@/core/middlewares/clientInfo.middleware'; // Middleware to capture client info

/**
 * Main class that sets up and configures the Express application. It is configured
 * as a service for dependency injection using Typedi.
 */
@Service()
class App {
  public express: expressInstance.Application; // Express application instance
  private baseApiUrl: string; // Base URL for API routes

  /**
   * Constructor to initialize the Express application and configure middlewares and routes.
   */
  constructor() {
    // Set up the base API URL using the configuration's prefix
    this.baseApiUrl = '/' + config.api.prefix.replace('/', '');
    this.express = expressInstance(); // Initialize Express application

    this.middleware(); // Set up application middlewares
    this.routes(); // Set up routes for the application
    this.express.use(errorHandler); // Add global error handler as the last middleware
  }

  /**
   * Configures all middlewares used in the application.
   */
  private middleware() {
    this.express.use(clientInfoMiddleware); // Middleware to capture client information
    this.express.use(helmet()); // Adds HTTP security protections
    this.express.use(morganMiddleware); // Log HTTP requests
    this.express.use(cors(corsOptions)); // Enable CORS with custom options

    this.express.use(preventCrossSiteScripting); // Prevent XSS attacks
    this.express.use(rateLimiter); // Rate limiter to prevent abuse
    this.express.use(xssMiddleware()); // Sanitize inputs to remove any malicious scripts

    // Parse JSON request bodies with a size limit
    this.express.use(bodyParser.json({ limit: config.api.jsonLimit }));
    // Parse URL-encoded request bodies
    this.express.use(
      bodyParser.urlencoded({ extended: config.api.extUrlencoded })
    );
    this.express.use(cookieParser()); // Parse cookies from requests
  }

  /**
   * Configures all routes for the application.
   */
  private routes() {
    // Test route to simulate an error for testing purposes
    this.express.get('/error', () => {
      throw new Error('This is a test error!');
    });

    // Generate and serve Swagger documentation at the `/api-docs` endpoint
    const swaggerDocs = generateSwaggerDocument();
    this.express.use(
      '/api-docs', // URL to access Swagger documentation
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocs)
    );

    // Log the base API URL and attach the API routes
    log(this.baseApiUrl); // Log the base API URL
    this.express.use(this.baseApiUrl, apiRouter); // Associate the routes with the base URL
  }

  /**
   * Initializes external modules (example with the mail service).
   */
  private initializeModules() {
    const smtpConfig: MailConfig = {
      service: 'smtp', // Type of mail service
      host: 'smtp.gmail.com', // SMTP host
      port: 587, // SMTP port
      user: 'your_smtp_username', // SMTP username (to be replaced)
      pass: 'your_smtp_password', // SMTP password (to be replaced)
    };

    // Initialize the mail module with SMTP configuration
    MailModule.init(smtpConfig);
  }
}

export default App;
