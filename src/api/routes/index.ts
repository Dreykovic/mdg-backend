import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import adminRouter from './admin/admin_routes';
import adminAuthRouter from './auth/admin_auth_routes';

// Create a new router instance to organize and manage catalog-related routes.
const apiRouter = express.Router();
apiRouter.use('/v1', adminRouter);
apiRouter.use('/v1', adminAuthRouter);

// Export the apiRouter so it can be used in the main application.
export default apiRouter;
