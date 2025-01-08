/**
 * bcrypt.util.ts
 *
 * Utility class for handling password hashing and comparison using bcrypt.
 * Provides methods to securely hash passwords and verify them against stored hashes.
 *
 * Key Features:
 * - Uses bcrypt for secure password management.
 * - Dynamically adjusts the salt rounds based on configuration.
 * - Includes error handling for common bcrypt operations.
 */

import config from '@/config';
import bcrypt from 'bcrypt';

export default class BcryptUtil {
  /**
   * Compares a plain text password with a hashed password.
   * @param password - The plain text password to compare.
   * @param hashedPassword - The hashed password to verify against.
   * @returns A promise that resolves to `true` if the passwords match, `false` otherwise.
   * @throws Error if bcrypt comparison fails.
   */
  static readonly comparePassword = async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => {
    try {
      // Compare the plain text password with the hashed password
      const match = await bcrypt.compare(password, hashedPassword);
      return match;
    } catch (error) {
      // Handle comparison errors
      throw new Error(
        `Error while comparing passwords: ${(error as Error).message}`
      );
    }
  };

  /**
   * Hashes a plain text password using bcrypt.
   * @param password - The plain text password to hash.
   * @returns A promise that resolves to the hashed password.
   * @throws Error if hashing fails.
   */
  static readonly hashPassword = async (password: string): Promise<string> => {
    try {
      // Generate a salt with the configured number of salt rounds
      const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);

      // Hash the password using the generated salt
      const hashedPassword = await bcrypt.hash(password, salt);

      return hashedPassword;
    } catch (error) {
      // Handle hashing errors
      throw new Error(
        `Error while hashing password: ${(error as Error).message}`
      );
    }
  };
}
