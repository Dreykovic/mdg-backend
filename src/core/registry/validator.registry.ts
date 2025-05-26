// core/ValidationRegistry.ts
import { log } from 'console';
import { NextFunction, Request, Response } from 'express';

export class ValidationRegistry {
  private readonly validators = new Map<string, any>();

  constructor() {
    // Mock schemas pour l'exemple
    this.validators.set('loginSchema', this.createMockValidator('loginSchema'));
    this.validators.set(
      'registerSchema',
      this.createMockValidator('registerSchema')
    );
  }

  private createMockValidator(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Mock validation - remplacez par votre logique réelle
      log(`Validating with ${schemaName}`);
      next();
    };
  }

  public get(name: string): any {
    return this.validators.get(name);
  }
}
