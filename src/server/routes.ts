import v1Router from '@/api/routes';
import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.

// Create a new router instance to organize and manage catalog-related routes.
const apiRouter = express.Router();
apiRouter.use(v1Router);

// Export the apiRouter so it can be used in the main application.
export default apiRouter;
