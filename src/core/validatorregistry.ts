// core/ValidationRegistry.ts
import { Request, Response, NextFunction } from 'express';

export class ValidationRegistry {
  private validators = new Map<string, any>();

  constructor() {
    // Mock schemas pour l'exemple
    this.validators.set('loginSchema', this.createMockValidator('loginSchema'));
    this.validators.set(
      'registerSchema',
      this.createMockValidator('registerSchema')
    );
  }

  private createMockValidator(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Mock validation - remplacez par votre logique réelle
      console.log(`Validating with ${schemaName}`);
      next();
    };
  }

  public get(name: string): any {
    return this.validators.get(name);
  }
}
