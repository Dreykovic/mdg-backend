// validators/volume-conversion.validator.ts
import { z } from 'zod';
import { transformers } from '../shared/utils';

export const VolumeConversionSchemas = {
  // Schema pour créer une conversion de volume
  createVolumeConversion: z
    .object({
      m1: z.number().min(0, 'M1 conversion factor must be positive'),
      m2: z.number().min(0, 'M2 conversion factor must be positive'),
      m3: z.number().min(0, 'M3 conversion factor must be positive'),
      productId: z.string().uuid('Product ID must be a valid UUID'),
      stdVolId: z
        .number()
        .int()
        .positive('Standard volume ID must be a positive integer')
        .optional(),
    })
    .transform((data) => ({
      ...data,
      avg: (data.m1 + data.m2 + data.m3) / 3, // Calcul automatique de la moyenne
    })),

  // Schema pour mettre à jour une conversion de volume avec transformations
  updateVolumeConversion: z
    .object({
      m1: transformers.stringToNumber
        .refine((val) => val >= 0, 'M1 conversion factor must be positive')
        .optional(),

      m2: transformers.stringToNumber
        .refine((val) => val >= 0, 'M2 conversion factor must be positive')
        .optional(),

      m3: transformers.stringToNumber
        .refine((val) => val >= 0, 'M3 conversion factor must be positive')
        .optional(),

      productId: z.string().uuid('Product ID must be a valid UUID').optional(),

      stdVolId: transformers.stringToInt
        .refine(
          (val) => val > 0,
          'Standard volume ID must be a positive integer'
        )
        .optional(),
    })
    .transform((data) => {
      // Recalcul de la moyenne si les facteurs sont modifiés
      const hasFactors =
        data.m1 !== undefined || data.m2 !== undefined || data.m3 !== undefined;
      if (hasFactors) {
        // Note: En pratique, il faudrait récupérer les valeurs existantes pour calculer la nouvelle moyenne
        // Ici on suppose que le backend s'en charge
        return data;
      }
      return data;
    }),

  // Schema pour supprimer une conversion de volume
  deleteVolumeConversion: z.object({
    id: z
      .number()
      .int()
      .positive('Volume conversion ID must be a positive integer'),
  }),

  // Schema pour les paramètres d'URL
  volumeConversionParam: z.object({
    conversionId: z
      .string()
      .regex(/^\d+$/, 'Conversion ID must be a valid number'),
  }),

  // Schema pour les paramètres de produit
  productParam: z.object({
    productId: z.string().uuid('Product ID must be a valid UUID'),
  }),

  // Schema pour les filtres de recherche
  volumeConversionFilters: z.object({
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

  // Schema pour créer plusieurs conversions de volume en même temps
  bulkCreateVolumeConversions: z.object({
    conversions: z
      .array(
        z
          .object({
            m1: z.number().min(0, 'M1 conversion factor must be positive'),
            m2: z.number().min(0, 'M2 conversion factor must be positive'),
            m3: z.number().min(0, 'M3 conversion factor must be positive'),
            productId: z.string().uuid('Product ID must be a valid UUID'),
            stdVolId: z
              .number()
              .int()
              .positive('Standard volume ID must be a positive integer'),
          })
          .transform((data) => ({
            ...data,
            avg: (data.m1 + data.m2 + data.m3) / 3,
          }))
      )
      .min(1, 'At least one conversion is required'),
  }),

  // Schema pour mise à jour en masse des conversions
  bulkUpdateVolumeConversions: z.object({
    conversionIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one conversion ID is required'),
    updates: z.object({
      m1: transformers.stringToNumber
        .refine((val) => val >= 0, 'M1 conversion factor must be positive')
        .optional(),
      m2: transformers.stringToNumber
        .refine((val) => val >= 0, 'M2 conversion factor must be positive')
        .optional(),
      m3: transformers.stringToNumber
        .refine((val) => val >= 0, 'M3 conversion factor must be positive')
        .optional(),
      stdVolId: transformers.stringToInt
        .refine(
          (val) => val > 0,
          'Standard volume ID must be a positive integer'
        )
        .optional(),
    }),
  }),

  // Schema pour supprimer plusieurs conversions
  bulkDeleteVolumeConversions: z.object({
    conversionIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one conversion ID is required'),
  }),

  // Schema pour calculer une conversion de volume
  calculateVolumeConversion: z.object({
    weight: z.number().min(0, 'Weight must be positive'),
    productId: z.string().uuid('Product ID must be a valid UUID'),
    targetVolumeUnitId: z
      .number()
      .int()
      .positive('Target volume unit ID must be a positive integer')
      .optional(),
  }),

  // Schema pour rechercher des conversions de volume
  searchVolumeConversions: z.object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Query is too long'),
    productId: z.string().uuid().optional(),
    stdVolId: z.number().int().positive().optional(),
    minAvg: transformers.stringToNumber.optional(),
    maxAvg: transformers.stringToNumber.optional(),
    minM1: transformers.stringToNumber.optional(),
    maxM1: transformers.stringToNumber.optional(),
    minM2: transformers.stringToNumber.optional(),
    maxM2: transformers.stringToNumber.optional(),
    minM3: transformers.stringToNumber.optional(),
    maxM3: transformers.stringToNumber.optional(),
  }),

  // Schema pour obtenir des statistiques sur les conversions
  getVolumeConversionStats: z.object({
    productId: z.string().uuid().optional(),
    stdVolId: z.number().int().positive().optional(),
    groupBy: z.enum(['product', 'stdVol', 'avgRange']).default('product'),
  }),

  // Schema pour valider la cohérence des conversions
  validateConversions: z.object({
    conversionIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one conversion ID is required'),
    tolerance: z.number().min(0).max(1).default(0.1), // Tolérance en pourcentage
  }),

  // Schema pour recalculer les moyennes
  recalculateAverages: z.object({
    conversionIds: z.array(z.number().int().positive()).optional(), // Si vide, recalcule toutes
  }),

  // Schema pour comparer les conversions
  compareConversions: z.object({
    conversionId1: z
      .number()
      .int()
      .positive('First conversion ID must be a positive integer'),
    conversionId2: z
      .number()
      .int()
      .positive('Second conversion ID must be a positive integer'),
  }),

  // Schema pour exporter les conversions
  exportVolumeConversions: z.object({
    format: z.enum(['JSON', 'CSV', 'EXCEL']).default('JSON'),
    productIds: z.array(z.string().uuid()).optional(),
    stdVolIds: z.array(z.number().int().positive()).optional(),
    includeCalculations: z.boolean().default(false),
  }),

  // Schema pour importer des conversions depuis un fichier
  importVolumeConversions: z.object({
    data: z
      .array(
        z.object({
          m1: z.number().min(0),
          m2: z.number().min(0),
          m3: z.number().min(0),
          productId: z.string().uuid(),
          stdVolId: z.number().int().positive(),
        })
      )
      .min(1, 'At least one conversion is required'),
    overwrite: z.boolean().default(false), // Écraser les conversions existantes
  }),

  // Schema pour obtenir les conversions par unité standard
  getByStandardVolume: z.object({
    stdVolId: z
      .number()
      .int()
      .positive('Standard volume ID must be a positive integer'),
  }),

  // Schema pour créer une conversion avec mesures automatiques
  createWithMeasurements: z
    .object({
      productId: z.string().uuid('Product ID must be a valid UUID'),
      stdVolId: z
        .number()
        .int()
        .positive('Standard volume ID must be a positive integer'),
      measurements: z
        .array(
          z.object({
            weight: z.number().min(0, 'Weight must be positive'),
            volume: z.number().min(0, 'Volume must be positive'),
          })
        )
        .min(3, 'At least 3 measurements are required')
        .max(3, 'Exactly 3 measurements are required'),
    })
    .transform((data) => {
      // Calcul des facteurs de conversion à partir des mesures
      const factors = data.measurements.map((m) => m.volume / m.weight);
      return {
        productId: data.productId,
        stdVolId: data.stdVolId,
        m1: factors[0],
        m2: factors[1],
        m3: factors[2],
        avg: factors.reduce((sum, f) => sum + f, 0) / factors.length,
      };
    }),
};

