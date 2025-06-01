// core/MiddlewareRegistry.ts
import rateLimit from 'express-rate-limit';
import { createRbacMiddleware } from '@/middlewares/rbac.middleware';
import verifyJWT from '@/middlewares/jwt.middleware';
import logger from '../utils/logger.util';

export class MiddlewareRegistry {
  private readonly middlewares = new Map<string, any>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.middlewares.set('auth', verifyJWT);
    this.middlewares.set('rbac:ADMIN', createRbacMiddleware(['ADMIN']));
    this.middlewares.set('rbac:USER', createRbacMiddleware(['USER']));
    this.middlewares.set('rbac:VENDOR', createRbacMiddleware(['VENDOR']));
    this.middlewares.set(
      'rbac:SUPER_ADMIN',
      createRbacMiddleware(['SUPER_ADMIN'])
    );
    this.middlewares.set('cors', (req: any, res: any, next: any) => next());
    this.middlewares.set('helmet', (req: any, res: any, next: any) => next());

    // Cache middlewares
    this.middlewares.set('cache:300', this.createCacheMiddleware(300));
    this.middlewares.set('cache:600', this.createCacheMiddleware(600));
  }

  public get(name: string): any {
    if (name.includes(':')) {
      const [type, param] = name.split(':');

      if (type === 'rbac') {
        if (typeof param === 'string') {
          return createRbacMiddleware([param]);
        }
      }

      if (type === 'rateLimit') {
        return rateLimit({
          windowMs: 15 * 60 * 1000,
          max: parseInt(param ?? '100', 10),
          message: { error: 'Too many requests' },
        });
      }

      if (type === 'cache') {
        return this.createCacheMiddleware(parseInt(param ?? '300', 10));
      }
    }

    return this.middlewares.get(name);
  }

  private createCacheMiddleware(seconds: number) {
    return (req: any, res: any, next: any): void => {
      res.set('Cache-Control', `public, max-age=${seconds}`);
      logger.debug(`Cache set for ${seconds} seconds`);
      next();
    };
  }
}
