// validators/ingredient.validator.ts
import { z } from 'zod';
import { transformers } from '../shared/utils';

export const IngredientSchemas = {
  // Schema pour créer un ingrédient
  createIngredient: z
    .object({
      name: z.string().max(255, 'Name is too long').optional(),
      quantity: z.number().min(0, 'Quantity must be positive'),
      grindRequired: z.boolean().default(false),
      recipeId: z
        .number()
        .int()
        .positive('Recipe ID must be a positive integer'),
      productId: z.string().uuid('Product ID must be a valid UUID').optional(),
      unitOfMeasureId: z
        .number()
        .int()
        .positive('Unit of measure ID must be a positive integer'),
    })
    .refine((data) => data.name !== undefined || data.productId !== undefined, {
      message: 'Either name or productId must be provided',
      path: ['name'],
    }),

  // Schema pour mettre à jour un ingrédient avec transformations
  updateIngredient: z
    .object({
      name: transformers.stringOrNull
        .refine((val) => val === null || val.length <= 255, 'Name is too long')
        .optional(),

      quantity: transformers.stringToNumber
        .refine((val) => val >= 0, 'Quantity must be positive')
        .optional(),

      grindRequired: transformers.stringToBoolean.optional(),

      recipeId: transformers.stringToInt
        .refine((val) => val > 0, 'Recipe ID must be a positive integer')
        .optional(),

      productId: transformers.stringToUuidOrNull.optional(),

      unitOfMeasureId: transformers.stringToInt
        .refine(
          (val) => val > 0,
          'Unit of measure ID must be a positive integer'
        )
        .optional(),
    })
    .refine(
      (data) => {
        // Si l'un des champs name ou productId est modifié, on doit s'assurer qu'au moins l'un des deux reste défini
        if (data.name === null && data.productId === null) {
          return false;
        }
        return true;
      },
      {
        message: 'Either name or productId must be provided',
        path: ['name'],
      }
    ),

  // Schema pour supprimer un ingrédient
  deleteIngredient: z.object({
    id: z.number().int().positive('Ingredient ID must be a positive integer'),
  }),

  // Schema pour les paramètres d'URL
  ingredientParam: z.object({
    ingredientId: z
      .string()
      .regex(/^\d+$/, 'Ingredient ID must be a valid number'),
  }),

  // Schema pour les paramètres de recette
  recipeParam: z.object({
    recipeId: z.string().regex(/^\d+$/, 'Recipe ID must be a valid number'),
  }),

  // Schema pour les filtres de recherche
  ingredientFilters: z.object({
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

  // Schema pour créer plusieurs ingrédients en même temps
  bulkCreateIngredients: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    ingredients: z
      .array(
        z
          .object({
            name: z.string().max(255, 'Name is too long').optional(),
            quantity: z.number().min(0, 'Quantity must be positive'),
            grindRequired: z.boolean().default(false),
            productId: z
              .string()
              .uuid('Product ID must be a valid UUID')
              .optional(),
            unitOfMeasureId: z
              .number()
              .int()
              .positive('Unit of measure ID must be a positive integer'),
          })
          .refine(
            (data) => data.name !== undefined || data.productId !== undefined,
            {
              message: 'Either name or productId must be provided',
              path: ['name'],
            }
          )
      )
      .min(1, 'At least one ingredient is required'),
  }),

  // Schema pour mise à jour en masse des ingrédients
  bulkUpdateIngredients: z.object({
    ingredientIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one ingredient ID is required'),
    updates: z.object({
      quantity: transformers.stringToNumber
        .refine((val) => val >= 0, 'Quantity must be positive')
        .optional(),
      grindRequired: transformers.stringToBoolean.optional(),
      unitOfMeasureId: transformers.stringToInt
        .refine(
          (val) => val > 0,
          'Unit of measure ID must be a positive integer'
        )
        .optional(),
    }),
  }),

  // Schema pour supprimer plusieurs ingrédients
  bulkDeleteIngredients: z.object({
    ingredientIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one ingredient ID is required'),
  }),

  // Schema pour dupliquer des ingrédients d'une recette à une autre
  duplicateIngredients: z.object({
    sourceRecipeId: z
      .number()
      .int()
      .positive('Source recipe ID must be a positive integer'),
    targetRecipeId: z
      .number()
      .int()
      .positive('Target recipe ID must be a positive integer'),
    ingredientIds: z.array(z.number().int().positive()).optional(), // Si vide, duplique tous les ingrédients
  }),

  // Schema pour ajuster les quantités (multiplier par un facteur)
  adjustQuantities: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    factor: z
      .number()
      .min(0.1, 'Factor must be at least 0.1')
      .max(100, 'Factor cannot exceed 100'),
    ingredientIds: z.array(z.number().int().positive()).optional(), // Si vide, ajuste tous les ingrédients
  }),

  // Schema pour rechercher des ingrédients
  searchIngredients: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Query is too long'),
    recipeId: z.number().int().positive().optional(),
    productId: z.string().uuid().optional(),
    grindRequired: transformers.stringToBoolean.optional(),
    minQuantity: transformers.stringToNumber.optional(),
    maxQuantity: transformers.stringToNumber.optional(),
    unitOfMeasureId: transformers.stringToInt.optional(),
  }),

  // Schema pour obtenir des statistiques sur les ingrédients
  getIngredientStats: z.object({
    recipeId: z
      .number()
      .int()
      .positive('Recipe ID must be a positive integer')
      .optional(),
    groupBy: z
      .enum(['recipe', 'product', 'unitOfMeasure', 'grindRequired'])
      .default('recipe'),
  }),

  // Schema pour remplacer tous les ingrédients d'une recette
  replaceIngredients: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    ingredients: z.array(
      z
        .object({
          name: z.string().max(255, 'Name is too long').optional(),
          quantity: z.number().min(0, 'Quantity must be positive'),
          grindRequired: z.boolean().default(false),
          productId: z
            .string()
            .uuid('Product ID must be a valid UUID')
            .optional(),
          unitOfMeasureId: z
            .number()
            .int()
            .positive('Unit of measure ID must be a positive integer'),
        })
        .refine(
          (data) => data.name !== undefined || data.productId !== undefined,
          {
            message: 'Either name or productId must be provided',
            path: ['name'],
          }
        )
    ),
  }),

  // Schema pour calculer le coût total des ingrédients
  calculateCost: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    servings: z.number().int().min(1, 'Servings must be at least 1').optional(),
    grindPreference: z.enum(['whole', 'ground', 'auto']).default('auto'),
  }),
};

