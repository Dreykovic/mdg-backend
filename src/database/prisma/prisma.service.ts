/**
 * PrismaService.ts
 *
 * This file defines the PrismaService class, which provides a centralized, enhanced Prisma client
 * with extended functionality through validation models. The service also includes methods
 * for managing database connections, handling errors, and validating data.
 *
 * Dependencies:
 * - TypeDI for dependency injection
 * - Prisma ORM for database interactions
 * - Custom validation models for data validation
 */

import { Service } from 'typedi';
import { Prisma, PrismaClient } from '@prisma/client';
import { log } from 'console';

/**
 * The PrismaService class provides an extended Prisma client with validation logic.
 * It also includes methods for managing database connections and handling errors.
 */
@Service()
export class PrismaService {
  private readonly prisma;

  constructor() {
    this.prisma = this.getExtendedClient();
  }

  /**
   * Extends the Prisma client with custom validation logic.
   * @returns {PrismaClient} An extended Prisma client instance.
   */
  getExtendedClient() {
    const xPrisma = new PrismaClient();
    return xPrisma;
  }

  /**
   * Returns the extended Prisma client instance.
   * @returns {PrismaClient} The extended Prisma client.
   */
  public getClient() {
    return this.prisma;
  }

  /**
   * Establishes a connection to the database.
   * Logs success or failure messages.
   */
  private async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      log('Database connected successfully');
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  /**
   * Disconnects the Prisma client from the database.
   * Ensures proper cleanup and logs the operation result.
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      // log('Database disconnected successfully');
    } catch (error) {
      log('Error while disconnecting from the database:', error);
    }
  }

  /**
   * Checks the database connection status.
   * @returns {Promise<{ success: boolean; error: any }>} Connection status and any errors.
   */
  public async checkConnection(): Promise<{ success: boolean; error: any }> {
    try {
      await this.connect();

      return { success: true, error: null };
    } catch (err) {
      throw new Error((err as any).message);
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Handles errors by categorizing and formatting them into user-friendly messages.
   * Supports Zod validation issues, Prisma client errors, and generic exceptions.
   * @param {any} error The error to handle.
   * @returns {Error} A formatted error with a user-friendly message.
   */
  public handleError(error: any): Error {
    log(' Error:', error);

    // Handle Zod validation issues
    if (error?.issues) {
      const formattedIssues = error.issues
        .map((issue: any) => {
          return `| ${issue.code}, the field "${issue.path.join('.')}" is invalid: ${issue.message}`;
        })
        .join(', ');

      log('Validation Issues:', formattedIssues);
      return new Error(`Validation Error: ${formattedIssues}`);
    }

    // Handle specific Prisma client errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          return new Error(
            `A record with the unique value "${error.meta?.target}" already exists.`
          );
        case 'P2003': // Foreign key constraint violation
          return new Error(
            'Operation failed due to a foreign key constraint violation.'
          );
        case 'P2025': // Record not found
          return new Error('The requested record was not found.');
        default:
          return new Error(
            'A database error occurred. Please try again later.'
          );
      }
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      log('Validation Error:', error.message);
      return new Error(
        'The provided data is invalid. Please check your input.'
      );
    }

    // Handle unexpected errors
    return new Error(`An unexpected error occurred. ${error.message}.`);
  }
}
