/**
 * setDefaultParam.middleware.ts
 *
 * This middleware assigns a default value to a specific route parameter if it is
 * missing or undefined in the request. It ensures that the parameter has a valid
 * value before proceeding to subsequent middleware or route handlers.
 *
 * Key functionalities:
 * - Checks if the specified route parameter exists.
 * - Assigns a default value to the parameter if it is missing.
 * - Passes control to the next middleware or route handler.
 *
 * Usage example:
 * ```typescript
 * import express from 'express';
 * import { setDefaultParam } from './middlewares/setDefaultParam';
 *
 * const app = express();
 *
 * // Define a route with the middleware
 * app.get('/user/:id', setDefaultParam('id', 'defaultId'), (req, res) => {
 *   res.send(`User ID: ${req.params.id}`);
 * });
 * ```
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to set a default value for a missing route parameter.
 *
 * @param {string} paramName - The name of the parameter to check.
 * @param {string} defaultValue - The default value to assign if the parameter is missing.
 * @returns A middleware function that assigns the default value if needed.
 */
export function setDefaultParam(paramName: string, defaultValue: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assign the default value if the parameter is missing or undefined
    req.params[paramName] = req.params[paramName] || defaultValue;

    // Proceed to the next middleware or route handler
    next();
  };
}
