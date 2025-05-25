/**
 * server.ts
 *
 * Main server entry point that initializes and starts the Express application
 * with integrated routes debugging capabilities.
 */

import 'reflect-metadata'; // Required for TypeDI
import { Container } from 'typedi';
import config from '@/config';
import logger from '@/core/utils/logger.util';
import App from '@/app';

/**
 * Server class responsible for starting and managing the Express application
 */
class Server {
  private app: App;
  private server: any;

  constructor() {
    this.app = Container.get(App);
  }

  /**
   * Starts the Express server and initializes debug tools
   */
  public async start(): Promise<void> {
    try {
      const port = config.port || 3000;

      this.server = this.app.express.listen(port, () => {
        logger.info(`🚀 Server running on port ${port}`);
        logger.info(`🌐 Environment: ${config.nodeEnv}`);
        logger.info(`📡 API Base URL: ${config.api.prefix}`);

        if (!config.isProd) {
          logger.info(
            `🔍 Routes debug endpoint: http://localhost:${port}/debug/routes`
          );
        }

        // Log routes to console in development
        this.app.logRoutes();
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Sets up graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      logger.info(`📢 Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close((err: Error) => {
          if (err) {
            logger.error('❌ Error during server shutdown:', err);
            process.exit(1);
          }

          logger.info('✅ Server closed successfully');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * Gets route analysis for monitoring purposes
   */
  public getRouteAnalysis() {
    return this.app.getRouteAnalysis();
  }

  /**
   * Gets all registered routes
   */
  public getRoutes() {
    return this.app.getRoutes();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
const server = new Server();
server.start();

export default server;
