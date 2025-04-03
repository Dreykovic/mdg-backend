import express from 'express'; // Importing the Express framework for creating routes and handling HTTP requests.
import compositionRouter from './compositions';
import conversionRouter from './conversion';
import stockRouter from './inventory';
import goodsRouter from './goods';

// Create a new router instance to organize and manage catalog-related routes.
const adminRouter = express.Router();
adminRouter.use('/admin', compositionRouter);
adminRouter.use('/admin', conversionRouter);
adminRouter.use('/admin', goodsRouter);
adminRouter.use('/admin', stockRouter);

// Export the adminRouter so it can be used in the main application.
export default adminRouter;
