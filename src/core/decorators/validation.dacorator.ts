/* eslint-disable @typescript-eslint/naming-convention */
// core/decorators/validation.decorator.ts
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ApiResponse from '@/core/utils/apiResponse.util';
import logger from '@/core/utils/logger.util';

export function ValidateBody<T extends z.ZodType>(schema: T) {
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
    ): Promise<any> {
      try {
        const result = schema.safeParse(req.body);

        if (!result.success) {
          logger.debug('Body Validation Error:', result.error.errors);
          const response = ApiResponse.http400({
            message: 'Validation failed',
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          });
          return res.status(response.httpStatusCode).json(response.data);
        }

        // Remplacer par les données validées et transformées
        req.body = result.data;
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

export function ValidateQuery<T extends z.ZodType>(schema: T) {
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
    ): Promise<any> {
      try {
        const result = schema.safeParse(req.query);

        if (!result.success) {
          logger.debug('Query Validation Error:', result.error.errors);
          const response = ApiResponse.http400({
            message: 'Query validation failed',
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          });
          return res.status(response.httpStatusCode).json(response.data);
        }

        req.query = result.data as any;
        return await originalMethod.call(this, req, res, next);
      } catch (err) {
        logger.error('Query validation decorator error:', err);
        const response = ApiResponse.http500('Internal validation error', err);
        return res.status(response.httpStatusCode).json(response.data);
      }
    };

    return descriptor;
  };
}

export function ValidateParams<T extends z.ZodType>(schema: T) {
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
    ): Promise<any> {
      try {
        const result = schema.safeParse(req.params);

        if (!result.success) {
          logger.debug('Params Validation Error:', result.error.errors);
          const response = ApiResponse.http400({
            message: 'Parameters validation failed',
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          });
          return res.status(response.httpStatusCode).json(response.data);
        }

        req.params = result.data as any;
        return await originalMethod.call(this, req, res, next);
      } catch (err) {
        logger.error('Params validation decorator error:', err);
        const response = ApiResponse.http500('Internal validation error', err);
        return res.status(response.httpStatusCode).json(response.data);
      }
    };

    return descriptor;
  };
}

// Décorateur composé pour validation complète
export function ValidateRequest<
  B extends z.ZodType,
  Q extends z.ZodType,
  P extends z.ZodType,
>(options: { body?: B; query?: Q; params?: P }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    // Appliquer les validateurs dans l'ordre inverse (params -> query -> body)
    if (options.params) {
      ValidateParams(options.params)(target, propertyKey, descriptor);
    }
    if (options.query) {
      ValidateQuery(options.query)(target, propertyKey, descriptor);
    }
    if (options.body) {
      ValidateBody(options.body)(target, propertyKey, descriptor);
    }

    return descriptor;
  };
}
