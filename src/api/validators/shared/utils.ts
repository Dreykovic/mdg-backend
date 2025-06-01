// validators/recipe.validator.ts
import StringUtil from '@/core/utils/string.util';
import { z } from 'zod';

// Transformers utilitaires
export const transformers = {
  stringToBoolean: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === 'boolean') {
      return val;
    }
    return StringUtil.parseBool(val);
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

  stringToUuidOrNull: z
    .union([z.string(), z.null()])
    .transform((val) => {
      if (val === null || val === '' || val === undefined) {
        return null;
      }
      return val;
    })
    .refine(
      (val) => val === null || z.string().uuid().safeParse(val).success,
      'Must be a valid UUID or null'
    ),

  stringOrNull: z.union([z.string(), z.null()]).transform((val) => {
    if (val === '' || val === undefined) {
      return null;
    }
    return val;
  }),

  trimmedString: z.string().transform((val) => val.trim()),
  positiveNumber: z.number().min(0, 'Must be a positive number'),
  strictlyPositiveNumber: z.number().min(0.01, 'Must be greater than 0'),
  uuidString: z.string().uuid('Must be a valid UUID'),
  optionalUuid: z.string().uuid().optional(),

  optionalFloat: z.number().optional(),
  optionalInt: z.number().int().optional(),
};
