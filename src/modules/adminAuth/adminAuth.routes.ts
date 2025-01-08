import express from 'express';
import AdminAuthController from './adminAuth.controller';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';

// Get the instance of AdminAuthController from the container
const adminAuthController = Container.get(AdminAuthController);

// Create a new express router
const router = express.Router();

// Apply the prefix for all routes under the '/admin-auth' path
prefixRoutes(router, '/admin-auth');

// Route for admin sign-in (POST request)
router.post('/sign-in', (req, res) => adminAuthController.signIn(req, res));

// Route for refreshing the authentication token (POST request)
router.post('/refresh', (req, res) => adminAuthController.refresh(req, res));

// Route for logging out the admin (DELETE request)
router.delete('/sign-out', (req, res) => adminAuthController.logout(req, res));

// Route for logging out the admin from all sessions (DELETE request)
router.delete('/close-all-sessions', (req, res) =>
  adminAuthController.logoutAll(req, res)
);
// Route for retrieve all active sessions the authentication token (POST request)
router.get(
  '/all-active-sessions',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => adminAuthController.getActiveSessions(req, res)
);
// Export the configured router
export default router;
