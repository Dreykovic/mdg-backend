import { Prisma, PrismaClient, UOMType } from '@prisma/client'; // Prisma types for database schema

// Get the Prisma service instance from the container
// const prismaService = Container.get(PrismaService);

/**
 * This function seeds the database with default units of measurement.
 * It ensures that certain units (e.g., Gram and Tablespoon) exist in the database.
 */
export async function seedDefaultUnits(
  prismaService: PrismaClient
): Promise<void> {
  // Default units of measure with properties like name, factor, and type
  const defaultUnits: Prisma.UnitOfMeasureCreateInput[] = [
    {
      name: 'Gram', // Unit name
      factor: 1, // Conversion factor (standard unit)
      isStandard: true, // Mark as standard unit
      type: UOMType.WEIGHT, // Unit type (Weight)
      createdAt: new Date(), // Set creation timestamp
      updatedAt: new Date(), // Set update timestamp
    },
    {
      name: 'Tablespoon', // Unit name
      factor: 1, // Conversion factor (standard unit)
      isStandard: true, // Mark as standard unit
      type: UOMType.VOLUME, // Unit type (Volume)
      createdAt: new Date(), // Set creation timestamp
      updatedAt: new Date(), // Set update timestamp
    },
  ];

  // Upsert all default units in parallel to avoid awaiting inside a loop
  await Promise.all(
    defaultUnits.map((defaultUnit) =>
      prismaService.unitOfMeasure.upsert({
        where: {
          name: defaultUnit.name, // Check for existing unit by name
        },
        update: {}, // If the unit exists, no update is performed
        create: defaultUnit, // Create the unit if it doesn't exist
      })
    )
  );
}