// Inférence des types TypeScript automatique
export type CreateIngredientRequest = z.infer<
  typeof IngredientSchemas.createIngredient
>;
export type UpdateIngredientRequest = z.infer<
  typeof IngredientSchemas.updateIngredient
>;
export type DeleteIngredientRequest = z.infer<
  typeof IngredientSchemas.deleteIngredient
>;
export type IngredientParamRequest = z.infer<
  typeof IngredientSchemas.ingredientParam
>;
export type RecipeParamRequest = z.infer<typeof IngredientSchemas.recipeParam>;
export type IngredientFiltersRequest = z.infer<
  typeof IngredientSchemas.ingredientFilters
>;
export type BulkCreateIngredientsRequest = z.infer<
  typeof IngredientSchemas.bulkCreateIngredients
>;
export type BulkUpdateIngredientsRequest = z.infer<
  typeof IngredientSchemas.bulkUpdateIngredients
>;
export type BulkDeleteIngredientsRequest = z.infer<
  typeof IngredientSchemas.bulkDeleteIngredients
>;
export type DuplicateIngredientsRequest = z.infer<
  typeof IngredientSchemas.duplicateIngredients
>;
export type AdjustQuantitiesRequest = z.infer<
  typeof IngredientSchemas.adjustQuantities
>;
export type SearchIngredientsRequest = z.infer<
  typeof IngredientSchemas.searchIngredients
>;
export type GetIngredientStatsRequest = z.infer<
  typeof IngredientSchemas.getIngredientStats
>;
export type ReplaceIngredientsRequest = z.infer<
  typeof IngredientSchemas.replaceIngredients
>;
export type CalculateCostRequest = z.infer<
  typeof IngredientSchemas.calculateCost
>;
export type IngredientSchemasType = typeof IngredientSchemas;
