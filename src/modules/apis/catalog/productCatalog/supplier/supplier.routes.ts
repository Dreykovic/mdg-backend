import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';

import SupplierController from './supplier.controller';

import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

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
