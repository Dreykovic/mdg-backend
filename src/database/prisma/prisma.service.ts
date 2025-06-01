/**
 * PrismaService.ts
 *
 * This file defines the PrismaService class, which provides a centralized, enhanced Prisma client
 * with extended functionality through validation models. The service also includes methods
 * for managing database connections, handling errors, and validating data.
 * Enhanced with cluster worker support.
 */

import { Service } from 'typedi';
import { Prisma, PrismaClient } from '@prisma/client';
import logger from '@/core/utils/logger.util';
import config from '@/config';
import cluster from 'cluster';
import colorTxt from 'ansi-colors';

// Type for connection check result
interface ConnectionCheckResult {
  success: boolean;
  error: Error | null;
}

// Type for Prisma error mapping
type PrismaErrorCode = 'P2002' | 'P2003' | 'P2025';
type ErrorMessageMap = Record<PrismaErrorCode, string>;

/**
 * The PrismaService class provides an extended Prisma client with validation logic.
 * It also includes methods for managing database connections, handling errors,
 * and supports cluster worker environments.
 */
@Service({ global: true })
export class PrismaService {
  // Private readonly property for the Prisma client
  private readonly prisma: PrismaClient;

  // Connection state tracking
  private isConnected = false;

  // Worker identification for cluster mode
  private readonly workerId: number | string;

  // Error message mapping
  private static readonly ERROR_MESSAGES: ErrorMessageMap = {
    P2002: 'A record with this unique value already exists.',
    P2003: 'Operation failed due to a foreign key constraint violation.',
    P2025: 'The requested record was not found.',
  };

  // Connection retry settings
  private static readonly MAX_RETRIES = 5;
  private static readonly RETRY_DELAY_MS = 1000;

  constructor() {
    // Set worker ID for logging
    this.workerId = cluster.isWorker
      ? (cluster.worker?.id ?? 'unknown')
      : 'primary';

    // Initialize with extended client
    this.prisma = this.getExtendedClient();

    // Attempt initial connection with retry logic
    this.connectWithRetry(0)
      .then(() => {
        this.isConnected = true;
        if (config.isDev) {
          logger.info(
            `Worker ${this.workerId}: Database connected successfully on initialization`
          );
        }
      })
      .catch((error) => {
        logger.error(
          `Worker ${this.workerId}: Failed to establish database connection: ${error.message}`
        );
      });
  }

  /**
   * Extends the Prisma client with custom validation logic and optimized logging.
   * Configured for optimal performance in a cluster environment.
   * @returns {PrismaClient} An extended Prisma client instance.
   */
  private getExtendedClient(): PrismaClient {
    // Create Prisma client with optimized logging configuration
    const prismaClient = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      // Add connection pool configuration for cluster environment
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Log slow queries in development mode
    if (config.isDev) {
      prismaClient.$on('query', (e) => {
        if (e.duration > 500) {
          // Log queries taking more than 500ms with worker ID
          logger.warn(
            `Worker ${this.workerId}: Slow query (${e.duration}ms): ${e.query}`
          );
        }
      });
    }

    return prismaClient;
  }

