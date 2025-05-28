import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/middlewares/rbac.middleware';
import verifyJWT from '@/middlewares/jwt.middleware';
import { ProductTagController } from '@/api/controllers/admin/goods/product-tag.controller';

const productTagController = Container.get(ProductTagController);
const productTagsRouter = express.Router();
prefixRoutes(productTagsRouter, '/tags');

productTagsRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productTagController.productTagsList(req, res)
);
productTagsRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  productTagController.productTags(req, res)
);
productTagsRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => productTagController.createProductTag(req, res)
);
productTagsRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => productTagController.updateProductTag(req, res)
);
productTagsRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productTagController.deleteProductTag(req, res)
);

export default productTagsRouter;
