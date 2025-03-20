import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.

import inventoryRouter from './inventory.routes';
import stockMvtRouter from './stockMvt.routes';

// Create a new router instance to organize and manage catalog-related routes.
const router = express.Router();
router.use('/stock', inventoryRouter);
router.use('/stock', stockMvtRouter);

// Export the router so it can be used in the main application.
export default router;
