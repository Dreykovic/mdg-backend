// validators/product-tag-link.validator.ts
import { z } from 'zod';

export const ProductTagLinkSchemas = {
  // Schema pour créer un lien produit-tag
  createProductTagLink: z.object({
    productId: z.string().uuid('Product ID must be a valid UUID'),
    productTagId: z
      .number()
      .int()
      .positive('Product Tag ID must be a positive integer'),
  }),
};

// Inférence des types TypeScript automatique
export type CreateProductTagLinkRequest = z.infer<
  typeof ProductTagLinkSchemas.createProductTagLink
>;

export type ProductTagLinkSchemasType = typeof ProductTagLinkSchemas;
