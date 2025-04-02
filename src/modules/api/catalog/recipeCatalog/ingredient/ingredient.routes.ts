import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { IngredientController } from './ingredient.controller';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

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
