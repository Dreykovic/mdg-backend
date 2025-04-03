import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import inventoryRouter from './inventory_routes';
import stockMvtRouter from './stock_mvt_routes';

// Create a new router instance to organize and manage catalog-related routes.
const stockRouter = express.Router();
stockRouter.use('/stock', inventoryRouter);
stockRouter.use('/stock', stockMvtRouter);

// Export the stockRouter so it can be used in the main application.
export default stockRouter;