// Inférence des types TypeScript automatique
export type CreateVolumeConversionRequest = z.infer<
  typeof VolumeConversionSchemas.createVolumeConversion
>;
export type UpdateVolumeConversionRequest = z.infer<
  typeof VolumeConversionSchemas.updateVolumeConversion
>;
export type DeleteVolumeConversionRequest = z.infer<
  typeof VolumeConversionSchemas.deleteVolumeConversion
>;
export type VolumeConversionParamRequest = z.infer<
  typeof VolumeConversionSchemas.volumeConversionParam
>;
export type ProductParamRequest = z.infer<
  typeof VolumeConversionSchemas.productParam
>;
export type VolumeConversionFiltersRequest = z.infer<
  typeof VolumeConversionSchemas.volumeConversionFilters
>;
export type BulkCreateVolumeConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.bulkCreateVolumeConversions
>;
export type BulkUpdateVolumeConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.bulkUpdateVolumeConversions
>;
export type BulkDeleteVolumeConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.bulkDeleteVolumeConversions
>;
export type CalculateVolumeConversionRequest = z.infer<
  typeof VolumeConversionSchemas.calculateVolumeConversion
>;
export type SearchVolumeConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.searchVolumeConversions
>;
export type GetVolumeConversionStatsRequest = z.infer<
  typeof VolumeConversionSchemas.getVolumeConversionStats
>;
export type ValidateConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.validateConversions
>;
export type RecalculateAveragesRequest = z.infer<
  typeof VolumeConversionSchemas.recalculateAverages
>;
export type CompareConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.compareConversions
>;
export type ExportVolumeConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.exportVolumeConversions
>;
export type ImportVolumeConversionsRequest = z.infer<
  typeof VolumeConversionSchemas.importVolumeConversions
>;
export type GetByStandardVolumeRequest = z.infer<
  typeof VolumeConversionSchemas.getByStandardVolume
>;
export type CreateWithMeasurementsRequest = z.infer<
  typeof VolumeConversionSchemas.createWithMeasurements
>;
export type VolumeConversionSchemasType = typeof VolumeConversionSchemas;
