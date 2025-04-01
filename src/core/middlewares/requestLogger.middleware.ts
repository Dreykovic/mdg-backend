/**
 * http-logger.middleware.ts
 *
 * Middleware Express pour logger les requêtes HTTP avec Pino
 */

import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import config from '@/config';
import logger from '../utils/logger.util';

// Configuration des options pour pino-http
const httpLogger = pinoHttp({
  logger,

  // Ne pas générer un logger séparé, utiliser notre instance
  wrapSerializers: false,

  // Personnaliser les données de requête à logger
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      path: req.path,
      parameters: {
        query: req.query,
        params: req.params,
      },
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'x-forwarded-for':
          req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      },
      // Ne pas logger les corps de requête en production pour des raisons de sécurité
      ...(config.isDev && { body: req.body }),
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeader('content-type'),
        'content-length': res.getHeader('content-length'),
      },
    }),
  },

  // Configurer quand générer les logs de réponse
  autoLogging: {
    ignore: (req: Request) => {
      // Ignorer les requêtes de healthcheck et les assets statiques
      return (
        req.url.includes('/health') ||
        req.url.includes('/favicon.ico') ||
        req.url.startsWith('/public/')
      );
    },
  },

  // Pour les applications e-commerce, c'est utile de logger les temps de réponse
  customLogLevel: (req, res) => {
    if (res.statusCode >= 500) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    if (res.statusCode >= 300) {
      return 'info';
    }
    return 'debug';
  },

  // Ajouter des métadonnées personnalisées
  customProps: (req) => {
    return {
      userAgent: req.headers['user-agent'],
      correlationId: req.headers['x-correlation-id'] || req.id,
    };
  },
});

// Middleware d'enrichissement pour ajouter plus d'informations contextuelles
const enrichLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Ajouter des informations utilisateur si disponibles
  if ((req as any).user) {
    // @ts-ignore - Pino allows child loggers with custom properties
    (req as any).log = (req as any).log.child({
      userId: ((req as any).user as any).id,
      userRole: ((req as any).user as any).role,
    });
  }

  next();
};

// Exporter le middleware comme une fonction qui combine les deux
export const requestLogger = () => {
  return [httpLogger, enrichLoggerMiddleware];
};

export default requestLogger;
