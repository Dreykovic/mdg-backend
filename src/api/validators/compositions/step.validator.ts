// validators/step.validator.ts
import { z } from 'zod';
import { transformers } from '../shared/utils';

export const StepSchemas = {
  // Schema pour créer une étape
  createStep: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    stepNumber: z
      .number()
      .int()
      .positive('Step number must be a positive integer'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(2000, 'Description is too long'),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .optional(),
  }),

  // Schema pour mettre à jour une étape avec transformations
  updateStep: z.object({
    recipeId: transformers.stringToInt
      .refine((val) => val > 0, 'Recipe ID must be a positive integer')
      .optional(),

    stepNumber: transformers.stringToInt
      .refine((val) => val > 0, 'Step number must be a positive integer')
      .optional(),

    description: z
      .string()
      .min(1, 'Description is required')
      .max(2000, 'Description is too long')
      .optional(),

    duration: transformers.stringToIntOrNull
      .refine(
        (val) => val === null || val >= 1,
        'Duration must be at least 1 minute or null'
      )
      .optional(),
  }),

  // Schema pour supprimer une étape
  deleteStep: z.object({
    id: z.number().int().positive('Step ID must be a positive integer'),
  }),

  // Schema pour les paramètres d'URL
  stepParam: z.object({
    stepId: z.string().regex(/^\d+$/, 'Step ID must be a valid number'),
  }),

  // Schema pour les paramètres de recette
  recipeParam: z.object({
    recipeId: z.string().regex(/^\d+$/, 'Recipe ID must be a valid number'),
  }),

  // Schema pour les filtres de recherche
  stepFilters: z.object({
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

  // Schema pour créer plusieurs étapes en même temps
  bulkCreateSteps: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    steps: z
      .array(
        z.object({
          stepNumber: z
            .number()
            .int()
            .positive('Step number must be a positive integer'),
          description: z
            .string()
            .min(1, 'Description is required')
            .max(2000, 'Description is too long'),
          duration: z
            .number()
            .int()
            .min(1, 'Duration must be at least 1 minute')
            .optional(),
        })
      )
      .min(1, 'At least one step is required'),
  }),

  // Schema pour réorganiser les étapes
  reorderSteps: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    stepOrders: z
      .array(
        z.object({
          stepId: z
            .number()
            .int()
            .positive('Step ID must be a positive integer'),
          newStepNumber: z
            .number()
            .int()
            .positive('New step number must be a positive integer'),
        })
      )
      .min(1, 'At least one step order is required'),
  }),

  // Schema pour dupliquer des étapes d'une recette à une autre
  duplicateSteps: z.object({
    sourceRecipeId: z
      .number()
      .int()
      .positive('Source recipe ID must be a positive integer'),
    targetRecipeId: z
      .number()
      .int()
      .positive('Target recipe ID must be a positive integer'),
    stepIds: z.array(z.number().int().positive()).optional(), // Si vide, duplique toutes les étapes
  }),

  // Schema pour mise à jour en masse des étapes
  bulkUpdateSteps: z.object({
    stepIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one step ID is required'),
    updates: z.object({
      description: z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description is too long')
        .optional(),
      duration: transformers.stringToIntOrNull
        .refine(
          (val) => val === null || val >= 1,
          'Duration must be at least 1 minute or null'
        )
        .optional(),
    }),
  }),

  // Schema pour supprimer plusieurs étapes
  bulkDeleteSteps: z.object({
    stepIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one step ID is required'),
  }),

  // Schema pour insérer une étape entre deux étapes existantes
  insertStep: z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    afterStepNumber: z
      .number()
      .int()
      .min(0, 'After step number must be 0 or positive'), // 0 = début
    description: z
      .string()
      .min(1, 'Description is required')
      .max(2000, 'Description is too long'),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .optional(),
  }),

  // Schema pour rechercher des étapes
  searchSteps: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Query is too long'),
    recipeId: z.number().int().positive().optional(),
    minDuration: transformers.stringToIntOrNull.optional(),
    maxDuration: transformers.stringToIntOrNull.optional(),
  }),

  // Schema pour obtenir des statistiques sur les étapes
  getStepStats: z.object({
    recipeId: z
      .number()
      .int()
      .positive('Recipe ID must be a positive integer')
      .optional(),
    groupBy: z.enum(['recipe', 'duration', 'stepNumber']).default('recipe'),
  }),
};

// Inférence des types TypeScript automatique
export type CreateStepRequest = z.infer<typeof StepSchemas.createStep>;
export type UpdateStepRequest = z.infer<typeof StepSchemas.updateStep>;
export type DeleteStepRequest = z.infer<typeof StepSchemas.deleteStep>;
export type StepParamRequest = z.infer<typeof StepSchemas.stepParam>;
export type RecipeParamRequest = z.infer<typeof StepSchemas.recipeParam>;
export type StepFiltersRequest = z.infer<typeof StepSchemas.stepFilters>;
export type BulkCreateStepsRequest = z.infer<
  typeof StepSchemas.bulkCreateSteps
>;
export type ReorderStepsRequest = z.infer<typeof StepSchemas.reorderSteps>;
export type DuplicateStepsRequest = z.infer<typeof StepSchemas.duplicateSteps>;
export type BulkUpdateStepsRequest = z.infer<
  typeof StepSchemas.bulkUpdateSteps
>;
export type BulkDeleteStepsRequest = z.infer<
  typeof StepSchemas.bulkDeleteSteps
>;
export type InsertStepRequest = z.infer<typeof StepSchemas.insertStep>;
export type SearchStepsRequest = z.infer<typeof StepSchemas.searchSteps>;
export type GetStepStatsRequest = z.infer<typeof StepSchemas.getStepStats>;
export type StepSchemasType = typeof StepSchemas;
