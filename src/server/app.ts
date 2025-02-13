/**
 * Main application file for the Express app. This file sets up the necessary
 * configurations, middlewares, routes, and integrations required for the
 * application to function securely and efficiently.
 */

import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
import { AllowedSitesType } from '@/integrations/recipe-scrapping/recipeScrapping.types';

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

    this.express.get('/scrape', async (req: Request, res: Response) => {
      try {
        const url =
          'https://cooking.nytimes.com/recipes/1026573-marry-me-salmon'; // Remplace par l'URL à scraper
        const data = await new RecipeScrappingService().getData(url);

        res.json({ data });
      } catch (error) {
        log('Erreur lors du scraping :', error);
        res.status(500).json({ error });
      }
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

class RecipeScrappingService {
  extractTimes = ($: cheerio.CheerioAPI) => {
    const times: Record<string, string> = {};

    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $('.stats_cookingTimeTable__b0moV dt').each((_, dt) => {
      const label = $(dt).text().trim();
      const value = $(dt).next('dd').text().trim();

      if (label && value) {
        times[label] = value;
      }
    });

    return times;
  };
  // Store allowed sites in a Set for faster lookup
  private allowedSites = new Set<AllowedSitesType>([
    'allrecipes.com',
    'cooking.nytimes.com',
    'simplyrecipes.com',
  ]);

  // Check if a given URL belongs to an allowed site
  private isValidSite(domain: string): boolean {
    return this.allowedSites.has(domain as AllowedSitesType);
  }

  // Extract the domain name from a URL
  private extractDomain(url: string): string | undefined | null {
    const match = url.match(/^(?:https?:\/\/)?([^/]+)/);
    return match ? match[1] : null;
  }

  // Validate if the URL belongs to an allowed site
  checkUrl(link: string): void {
    const domain = this.extractDomain(link);
    if (!domain || !this.isValidSite(domain)) {
      throw new Error(
        'Invalid URL. Please provide a valid URL from allowed sites.'
      );
    }
  }

  // Fetch and scrape data from a given URL
  async getData(url: string): Promise<any> {
    try {
      this.checkUrl(url); // Validate the URL before proceeding

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const titles: string[] = [];
      const description: String = $('.topnote_topnoteParagraphs__A3OtF').text();
      $('h1').each((_, element) => {
        titles.push($(element).text());
      });
      const times = this.extractTimes($);

      return { titles, description, times };
    } catch (error) {
      throw new Error(`Scraping Error: ${(error as Error).message}`);
    }
  }
}
export default App;
