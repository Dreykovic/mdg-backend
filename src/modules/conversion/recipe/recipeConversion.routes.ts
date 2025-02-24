import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { RecipeConversionController } from './recipeConversion.controller';

const recipeConversionController = Container.get(RecipeConversionController);
const recipeConversionsRouter = express.Router();
prefixRoutes(recipeConversionsRouter, '/recipe');

recipeConversionsRouter.post(
  '/add',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeConversionController.getRecipe(req, res)
);

export default recipeConversionsRouter;
