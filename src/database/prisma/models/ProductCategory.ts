import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define the schema for ProductCategory
const productCategorySchema = z.object({
  id: z.number().int().optional(), // Optional for create operations
  name: z.string().nonempty({ message: 'Name is required' }),
  imageRef: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  slug: z.string().optional().nullable(),
  createdAt: z.date().optional(), // Automatically handled by Prisma
  updatedAt: z.date().optional(), // Automatically updated by Prisma
}) satisfies z.Schema<Prisma.ProductCategoryUncheckedCreateInput>;

export const ProductCategoryValidation = Prisma.defineExtension({
  query: {
    productCategory: {
      create({ args, query }) {
        args.data = productCategorySchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = productCategorySchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = productCategorySchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = productCategorySchema.parse(args.create);
        args.update = productCategorySchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
