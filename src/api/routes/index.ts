// app.ts
import { RouteScanner } from '@/core/scanner/route.scanner';
import { AppConfig } from '@/core/types/route.types';
import config from '@/config';
// Vérifier les métadonnées du controller

import { TestController } from '../controllers/test.controller';
import logger from '@/core/utils/logger.util';
import authModule from './auth.module';
import adminModule from './admin.module';

logger.debug('🚀 === DÉBUT CONFIGURATION ROUTES ===');

const routeScanner = new RouteScanner();
const baseApiUrl = `/${config.api.prefix.replace(/^\/+/, '')}`;
logger.debug(`🔧 API base URL: ${baseApiUrl}`);

// Configuration complète avec 4 niveaux de préfixage
const appConfig: AppConfig = {
  globalPrefix: baseApiUrl, // Niveau 1: Global
  // globalMiddlewares: ['cors', 'helmet'],
  versions: [
    {
      version: 'v1', // Niveau 2: Version
      // middlewares: ['rateLimit:1000'],
      modules: [
        authModule,
        adminModule,
        {
          name: 'test', // Ajout temporaire
          prefix: '/test',
          controllers: [TestController],
        },
      ],
    },
  ],
};

// Construction des routes avec 4 niveaux de préfixage
logger.debug('🏗️ Construction des routes...');
const appRoutes = routeScanner.scanApp(appConfig);

logger.debug('✅ Routes construites avec succès');
logger.debug('✅ === FIN CONFIGURATION ROUTES ===');

export default appRoutes;
