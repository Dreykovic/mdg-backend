/**
 * preventCrossSiteScripting.middleware.ts
 *
 * This middleware function adds a security header to HTTP responses to help
 * prevent Cross-Site Scripting (XSS) attacks. The `X-XSS-Protection` header
 * is supported by most modern browsers and instructs them to enable their
 * built-in XSS protection mechanisms.
 *
 * Key functionalities:
 * - Sets the `X-XSS-Protection` header to `1; mode=block`, which tells the browser
 *   to block any detected XSS attempts.
 * - Provides an additional layer of security against XSS vulnerabilities.
 *
 * Note: While this header is useful, it should be part of a broader security strategy,
 * including input validation, sanitization, and the use of Content Security Policy (CSP).
 *
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to add the `X-XSS-Protection` header to HTTP responses.
 * This header helps mitigate Cross-Site Scripting (XSS) attacks by enabling
 * the browser's built-in XSS filtering and blocking detected attempts.
 *
 * @param {Request} req - The incoming HTTP request object.
 * @param {Response} res - The outgoing HTTP response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export default function preventCrossSiteScripting(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add the X-XSS-Protection header to the response
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Proceed to the next middleware or route handler
  next();
}
