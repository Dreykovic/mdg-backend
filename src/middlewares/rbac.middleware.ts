/**
 * rbac.middleware.ts
 *
 * This middleware implements Role-Based Access Control (RBAC) by checking whether
 * the authenticated user has the necessary roles to access a specific route or resource.
 *
 * Key functionalities:
 * - Ensures the user is authenticated and has roles defined.
 * - Validates if the user's roles intersect with the allowed roles for the resource.
 * - Responds with appropriate HTTP status codes and error messages for unauthorized access.
 *
 * Usage example:
 * ```typescript
 * import express from 'express';
 * import { rbacMiddleware } from './rbacMiddleware';
 *
 * const app = express();
 *
 * app.use('/admin', rbacMiddleware(['admin']), (req, res) => {
 *   res.send('Welcome, Admin!');
 * });
 * ```
 */

import { NextFunction, Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';

/**
 * Middleware for Role-Based Access Control (RBAC).
 *
 * @param {string[]} allowedRoles - List of roles authorized to access the resource.
 * @returns Middleware function to enforce role-based access control.
 */
export const createRbacMiddleware = (allowedRoles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void => {
    try {
      // Check if the user is authenticated and has roles defined
      if (!(req as any).user) {
        const response = ApiResponse.http403({
          message: "You don't have the right permission",
        });
        res.status(response.httpStatusCode).json(response.data);
        return;
      }

      // Retrieve the roles of the authenticated user
      const userRoles: string[] = (req as any).user.roles;

      // Check if the user's roles match any of the allowed roles
      const allowed = userRoles.some((role) => allowedRoles.includes(role));

      if (!allowed) {
        const response = ApiResponse.http403({
          message: "You don't have the right permission",
        });
        res.status(response.httpStatusCode).json(response.data);
        return;
      }

      // If the user has an authorized role, proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Handle unexpected errors
      const response = ApiResponse.http500('', {
        message: (error as Error).message || 'Internal Server Error',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  };
};
