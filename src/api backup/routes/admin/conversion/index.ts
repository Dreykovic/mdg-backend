import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import volumeConversionsRouter from './volume_routes';
import recipeConversionsRouter from './recipe_conversion_routes';
import unitsOfMeasureRouter from './unit_of_measur_routes';

// Create a new router instance to organize and manage Catalog-related routes.
const conversionRouter = express.Router();

conversionRouter.use('/conversion', volumeConversionsRouter);
conversionRouter.use('/conversion', recipeConversionsRouter);
conversionRouter.use(unitsOfMeasureRouter);

// Export the conversionRouter so it can be used in the main application.
export default conversionRouter;
