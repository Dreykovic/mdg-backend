import config from '@/config'; // Application configuration (e.g., default user credentials)
import BcryptUtil from '@/core/utils/bcrypt.util'; // Utility for hashing passwords
import { PrismaClient, ProfileName, User } from '@prisma/client'; // Prisma types for database schema

// Get the Prisma service instance from the container
// const prismaService = Container.get(PrismaService);

/**
 * This function ensures that a default user exists in the database.
 * If the user does not exist, it creates one with the default configuration from the `config` file.
 * If the user exists, no update is performed.
 */
export async function createOrFindDefaultUser(
  prismaService: PrismaClient
): Promise<User> {
  const defaultUser = await prismaService.user.upsert({
    where: {
      username: config.defaultUser.name, // Check for an existing user by username
    },
    update: {}, // If the user exists, no update is performed
    create: {
      username: config.defaultUser.name, // Use default username from configuration
      password: await BcryptUtil.hashPassword(config.defaultUser.password), // Hash the default password
      email: config.defaultUser.email, // Set the default email address
      profiles: config.defaultUser.profiles.split(',') as ProfileName[], // Set the default profiles
    },
  });

  return defaultUser; // Return the created or found default user
}
