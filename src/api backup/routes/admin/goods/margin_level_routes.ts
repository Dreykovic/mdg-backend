import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/middlewares/prefixRoutes.middleware';

import verifyJWT from '@/middlewares/jwt.middleware';
import { rbacMiddleware } from '@/middlewares/rbac.middleware';
import { MarginController } from '@/api/controllers/admin/goods/margin-level.controller';

const marginController = Container.get(MarginController);
const marginsRouter = express.Router();
prefixRoutes(marginsRouter, '/margins');

marginsRouter.get('/list', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  marginController.marginList(req, res)
);
marginsRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  marginController.margins(req, res)
);
marginsRouter.post('/save', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  marginController.createMargin(req, res)
);

marginsRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => marginController.updateMargin(req, res)
);
marginsRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => marginController.deleteMargin(req, res)
);

export default marginsRouter;
