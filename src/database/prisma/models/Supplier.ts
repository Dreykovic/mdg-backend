import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define the schema for Supplier
const supplierSchema = z.object({
  id: z.number().int().optional(), // Optional for create operations
  name: z.string().nonempty({ message: 'Supplier name is required' }),
  address1: z.string().nonempty({ message: 'Address line 1 is required' }),
  address2: z.string().optional().nullable(),
  city: z.string().nonempty({ message: 'City is required' }),
  state: z.string().optional().nullable(),
  postalCode: z.string().nonempty({ message: 'Postal code is required' }),
  country: z.string().nonempty({ message: 'Country is required' }),
  imageRef: z.string().optional().nullable(),
  createdAt: z.date().optional(), // Automatically handled by Prisma
  updatedAt: z.date().optional(), // Automatically updated by Prisma
}) satisfies z.Schema<Prisma.SupplierUncheckedCreateInput>;

export const SupplierValidation = Prisma.defineExtension({
  query: {
    supplier: {
      create({ args, query }) {
        args.data = supplierSchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = supplierSchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = supplierSchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = supplierSchema.parse(args.create);
        args.update = supplierSchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
