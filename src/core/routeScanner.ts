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

import logger from './utils/logger.util';

interface RouteInfo {
  method: string;
  path: string;
  fullPath: string;
  controller: string;
  handler: string;
}

interface ModuleInfo {
  name: string;
  prefix: string;
  routes: RouteInfo[];
}

interface VersionInfo {
  version: string;
  modules: ModuleInfo[];
}

export class RouteScanner {
  private readonly middlewareRegistry = new MiddlewareRegistry();
  private readonly validationRegistry = new ValidationRegistry();
  private routingSummary: VersionInfo[] = [];

  public scanApp(config: AppConfig): Router {
    logger.debug("🚀 Début du scan de l'application");
    this.routingSummary = [];

    const appRouter = Router();

    // Middlewares globaux
    this.applyGlobalMiddlewares(appRouter, config.globalMiddlewares);

    // Construction des versions
    const versionsRouter = this.scanVersions(config.versions);
    appRouter.use(config.globalPrefix, versionsRouter);

    // Affichage du résumé final
    this.displayRoutingSummary(config.globalPrefix);

    return appRouter;
  }

  private applyGlobalMiddlewares(router: Router, middlewares?: string[]): void {
    if (middlewares?.length === null || middlewares?.length === undefined) {
      return;
    }

    let appliedCount = 0;
    middlewares.forEach((middlewareName) => {
      const middleware = this.middlewareRegistry.get(middlewareName);
      if (middleware !== undefined && middleware !== null) {
        router.use(middleware);
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      logger.debug(`📋 ${appliedCount} middleware(s) global(aux) appliqué(s)`);
    }
  }

  private scanVersions(versions: VersionConfig[]): Router {
    const router = Router();

    versions.forEach((version) => {
      const versionInfo: VersionInfo = {
        version: version.version,
        modules: [],
      };

      const versionRouter = this.buildVersionRoutes(version, versionInfo);
      router.use(`/${version.version}`, versionRouter);

      this.routingSummary.push(versionInfo);
    });

    return router;
  }

  private buildVersionRoutes(
    version: VersionConfig,
    versionInfo: VersionInfo
  ): Router {
    const router = Router();

    // Middlewares de version
    this.applyVersionMiddlewares(router, version.middlewares);

    // Modules
    version.modules.forEach((module) => {
      const moduleInfo: ModuleInfo = {
        name: module.name,
        prefix: module.prefix.startsWith('/')
          ? module.prefix
          : `/${module.prefix}`,
        routes: [],
      };

      const moduleRouter = this.buildModuleRoutes(
        module,
        moduleInfo,
        version.version
      );
      router.use(moduleInfo.prefix, moduleRouter);

      versionInfo.modules.push(moduleInfo);
    });

    return router;
  }

  private applyVersionMiddlewares(
    router: Router,
    middlewares?: string[]
  ): void {
    if (middlewares?.length === null || middlewares?.length === undefined) {
      return;
    }
    middlewares.forEach((middlewareName) => {
      const middleware = this.middlewareRegistry.get(middlewareName);

      if (middleware !== undefined || middleware !== null) {
        router.use(middleware);
      }
    });
  }

  private buildModuleRoutes(
    module: ModuleConfig,
    moduleInfo: ModuleInfo,
    version: string
  ): Router {
    const router = Router();

    // Middlewares de module
    this.applyModuleMiddlewares(router, module.middlewares);

    // Controllers
    module.controllers.forEach((controllerClass) => {
      const controllerRouter = this.buildControllerRoutes(
        controllerClass,
        moduleInfo,
        version
      );

      if (controllerRouter) {
        const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
          CONTROLLER_METADATA,
          controllerClass
        );

        if (controllerMetadata !== null && controllerMetadata !== undefined) {
          router.use(controllerMetadata.prefix, controllerRouter);
        }
      }
    });

    return router;
  }

  private applyModuleMiddlewares(router: Router, middlewares?: string[]): void {
    if (middlewares?.length === null || middlewares?.length === undefined) {
      return;
    }
    middlewares.forEach((middlewareName) => {
      const middleware = this.middlewareRegistry.get(middlewareName);
      if (middleware !== undefined && middleware !== null) {
        router.use(middleware);
      }
    });
  }

  private buildControllerRoutes(
    controllerClass: new (...args: any[]) => unknown,
    moduleInfo: ModuleInfo,
    version: string
  ): Router | null {
    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      CONTROLLER_METADATA,
      controllerClass
    );

    const routesMetadata: RouteMetadata[] =
      Reflect.getMetadata(ROUTES_METADATA, controllerClass) ?? [];

    if (
      controllerMetadata === null ||
      controllerMetadata === undefined ||
      routesMetadata.length === 0
    ) {
      return null;
    }

    const router = Router();

    try {
      const controller = Container.get(controllerClass);

      routesMetadata.forEach((route) => {
        this.addRoute(
          router,
          route,
          controller,
          controllerMetadata?.middlewares
        );

        // Enregistrer les informations de route pour le résumé
        const fullPath = this.buildFullPath(
          version,
          moduleInfo.prefix,
          controllerMetadata.prefix,
          route.path
        );

        moduleInfo.routes.push({
          method: route.method.toUpperCase(),
          path: route.path,
          fullPath,
          controller: controllerClass.name,
          handler: route.methodName,
        });
      });

      return router;
    } catch (error) {
      logger.debug(`❌ Erreur controller ${controllerClass.name}:`, error);
      return null;
    }
  }

