// validators/product.validator.ts
import StringUtil from '@/core/utils/string.util';
import { z } from 'zod';

// Enum pour VisibilityType (à adapter selon votre définition)
const VisibilityTypeEnum = z.enum(['DRAFT', 'VISIBLE', 'HIDDEN', 'ARCHIVED']);

// Transformers utilitaires
const transformers = {
  stringToBoolean: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === 'boolean') {
      return val;
    }
    return StringUtil.parseBool(val);
  }),

  stringToNumber: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'number') {
      return val;
    }
    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
      throw new Error('Invalid number format');
    }
    return parsed;
  }),

  stringToInt: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'number') {
      return Math.floor(val);
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid integer format');
    }
    return parsed;
  }),

  stringToIntOrNull: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      if (val === null || val === '' || val === undefined) {
        return null;
      }
      if (typeof val === 'number') {
        return Math.floor(val);
      }
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        throw new Error('Invalid integer format');
      }
      return parsed;
    }),
};

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

  // Schema pour mettre à jour un produit avec transformations
  updateProduct: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .optional(),

    // Transformations pour les booléens
    isGlutenFree: transformers.stringToBoolean.optional(),
    isGMOFree: transformers.stringToBoolean.optional(),
    isActive: transformers.stringToBoolean.optional(),
    isArchived: transformers.stringToBoolean.optional(),
    isFeatured: transformers.stringToBoolean.optional(),

    description: z.string().max(1000, 'Description is too long').optional(),
    sku: z
      .string()
      .min(1, 'SKU is required')
      .max(100, 'SKU is too long')
      .optional(),

    visibility: VisibilityTypeEnum.optional(),

    // Transformations pour les nombres décimaux
    additionalCost: transformers.stringToNumber
      .refine((val) => val >= 0, 'Additional cost must be positive')
      .optional(),
    costPerGramWhole: transformers.stringToNumber
      .refine((val) => val >= 0, 'Cost per gram whole must be positive')
      .optional(),
    costPerGramGround: transformers.stringToNumber
      .refine((val) => val >= 0, 'Cost per gram ground must be positive')
      .optional(),
    pricePerGramWhole: transformers.stringToNumber
      .refine((val) => val >= 0, 'Price per gram whole must be positive')
      .optional(),
    pricePerGramGround: transformers.stringToNumber
      .refine((val) => val >= 0, 'Price per gram ground must be positive')
      .optional(),

    // Transformations pour les entiers
    originId: transformers.stringToInt
      .refine((val) => val > 0, 'Origin ID must be a positive integer')
      .optional(),
    categoryId: transformers.stringToInt
      .refine((val) => val > 0, 'Category ID must be a positive integer')
      .optional(),
    supplierId: transformers.stringToInt
      .refine((val) => val > 0, 'Supplier ID must be a positive integer')
      .optional(),
    marginLevelId: transformers.stringToInt
      .refine((val) => val > 0, 'Margin level ID must be a positive integer')
      .optional(),

    // Cas spécial : peut être null
    subcategoryId: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val > 0,
        'Subcategory ID must be a positive integer or null'
      )
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
