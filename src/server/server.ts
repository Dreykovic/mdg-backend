/**
 * The Server class encapsulates the logic to initialize and manage an HTTP or HTTPS server.
 * It handles server startup, error handling, graceful shutdown, and periodic logging of connections.
 * This class uses the Express app and Prisma service for database interaction.
 */

import http from 'http';
import fs from 'fs';
import expressInstance from 'express';
import https from 'https';
import colorTxt from 'ansi-colors';
import logger from '@/core/utils/logger.util';
import { format } from 'date-fns';
import pkg from '@packages';
import { Service } from 'typedi';
import App from './app';
import { PrismaService } from '@/database/prisma/prisma.service';
import config from '@/config';
import cluster from 'cluster';
import os from 'os';

// Types
type ServerConnections = Set<any>;
type ServerErrorCode = 'EACCES' | 'EADDRINUSE' | 'EADDRNOTAVAIL';
type ErrorMessageMap = Record<ServerErrorCode, string>;

@Service()
class Server {
  private readonly app: expressInstance.Application;
  private server: http.Server | https.Server;
  private serverConnections: ServerConnections = new Set();
  private isShuttingDown = false;
  private startTime: Date | null = null;

  // Map error codes to messages for better maintenance
  private static readonly ERROR_MESSAGES: ErrorMessageMap = {
    EACCES: 'requires elevated privileges',
    EADDRINUSE: 'is already in use',
    EADDRNOTAVAIL: 'not available',
  };

  constructor(
    private readonly appInstance: App,
    public readonly prismaService: PrismaService
  ) {
    this.app = appInstance.express;
    this.server = this.createServer();

    // Setup process uncaught exception handler
    process.on('uncaughtException', this.handleUncaughtException.bind(this));
  }

  /**
   * Handle uncaught exceptions to prevent server crashes
   */
  private handleUncaughtException(error: Error): void {
    logger.error(colorTxt.red(`Uncaught exception: ${error.message}`));
    logger.error(error.stack || 'No stack trace available');

    // Only shutdown in production
    if (config.isProd) {
      logger.warn(
        colorTxt.yellow(
          'Uncaught exception in production, initiating graceful shutdown'
        )
      );
      this.shutDown();
    }
  }

  /**
   * Creates the HTTP or HTTPS server based on the configuration.
   * If HTTPS is enabled in production, it loads SSL certificates.
   * @returns {http.Server | https.Server} - The server instance.
   */
  private createServer(): http.Server | https.Server {
    if (config.ssl.isHttps && config.isProd) {
      try {
        // Load SSL certificates with content verification
        const key = fs.readFileSync(config.ssl.privateKey);
        const cert = fs.readFileSync(config.ssl.certificate);

        if (!key || !cert) {
          throw new Error('SSL certificates are empty');
        }

        const options = { key, cert };

        // Add optional CA certificates if configured
        if (config.ssl.ca && fs.existsSync(config.ssl.ca)) {
          Object.assign(options, { ca: fs.readFileSync(config.ssl.ca) });
        }

        return https.createServer(options, this.app);
      } catch (err) {
        logger.error(
          colorTxt.red(
            `SSL certificate error: ${err instanceof Error ? err.message : String(err)}`
          )
        );
        process.exit(1);
      }
    }

    return http.createServer(this.app);
  }

  /**
   * Logs a message when the server starts listening.
   * @param {string} host - The host of the server.
   * @param {number} port - The port the server is listening on.
   * @param {boolean} silent - If true, suppress log output.
   */
  private onListening(host: string, port: number, silent: boolean): void {
    if (silent) {
      return;
    }

    this.startTime = new Date();
    const protocol = config.ssl.isHttps && config.isProd ? 'https' : 'http';

    // Log the actual port being used (may differ from config if port was busy)
    const address = this.server.address();
    const actualPort =
      typeof address === 'object' && address ? address.port : port;

    // In cluster mode as a worker, send port info to master instead of logging
    if (config.cluster && cluster.isWorker) {
      process.send?.({
        type: 'SERVER_LISTENING',
        port: actualPort,
        workerId: cluster.worker?.id,
      });
    }

    if (actualPort !== port) {
      logger.info(
        colorTxt.yellow(
          `-> Note: Server running on port ${actualPort} (different from configured port ${port})`
        )
      );
    }

    const serverInfo = `${protocol}://${host}:${actualPort}${config.ssl.isHttps && config.isProd ? ' (SSL)' : ''}`;
    logger.info(colorTxt.white(`-> Server listening on ${serverInfo}`));

    // Log CPU and memory info
    const cpuCount = os.cpus().length;
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.rss / 1024 / 1024);

