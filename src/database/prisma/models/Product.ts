import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define the schema for Product
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(100),
  isGlutenFree: z.boolean(),
  isGMOFree: z.boolean(),
  description: z.string().max(1000).nullable().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  minimumStockLevel: z
    .number()
    .gte(0, 'Minimum stock level must be greater than or equal to 0')
    .optional(),
  quantity: z
    .number()
    .gte(0, 'Quantity must be greater than or equal to 0')
    .optional(),
  additionalCost: z
    .number()
    .gte(0, 'Additional cost must be greater than or equal to 0')
    .optional(),
  costPerGramWhole: z
    .number()
    .gte(0, 'Cost per gram (whole) must be greater than or equal to 0'),
  costPerGramGround: z
    .number()
    .gte(0, 'Cost per gram (ground) must be greater than or equal to 0'),
  pricePerGramWhole: z
    .number()
    .gte(0, 'Price per gram (whole) must be greater than or equal to 0'),
  pricePerGramGround: z
    .number()
    .gte(0, 'Price per gram (ground) must be greater than or equal to 0'),

  originId: z.number().int(),
  subcategoryId: z.number().int().nullable().optional(),
  categoryId: z.number().int(),
  supplierId: z.number().int(),
  marginLevelId: z.number().int(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}) satisfies z.Schema<Prisma.ProductUncheckedCreateInput>;

export const ProductValidation = Prisma.defineExtension({
  query: {
    product: {
      create({ args, query }) {
        args.data = productSchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = productSchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = productSchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = productSchema.parse(args.create);
        args.update = productSchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
