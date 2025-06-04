// validators/unit-of-measure.validator.ts
import { z } from 'zod';
import { transformers } from '../shared/utils';

// Enum pour UOMType (à adapter selon votre définition)
const UOMTypeEnum = z.enum(['WEIGHT', 'VOLUME', 'OTHER']);

export const UnitOfMeasureSchemas = {
  // Schema pour créer une unité de mesure
  createUnitOfMeasure: z
    .object({
      name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
      type: UOMTypeEnum,
      factor: z.number().min(0.000001, 'Factor must be positive').default(1),
      isStandard: z.boolean().default(false),
      standardUnitId: z
        .number()
        .int()
        .positive('Standard unit ID must be a positive integer')
        .optional(),
    })
    .refine(
      (data) => {
        // Si c'est une unité standard, elle ne peut pas avoir de standardUnitId
        if (data.isStandard && data.standardUnitId !== undefined) {
          return false;
        }
        // Si ce n'est pas une unité standard et qu'elle a un facteur différent de 1, elle doit avoir un standardUnitId
        if (
          !data.isStandard &&
          data.factor !== 1 &&
          data.standardUnitId === undefined
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          'Standard units cannot have standardUnitId, and non-standard units with factor ≠ 1 must have standardUnitId',
        path: ['standardUnitId'],
      }
    ),

  // Schema pour mettre à jour une unité de mesure avec transformations
  updateUnitOfMeasure: z
    .object({
      name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .optional(),
      type: UOMTypeEnum.optional(),

      factor: transformers.stringToNumber
        .refine((val) => val > 0.000001, 'Factor must be positive')
        .optional(),

      isStandard: transformers.stringToBoolean.optional(),

      standardUnitId: transformers.stringToIntOrNull
        .refine(
          (val) => val === null || val > 0,
          'Standard unit ID must be a positive integer or null'
        )
        .optional(),
    })
    .refine(
      (data) => {
        // Validation logique pour les mises à jour
        if (
          data.isStandard === true &&
          data.standardUnitId !== undefined &&
          data.standardUnitId !== null
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Standard units cannot have standardUnitId',
        path: ['standardUnitId'],
      }
    ),

  // Schema pour supprimer une unité de mesure
  deleteUnitOfMeasure: z.object({
    id: z
      .number()
      .int()
      .positive('Unit of measure ID must be a positive integer'),
  }),

  // Schema pour les paramètres d'URL
  unitOfMeasureParam: z.object({
    unitId: z.string().regex(/^\d+$/, 'Unit ID must be a valid number'),
  }),

  // Schema pour les filtres de recherche
  unitOfMeasureFilters: z.object({
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

  // Schema pour créer plusieurs unités de mesure en même temps
  bulkCreateUnitsOfMeasure: z.object({
    units: z
      .array(
        z
          .object({
            name: z
              .string()
              .min(1, 'Name is required')
              .max(100, 'Name is too long'),
            type: UOMTypeEnum,
            factor: z
              .number()
              .min(0.000001, 'Factor must be positive')
              .default(1),
            isStandard: z.boolean().default(false),
            standardUnitId: z
              .number()
              .int()
              .positive('Standard unit ID must be a positive integer')
              .optional(),
          })
          .refine(
            (data) => {
              if (data.isStandard && data.standardUnitId !== undefined) {
                return false;
              }
              if (
                !data.isStandard &&
                data.factor !== 1 &&
                data.standardUnitId === undefined
              ) {
                return false;
              }
              return true;
            },
            {
              message: 'Invalid standard unit configuration',
              path: ['standardUnitId'],
            }
          )
      )
      .min(1, 'At least one unit is required'),
  }),

  // Schema pour convertir entre unités
  convertUnits: z.object({
    fromUnitId: z
      .number()
      .int()
      .positive('From unit ID must be a positive integer'),
    toUnitId: z
      .number()
      .int()
      .positive('To unit ID must be a positive integer'),
    value: z.number().min(0, 'Value must be positive'),
  }),

  // Schema pour rechercher des unités de mesure
  searchUnitsOfMeasure: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Query is too long'),
    type: UOMTypeEnum.optional(),
    isStandard: transformers.stringToBoolean.optional(),
    minFactor: transformers.stringToNumber.optional(),
    maxFactor: transformers.stringToNumber.optional(),
  }),

  // Schema pour obtenir les unités dérivées
  getDerivedUnits: z.object({
    standardUnitId: z
      .number()
      .int()
      .positive('Standard unit ID must be a positive integer'),
  }),

  // Schema pour obtenir des statistiques sur les unités
  getUnitStats: z.object({
    type: UOMTypeEnum.optional(),
    groupBy: z.enum(['type', 'isStandard', 'standardUnit']).default('type'),
  }),

  // Schema pour la mise à jour en masse
  bulkUpdateUnitsOfMeasure: z.object({
    unitIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one unit ID is required'),
    updates: z.object({
      type: UOMTypeEnum.optional(),
      factor: transformers.stringToNumber
        .refine((val) => val > 0.000001, 'Factor must be positive')
        .optional(),
      isStandard: transformers.stringToBoolean.optional(),
      standardUnitId: transformers.stringToIntOrNull.optional(),
    }),
  }),

  // Schema pour synchroniser les facteurs de conversion
  synchronizeFactors: z.object({
    standardUnitId: z
      .number()
      .int()
      .positive('Standard unit ID must be a positive integer'),
    baseFactor: z
      .number()
      .min(0.000001, 'Base factor must be positive')
      .default(1),
  }),

  // Schema pour valider la cohérence des conversions
  validateConversions: z.object({
    unitIds: z
      .array(z.number().int().positive())
      .min(2, 'At least two unit IDs are required'),
  }),

  // Schema pour créer une unité dérivée
  createDerivedUnit: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    standardUnitId: z
      .number()
      .int()
      .positive('Standard unit ID must be a positive integer'),
    factor: z.number().min(0.000001, 'Factor must be positive'),
  }),

  // Schema pour exporter les unités
  exportUnits: z.object({
    format: z.enum(['JSON', 'CSV', 'XML']).default('JSON'),
    type: UOMTypeEnum.optional(),
    includeConversions: z.boolean().default(false),
  }),
};

