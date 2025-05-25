// app.ts
import { RouteScanner } from '@/core/routeScanner';
import { AppConfig } from '@/core/types/route.types';
import { AdminAuthController } from './controllers/auth/admin_auth_controller';
import config from '@/config';
// Vérifier les métadonnées du controller
import 'reflect-metadata';
import {
  CONTROLLER_METADATA,
  ROUTES_METADATA,
} from '@/core/decorators/route.decorators';
import { log } from 'console';
import { TestController } from './controllers/test_controller';

log('🚀 === DÉBUT CONFIGURATION ROUTES ===');

const routeScanner = new RouteScanner();
const baseApiUrl = `/${config.api.prefix.replace(/^\/+/, '')}`;
log(`🔧 API base URL: ${baseApiUrl}`);

// Vérifier que le controller est bien importé
log('🎮 AdminAuthController:', AdminAuthController);
log('🎮 AdminAuthController.name:', AdminAuthController.name);

const controllerMetadata = Reflect.getMetadata(
  CONTROLLER_METADATA,
  AdminAuthController
);
const routesMetadata = Reflect.getMetadata(
  ROUTES_METADATA,
  AdminAuthController
);

log('🔍 Controller metadata:', controllerMetadata);
log('🔍 Routes metadata:', routesMetadata);
log(
  '🔍 Nombre de routes:',
  Array.isArray(routesMetadata) ? routesMetadata.length : 0
);

if (routesMetadata !== undefined && routesMetadata !== null) {
  routesMetadata.forEach((route: any, index: number) => {
    log(
      `  Route ${index + 1}: ${route.method.toUpperCase()} ${route.path} -> ${route.methodName}`
    );
  });
}

// Configuration complète avec 4 niveaux de préfixage
const appConfig: AppConfig = {
  globalPrefix: baseApiUrl, // Niveau 1: Global
  // globalMiddlewares: ['cors', 'helmet'],
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

        {
          name: 'test', // Ajout temporaire
          prefix: '/test',
          controllers: [TestController],
        },
      ],
    },
  ],
};

log('⚙️ Configuration finale:', JSON.stringify(appConfig, null, 2));

// Construction des routes avec 4 niveaux de préfixage
log('🏗️ Construction des routes...');
const appRoutes = routeScanner.scanApp(appConfig);

log('✅ Routes construites avec succès');
log('🎯 URLs attendues:');
log(`   POST ${baseApiUrl}/v1/auth/admin/sign-in`);
log(`   POST ${baseApiUrl}/v1/auth/admin/refresh`);
log(`   POST ${baseApiUrl}/v1/auth/admin/logout`);
log(`   POST ${baseApiUrl}/v1/auth/admin/logout-all`);
log(`   GET ${baseApiUrl}/v1/auth/admin/active-sessions`);

log('✅ === FIN CONFIGURATION ROUTES ===');

export default appRoutes;
