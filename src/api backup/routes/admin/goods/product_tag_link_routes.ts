import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';

import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { ProductTagLinkController } from '@/api/controllers/admin/goods/product_tag_link_controller';

const productTagLinkController = Container.get(ProductTagLinkController);
const productTagLinksRouter = express.Router();
prefixRoutes(productTagLinksRouter, '/tag-links');

productTagLinksRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productTagLinkController.tagLinksList(req, res)
);
productTagLinksRouter.get(
  '/product/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productTagLinkController.productTagLinksList(req, res)
);
productTagLinksRouter.get(
  '/',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productTagLinkController.productTagLinks(req, res)
);
productTagLinksRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => productTagLinkController.createProductTagLink(req, res)
);
productTagLinksRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => productTagLinkController.updateProductTagLink(req, res)
);
productTagLinksRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productTagLinkController.deleteProductTagLink(req, res)
);

export default productTagLinksRouter;
