import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import adminRouter from './admin/admin_routes';
import adminAuthRouter from './auth/admin_auth_routes';

// Create a new router instance to organize and manage catalog-related routes.
const v1Router = express.Router();
v1Router.use('/v1', adminRouter);
v1Router.use('/v1', adminAuthRouter);

// Export the v1Router so it can be used in the main application.
export default v1Router;
