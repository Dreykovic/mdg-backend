// types/route.types.ts
export interface RouteConfig {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  handler: string;
  middlewares?: string[];
  validation?: string;
  rateLimit?: number;
}

export interface ControllerConfig {
  controller: string;
  prefix: string;
  middlewares?: string[];
  routes: RouteConfig[];
}

export interface ModuleConfig {
  name: string;
  prefix: string;
  middlewares?: string[];
  controllers: any[];
}

export interface VersionConfig {
  version: string;
  middlewares?: string[];
  modules: ModuleConfig[];
}

export interface AppConfig {
  globalPrefix: string;
  globalMiddlewares?: string[];
  versions: VersionConfig[];
}
