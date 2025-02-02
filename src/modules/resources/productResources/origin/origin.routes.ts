import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { OriginController } from './origin.controller';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';

const originController = Container.get(OriginController);
const originsRouter = express.Router();
prefixRoutes(originsRouter, '/origins');

originsRouter.get('/list', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  originController.originsList(req, res)
);
originsRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  originController.origins(req, res)
);
originsRouter.post('/save', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  originController.createOrigin(req, res)
);

originsRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => originController.updateOrigin(req, res)
);
originsRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => originController.deleteOrigin(req, res)
);

export default originsRouter;
