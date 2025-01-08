import { z } from 'zod';
import { Prisma, UOMType } from '@prisma/client';

// Define the schema for UnitOfMeasure
const unitOfMeasureSchema = z.object({
  id: z.number().int().optional(), // Optional for create operations
  name: z.string().nonempty({ message: 'Unit of measure name is required' }),
  type: z.nativeEnum(UOMType, {
    message: 'Invalid type for unit of measure',
  }), // Enum validation
  factor: z.number(),
  isStandard: z.boolean().optional(),
  createdAt: z.date().optional(), // Automatically handled by Prisma
  updatedAt: z.date().optional(), // Automatically updated by Prisma
}) satisfies z.Schema<Prisma.UnitOfMeasureUncheckedCreateInput>;

export const UnitOfMeasureValidation = Prisma.defineExtension({
  query: {
    unitOfMeasure: {
      create({ args, query }) {
        args.data = unitOfMeasureSchema.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = unitOfMeasureSchema.partial().parse(args.data);
        return query(args);
      },
      updateMany({ args, query }) {
        args.data = unitOfMeasureSchema.partial().parse(args.data);
        return query(args);
      },
      upsert({ args, query }) {
        args.create = unitOfMeasureSchema.parse(args.create);
        args.update = unitOfMeasureSchema.partial().parse(args.update);
        return query(args);
      },
    },
  },
});
