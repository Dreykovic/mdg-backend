import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.

import volumeConversionsRouter from './volume/volume.routes';

// Create a new router instance to organize and manage resource-related routes.
const router = express.Router();

router.use('/conversion', volumeConversionsRouter);

// Export the router so it can be used in the main application.
export default router;
