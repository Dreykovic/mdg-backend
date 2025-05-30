// validators/recipe.validator.ts
import { z } from 'zod';
import { transformers } from '../shared/utils';

// Enums pour les types (à adapter selon votre définition)
const RecipeDifficultyTypeEnum = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);
const VisibilityTypeEnum = z.enum(['DRAFT', 'VISIBLE', 'HIDDEN', 'ARCHIVED']);

export const RecipeSchemas = {
  // Schema pour créer une recette
  createRecipe: z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    description: z.string().max(2000, 'Description is too long').optional(),
    preparationTime: z
      .number()
      .int()
      .min(1, 'Preparation time must be at least 1 minute'),
    cookingTime: z
      .number()
      .int()
      .min(0, 'Cooking time must be positive')
      .optional(),
    servings: z.number().int().min(1, 'Servings must be at least 1').optional(),
    isApproved: z.boolean().default(false),
    isPromoAwarded: z.boolean().default(false),
    difficulty: RecipeDifficultyTypeEnum.default('EASY'),
    visibility: VisibilityTypeEnum.default('DRAFT'),
    userId: z.string().uuid('User ID must be a valid UUID'),
  }),

  // Schema pour mettre à jour une recette avec transformations
  updateRecipe: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .optional(),
    description: z.string().max(2000, 'Description is too long').optional(),

    // Transformations pour les entiers avec validation
    preparationTime: transformers.stringToInt
      .refine((val) => val >= 1, 'Preparation time must be at least 1 minute')
      .optional(),

    cookingTime: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 0,
        'Cooking time must be positive or null'
      )
      .optional(),

    servings: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 1,
        'Servings must be at least 1 or null'
      )
      .optional(),

    // Transformations pour les booléens
    isApproved: transformers.stringToBoolean.optional(),
    isPromoAwarded: transformers.stringToBoolean.optional(),

    // Enums avec validation
    difficulty: RecipeDifficultyTypeEnum.optional(),
    visibility: VisibilityTypeEnum.optional(),

    // UUID validation
    userId: z.string().uuid('User ID must be a valid UUID').optional(),
  }),

  // Schema pour supprimer une recette
  deleteRecipe: z.object({
    id: z.number().int().positive('Recipe ID must be a positive integer'),
  }),

  // Schema pour les paramètres d'URL
  recipeParam: z.object({
    recipeId: z.string().regex(/^\d+$/, 'Recipe ID must be a valid number'),
  }),

  // Schema pour les filtres de recherche avec transformations
  recipeFilters: z.object({
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

  // Schema pour l'approbation d'une recette avec transformations
  approveRecipe: z.object({
    isApproved: transformers.stringToBoolean,
    adminNotes: z.string().max(500, 'Admin notes are too long').optional(),
  }),

  // Schema pour l'attribution de promo avec transformations
  awardPromo: z.object({
    isPromoAwarded: transformers.stringToBoolean,
    promoReason: z.string().max(255, 'Promo reason is too long').optional(),
  }),

  // Schema pour changer la visibilité
  updateVisibility: z.object({
    visibility: VisibilityTypeEnum,
  }),

  // Schema pour la recherche avancée avec transformations
  searchRecipes: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Query is too long'),
    difficulty: RecipeDifficultyTypeEnum.optional(),

    maxPreparationTime: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 1,
        'Max preparation time must be positive'
      )
      .optional(),

    maxCookingTime: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 1,
        'Max cooking time must be positive'
      )
      .optional(),

    minServings: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 1,
        'Min servings must be positive'
      )
      .optional(),

    maxServings: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 1,
        'Max servings must be positive'
      )
      .optional(),

    isApproved: transformers.stringToBoolean.optional(),
    visibility: VisibilityTypeEnum.optional(),
    userId: z.string().uuid().optional(),
  }),

  // Schema pour les opérations en masse avec transformations
  bulkUpdateRecipes: z.object({
    recipeIds: z
      .array(
        transformers.stringToInt.refine(
          (val) => val > 0,
          'Recipe ID must be positive'
        )
      )
      .min(1, 'At least one recipe ID is required'),
    updates: z.object({
      isApproved: transformers.stringToBoolean.optional(),
      isPromoAwarded: transformers.stringToBoolean.optional(),
      visibility: VisibilityTypeEnum.optional(),
      difficulty: RecipeDifficultyTypeEnum.optional(),
    }),
  }),

  // Schema pour cloner une recette avec transformations
  cloneRecipe: z.object({
    originalRecipeId: transformers.stringToInt.refine(
      (val) => val > 0,
      'Original recipe ID must be a positive integer'
    ),
    newName: z
      .string()
      .min(1, 'New name is required')
      .max(255, 'Name is too long'),
    userId: z.string().uuid('User ID must be a valid UUID'),
  }),

  // Schema pour les statistiques de recette
  getRecipeStats: z.object({
    startDate: z.string().datetime('Invalid start date format').optional(),
    endDate: z.string().datetime('Invalid end date format').optional(),
    groupBy: z.enum(['day', 'week', 'month', 'year']).default('month'),
  }),

  // Schema pour l'export de recettes
  exportRecipes: z.object({
    format: z.enum(['JSON', 'CSV', 'PDF']).default('JSON'),
    filters: z
      .object({
        isApproved: transformers.stringToBoolean.optional(),
        difficulty: RecipeDifficultyTypeEnum.optional(),
        visibility: VisibilityTypeEnum.optional(),
        userId: z.string().uuid().optional(),
      })
      .optional(),
  }),
};

// Inférence des types TypeScript automatique
export type CreateRecipeRequest = z.infer<typeof RecipeSchemas.createRecipe>;
export type UpdateRecipeRequest = z.infer<typeof RecipeSchemas.updateRecipe>;
export type DeleteRecipeRequest = z.infer<typeof RecipeSchemas.deleteRecipe>;
export type RecipeParamRequest = z.infer<typeof RecipeSchemas.recipeParam>;
export type RecipeFiltersRequest = z.infer<typeof RecipeSchemas.recipeFilters>;
export type ApproveRecipeRequest = z.infer<typeof RecipeSchemas.approveRecipe>;
export type AwardPromoRequest = z.infer<typeof RecipeSchemas.awardPromo>;
export type UpdateVisibilityRequest = z.infer<
  typeof RecipeSchemas.updateVisibility
>;
export type SearchRecipesRequest = z.infer<typeof RecipeSchemas.searchRecipes>;
export type BulkUpdateRecipesRequest = z.infer<
  typeof RecipeSchemas.bulkUpdateRecipes
>;
export type CloneRecipeRequest = z.infer<typeof RecipeSchemas.cloneRecipe>;
export type GetRecipeStatsRequest = z.infer<
  typeof RecipeSchemas.getRecipeStats
>;
export type ExportRecipesRequest = z.infer<typeof RecipeSchemas.exportRecipes>;
export type RecipeSchemasType = typeof RecipeSchemas;
