import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { UOMController } from '@/api/controllers/admin/conversion/unit_of_measure_controller';

const uOMController = Container.get(UOMController);
const unitsOfMeasureRouter = express.Router();
prefixRoutes(unitsOfMeasureRouter, '/us-o-m');

unitsOfMeasureRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => uOMController.unitsOfMeasureList(req, res)
);
unitsOfMeasureRouter.get(
  '/',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => uOMController.unitsOfMeasure(req, res)
);
unitsOfMeasureRouter.post(
  '/save',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => uOMController.createUnitOfMeasure(req, res)
);
unitsOfMeasureRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => uOMController.updateUnitOfService(req, res)
);
unitsOfMeasureRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => uOMController.deleteUnitOfMeasure(req, res)
);

export default unitsOfMeasureRouter;