  private buildFullPath(
    version: string,
    modulePrefix: string,
    controllerPrefix: string,
    routePath: string
  ): string {
    const parts = ['', version, modulePrefix, controllerPrefix, routePath]
      .filter((part) => part !== null && part !== undefined && part !== '/')
      .map((part) => part.replace(/^\/+|\/+$/g, ''));

    return `/${parts.join('/')}`;
  }

  private addRoute(
    router: Router,
    route: RouteMetadata,
    controller: any,
    controllerMiddlewares?: string[]
  ): void {
    const middlewares = [];

    // Middlewares du controller
    if (
      (route.overrideMiddlewares === false ||
        route.overrideMiddlewares === undefined ||
        route.overrideMiddlewares === null) &&
      controllerMiddlewares
    ) {
      controllerMiddlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== null && middleware !== undefined) {
          middlewares.push(middleware);
        }
      });
    }

    // Validation
    if (
      typeof route.validation === 'string' &&
      route.validation.trim() !== ''
    ) {
      const validator = this.validationRegistry.get(route.validation);
      if (validator !== null && validator !== undefined) {
        middlewares.push(validator);
      }
    }

    // Middlewares de la route
    if (route.middlewares) {
      route.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== null && middleware !== undefined) {
          middlewares.push(middleware);
        }
      });
    }

    // Vérification de l||a méthode
    if (typeof controller[route.methodName] !== 'function') {
      return;
    }

    // Handler
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

    router[route.method](route.path, ...middlewares, handler);
  }

  private displayRoutingSummary(globalPrefix: string): void {
    const SEPARATOR_LENGTH = 50;

    logger.debug(`${'='.repeat(SEPARATOR_LENGTH)}`);
    logger.debug('🗺️  RÉSUMÉ DES ROUTES PAR MODULE');
    logger.debug(`${'='.repeat(SEPARATOR_LENGTH)}`);

    let totalRoutes = 0;

    this.routingSummary.forEach((versionInfo) => {
      logger.debug(`📦 VERSION: ${versionInfo.version}`);
      logger.debug('-'.repeat(50));

      versionInfo.modules.forEach((moduleInfo) => {
        if (moduleInfo.routes.length === 0) {
          return;
        }

        logger.debug(`🏗️  MODULE: ${moduleInfo.name.toUpperCase()}`);
        logger.debug(`   Préfixe: ${moduleInfo.prefix}`);
        logger.debug(`   Routes (${moduleInfo.routes.length}):`);

        moduleInfo.routes
          .sort((a, b) => {
            // Tri par méthode puis par path
            if (a.method !== b.method) {
              const methodOrder = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
              return (
                methodOrder.indexOf(a.method) - methodOrder.indexOf(b.method)
              );
            }
            return a.path.localeCompare(b.path);
          })
          .forEach((route) => {
            const methodPadded = route.method.padEnd(6);
            const fullPath = globalPrefix + route.fullPath;
            logger.debug(`     ${methodPadded} ${fullPath}`);
            logger.debug(
              `            └─ ${route.controller}.${route.handler}()`
            );
          });

        totalRoutes += moduleInfo.routes.length;
      });
    });

    logger.debug(`${'='.repeat(SEPARATOR_LENGTH)}`);
    logger.debug(`✅ TOTAL: ${totalRoutes} route(s) enregistrée(s)`);
    logger.debug(`${'='.repeat(SEPARATOR_LENGTH)}`);
  }
}
