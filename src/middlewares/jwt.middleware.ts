/**
 * jwt.middleware.ts
 *
 * This middleware is responsible for verifying JSON Web Tokens (JWT) provided
 * in the authorization header of incoming HTTP requests. It ensures that a
 * valid token is present and attaches the decoded user data to the request object.
 * If the token is invalid, expired, or missing, the middleware responds with
 * appropriate HTTP status codes and messages.
 *
 * Key functionalities:
 * - Validates the presence of the Authorization header.
 * - Extracts and verifies the JWT.
 * - Decodes the token and attaches user data to the request.
 * - Handles errors related to token verification, such as expiration or invalid format.
 */

import config from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiResponse from '../core/utils/apiResponse.util';
import { log } from 'console';

/**
 * Middleware for verifying JWT token in the authorization header.
 * Decodes the token and attaches the user data to the request object if valid.
 *
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 * @param {NextFunction} next - The next middleware function
 * @returns {Promise<void> | void}
 */
const verifyJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> | void => {
  try {
    // Retrieve the Authorization header
    const authHeader = String(req.headers.authorization);

    // Check if the Authorization header is present
    if (!authHeader) {
      const response = ApiResponse.http401({
        message: 'Authorization header is missing',
      });
      res.status(response.httpStatusCode).json(response.data);
      return;
    }

    // Extract the token from the header (removing 'Bearer' or 'JWT' prefix)
    const token = authHeader
      .replace(/^bearer|^jwt/i, '')
      .replace(/^\s+|\s+$/gi, '')
      .trim();

    // Check if a token is provided after extraction
    if (!token) {
      const response = ApiResponse.http403({
        message: 'A token is required for authentication',
      });
      res.status(response.httpStatusCode).json(response.data);
      return;
    }

    // Verify the JWT using the secret key
    const decoded = jwt.verify(token, config.jwt.accessToken);

    // Extract user information from the decoded token
    const profiles = (decoded as any).profiles as string;
    const user = {
      id: (decoded as any).userId,
      username: (decoded as any).username,
      roles: profiles.split(','),
      email: (decoded as any).email,
    };

    // Attach the user information to the request object
    (req as any).user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err: any) {
    // Handle errors related to token verification
    let errorMessage = 'Failed to authenticate token';
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }
    // Log the error for debugging purposes
    log(err);

    // Respond with an appropriate HTTP status and message
    const response = ApiResponse.http401({ message: errorMessage });
    res.status(response.httpStatusCode).json(response.data);
  }
};

export default verifyJWT;