  /**
   * Returns the extended Prisma client instance.
   * @returns {PrismaClient} The extended Prisma client.
   */
  public getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Establishes a connection to the database with retry capabilities.
   * Implements exponential backoff for retries in a cluster environment.
   * @param {number} retryCount - Current retry attempt
   */
  private async connectWithRetry(retryCount: number): Promise<void> {
    // Already connected
    if (this.isConnected) {
      return;
    }

    try {
      // Add connection timeout
      const connectionPromise = this.prisma.$connect();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Database connection timeout after 5 seconds'));
        }, 5000);
      });

      await Promise.race([connectionPromise, timeoutPromise]);
      this.isConnected = true;

      // Log successful connection in cluster mode
      if (cluster.isWorker && config.isDev) {
        logger.debug(
          `Worker ${this.workerId}: Successfully connected to database`
        );
      }
    } catch (error) {
      this.isConnected = false;

      if (retryCount < PrismaService.MAX_RETRIES) {
        // Calculate exponential backoff with jitter for cluster workers
        const product =
          PrismaService.RETRY_DELAY_MS * Math.pow(1.5, retryCount);
        const delay =
          product + (cluster.isWorker ? Math.floor(Math.random() * 500) : 0);

        logger.warn(
          colorTxt.yellow(
            `Worker ${this.workerId}: Database connection failed (attempt ${retryCount + 1}/${PrismaService.MAX_RETRIES}). Retrying in ${Math.round(delay / 1000)}s...`
          )
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.connectWithRetry(retryCount + 1);
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Worker ${this.workerId}: Failed to connect after ${PrismaService.MAX_RETRIES} attempts: ${errorMessage}`
      );
    }
  }

  /**
   * Establishes a connection to the database.
   * Uses a connection timeout to prevent hanging.
   */
  private async connect(): Promise<void> {
    return this.connectWithRetry(0);
  }

  /**
   * Disconnects the Prisma client from the database.
   * Ensures proper cleanup and handles errors.
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.prisma.$disconnect();
      this.isConnected = false;

      if (config.isDev) {
        logger.debug(
          `Worker ${this.workerId}: Database disconnected successfully`
        );
      }
    } catch (error) {
      logger.error(
        `Worker ${this.workerId}: Error disconnecting from database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Checks the database connection status with improved error handling.
   * Enhanced to work with cluster workers.
   * @returns {Promise<ConnectionCheckResult>} Connection status and any errors.
   */
  public async checkConnection(): Promise<ConnectionCheckResult> {
    try {
      // If already connected, run a lightweight test query
      if (this.isConnected) {
        await this.prisma.$queryRaw`SELECT 1`;
        return { success: true, error: null };
      }

      // If not connected, establish connection
      await this.connect();
      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        `Worker ${this.workerId}: Connection check failed: ${errorMessage}`
      );
      return {
        success: false,
        error: new Error(
          `Worker ${this.workerId}: Database connection check failed: ${errorMessage}`
        ),
      };
    }
  }

  /**
   * Handles errors by categorizing and formatting them into user-friendly messages.
   * Supports Zod validation issues, Prisma client errors, and generic exceptions.
   * Enhanced with worker context for better debugging in cluster mode.
   * @param {unknown} error The error to handle.
   * @returns {Error} A formatted error with a user-friendly message.
   */
  public handleError(error: unknown): Error {
    // Add worker context for cluster mode
    const workerContext = cluster.isWorker ? `Worker ${this.workerId}: ` : '';

    // Log the original error for debugging
    logger.debug(`${workerContext}Database error:`, error);

    // Handle Zod validation issues
    if (
      error !== null &&
      typeof error === 'object' &&
      'issues' in error &&
      Array.isArray(error.issues)
    ) {
      const formattedIssues = error.issues
        .map((issue: any) => {
          const path = Array.isArray(issue.path)
            ? issue.path.join('.')
            : issue.path;
          return `${issue.code}: the field "${path}" is invalid: ${issue.message}`;
        })
        .join('; ');

      logger.warn(`${workerContext}Validation Issues: ${formattedIssues}`);
      return new Error(`Validation Error: ${formattedIssues}`);
    }

    // Handle specific Prisma client errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const errorCode = error.code as PrismaErrorCode;
      const defaultMessage =
        'A database error occurred. Please try again later.';
      const errorMessage =
        PrismaService.ERROR_MESSAGES[errorCode] || defaultMessage;

      // Add context for unique constraint violations
      if (
        errorCode === 'P2002' &&
        typeof error.meta !== 'undefined' &&
        typeof (error.meta as { target?: unknown }).target !== 'undefined'
      ) {
        return new Error(
          `${errorMessage} Field: ${(error.meta as { target: unknown }).target}`
        );
      }

      return new Error(errorMessage);
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      logger.warn(`${workerContext}Prisma Validation Error: ${error.message}`);
      return new Error(
        'The provided data is invalid. Please check your input.'
      );
    }

    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`An unexpected database error occurred. ${errorMessage}`);
  }

  /**
   * Ensures the service is properly cleaned up when the application exits
   * Enhanced to handle cluster worker shutdown
   */
  public async onApplicationShutdown(): Promise<void> {
    if (cluster.isWorker && config.isDev) {
      logger.debug(
        `Worker ${this.workerId}: Shutting down database connection`
      );
    }
    await this.disconnect();
  }

  /**
   * Provides connection metrics for monitoring.
   * Useful for health checks in a clustered environment.
   * @returns {Object} Connection metrics
   */
  public getConnectionMetrics(): Record<string, any> {
    return {
      isConnected: this.isConnected,
      workerId: this.workerId,
      timestamp: new Date().toISOString(),
    };
  }
}
