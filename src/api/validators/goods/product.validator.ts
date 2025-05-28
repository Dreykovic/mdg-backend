// validators/product.validator.ts
import { z } from 'zod';

// Enum pour VisibilityType (à adapter selon votre définition)
const VisibilityTypeEnum = z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED']);

export const ProductSchemas = {
  // Schema pour créer un produit
  createProduct: z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    isGlutenFree: z.boolean(),
    isGMOFree: z.boolean(),
    description: z.string().max(1000, 'Description is too long').optional(),
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU is too long'),

    isActive: z.boolean().default(false),
    isArchived: z.boolean().default(false),
    visibility: VisibilityTypeEnum.default('DRAFT'),
    isFeatured: z.boolean().default(false),
    additionalCost: z
      .number()
      .min(0, 'Additional cost must be positive')
      .default(0),

    costPerGramWhole: z.number().min(0, 'Cost per gram whole must be positive'),
    costPerGramGround: z
      .number()
      .min(0, 'Cost per gram ground must be positive'),
    pricePerGramWhole: z
      .number()
      .min(0, 'Price per gram whole must be positive'),
    pricePerGramGround: z
      .number()
      .min(0, 'Price per gram ground must be positive'),

    originId: z.number().int().positive('Origin ID must be a positive integer'),
    subcategoryId: z
      .number()
      .int()
      .positive('Subcategory ID must be a positive integer')
      .optional(),
    categoryId: z
      .number()
      .int()
      .positive('Category ID must be a positive integer'),
    supplierId: z
      .number()
      .int()
      .positive('Supplier ID must be a positive integer'),
    marginLevelId: z
      .number()
      .int()
      .positive('Margin level ID must be a positive integer'),
  }),

  // Schema pour mettre à jour un produit
  updateProduct: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .optional(),
    isGlutenFree: z.boolean().optional(),
    isGMOFree: z.boolean().optional(),
    description: z.string().max(1000, 'Description is too long').optional(),
    sku: z
      .string()
      .min(1, 'SKU is required')
      .max(100, 'SKU is too long')
      .optional(),

    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    visibility: VisibilityTypeEnum.optional(),
    isFeatured: z.boolean().optional(),
    additionalCost: z
      .number()
      .min(0, 'Additional cost must be positive')
      .optional(),

    costPerGramWhole: z
      .number()
      .min(0, 'Cost per gram whole must be positive')
      .optional(),
    costPerGramGround: z
      .number()
      .min(0, 'Cost per gram ground must be positive')
      .optional(),
    pricePerGramWhole: z
      .number()
      .min(0, 'Price per gram whole must be positive')
      .optional(),
    pricePerGramGround: z
      .number()
      .min(0, 'Price per gram ground must be positive')
      .optional(),

    originId: z
      .number()
      .int()
      .positive('Origin ID must be a positive integer')
      .optional(),
    subcategoryId: z
      .number()
      .int()
      .positive('Subcategory ID must be a positive integer')
      .optional(),
    categoryId: z
      .number()
      .int()
      .positive('Category ID must be a positive integer')
      .optional(),
    supplierId: z
      .number()
      .int()
      .positive('Supplier ID must be a positive integer')
      .optional(),
    marginLevelId: z
      .number()
      .int()
      .positive('Margin level ID must be a positive integer')
      .optional(),
  }),

  // Schema pour supprimer un produit
  deleteProduct: z.object({
    id: z.string().uuid('Product ID must be a valid UUID'),
  }),
};

// Inférence des types TypeScript automatique
export type CreateProductRequest = z.infer<typeof ProductSchemas.createProduct>;
export type UpdateProductRequest = z.infer<typeof ProductSchemas.updateProduct>;
export type DeleteProductRequest = z.infer<typeof ProductSchemas.deleteProduct>;

export type ProductSchemasType = typeof ProductSchemas;
