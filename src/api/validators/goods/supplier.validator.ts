// validators/supplier.validator.ts
import { z } from 'zod';

export const SupplierSchemas = {
  // Schema pour créer un fournisseur
  createSupplier: z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    address1: z
      .string()
      .min(1, 'Address 1 is required')
      .max(255, 'Address 1 is too long'),
    address2: z.string().max(255, 'Address 2 is too long').optional(),
    city: z.string().min(1, 'City is required').max(100, 'City is too long'),
    state: z.string().min(1, 'State is required').max(100, 'State is too long'),
    country: z
      .string()
      .min(1, 'Country is required')
      .max(100, 'Country is too long'),
    postalCode: z.string().max(20, 'Postal code is too long').optional(),
    phone: z.string().max(20, 'Phone number is too long').optional(),
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email is too long')
      .optional(),
  }),

  // Schema pour mettre à jour un fournisseur
  updateSupplier: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .optional(),
    address1: z
      .string()
      .min(1, 'Address 1 is required')
      .max(255, 'Address 1 is too long')
      .optional(),
    address2: z.string().max(255, 'Address 2 is too long').optional(),
    city: z
      .string()
      .min(1, 'City is required')
      .max(100, 'City is too long')
      .optional(),
    state: z
      .string()
      .min(1, 'State is required')
      .max(100, 'State is too long')
      .optional(),
    country: z
      .string()
      .min(1, 'Country is required')
      .max(100, 'Country is too long')
      .optional(),
    postalCode: z.string().max(20, 'Postal code is too long').optional(),
    phone: z.string().max(20, 'Phone number is too long').optional(),
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email is too long')
      .optional(),
  }),
};

// Inférence des types TypeScript automatique
export type CreateSupplierRequest = z.infer<
  typeof SupplierSchemas.createSupplier
>;
export type UpdateSupplierRequest = z.infer<
  typeof SupplierSchemas.updateSupplier
>;

export type SupplierSchemasType = typeof SupplierSchemas;
