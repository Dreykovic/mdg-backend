import 'reflect-metadata';
import Server from '@/server/server';
import logger from '@/core/utils/logger.util';
import colorTxt from 'ansi-colors';
import Container from 'typedi';
import config from './config';

async function bootstrap(): Promise<void> {
  try {
    const silent = config.isTest || process.argv.includes('--silent');
    const server = Container.get(Server);

    // Start server first
    await server.bootstrap(silent);

    // Then check database connection
    await server.checkDatabase(silent);

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error.message}`, {
        stack: error.stack,
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(
        `Unhandled Rejection: ${reason instanceof Error ? reason.message : reason}`
      );
      // Don't exit here to allow the promise to potentially resolve
    });
  } catch (error) {
    logger.error(
      colorTxt.red(`Failed to start server: ${(error as Error).message}`)
    );
    process.exit(1);
  }
}

// Start the application
void bootstrap();
