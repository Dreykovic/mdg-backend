import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.

// Importing route handlers for specific resource-related features.
import originsRouter from './origin/origin.routes'; // Router to handle routes related to "origins".
import categoriesRouter from './category/category.routes'; // Router to handle routes related to "categories".

import marginsRouter from './margin/margin.routes';
import supplierRouter from './supplier/supplier.routes';

import productRouter from './product/product.routes';
import productTagsRouter from './ProductTag/productTag.routes';

// Create a new router instance to organize and manage resource-related routes.
const productResourcesRouter = express.Router();

// Mount the origins router under the `/product-resources` path.
// Routes from `originsRouter` will now be accessible under `/product-resources/...`.
productResourcesRouter.use('/product-resources', originsRouter);

// Mount the categories router under the `/product-resources` path.
// Routes from `categoriesRouter` will now be accessible under `/product-resources/...`.
productResourcesRouter.use('/product-resources', categoriesRouter);

// Mount the subcategories router under the `/product-resources` path.

productResourcesRouter.use('/product-resources', marginsRouter);
productResourcesRouter.use('/product-resources', supplierRouter);

productResourcesRouter.use('/product-resources', productRouter);
productResourcesRouter.use('/product-resources', productTagsRouter);

// Export the router so it can be used in the main application.
export default productResourcesRouter;
