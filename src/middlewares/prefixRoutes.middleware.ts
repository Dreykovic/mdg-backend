/**
 * prefixRoutes.middleware.ts
 *
 * This utility function dynamically adds a prefix to all route paths defined in
 * an Express router instance. It modifies the router's HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
 * to prepend the given prefix to the route URLs before they are registered.
 *
 * Key functionalities:
 * - Intercepts the router methods to append a prefix to all paths.
 * - Maintains the original behavior of the Express router methods.
 * - Ensures that dynamic routing is simplified and consistent across the application.
 *
 * Usage example:
 * ```typescript
 * import express from 'express';
 * import prefixRoutes from './prefixRoutes';
 *
 * const router = express.Router();
 * prefixRoutes(router, '/api/v1');
 *
 * router.get('/users', (req, res) => res.send('Users endpoint'));
 * // The actual route will be '/api/v1/users'.
 * ```
 */

import express from 'express';

/**
 * Middleware to dynamically add a prefix to all routes in an Express router.
 *
 * @param {express.Router} router - The Express router instance to be prefixed.
 * @param {string} prefix - The prefix to add to each route path.
 */
const prefixRoutes = (router: express.Router, prefix: string) => {
  // List of HTTP methods to override in the router
  const methods = ['get', 'post', 'put', 'delete', 'patch', 'all'];

  // Loop through each HTTP method
  methods.forEach((method) => {
    // Store the original method for later use
    const originalMethod = router[method as keyof express.Router] as Function;

    // Override the method
    router[method as keyof express.Router] = function (...args: any[]) {
      // Check if the first argument is a string (route path)
      if (typeof args[0] === 'string') {
        // Prepend the prefix to the route path
        args[0] = prefix + args[0];
      }
      // Call the original method with the updated arguments
      return originalMethod.apply(router, args);
    } as any;
  });
};

export default prefixRoutes;
