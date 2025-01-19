/**
 * API router that handles the routing of different modules for the application.
 * The router is responsible for delegating requests to their corresponding module controllers.
 */

import adminAuthModule from '@/modules/adminAuth/adminAuth.module'; // Admin authentication module
import conversionModule from '@/modules/conversion/resources.module';
import filesModule from '@/modules/files/files.module'; // File handling module
import resourcesModule from '@/modules/resources/resources.module'; // Resource management module
import express from 'express'; // Express router to define API routes

// Initialize the API router
const apiRouter = express.Router();

/**
 * Route to handle all admin authentication related requests under the `/v1` version.
 * Delegates requests to the adminAuthModule controller.
 */
apiRouter.use('/v1', adminAuthModule.controller);

/**
 * Route to handle all resource management related requests under the `/v1` version.
 * Delegates requests to the resourcesModule controller.
 */
apiRouter.use('/v1', resourcesModule.controller);

/**
 * Route to handle all resource management related requests under the `/v1` version.
 * Delegates requests to the conversionModule controller.
 */
apiRouter.use('/v1', conversionModule.controller);

/**
 * Route to handle all file management related requests under the `/v1` version.
 * Delegates requests to the filesModule controller.
 */
apiRouter.use('/v1', filesModule.controller);

// Export the configured API router for use in the main app
export default apiRouter;
