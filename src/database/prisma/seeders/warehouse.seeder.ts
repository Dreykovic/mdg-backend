import { PrismaClient } from '@prisma/client'; // Prisma types for database schema

// Get the Prisma service instance from the container
// const prismaService = Container.get(PrismaService);

/**
 * This function seeds the database with default warehouse.
 * It ensures that at least one warehouse exists in the database.
 */
export async function seedDefaultWareHouse(prismaService: PrismaClient) {
  await prismaService.warehouse.upsert({
    where: { name: 'Main' },
    update: {},
    create: { name: 'Main', location: 'Lomé', isDefault: true },
  });
}
