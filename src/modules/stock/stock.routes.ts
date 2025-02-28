import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

import { InventoryController } from './stock.controller';

const inventoryController = Container.get(InventoryController);
const inventoryRouter = express.Router();
prefixRoutes(inventoryRouter, '/inventory');

inventoryRouter.post(
  '/create',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => inventoryController.createInventory(req, res)
);

export default inventoryRouter;
