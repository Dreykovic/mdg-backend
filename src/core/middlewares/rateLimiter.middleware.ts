/**
 * rateLimiter.middleware.ts
 *
 * This file implements a rate-limiting middleware for Express using the `express-rate-limit`
 * library. It helps protect the application from brute force attacks and excessive requests
 * by limiting the number of requests a client can make within a specified time window.
 *
 * Key functionalities:
 * - Configures the rate limit based on settings defined in the application's configuration file.
 * - Logs excessive request attempts for monitoring and debugging.
 * - Provides a user-friendly error message when the rate limit is exceeded.
 *
 */

import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';

import logger from '@/core/utils/logger.util';
import config from '@/config';

/**
 * Rate limiter middleware to control the number of requests from a single client.
 *
 * Configuration:
 * - `windowMs`: Time window for counting requests (in milliseconds).
 * - `max`: Maximum number of requests allowed within the time window.
 * - `message`: Response sent when the rate limit is exceeded.
 * - `handler`: Custom handler to log the event and respond with a specific message.
 * - `standardHeaders`: Includes rate limit info in the `RateLimit-*` headers.
 * - `legacyHeaders`: Disables the deprecated `X-RateLimit-*` headers.
 */
export const rateLimiter = rateLimit({
  // Time window for rate limiting (converted from minutes to milliseconds)
  windowMs: parseInt(config.rateLimiter.window) * 60 * 1000, // Example: 15 minutes

  // Maximum number of requests allowed within the time window
  max: parseInt(config.rateLimiter.max), // Example: 100 requests

  // Message to send when the rate limit is exceeded
  message: {
    message: 'Too many attempts, please try again after sixty seconds.',
  },

  // Custom handler for rate limit violations
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    // Log the rate limit violation for debugging and monitoring
    logger.error(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'errLog.log'
    );

    // Respond with the rate limit violation message
    res.status(options.statusCode).send(options.message);
  },

  // Include standard rate limit headers in the response
  standardHeaders: true,

  // Disable legacy rate limit headers
  legacyHeaders: false,
});
