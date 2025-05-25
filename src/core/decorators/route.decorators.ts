// decorators/route.decorators.ts
import 'reflect-metadata';

export const CONTROLLER_METADATA = Symbol('controller');
export const ROUTES_METADATA = Symbol('routes');
export const MIDDLEWARES_METADATA = Symbol('middlewares');

export interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  methodName: string;
  middlewares?: string[];
  validation?: string;
  overrideMiddlewares?: boolean; // Si true, ignore les middlewares du controller
}

export interface ControllerMetadata {
  prefix: string;
  middlewares?: string[];
}

// Décorateur Controller - maintenant avec prefix au lieu de basePath
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Controller(prefix: string, middlewares?: string[]) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T): T {
    const metadata: ControllerMetadata = { prefix, middlewares };
    Reflect.defineMetadata(CONTROLLER_METADATA, metadata, constructor);
    return constructor;
  };
}

// Décorateur pour middlewares au niveau méthode (additifs par défaut)
// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseMiddlewares(...middlewares: string[]) {
  return function (target: any, propertyKey: string): void {
    const existingMiddlewaresRaw = Reflect.getMetadata(
      MIDDLEWARES_METADATA,
      target,
      propertyKey
    );
    const existingMiddlewares =
      existingMiddlewaresRaw !== undefined ? existingMiddlewaresRaw : [];
    Reflect.defineMetadata(
      MIDDLEWARES_METADATA,
      [...existingMiddlewares, ...middlewares],
      target,
      propertyKey
    );
  };
}

// Décorateur pour remplacer complètement les middlewares du controller
// eslint-disable-next-line @typescript-eslint/naming-convention
export function OverrideMiddlewares(...middlewares: string[]) {
  return function (target: any, propertyKey: string): void {
    const routes =
      Reflect.getMetadata(ROUTES_METADATA, target.constructor) !== undefined
        ? Reflect.getMetadata(ROUTES_METADATA, target.constructor)
        : [];
    const routeIndex = routes.findIndex(
      (r: RouteMetadata) => r.methodName === propertyKey
    );

    // Marquer la route pour override des middlewares
    Reflect.defineMetadata(
      MIDDLEWARES_METADATA,
      middlewares,
      target,
      propertyKey
    );

    if (routeIndex >= 0) {
      routes[routeIndex].overrideMiddlewares = true;
    }

    Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
  };
}

// Décorateur pour une route sans aucun middleware (même pas ceux du controller)
// eslint-disable-next-line @typescript-eslint/naming-convention
export function NoMiddlewares() {
  return function (target: any, propertyKey: string): void {
    const routes =
      Reflect.getMetadata(ROUTES_METADATA, target.constructor) !== undefined
        ? Reflect.getMetadata(ROUTES_METADATA, target.constructor)
        : [];
    const routeIndex = routes.findIndex(
      (r: RouteMetadata) => r.methodName === propertyKey
    );

    Reflect.defineMetadata(MIDDLEWARES_METADATA, [], target, propertyKey);

    if (routeIndex >= 0) {
      routes[routeIndex].overrideMiddlewares = true;
    }

    Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
  };
}

// Factory pour créer les décorateurs HTTP
function createRouteDecorator(method: string) {
  return function (path: string) {
    return function (target: any, propertyKey: string): void {
      const metadata = Reflect.getMetadata(ROUTES_METADATA, target.constructor);
      const routes = metadata !== undefined ? metadata : [];
      const middlewares = Reflect.getMetadata(
        MIDDLEWARES_METADATA,
        target,
        propertyKey
      );

      routes.push({
        method: method as RouteMetadata['method'],
        path,
        methodName: propertyKey,
        middlewares,
      });

      Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
    };
  };
}

// Décorateurs HTTP
export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Put = createRouteDecorator('put');
export const Patch = createRouteDecorator('patch');
export const Delete = createRouteDecorator('delete');
