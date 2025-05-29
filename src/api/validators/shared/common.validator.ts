// validators/margin.validator.ts
import { z } from 'zod';

export const CommonSchemas = {
  // Schema pour la pagination et filtres
  getEntities: z.object({
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

  // Schema pour supprimer une marge
  enntityWithNumberId: z.object({
    id: z.number().int().positive('ID must be a positive integer'),
  }),
  enntityWithStringId: z.object({
    id: z.string().uuid('Product ID must be a valid UUID'),
  }),

  // Schema pour les paramètres d'URL
  entityNumberParam: z.object({
    modelId: z.string().regex(/^\d+$/, 'Model ID must be a valid number'),
  }),

  entityStringParam: z.object({
    modelId: z.string().uuid('Product ID must be a valid UUID'),
  }),
};

// Inférence des types TypeScript automatique
export type GetEntitiesQuery = z.infer<typeof CommonSchemas.getEntities>;
export type EnntityWithNumberIdRequest = z.infer<
  typeof CommonSchemas.enntityWithNumberId
>;
export type EnntityWithStringIdRequest = z.infer<
  typeof CommonSchemas.enntityWithStringId
>;

export type EntityNumberParamsRequest = z.infer<
  typeof CommonSchemas.entityNumberParam
>;
export type EntityStringParamsRequest = z.infer<
  typeof CommonSchemas.entityNumberParam
>;

export type CommonSchemasType = typeof CommonSchemas;
