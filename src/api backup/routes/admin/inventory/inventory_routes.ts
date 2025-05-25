import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/middlewares/rbac.middleware';
import verifyJWT from '@/middlewares/jwt.middleware';
import { InventoryController } from '@/api/controllers/admin/inventory_controller';

const inventoryController = Container.get(InventoryController);
const inventoryRouter = express.Router();
prefixRoutes(inventoryRouter, '/inventory');

inventoryRouter.post(
  '/create',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => inventoryController.createInventory(req, res)
);
inventoryRouter.get(
  '/get/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => inventoryController.getInventory(req, res)
);
inventoryRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => inventoryController.updateInventory(req, res)
);

export default inventoryRouter;
