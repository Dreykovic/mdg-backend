// validators/recipe.validator.ts
import { z } from 'zod';

// Enums pour les types (à adapter selon votre définition)
const RecipeDifficultyTypeEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
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

  // Schema pour mettre à jour une recette
  updateRecipe: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .optional(),
    description: z.string().max(2000, 'Description is too long').optional(),
    preparationTime: z
      .number()
      .int()
      .min(1, 'Preparation time must be at least 1 minute')
      .optional(),
    cookingTime: z
      .number()
      .int()
      .min(0, 'Cooking time must be positive')
      .optional(),
    servings: z.number().int().min(1, 'Servings must be at least 1').optional(),
    isApproved: z.boolean().optional(),
    isPromoAwarded: z.boolean().optional(),
    difficulty: RecipeDifficultyTypeEnum.optional(),
    visibility: VisibilityTypeEnum.optional(),
    userId: z.string().uuid('User ID must be a valid UUID').optional(),
  }),
  // TODO:Use next schemas
  // Schema pour l'approbation d'une recette
  approveRecipe: z.object({
    isApproved: z.boolean(),
    adminNotes: z.string().max(500, 'Admin notes are too long').optional(),
  }),

  // Schema pour l'attribution de promo
  awardPromo: z.object({
    isPromoAwarded: z.boolean(),
    promoReason: z.string().max(255, 'Promo reason is too long').optional(),
  }),

  // Schema pour changer la visibilité
  updateVisibility: z.object({
    visibility: VisibilityTypeEnum,
  }),

  // Schema pour la recherche avancée
  searchRecipes: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Query is too long'),
    difficulty: RecipeDifficultyTypeEnum.optional(),
    maxPreparationTime: z.number().int().min(1).optional(),
    maxCookingTime: z.number().int().min(1).optional(),
    minServings: z.number().int().min(1).optional(),
    maxServings: z.number().int().min(1).optional(),
    isApproved: z.boolean().optional(),
    visibility: VisibilityTypeEnum.optional(),
    userId: z.string().uuid().optional(),
  }),

  // Schema pour les opérations en masse
  bulkUpdateRecipes: z.object({
    recipeIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one recipe ID is required'),
    updates: z.object({
      isApproved: z.boolean().optional(),
      isPromoAwarded: z.boolean().optional(),
      visibility: VisibilityTypeEnum.optional(),
      difficulty: RecipeDifficultyTypeEnum.optional(),
    }),
  }),

  // Schema pour cloner une recette
  cloneRecipe: z.object({
    originalRecipeId: z
      .number()
      .int()
      .positive('Original recipe ID must be a positive integer'),
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
        isApproved: z.boolean().optional(),
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
