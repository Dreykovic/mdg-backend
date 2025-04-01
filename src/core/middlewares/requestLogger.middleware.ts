/**
 * http-logger.middleware.ts
 *
 * Middleware Express pour logger les requêtes HTTP avec Pino
 * - Affiche le minimum dans la console
 * - Enregistre les détails complets dans les fichiers de log
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
    req: (req) => {
      // Important: Ne pas modifier l'objet req directement, juste créer un nouvel objet

      // Version minimale pour l'affichage console
      const minimalInfo = {
        method: req.method,
        url: req.url,
      };

      // Informations détaillées pour les fichiers de log
      const detailedInfo = {
        id: req.id,
        method: req.method,
        url: req.url,
        path: req.path,
        parameters: {
          query: req.query ? { ...req.query } : {}, // Copie de req.query au lieu de modification directe
          params: req.params ? { ...req.params } : {}, // Copie de req.params au lieu de modification directe
        },
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'x-forwarded-for':
            req.headers['x-forwarded-for'] ||
            (req.socket ? req.socket.remoteAddress : null),
        },
        // Ne pas logger les corps de requête en production pour des raisons de sécurité
        ...(config.isDev && req.body ? { body: { ...req.body } } : {}),
      };

      // Retourner les informations appropriées selon le niveau de log
      return process.stdout.isTTY ? minimalInfo : detailedInfo;
    },
    res: (res) => {
      // Version minimale pour l'affichage console
      const minimalInfo = {
        statusCode: res.statusCode,
      };

      // Informations détaillées pour les fichiers de log
      const detailedInfo = {
        statusCode: res.statusCode,
        headers: {
          'content-type': res.getHeader('content-type'),
          'content-length': res.getHeader('content-length'),
        },
      };

      // Retourner les informations appropriées selon le niveau de log
      return process.stdout.isTTY ? minimalInfo : detailedInfo;
    },
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
    // En mode console, utiliser 'info' pour les requêtes réussies,
    // sinon 'debug' pour les fichiers de log
    return process.stdout.isTTY ? 'info' : 'debug';
  },

  // Ajouter des métadonnées personnalisées
  customProps: (req) => {
    const props = {
      correlationId: req.headers['x-correlation-id'] || req.id,
    };

    // Ajouter userAgent uniquement dans les logs détaillés
    if (!process.stdout.isTTY) {
      return {
        ...props,
        userAgent: req.headers['user-agent'],
      };
    }

    return props;
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
