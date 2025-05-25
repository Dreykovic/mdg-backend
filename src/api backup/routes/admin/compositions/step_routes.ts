import express from 'express';
import Container from 'typedi';
import prefixRoutes from '@/core/middlewares/prefixRoutes.middleware';
import { rbacMiddleware } from '@/core/middlewares/rbac.middleware';
import verifyJWT from '@/core/middlewares/jwt.middleware';
import { StepController } from '@/api/controllers/admin/compositions/step_controller';

const stepController = Container.get(StepController);
const stepsRouter = express.Router();
prefixRoutes(stepsRouter, '/steps');

stepsRouter.get('/list', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  stepController.stepsList(req, res)
);
stepsRouter.get('/', verifyJWT, rbacMiddleware(['ADMIN']), (req, res) =>
  stepController.steps(req, res)
);
stepsRouter.post(
  '/save',
  verifyJWT,

  rbacMiddleware(['ADMIN']),

  (req, res) => stepController.createStep(req, res)
);
stepsRouter.put(
  '/update/:modelId',
  verifyJWT,
  rbacMiddleware(['ADMIN']),

  (req, res) => stepController.updateStep(req, res)
);
stepsRouter.delete(
  '/delete',
  verifyJWT,
  rbacMiddleware(['ADMIN']),
  (req, res) => stepController.deleteStep(req, res)
);

export default stepsRouter;
