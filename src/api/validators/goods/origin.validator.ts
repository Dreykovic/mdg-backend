// validators/origin.validator.ts
import { z } from 'zod';

export const OriginSchemas = {
  // Schema pour la pagination et filtres
  getOrigins: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => parseInt(val ?? '1')),
    pageSize: z
      .string()
      .optional()
      .transform((val) => parseInt(val ?? '10')),
    filters: z
      .string()
      .optional()
      .transform((val) => {
        try {
          return typeof val === 'string' && val.trim() !== ''
            ? JSON.parse(val)
            : {};
        } catch {
          return {};
        }
      }),
  }),

  // Schema pour créer une origine
  createOrigin: z.object({
    country: z.string().min(1, 'Country is required'),
  }),

  // Schema pour mettre à jour une origine
  updateOrigin: z.object({
    country: z.string().min(1, 'Country is required').optional(),
  }),

  // Schema pour supprimer une origine
  deleteOrigin: z.object({
    id: z.number().int().positive('ID must be a positive integer'),
  }),

  // Schema pour les paramètres d'URL
  originParams: z.object({
    modelId: z.string().regex(/^\d+$/, 'Model ID must be a valid number'),
  }),
};

// Inférence des types TypeScript automatique
export type GetOriginsQuery = z.infer<typeof OriginSchemas.getOrigins>;
export type CreateOriginRequest = z.infer<typeof OriginSchemas.createOrigin>;
export type UpdateOriginRequest = z.infer<typeof OriginSchemas.updateOrigin>;
export type DeleteOriginRequest = z.infer<typeof OriginSchemas.deleteOrigin>;
export type OriginParamsRequest = z.infer<typeof OriginSchemas.originParams>;
export type OriginSchemasType = typeof OriginSchemas;
