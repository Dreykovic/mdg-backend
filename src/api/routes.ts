// app.ts
import { RouteScanner } from '@/core/routeScanner';
import { AppConfig } from '@/core/types/route.types';
import { AdminAuthController } from './controllers/auth/admin_auth_controller';
import config from '@/config';
import logger from '@/core/utils/logger.util';

const routeScanner = new RouteScanner();
const baseApiUrl = `/${config.api.prefix.replace(/^\/+/, '')}`;
logger.debug(`API base URL: ${baseApiUrl}`);

// Configuration complète avec 4 niveaux de préfixage
const appConfig: AppConfig = {
  globalPrefix: baseApiUrl, // Niveau 1: Global
  globalMiddlewares: ['cors', 'helmet'],
  versions: [
    {
      version: 'v1', // Niveau 2: Version
      // middlewares: ['rateLimit:1000'],
      modules: [
        {
          name: 'auth',
          prefix: '/auth', // Niveau 3: Module
          controllers: [AdminAuthController],
        },
      ],
    },
  ],
};

// Construction des routes avec 4 niveaux de préfixage
const appRoutes = routeScanner.scanApp(appConfig);

export default appRoutes;
