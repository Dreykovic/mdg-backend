import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/middlewares/rbac.middleware';
import verifyJWT from '@/middlewares/jwt.middleware';
import { IngredientController } from '@/api/controllers/admin/compositions/ingredient_controller';

const ingredientController = Container.get(IngredientController);
const ingredientsRouter = express.Router();
prefixRoutes(ingredientsRouter, '/ingredients');

ingredientsRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => ingredientController.ingredientsList(req, res)
);
ingredientsRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  ingredientController.ingredients(req, res)
);
ingredientsRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => ingredientController.createIngredient(req, res)
);
ingredientsRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => ingredientController.updateIngredient(req, res)
);
ingredientsRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => ingredientController.deleteIngredient(req, res)
);

export default ingredientsRouter;
