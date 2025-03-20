import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

import { StockController } from './stock.controller';

const stockMvtController = Container.get(StockController);
const stockMvtRouter = express.Router();
prefixRoutes(stockMvtRouter, '/stock-movement');

stockMvtRouter.post('/save', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  stockMvtController.createStockMovement(req, res)
);

export default stockMvtRouter;
