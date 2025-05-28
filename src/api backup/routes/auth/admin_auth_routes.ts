import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/middlewares/prefixRoutes.middleware';
import verifyJWT from '@/middlewares/jwt.middleware';
import { rbacMiddleware } from '@/middlewares/rbac.middleware';
import { authRateLimiter } from '@/middlewares/rateLimiter.middleware';
import AdminAuthController from '@/api/controllers/auth/admin-auth.controller';

// Get the instance of AdminAuthController from the container
const adminAuthController = Container.get(AdminAuthController);

// Create a new express adminAuthRouter
const adminAuthRouter = express.Router();

// Apply the prefix for all routes under the '/admin-auth' path
prefixRoutes(adminAuthRouter, '/admin-auth');

// Route for admin sign-in (POST request)
adminAuthRouter.post('/sign-in', authRateLimiter, (req, res) =>
  adminAuthController.signIn(req, res)
);

// Route for refreshing the authentication token (POST request)
adminAuthRouter.post('/refresh', (req, res) =>
  adminAuthController.refresh(req, res)
);

// Route for logging out the admin (DELETE request)
adminAuthRouter.delete('/sign-out', (req, res) =>
  adminAuthController.logout(req, res)
);

// Route for logging out the admin from all sessions (DELETE request)
adminAuthRouter.delete('/close-all-sessions', (req, res) =>
  adminAuthController.logoutAll(req, res)
);
// Route for retrieve all active sessions the authentication token (POST request)
adminAuthRouter.get(
  '/all-active-sessions',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => adminAuthController.getActiveSessions(req, res)
);
// Export the configured adminAuthRouter
export default adminAuthRouter;
