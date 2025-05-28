/* eslint-disable @typescript-eslint/naming-convention */
// decorators/errorHandler.decorator.ts
import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ValidationError } from '@/core/decorators/validation.decorator'; // Import ajouté
import logger from '../utils/logger.util';

export function ControllerErrorHandler(
  defaultMessage = 'An error occurred',
  code = 400
) {
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
    ): Promise<void | Response<any, Record<string, any>>> {
      try {
        return await originalMethod.apply(this, [req, res, ...args]);
      } catch (error) {
        // Gestion spéciale pour ValidationError
        if (error instanceof ValidationError) {
          logger.debug(`Validation error in ${propertyKey.toString()}:`, {
            source: error.source,
            details: error.details,
            method: req.method,
            url: req.url,
          });

          const response = ApiResponse.http400({
            message: error.message,
            type: 'ValidationError',
            details: error.details,
          });
          return res.status(response.httpStatusCode).json(response.data);
        }

        // Gestion normale des autres erreurs (votre code existant)
        const errorMessage = (error as Error)?.message || defaultMessage;

        logger.error(`Controller error in ${propertyKey.toString()}:`, {
          error: errorMessage,
          method: req.method,
          url: req.url,
          statusCode: code,
        });

        // Map direct des codes vers les méthodes ApiResponse
        const responseMap: Record<number, () => any> = {
          400: () => ApiResponse.http400({ message: errorMessage }),
          401: () => ApiResponse.http401({ message: errorMessage }),
          403: () => ApiResponse.http403({ message: errorMessage }),
          404: () => ApiResponse.http404({ message: errorMessage }),
          422: () => ApiResponse.http422({ message: errorMessage }),
          500: () => ApiResponse.http500(errorMessage, error),
        };

        const response = responseMap[code] ?? responseMap[400];
        if (typeof response === 'function') {
          const result = response();
          return res.status(result.httpStatusCode).json(result.data);
        }
        // Fallback in case no valid response function is found
        return res.status(500).json({ message: defaultMessage });
      }
    };

    return descriptor;
  };
}

// Vos autres décorateurs restent inchangés
/**
 * Décorateur pour gérer les erreurs dans les services
 * @param customMessage - Message d'erreur personnalisé (optionnel)
 * @param logOperation - Si true, log le nom de l'opération (défaut: true)
 * @param preserveOriginalError - Si true, preserve l'erreur originale, sinon wrap dans une nouvelle Error (défaut: false)
 */
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
export function AuthServiceErrorHandler(
  customMessage = 'Authentication operation failed'
): MethodDecorator {
  return ServiceErrorHandler(customMessage, true, false);
}

/**
 * Décorateur pour les opérations critiques qui doivent préserver l'erreur originale
 */
export function CriticalServiceErrorHandler(
  customMessage?: string
): MethodDecorator {
  return ServiceErrorHandler(customMessage, true, true);
}
