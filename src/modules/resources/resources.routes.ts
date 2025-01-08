import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import productResourcesRouter from './productResources/productResources.routes';
import unitsOfMeasureRouter from './uOM/uOM.routes';
import recipeResourcesRouter from './recipeResources /recipeResources.routes';

// Create a new router instance to organize and manage resource-related routes.
const router = express.Router();
router.use('/resources', productResourcesRouter);
router.use('/resources', unitsOfMeasureRouter);
router.use('/resources', recipeResourcesRouter);

// Export the router so it can be used in the main application.
export default router;
