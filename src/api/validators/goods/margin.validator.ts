// validators/margin.validator.ts
import { z } from 'zod';

export const MarginSchemas = {
  // Schema pour créer une marge
  createMargin: z.object({
    name: z.string().min(1, 'Name is required'),
    margin: z
      .number()
      .min(0, 'Margin must be a positive number')
      .max(100, 'Margin cannot exceed 100%'),
  }),

  // Schema pour mettre à jour une marge
  updateMargin: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    margin: z
      .number()
      .min(0, 'Margin must be a positive number')
      .max(100, 'Margin cannot exceed 100%')
      .optional(),
  }),
};

// Inférence des types TypeScript automatique
export type CreateMarginRequest = z.infer<typeof MarginSchemas.createMargin>;
export type UpdateMarginRequest = z.infer<typeof MarginSchemas.updateMargin>;
export type MarginSchemasType = typeof MarginSchemas;
