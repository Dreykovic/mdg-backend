// core/RouteScanner.ts
import { Router } from 'express';
import Container from 'typedi';
import {
  CONTROLLER_METADATA,
  ControllerMetadata,
  RouteMetadata,
  ROUTES_METADATA,
} from '@/core//decorators/route.decorators';

import {
  AppConfig,
  ModuleConfig,
  VersionConfig,
} from '@/core/types/route.types';
import { MiddlewareRegistry } from './middlewareRegistry';
import { ValidationRegistry } from './validatorregistry';
import { log } from 'console';

export class RouteScanner {
  private readonly middlewareRegistry = new MiddlewareRegistry();
  private readonly validationRegistry = new ValidationRegistry();

  // Méthode principale pour application complète
  public scanApp(config: AppConfig): Router {
    log('🚀 === DÉBUT SCAN APPLICATION ===');
    log('Config:', JSON.stringify(config, null, 2));

    const appRouter = Router();

    // Middlewares globaux de l'application
    if (config.globalMiddlewares) {
      log('📋 Application des middlewares globaux:', config.globalMiddlewares);
      config.globalMiddlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          appRouter.use(middleware);
          log(`✅ Middleware global appliqué: ${middlewareName}`);
        } else {
          log(`❌ Middleware global non trouvé: ${middlewareName}`);
        }
      });
    }

    // Construire les versions
    log('🔄 Construction des versions...');
    const versionsRouter = this.scanVersions(config.versions);

    // Appliquer le préfixe global
    log(`🎯 Application du préfixe global: ${config.globalPrefix}`);
    appRouter.use(config.globalPrefix, versionsRouter);

    log('✅ === FIN SCAN APPLICATION ===');

    // Debug: Afficher les routes enregistrées
    // this.debugRoutes(appRouter);

    return appRouter;
  }

  private scanVersions(versions: VersionConfig[]): Router {
    log('📦 === SCAN VERSIONS ===');
    log('Nombre de versions:', versions.length);

    const router = Router();

    versions.forEach((version, index) => {
      log(
        `🔧 Construction version ${index + 1}/${versions.length}: ${version.version}`
      );
      const versionRouter = this.buildVersionRoutes(version);
      const versionPath = `/${version.version}`;
      router.use(versionPath, versionRouter);
      log(`✅ Version ${version.version} montée sur: ${versionPath}`);
    });

    log('✅ === FIN SCAN VERSIONS ===');
    return router;
  }

  private buildVersionRoutes(version: VersionConfig): Router {
    log(`🏗️  === BUILD VERSION ${version.version} ===`);
    const router = Router();

    // Middlewares de version
    if (version.middlewares) {
      log('📋 Middlewares de version:', version.middlewares);
      version.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          router.use(middleware);
          log(`✅ Middleware version appliqué: ${middlewareName}`);
        } else {
          log(`❌ Middleware version non trouvé: ${middlewareName}`);
        }
      });
    }

    log(`📂 Modules dans ${version.version}:`, version.modules.length);

    // Modules de la version
    version.modules.forEach((module, index) => {
      log(
        `🔧 Construction module ${index + 1}/${version.modules.length}: ${module.name}`
      );
      const moduleRouter = this.buildModuleRoutes(module);
      const modulePath = module.prefix.startsWith('/')
        ? module.prefix
        : `/${module.prefix}`;
      router.use(modulePath, moduleRouter);
      log(`✅ Module ${module.name} monté sur: ${modulePath}`);
    });

    log(`✅ === FIN BUILD VERSION ${version.version} ===`);
    return router;
  }

  private buildModuleRoutes(module: ModuleConfig): Router {
    log(`🏗️  === BUILD MODULE ${module.name} ===`);
    const router = Router();

    // Middlewares de module
    if (module.middlewares) {
      log('📋 Middlewares de module:', module.middlewares);
      module.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          router.use(middleware);
          log(`✅ Middleware module appliqué: ${middlewareName}`);
        } else {
          log(`❌ Middleware module non trouvé: ${middlewareName}`);
        }
      });
    }

    log(`🎮 Controllers dans ${module.name}:`, module.controllers.length);
    log(
      'Controllers:',
      module.controllers.map((c) => c.name)
    );

    // Controllers du module
    module.controllers.forEach((controllerClass, index) => {
      log(
        `🔧 Construction controller ${index + 1}/${module.controllers.length}: ${controllerClass.name}`
      );

      const controllerRouter = this.buildControllerRoutes(controllerClass);

      if (controllerRouter) {
        const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
          CONTROLLER_METADATA,
          controllerClass
        );

        if (controllerMetadata !== undefined && controllerMetadata !== null) {
          const controllerPath = controllerMetadata.prefix;
          router.use(controllerPath, controllerRouter);
          log(
            `✅ Controller ${controllerClass.name} monté sur: ${controllerPath}`
          );
        } else {
          log(`❌ Pas de metadata de controller pour: ${controllerClass.name}`);
        }
      } else {
        log(`❌ Aucune route construite pour: ${controllerClass.name}`);
      }
    });

    log(`✅ === FIN BUILD MODULE ${module.name} ===`);
    return router;
  }

  private buildControllerRoutes(
    controllerClass: new (...args: any[]) => unknown
  ): Router | null {
    log(`🏗️  === BUILD CONTROLLER ${controllerClass.name} ===`);

    // Vérifier les métadonnées
    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      CONTROLLER_METADATA,
      controllerClass
    );

    log('Controller metadata:', controllerMetadata);

    const metadata = Reflect.getMetadata(ROUTES_METADATA, controllerClass);
    const routesMetadata: RouteMetadata[] =
      metadata !== undefined ? metadata : [];

    log('Routes metadata:', routesMetadata);
    log('Nombre de routes trouvées:', routesMetadata.length);

    if (controllerMetadata === undefined || controllerMetadata === null) {
      log(`❌ Pas de metadata @Controller pour: ${controllerClass.name}`);
      return null;
    }

    if (routesMetadata.length === 0) {
      log(`❌ Aucune route trouvée pour: ${controllerClass.name}`);
      log('Vérifiez que les méthodes ont des décorateurs @Get, @Post, etc.');
      return null;
    }

    const router = Router();

    try {
      const controller = Container.get(controllerClass);
      log(`✅ Instance du controller créée: ${controllerClass.name}`);

      // Routes du controller
      routesMetadata.forEach((route, index) => {
        log(`🛣️  Ajout route ${index + 1}/${routesMetadata.length}:`);
        log(`   Méthode: ${route.method.toUpperCase()}`);
        log(`   Chemin: ${route.path}`);
        log(`   Handler: ${route.methodName}`);
        log(`   Middlewares: ${route.middlewares ?? 'aucun'}`);

        this.addRoute(
          router,
          route,
          controller,
          controllerMetadata?.middlewares
        );

        log(`✅ Route ajoutée: ${route.method.toUpperCase()} ${route.path}`);
      });
    } catch (error) {
      log(`❌ Erreur lors de la création de l'instance du controller:`, error);
      return null;
    }

    log(`✅ === FIN BUILD CONTROLLER ${controllerClass.name} ===`);
    return router;
  }

  private addRoute(
    router: Router,
    route: RouteMetadata,
    controller: any,
    controllerMiddlewares?: string[]
  ): void {
    log(`🔧 === AJOUT ROUTE ${route.method.toUpperCase()} ${route.path} ===`);

    const middlewares = [];

    // 1. Middlewares du controller (sauf si overrideMiddlewares = true)
    if (
      (route.overrideMiddlewares === undefined ||
        route.overrideMiddlewares === false) &&
      controllerMiddlewares
    ) {
      log('📋 Middlewares du controller:', controllerMiddlewares);
      controllerMiddlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          middlewares.push(middleware);
          log(`✅ Middleware controller ajouté: ${middlewareName}`);
        } else {
          log(`❌ Middleware controller non trouvé: ${middlewareName}`);
        }
      });
    }

    // 2. Validation
    if (
      route.validation !== undefined &&
      route.validation !== null &&
      route.validation !== ''
    ) {
      log('🔍 Validation:', route.validation);
      const validator = this.validationRegistry.get(route.validation);
      if (validator !== undefined && validator !== null) {
        middlewares.push(validator);
        log(`✅ Validator ajouté: ${route.validation}`);
      } else {
        log(`❌ Validator non trouvé: ${route.validation}`);
      }
    }

    // 3. Middlewares spécifiques à la route
    if (route.middlewares) {
      log('📋 Middlewares de la route:', route.middlewares);
      route.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          middlewares.push(middleware);
          log(`✅ Middleware route ajouté: ${middlewareName}`);
        } else {
          log(`❌ Middleware route non trouvé: ${middlewareName}`);
        }
      });
    }

    // Vérifier que la méthode existe sur le controller
    if (typeof controller[route.methodName] !== 'function') {
      log(`❌ Méthode ${route.methodName} non trouvée sur le controller`);
      return;
    }

    log(`✅ Méthode ${route.methodName} trouvée sur le controller`);

    // Handler de la méthode
    const handler = async (
      req: import('express').Request,
      res: import('express').Response,
      next: import('express').NextFunction
    ): Promise<void> => {
      try {
        await controller[route.methodName](req, res, next);
      } catch (error) {
        next(error);
      }
    };

    log(`🎯 Enregistrement: ${route.method.toUpperCase()} ${route.path}`);
    log(`📦 Nombre de middlewares: ${middlewares.length}`);

    router[route.method](route.path, ...middlewares, handler);

    log(`✅ === ROUTE AJOUTÉE ===`);
  }

  // Méthode de debug pour afficher les routes
  // private debugRoutes(router: any): void {
  //   log('\n🔍 === DEBUG ROUTES FINALES ===');
  //   this.printRoutes(router, '');
  //   log('✅ === FIN DEBUG ROUTES ===\n');
  // }

  // private printRoutes(router: any, basePath: string): void {
  //   if (Array.isArray(router.stack)) {
  //     router.stack.forEach((layer: any) => {
  //       if (typeof layer.route !== 'undefined') {
  //         // Route finale
  //         const methods = Object.keys(layer.route.methods)
  //           .join(', ')
  //           .toUpperCase();
  //         log(`📍 ${methods} ${basePath}${layer.route.path}`);
  //       } else if (layer.name === 'router') {
  //         // Sous-router
  //         const path = layer.regexp.source
  //           .replace('\\', '')
  //           .replace('(?:', '')
  //           .replace(')?', '')
  //           .replace('$', '')
  //           .replace('^', '');
  //         log(`📁 Sous-router: ${basePath}${path}`);
  //         this.printRoutes(layer.handle, `${basePath}${path}`);
  //       }
  //     });
  //   }
  // }
}
