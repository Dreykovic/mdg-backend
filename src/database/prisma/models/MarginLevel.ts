import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define the schema for MarginLevel
const marginLevelSchema = z.object({
  id: z.number().int().optional(), // Optional for create operations
  name: z.string().nonempty({ message: 'Margin level name is required' }),
  margin: z
    .number()
    .gte(0, { message: 'Margin must be a non-negative number' }),
  createdAt: z.date().optional(), // Automatically handled by Prisma
  updatedAt: z.date().optional(), // Automatically updated by Prisma
}) satisfies z.Schema<Prisma.MarginLevelUncheckedCreateInput>;

export const MarginLevelValidation = Prisma.defineExtension({
  query: {
    marginLevel: {
      create({ args, query }) {
        args.data = marginLevelSchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = marginLevelSchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = marginLevelSchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = marginLevelSchema.parse(args.create);
        args.update = marginLevelSchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
