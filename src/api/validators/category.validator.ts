// validators/supplier.validator.ts
import { z } from 'zod';

export const CategorySchemas = {
  // Schema pour créer un fournisseur
  createCategory: z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),

    description: z.string().max(255, 'Description is too long').optional(),
  }),

  // Schema pour mettre à jour un fournisseur
  updateCategory: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .optional(),
    description: z.string().max(255, 'Description is too long').optional(),
  }),
};

// Inférence des types TypeScript automatique
export type CreateCategoryRequest = z.infer<
  typeof CategorySchemas.createCategory
>;
export type UpdateCategoryRequest = z.infer<
  typeof CategorySchemas.updateCategory
>;

export type CategorySchemasType = typeof CategorySchemas;
