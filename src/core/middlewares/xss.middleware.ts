/**
 * xssMiddleware.ts
 *
 * This middleware sanitizes all incoming request data (body, query, and params)
 * to prevent Cross-Site Scripting (XSS) attacks. It uses `xss-filters` to encode
 * potentially dangerous characters, making the application more secure.
 *
 * Key functionalities:
 * - Cleans `req.body`, `req.query`, and `req.params` by sanitizing their values.
 * - Handles both string and object data types, ensuring consistent sanitization.
 * - Mitigates risks of malicious script injection in incoming data.
 *
 * Usage example:
 * ```typescript
 * import express from 'express';
 * import xssMiddleware from './middlewares/xssMiddleware';
 *
 * const app = express();
 * app.use(express.json());
 * app.use(xssMiddleware());
 *
 * app.post('/data', (req, res) => {
 *   res.json({ sanitizedBody: req.body });
 * });
 * ```
 */

import { NextFunction, Request, Response } from 'express';
import { inHTMLData } from 'xss-filters';

/**
 * Utility function to clean incoming data by sanitizing potentially harmful content.
 *
 * @template T - The type of data being sanitized.
 * @param {T | string} data - The data to sanitize. Defaults to an empty string.
 * @returns {T} - The sanitized data.
 */
const clean = <T>(data: T | string = ''): T => {
  let isObject = false;

  // Check if the data is an object and convert it to a string if necessary
  if (typeof data === 'object') {
    data = JSON.stringify(data);
    isObject = true;
  }

  // Sanitize the data to remove or encode potentially harmful characters
  data = inHTMLData(data as string).trim();

  // If the data was originally an object, parse it back into an object
  if (isObject) {
    data = JSON.parse(data);
  }

  return data as T;
};

/**
 * Middleware to sanitize request data and prevent XSS attacks.
 *
 * This middleware cleans the `req.body`, `req.query`, and `req.params` fields to
 * ensure that all incoming data is free from malicious content.
 *
 * @returns {Function} - The middleware function.
 */
const xssMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize the request body, query, and params if they exist
    if (req.body) {
      req.body = clean(req.body);
    }
    if (req.query) {
      req.query = clean(req.query);
    }
    if (req.params) {
      req.params = clean(req.params);
    }

    // Proceed to the next middleware or route handler
    next();
  };
};

export default xssMiddleware;
