import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/middlewares/prefixRoutes.middleware';

import { rbacMiddleware } from '@/middlewares/rbac.middleware';
import verifyJWT from '@/middlewares/jwt.middleware';
import SupplierController from '@/api/controllers/admin/goods/supplier_controller';

const supplierController = Container.get(SupplierController);
const supplierRouter = express.Router();
prefixRoutes(supplierRouter, '/suppliers');

supplierRouter.get('/list', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  supplierController.suppliersList(req, res)
);
supplierRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  supplierController.suppliers(req, res)
);
supplierRouter.post(
  '/save',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => supplierController.createSupplier(req, res)
);

supplierRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => supplierController.updateSupplier(req, res)
);
supplierRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => supplierController.deleteSupplier(req, res)
);

export default supplierRouter;