    logger.info(
      colorTxt.white(
        `-> Server running on ${cpuCount} CPU cores, using ${memoryUsageMB}MB memory`
      )
    );

    if (protocol === 'http' && (!config.cluster || !cluster.isWorker)) {
      logger.info(
        colorTxt.green(
          `-> Documentation available at http://${host}:${actualPort}/api-docs`
        )
      );
    }
  }

  /**
   * Handles server errors and logs appropriate messages.
   * @param {Error} error - The error object.
   * @param {string} host - The host of the server.
   * @param {number} port - The port the server is running on.
   */
  private onError(
    error: NodeJS.ErrnoException,
    host: string,
    port: number
  ): void {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const errorCode = error.code as ServerErrorCode;
    const errorMessage =
      Server.ERROR_MESSAGES[errorCode] || `Unknown error: ${error.message}`;

    logger.error(
      colorTxt.red(
        `HTTP server error - Host ${host}:${port} ${errorMessage} (${errorCode})`
      )
    );

    if (Object.keys(Server.ERROR_MESSAGES).includes(errorCode)) {
      this.shutDown();
    } else {
      throw error;
    }
  }

  /**
   * Gracefully shuts down the server, closing active connections.
   */
  private shutDown(): void {
    if (this.isShuttingDown) {
      return;
    }
    this.isShuttingDown = true;

    logger.warn(colorTxt.yellow('Server shutting down gracefully'));

    // Calculate uptime if server was started
    if (this.startTime) {
      const uptime = (new Date().getTime() - this.startTime.getTime()) / 1000;
      logger.info(
        colorTxt.white(
          `-> Server uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
        )
      );
    }

    // Close database connection first
    this.prismaService.onApplicationShutdown().catch((err) => {
      logger.error(
        colorTxt.red(`Error disconnecting from database: ${err.message}`)
      );
    });

    // Close the server to prevent new connections
    this.server.close(() => {
      logger.info(colorTxt.white('Successfully closed all connections'));

      // Exit with success code after cleanup
      setTimeout(() => process.exit(0), 100);
    });

    // End all connections gracefully
    this.serverConnections.forEach((connection) => connection.end());

    // Set a timeout to forcefully close connections if they don't close gracefully
    setTimeout(() => {
      logger.error(
        colorTxt.red(
          'Could not close connections in time, forcefully shutting down'
        )
      );
      this.serverConnections.forEach((connection) => connection.destroy());

      // Final timeout before forced exit
      setTimeout(() => process.exit(1), 1000);
    }, 5000);
  }

  /**
   * Logs the number of open connections and resource usage at a specified interval.
   * @param {number} interval - Interval in milliseconds.
   */
  private monitorResources(interval: number = 30000): void {
    setInterval(() => {
      // Connection info
      const connectionCount = this.serverConnections.size;

      // Memory usage
      const memoryUsage = process.memoryUsage();
      const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const rss = Math.round(memoryUsage.rss / 1024 / 1024);

      // CPU load
      const cpuUsage = process.cpuUsage();
      const cpuUser = Math.round(cpuUsage.user / 1000000);
      const cpuSystem = Math.round(cpuUsage.system / 1000000);

      logger.debug(
        `Server stats: ${connectionCount} connections | Memory: ${heapUsed}/${heapTotal}MB (heap), ${rss}MB (total) | CPU: ${cpuUser}s user, ${cpuSystem}s system`
      );
    }, interval);
  }

  /**
   * Initializes and starts the server in single or cluster mode.
   * @param {boolean} silent - If true, suppress log output.
   * @returns {Promise<Server>} - The running server instance.
   */
  private async runServer(silent: boolean): Promise<Server> {
    const serverHost = config.app.host;
    const serverPort = config.app.port;

    // Check if clustering is enabled and we're the master process
    if (config.cluster && cluster.isPrimary) {
      const numCPUs = os.cpus().length;
      const workerCount = config.clusterWorkers || numCPUs;
      const protocol = config.ssl.isHttps && config.isProd ? 'https' : 'http';

      logger.info(
        colorTxt.cyan(
          `Starting server in cluster mode with ${workerCount} workers`
        )
      );

      // Log the master process server details
      logger.info(
        colorTxt.white(
          `-> Primary process managing server on ${protocol}://${serverHost}:${serverPort}`
        )
      );

      if (protocol === 'http') {
        logger.info(
          colorTxt.green(
            `-> Documentation available at http://${serverHost}:${serverPort}/api-docs`
          )
        );
      }

      // Setup worker message handling to get port information
      cluster.on('message', (worker, message) => {
        if (message.type === 'SERVER_LISTENING' && message.port) {
          logger.info(
            colorTxt.white(
              `-> Worker ${worker.id} listening on port ${message.port}`
            )
          );
        }
      });

      // Fork workers
      for (let i = 0; i < workerCount; i++) {
        cluster.fork();
      }

      // Handle worker events
      cluster.on('exit', (worker, code, signal) => {
        logger.warn(
          colorTxt.yellow(
            `Worker ${worker.id} died with code ${code} and signal ${signal}`
          )
        );

        // Replace the dead worker if not shutting down
        if (!this.isShuttingDown) {
          logger.info(colorTxt.white('Starting a new worker'));
          cluster.fork();
        }
      });

      return this;
    }

    // Set up event listeners before starting the server
    this.server.on('error', (error) =>
      this.onError(error, serverHost, serverPort)
    );

    // Efficient connection tracking with keep-alive timeout handling
    this.server.on('connection', (connection) => {
      this.serverConnections.add(connection);

      // Auto-cleanup stale connections
      connection.on('close', () => this.serverConnections.delete(connection));

      // Set keep-alive timeout to match server configuration
      if (config.keepAliveTimeout) {
        connection.setKeepAlive(true);
        connection.setTimeout(config.keepAliveTimeout);
      }
    });

    // Start the server
    this.server.listen(serverPort, serverHost, () => {
      this.onListening(serverHost, serverPort, silent);
    });

    // Monitor resources if enabled in config
    if (config.debug?.http_connection) {
      this.monitorResources(config.debug.monitor_interval || 30000);
    }

    // Handle system signals for graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];
    signals.forEach((signal) => {
      process.once(signal, () => {
        logger.info(colorTxt.white(`Received ${signal} signal`));
        this.shutDown();
      });
    });

    return this;
  }

  /**
   * Checks the database connection and logs the result.
   * @param {boolean} silent - If true, suppress log output.
   */
  public async checkDatabase(silent: boolean): Promise<void> {
    try {
      const res = await this.prismaService.checkConnection();

      if (res.success && !silent) {
        logger.info(colorTxt.white('-> Connected to database successfully'));
      } else if (!res.success) {
        throw res.error || new Error('Unknown database connection error');
      }
    } catch (error) {
      const errorMessage = `Unable to connect to the database: ${(error as Error).message}`;
      logger.error(colorTxt.red(errorMessage));
      throw new Error(errorMessage);
    }
  }

  /**
   * Bootstraps the server by initializing necessary components and starting the server.
   * @param {boolean} silent - If true, suppress log output.
   * @returns {Promise<Server>} - The running server instance.
   */
  public async bootstrap(silent: boolean): Promise<Server> {
    if (!silent) {
      const dateTime = format(new Date(), 'yyyy:MM:dd\tHH:mm:ss');

      logger.info(
        colorTxt.bgBlackBright.yellow(
          `\n Starting ${pkg.name.toUpperCase()} `
        ) + colorTxt.bgGreen.white(` v${pkg.version} `)
      );
      logger.info(
        colorTxt.bold.blue(`-> Running in ${config.nodeEnv} environment`)
      );
      logger.info(colorTxt.blue(`-> Started at ${dateTime}`));

      // Show Node.js version
      logger.info(colorTxt.blue(`-> Node.js ${process.version}`));
    }

    // Check database connection before starting server
    await this.checkDatabase(silent);
    return this.runServer(silent);
  }
}

export default Server;
