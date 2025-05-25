// app.ts
import { RouteScanner } from '@/core/routeScanner';
import { AppConfig } from '@/core/types/route.types';

const routeScanner = new RouteScanner();

// Configuration complète avec 4 niveaux de préfixage
const appConfig: AppConfig = {
  globalPrefix: '/api', // Niveau 1: Global
  globalMiddlewares: ['cors', 'helmet'],
  versions: [
    {
      version: 'v1', // Niveau 2: Version
      middlewares: ['rateLimit:1000'],
      modules: [
        {
          name: 'admin',
          prefix: 'admin', // Niveau 3: Module
          middlewares: ['auth', 'rbac:ADMIN'],
          controllers: [
            InventoryController, // Niveau 4: /inventory
            AdminProductController, // Niveau 4: /products
          ],
        },
        {
          name: 'ecommerce',
          prefix: 'shop', // Niveau 3: Module
          middlewares: [],
          controllers: [
            EcommerceProductController, // Niveau 4: /products
            AuthController, // Niveau 4: /auth
            CartController, // Niveau 4: /cart
          ],
        },
      ],
    },
    {
      version: 'v2', // Niveau 2: Version
      middlewares: ['rateLimit:500'],
      modules: [
        {
          name: 'ecommerce',
          prefix: 'shop', // Niveau 3: Module
          middlewares: [],
          controllers: [
            // EcommerceProductV2Controller,
          ],
        },
      ],
    },
  ],
};

// Construction des routes avec 4 niveaux de préfixage
const appRoutes = routeScanner.scanApp(appConfig);

export default appRoutes;