// Inférence des types TypeScript automatique
export type CreateUnitOfMeasureRequest = z.infer<
  typeof UnitOfMeasureSchemas.createUnitOfMeasure
>;
export type UpdateUnitOfMeasureRequest = z.infer<
  typeof UnitOfMeasureSchemas.updateUnitOfMeasure
>;
export type DeleteUnitOfMeasureRequest = z.infer<
  typeof UnitOfMeasureSchemas.deleteUnitOfMeasure
>;
export type UnitOfMeasureParamRequest = z.infer<
  typeof UnitOfMeasureSchemas.unitOfMeasureParam
>;
export type UnitOfMeasureFiltersRequest = z.infer<
  typeof UnitOfMeasureSchemas.unitOfMeasureFilters
>;
export type BulkCreateUnitsOfMeasureRequest = z.infer<
  typeof UnitOfMeasureSchemas.bulkCreateUnitsOfMeasure
>;
export type ConvertUnitsRequest = z.infer<
  typeof UnitOfMeasureSchemas.convertUnits
>;
export type SearchUnitsOfMeasureRequest = z.infer<
  typeof UnitOfMeasureSchemas.searchUnitsOfMeasure
>;
export type GetDerivedUnitsRequest = z.infer<
  typeof UnitOfMeasureSchemas.getDerivedUnits
>;
export type GetUnitStatsRequest = z.infer<
  typeof UnitOfMeasureSchemas.getUnitStats
>;
export type BulkUpdateUnitsOfMeasureRequest = z.infer<
  typeof UnitOfMeasureSchemas.bulkUpdateUnitsOfMeasure
>;
export type SynchronizeFactorsRequest = z.infer<
  typeof UnitOfMeasureSchemas.synchronizeFactors
>;
export type ValidateConversionsRequest = z.infer<
  typeof UnitOfMeasureSchemas.validateConversions
>;
export type CreateDerivedUnitRequest = z.infer<
  typeof UnitOfMeasureSchemas.createDerivedUnit
>;
export type ExportUnitsRequest = z.infer<
  typeof UnitOfMeasureSchemas.exportUnits
>;
export type UnitOfMeasureSchemasType = typeof UnitOfMeasureSchemas;
