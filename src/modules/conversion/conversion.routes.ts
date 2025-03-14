import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.

import volumeConversionsRouter from './volume/volume.routes';
import recipeConversionsRouter from './recipe/recipeConversion.routes';

// Create a new router instance to organize and manage Catalog-related routes.
const router = express.Router();

router.use('/conversion', volumeConversionsRouter);
router.use('/conversion', recipeConversionsRouter);

// Export the router so it can be used in the main application.
export default router;
