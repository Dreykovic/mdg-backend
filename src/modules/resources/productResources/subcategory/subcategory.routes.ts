import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import SubcategoryController from './subcategory.controller';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';

const subcategoryController = Container.get(SubcategoryController);
const subcategoriesRouter = express.Router();
prefixRoutes(subcategoriesRouter, '/sub-categories');

subcategoriesRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => subcategoryController.subcategoriesList(req, res)
);
subcategoriesRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  subcategoryController.subcategories(req, res)
);
subcategoriesRouter.post(
  '/save',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => subcategoryController.createSubcategory(req, res)
);
subcategoriesRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => subcategoryController.updateSubcategory(req, res)
);
subcategoriesRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => subcategoryController.deleteSubcategory(req, res)
);

export default subcategoriesRouter;
