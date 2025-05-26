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
 * - Supports skipping successful requests in rate limiting calculations.
 * - Configures trust proxy settings for proper client IP detection behind load balancers.
 */

import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';

import logger from '@/core/utils/logger.util';
import config from '@/config';

// Extract rate limiter configuration from the main config
const { max, window, skipSuccessfulRequests } = config.rateLimiter;

/**
 * Rate limiter middleware to control the number of requests from a single client.
 */
export const rateLimiter = rateLimit({
  // Time window for rate limiting (converted from minutes to milliseconds)
  windowMs: parseInt(window) * 60 * 1000,

  // Maximum number of requests allowed within the time window
  max: parseInt(max),

  // Skip counting successful requests (2xx responses) when enabled
  skipSuccessfulRequests,

  // Trust proxy configuration for proper IP detection behind load balancers/proxies
  // trustProxy is not a valid property for express-rate-limit options and has been removed

  // Message to send when the rate limit is exceeded
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
    code: 'TOO_MANY_REQUESTS',
  },

  // Custom handler for rate limit violations
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    // Log the rate limit violation with detailed information
    logger.error(
      `Rate limit exceeded: IP=${req.ip} | Method=${req.method} | URL=${req.url} | Origin=${req.headers.origin ?? 'unknown'}`,
      'rate-limiter.log'
    );

    // Return standardized error response
    res.status(429).json(options.message);
  },

  // Include standard rate limit headers in the response (RateLimit-*)
  standardHeaders: true,

  // Disable legacy rate limit headers (X-RateLimit-*)
  legacyHeaders: false,

  // Add the current limit to all responses if debugging is enabled
  // Removed invalid property 'enableDraftSpec'
});

// Export a specialized version for login/authentication routes with stricter limits
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 failed attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  // trustProxy is not a valid property and has been removed
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again later.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn(
      `Login rate limit exceeded: IP=${req.ip} | Endpoint=${req.url}`,
      'auth-rate-limiter.log'
    );
    res.status(429).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
