// decorators/errorHandler.decorator.ts
import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { PrismaService } from '@/database/prisma/prisma.service';
import logger from '../utils/logger.util';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ControllerErrorHandler(defaultMessage = 'An error occurred') {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      ...args: any[]
    ): Promise<void> {
      try {
        await originalMethod.apply(this, [req, res, ...args]);
      } catch (error) {
        logger.debug(error);
        const response = ApiResponse.http401({
          message: (error as Error).message || defaultMessage,
        });
        res.status(response.httpStatusCode).json(response.data);
      }
    };

    return descriptor;
  };
}

/**
 * Décorateur pour gérer les erreurs dans les services
 * @param customMessage - Message d'erreur personnalisé (optionnel)
 * @param logOperation - Si true, log le nom de l'opération (défaut: true)
 * @param preserveOriginalError - Si true, preserve l'erreur originale, sinon wrap dans une nouvelle Error (défaut: false)
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ServiceErrorHandler(
  customMessage?: string,
  logOperation = true,
  preserveOriginalError = false
) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      try {
        if (logOperation) {
          logger.debug(
            `Service operation: ${target.constructor.name}.${String(propertyKey)}`
          );
        }
        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.debug(
          `Error in ${target.constructor.name}.${String(propertyKey)}:`,
          error
        );

        if (preserveOriginalError) {
          throw error;
        }

        const errorMessage =
          (typeof customMessage === 'string' && customMessage.trim().length > 0
            ? customMessage
            : (error as Error).message) ||
          `Error in ${String(propertyKey)} operation`;

        throw new PrismaService().handleError(error) ?? new Error(errorMessage);
      }
    };

    return descriptor;
  };
}

/**
 * Décorateur spécialisé pour les opérations d'authentification
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function AuthServiceErrorHandler(
  customMessage = 'Authentication operation failed'
): MethodDecorator {
  return ServiceErrorHandler(customMessage, true, false);
}

/**
 * Décorateur pour les opérations critiques qui doivent préserver l'erreur originale
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CriticalServiceErrorHandler(
  customMessage?: string
): MethodDecorator {
  return ServiceErrorHandler(customMessage, true, true);
}
