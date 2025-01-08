import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define the schema for Origin
const originSchema = z.object({
  id: z.number().int().optional(), // Optional for create operations
  country: z.string().nonempty({ message: 'Country is required' }),
  createdAt: z.date().optional(), // Automatically handled by Prisma
  updatedAt: z.date().optional(), // Automatically updated by Prisma
}) satisfies z.Schema<Prisma.OriginUncheckedCreateInput>;

export const OriginValidation = Prisma.defineExtension({
  query: {
    origin: {
      create({ args, query }) {
        args.data = originSchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = originSchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = originSchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = originSchema.parse(args.create);
        args.update = originSchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
