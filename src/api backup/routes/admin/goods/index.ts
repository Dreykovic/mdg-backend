import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import categoriesRouter from './category_routes';
import marginsRouter from './margin_level_routes';
import originsRouter from './origin_routes';
import productRouter from './product_routes';
import productTagLinksRouter from './product_tag_link_routes';
import productTagsRouter from './product_tag_routes';
import supplierRouter from './supplier_routes';

// Create a new router instance to organize and manage catalog-related routes.
const goodsRouter = express.Router();
goodsRouter.use('/goods', categoriesRouter);
goodsRouter.use('/goods', marginsRouter);
goodsRouter.use('/goods', originsRouter);
goodsRouter.use('/goods', productRouter);
goodsRouter.use('/goods', productTagLinksRouter);
goodsRouter.use('/goods', productTagsRouter);
goodsRouter.use('/goods', supplierRouter);

// Export the goodsRouter so it can be used in the main application.
export default goodsRouter;
