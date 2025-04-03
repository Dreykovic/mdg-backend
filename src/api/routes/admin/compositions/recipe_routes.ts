import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { RecipeController } from '@/api/controllers/admin/compositions/recipe_controller';

const recipeController = Container.get(RecipeController);
const recipesRouter = express.Router();
prefixRoutes(recipesRouter, '/recipes');

recipesRouter.get('/list', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  recipeController.recipesList(req, res)
);
recipesRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  recipeController.recipes(req, res)
);
recipesRouter.get(
  '/details/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeController.recipe(req, res)
);
recipesRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => recipeController.createRecipe(req, res)
);
recipesRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => recipeController.updateRecipe(req, res)
);
recipesRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeController.deleteRecipe(req, res)
);

export default recipesRouter;
