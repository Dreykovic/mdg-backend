// validators/product-tag-link.validator.ts
import { z } from 'zod';

export const RecipeCategoryLinkSchemas = {
  // Schema pour créer un lien produit-tag
  createRecipeCategoryLink: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    categoryId: z
      .number()
      .int()
      .positive('Recipe Category ID must be a positive integer'),
  }),
};

// Inférence des types TypeScript automatique
export type CreateRecipeCategoryLinkRequest = z.infer<
  typeof RecipeCategoryLinkSchemas.createRecipeCategoryLink
>;

export type RecipeCategoryLinkSchemasType = typeof RecipeCategoryLinkSchemas;
