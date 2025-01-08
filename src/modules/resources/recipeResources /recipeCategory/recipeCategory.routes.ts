import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { RecipeCategoryController } from './recipeCategory.controller';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

const recipeCategoryController = Container.get(RecipeCategoryController);
const recipeCategoriesRouter = express.Router();
prefixRoutes(recipeCategoriesRouter, '/recipe-categories');

recipeCategoriesRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeCategoryController.recipeCategoriesList(req, res)
);
recipeCategoriesRouter.get(
  '/',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeCategoryController.recipeCategories(req, res)
);
recipeCategoriesRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => recipeCategoryController.createRecipeCategory(req, res)
);
recipeCategoriesRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => recipeCategoryController.updateRecipeCategory(req, res)
);
recipeCategoriesRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeCategoryController.deleteRecipeCategory(req, res)
);

export default recipeCategoriesRouter;
