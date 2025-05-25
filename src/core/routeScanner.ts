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

export class RouteScanner {
  private readonly middlewareRegistry = new MiddlewareRegistry();
  private readonly validationRegistry = new ValidationRegistry();

  // Méthode principale pour application complète
  public scanApp(config: AppConfig): Router {
    const appRouter = Router();

    // Middlewares globaux de l'application
    if (config.globalMiddlewares) {
      config.globalMiddlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          appRouter.use(middleware);
        }
      });
    }

    // Construire les versions
    const versionsRouter = this.scanVersions(config.versions);

    // Appliquer le préfixe global
    appRouter.use(config.globalPrefix, versionsRouter);

    return appRouter;
  }

  private scanVersions(versions: VersionConfig[]): Router {
    const router = Router();

    versions.forEach((version) => {
      const versionRouter = this.buildVersionRoutes(version);
      router.use(`/${version.version}`, versionRouter);
    });

    return router;
  }

  private buildVersionRoutes(version: VersionConfig): Router {
    const router = Router();

    // Middlewares de version
    if (version.middlewares) {
      version.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          router.use(middleware);
        }
      });
    }

    // Modules de la version
    version.modules.forEach((module) => {
      const moduleRouter = this.buildModuleRoutes(module);
      router.use(`/${module.prefix}`, moduleRouter);
    });

    return router;
  }

  private buildModuleRoutes(module: ModuleConfig): Router {
    const router = Router();

    // Middlewares de module
    if (module.middlewares) {
      module.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          router.use(middleware);
        }
      });
    }

    // Controllers du module
    module.controllers.forEach((controllerClass) => {
      const controllerRouter = this.buildControllerRoutes(controllerClass);
      if (controllerRouter) {
        const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
          CONTROLLER_METADATA,
          controllerClass
        );
        router.use(controllerMetadata.prefix, controllerRouter);
      }
    });

    return router;
  }

  private buildControllerRoutes(
    controllerClass: new (...args: any[]) => unknown
  ): Router | null {
    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      CONTROLLER_METADATA,
      controllerClass
    );
    const metadata = Reflect.getMetadata(ROUTES_METADATA, controllerClass);
    const routesMetadata: RouteMetadata[] =
      metadata !== undefined ? metadata : [];

    if (
      (controllerMetadata !== undefined && controllerMetadata !== null) ||
      routesMetadata.length === 0
    ) {
      return null;
    }

    const router = Router();
    const controller = Container.get(controllerClass);

    // Routes du controller (les middlewares du controller sont gérés au niveau route)
    routesMetadata.forEach((route) => {
      this.addRoute(
        router,
        route,
        controller,
        (controllerMetadata as ControllerMetadata)?.middlewares
      );
    });

    return router;
  }

  private addRoute(
    router: Router,
    route: RouteMetadata,
    controller: any,
    controllerMiddlewares?: string[]
  ): void {
    const middlewares = [];

    // 1. Middlewares du controller (sauf si overrideMiddlewares = true)
    if (
      (route.overrideMiddlewares === undefined ||
        route.overrideMiddlewares === false) &&
      controllerMiddlewares
    ) {
      controllerMiddlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          middlewares.push(middleware);
        }
      });
    }

    // 2. Validation
    if (
      route.validation !== undefined &&
      route.validation !== null &&
      route.validation !== ''
    ) {
      const validator = this.validationRegistry.get(route.validation);
      if (validator !== undefined && validator !== null) {
        middlewares.push(validator);
      }
    }

    // 3. Middlewares spécifiques à la route
    if (route.middlewares) {
      route.middlewares.forEach((middlewareName) => {
        const middleware = this.middlewareRegistry.get(middlewareName);
        if (middleware !== undefined && middleware !== null) {
          middlewares.push(middleware);
        }
      });
    }

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

    router[route.method](route.path, ...middlewares, handler);
  }
}
