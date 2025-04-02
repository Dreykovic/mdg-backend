import express from 'express';
import FilesController from './files.controller';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { setDefaultParam } from '@/core/middlewares/setDefaultParam.middleware.';
import {
  CATEGORY_IMAGE_DIRECTORY,
  SUBCATEGORY_IMAGE_DIRECTORY,
  SUPPLIER_IMAGE_DIRECTORY,
} from '@/core/constants/images';

// Get the instance of AdminAuthController from the container
const filesController = Container.get(FilesController);

// Create a new express router
const router = express.Router();

// Apply the prefix for all routes under the '/admin-auth' path
prefixRoutes(router, '/assets');

// Route for retrieve all active sessions the authentication token (POST request)
router.get(
  '/categories/:fileRef',
  setDefaultParam('directory', CATEGORY_IMAGE_DIRECTORY),
  (req, res) => filesController.getFile(req, res)
);
router.get(
  '/sub-categories/:fileRef',
  setDefaultParam('directory', SUBCATEGORY_IMAGE_DIRECTORY),
  (req, res) => filesController.getFile(req, res)
);
router.get(
  '/suppliers/:fileRef',
  setDefaultParam('directory', SUPPLIER_IMAGE_DIRECTORY),
  (req, res) => filesController.getFile(req, res)
);
// Export the configured router
export default router;
