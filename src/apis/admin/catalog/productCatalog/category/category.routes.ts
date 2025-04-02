import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { CategoryController } from './category.controller';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

const categoryController = Container.get(CategoryController);
const categoriesRouter = express.Router();
prefixRoutes(categoriesRouter, '/categories');

categoriesRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => categoryController.categoriesList(req, res)
);
categoriesRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  categoryController.categories(req, res)
);
categoriesRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => categoryController.createCategory(req, res)
);
categoriesRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => categoryController.updateCategory(req, res)
);
categoriesRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => categoryController.deleteCategory(req, res)
);

export default categoriesRouter;
