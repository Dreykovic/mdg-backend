import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { ProductController } from '@/api/controllers/admin/goods/product_controller';

const productController = Container.get(ProductController);
const productRouter = express.Router();
prefixRoutes(productRouter, '/products');

productRouter.get('/list', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  productController.productsList(req, res)
);
productRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  productController.products(req, res)
);
productRouter.get(
  '/details/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productController.product(req, res)
);
productRouter.post('/save', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  productController.createProduct(req, res)
);
productRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productController.updateProduct(req, res)
);
productRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => productController.deleteProduct(req, res)
);

export default productRouter;
