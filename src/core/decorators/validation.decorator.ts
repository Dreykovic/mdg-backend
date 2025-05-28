/* eslint-disable @typescript-eslint/naming-convention */
// core/decorators/validation.decorator.ts
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Classe d'erreur personnalisée pour la validation
export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Array<{
      field: string;
      message: string;
      code: string;
    }>,
    public source: 'params' | 'query' | 'body'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

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
            throw new ValidationError(
              'Parameters validation failed',
              paramsResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
              'params'
            );
          }
          req.params = paramsResult.data as any;
        }

        // Valider query
        if (schemas.query) {
          const queryResult = schemas.query.safeParse(req.query);
          if (!queryResult.success) {
            throw new ValidationError(
              'Query validation failed',
              queryResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
              'query'
            );
          }
          req.query = queryResult.data as any;
        }

        // Valider body
        if (schemas.body) {
          const bodyResult = schemas.body.safeParse(req.body);
          if (!bodyResult.success) {
            throw new ValidationError(
              'Body validation failed',
              bodyResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
              'body'
            );
          }
          req.body = bodyResult.data;
        }

        return await originalMethod.call(this, req, res, next);
      } catch (err) {
        // Laisser ControllerErrorHandler gérer toutes les erreurs
        throw err;
      }
    };

    return descriptor;
  };
}

// Décorateurs individuels (si vous préférez parfois séparer)
// export function ValidateBody<T extends z.ZodType>(schema: T): PropertyDescriptor {
//   return ValidateRequest({ body: schema });
// }

// export function ValidateQuery<T extends z.ZodType>(schema: T) {
//   return ValidateRequest({ query: schema });
// }

// export function ValidateParams<T extends z.ZodType>(schema: T) {
//   return ValidateRequest({ params: schema });
// }
