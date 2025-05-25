import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { VolumeConversionController } from '@/api/controllers/admin/conversion/volume_conversion_controller';

const volumeConversionController = Container.get(VolumeConversionController);
const volumeConversionsRouter = express.Router();
prefixRoutes(volumeConversionsRouter, '/volume');

volumeConversionsRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => volumeConversionController.volumeConversionsList(req, res)
);
volumeConversionsRouter.get(
  '/',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => volumeConversionController.volumeConversions(req, res)
);
volumeConversionsRouter.post(
  '/save',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => volumeConversionController.createVolumeConversion(req, res)
);

volumeConversionsRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => volumeConversionController.deleteVolumeConversion(req, res)
);

export default volumeConversionsRouter;
