import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import productCatalogRouter from './productCatalog/productCatalog.routes';
import unitsOfMeasureRouter from './uOM/uOM.routes';
import recipeCatalogRouter from './recipeCatalog/recipeCatalog.routes';

// Create a new router instance to organize and manage catalog-related routes.
const router = express.Router();
router.use('/catalog', productCatalogRouter);
router.use('/catalog', unitsOfMeasureRouter);
router.use('/catalog', recipeCatalogRouter);

// Export the router so it can be used in the main application.
export default router;
