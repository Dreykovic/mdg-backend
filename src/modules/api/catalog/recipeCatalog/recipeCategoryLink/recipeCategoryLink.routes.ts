import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';

import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';

import { RecipeCategoryLinkController } from './recipeCategoryLink.controller';

const recipeCategoryLinkController = Container.get(
  RecipeCategoryLinkController
);
const recipeCategoryLinksRouter = express.Router();
prefixRoutes(recipeCategoryLinksRouter, '/recipe-category-links');

recipeCategoryLinksRouter.get(
  '/list',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeCategoryLinkController.recipeCategoryLinksList(req, res)
);
recipeCategoryLinksRouter.get(
  '/',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeCategoryLinkController.recipeCategoryLinks(req, res)
);
recipeCategoryLinksRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => recipeCategoryLinkController.createRecipeCategoryLink(req, res)
);
recipeCategoryLinksRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => recipeCategoryLinkController.updateRecipeCategoryLink(req, res)
);
recipeCategoryLinksRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => recipeCategoryLinkController.deleteRecipeCategoryLink(req, res)
);

export default recipeCategoryLinksRouter;
