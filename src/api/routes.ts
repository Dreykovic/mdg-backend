// app.ts
import { RouteScanner } from './core/RouteScanner';
import { AppConfig } from './types/route.types';

// Import de tous vos controllers
import { InventoryController } from './controllers/admin/InventoryController';
import { AdminProductController } from './controllers/admin/ProductController';
import { EcommerceProductController } from './controllers/ecommerce/ProductController';
import { AuthController } from './controllers/ecommerce/AuthController';
import { CartController } from './controllers/ecommerce/CartController';

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
