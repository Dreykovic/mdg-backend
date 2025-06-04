// validators/origin.validator.ts
import { z } from 'zod';

export const OriginSchemas = {
  // Schema pour créer une origine
  createOrigin: z.object({
    country: z.string().min(1, 'Country is required'),
  }),

  // Schema pour mettre à jour une origine
  updateOrigin: z.object({
    country: z.string().min(1, 'Country is required').optional(),
  }),
};

// Inférence des types TypeScript automatique
export type CreateOriginRequest = z.infer<typeof OriginSchemas.createOrigin>;
export type UpdateOriginRequest = z.infer<typeof OriginSchemas.updateOrigin>;
export type OriginSchemasType = typeof OriginSchemas;
