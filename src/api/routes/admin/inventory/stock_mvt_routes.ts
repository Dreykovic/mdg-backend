import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { InventoryController } from '@/api/controllers/admin/inventory_controller';

const stockMvtController = Container.get(InventoryController);
const stockMvtRouter = express.Router();
prefixRoutes(stockMvtRouter, '/stock-movement');

stockMvtRouter.post('/save', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  stockMvtController.createStockMovement(req, res)
);

export default stockMvtRouter;
