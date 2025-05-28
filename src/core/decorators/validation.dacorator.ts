/* eslint-disable @typescript-eslint/naming-convention */
// core/decorators/validation.decorator.ts
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ApiResponse from '@/core/utils/apiResponse.util';
import logger from '@/core/utils/logger.util';
// Dans validation.decorators.ts - ajoutez cette fonction
export function ValidateRequest<
  B extends z.ZodType,
  Q extends z.ZodType,
  P extends z.ZodType,
>(schemas: { body?: B; query?: Q; params?: P }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next?: NextFunction
    ): Promise<Response | void> {
      try {
        // Valider params
        if (schemas.params) {
          const paramsResult = schemas.params.safeParse(req.params);
          if (!paramsResult.success) {
            return handleValidationError(
              res,
              'Parameters validation failed',
              paramsResult.error
            );
          }
          req.params = paramsResult.data as any;
        }

        // Valider query
        if (schemas.query) {
          const queryResult = schemas.query.safeParse(req.query);
          if (!queryResult.success) {
            return handleValidationError(
              res,
              'Query validation failed',
              queryResult.error
            );
          }
          req.query = queryResult.data as any;
        }

        // Valider body
        if (schemas.body) {
          const bodyResult = schemas.body.safeParse(req.body);
          if (!bodyResult.success) {
            return handleValidationError(
              res,
              'Body validation failed',
              bodyResult.error
            );
          }
          req.body = bodyResult.data;
        }

        return await originalMethod.call(this, req, res, next);
      } catch (err) {
        logger.error('Validation decorator error:', err);
        const response = ApiResponse.http500('Internal validation error', err);
        return res.status(response.httpStatusCode).json(response.data);
      }
    };

    return descriptor;
  };
}

// Fonction helper pour les erreurs
function handleValidationError(
  res: Response,
  message: string,
  error: z.ZodError
): Response {
  logger.debug('Validation Error:', error.errors);
  const response = ApiResponse.http400({
    message,
    type: 'ValidationError',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  });
  return res.status(response.httpStatusCode).json(response.data);
}
