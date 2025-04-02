import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.

// Importing route handlers for specific catalog-related features.
import originsRouter from './origin/origin.routes'; // Router to handle routes related to "origins".
import categoriesRouter from './category/category.routes'; // Router to handle routes related to "categories".

import marginsRouter from './margin/margin.routes';
import supplierRouter from './supplier/supplier.routes';

import productRouter from './product/product.routes';
import productTagsRouter from './ProductTag/productTag.routes';
import productTagLinksRouter from './ProductTagLink/recipeCategoryLink.routes';

// Create a new router instance to organize and manage catalog-related routes.
const productCatalogRouter = express.Router();

// Mount the origins router under the `/product-catalog` path.
// Routes from `originsRouter` will now be accessible under `/product-catalog/...`.
productCatalogRouter.use('/product-catalog', originsRouter);

// Mount the categories router under the `/product-catalog` path.
// Routes from `categoriesRouter` will now be accessible under `/product-catalog/...`.
productCatalogRouter.use('/product-catalog', categoriesRouter);

// Mount the subcategories router under the `/product-catalog` path.

productCatalogRouter.use('/product-catalog', marginsRouter);
productCatalogRouter.use('/product-catalog', supplierRouter);

productCatalogRouter.use('/product-catalog', productRouter);
productCatalogRouter.use('/product-catalog', productTagsRouter);
productCatalogRouter.use('/product-catalog', productTagLinksRouter);

// Export the router so it can be used in the main application.
export default productCatalogRouter;
