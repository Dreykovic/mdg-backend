import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define the schema for ProductSubcategory
const productSubcategorySchema = z.object({
  id: z.number().int().optional(), // Optional for create operations
  name: z.string().nonempty({ message: 'Name is required' }),
  imageRef: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  slug: z.string().optional().nullable(),
  categoryId: z
    .number()
    .int()
    .nonnegative({ message: 'Category ID must be a positive integer' }),
  createdAt: z.date().optional(), // Automatically handled by Prisma
  updatedAt: z.date().optional(), // Automatically updated by Prisma
}) satisfies z.Schema<Prisma.ProductSubcategoryUncheckedCreateInput>;

export const ProductSubcategoryValidation = Prisma.defineExtension({
  query: {
    productSubcategory: {
      create({ args, query }) {
        args.data = productSubcategorySchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = productSubcategorySchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = productSubcategorySchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = productSubcategorySchema.parse(args.create);
        args.update = productSubcategorySchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
