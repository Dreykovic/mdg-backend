/**
 * The Server class encapsulates the logic to initialize and manage an HTTP or HTTPS server.
 * It handles server startup, error handling, graceful shutdown, and periodic logging of connections.
 * This class uses the Express app and Prisma service for database interaction.
 */

import http from 'http'; // Importing the http module for creating an HTTP server
import fs from 'fs'; // Importing the fs module to read files (e.g., SSL certificates)
import expressInstance from 'express'; // Importing Express for creating the web application
import https from 'https'; // Importing the https module for creating an HTTPS server
import colorTxt from 'ansi-colors'; // Importing ansi-colors for colored console output
import logger from '@/core/utils/logger.util'; // Importing a utility for logging
import { format } from 'date-fns'; // Importing date-fns for date formatting
import pkg from '@packages'; // Importing package information (name and version)
import { log } from 'console'; // Importing the console log function
import { Service } from 'typedi'; // Importing Typedi for dependency injection
import App from './app'; // Importing the application instance
import { PrismaService } from '@/database/prisma/prisma.service'; // Importing Prisma service for database interaction
import config from '@/config'; // Importing the application configuration

@Service() // Typedi decorator to mark the class as a service
class Server extends http.Server {
  private readonly app: expressInstance.Application; // Express application instance

  constructor(
    private readonly appInstance: App, // Application instance to wrap
    public readonly prismaService: PrismaService // Prisma service for database connection
  ) {
    super(appInstance.express); // Initialize the HTTP server with the Express app
    this.app = appInstance.express;
  }

  /**
   * Creates the HTTP or HTTPS server based on the configuration.
   * If HTTPS is enabled in production, it loads SSL certificates.
   * @returns {http.Server | https.Server} - The server instance.
   */
  private readonly createServer = () => {
    let options;

    if (config.ssl.isHttps && config.isProd) {
      // Load SSL certificates if HTTPS is enabled and running in production
      try {
        options = {
          key: fs.readFileSync(`${config.ssl.privateKey}`),
          cert: fs.readFileSync(`${config.ssl.certificate}`),
        };
      } catch (err) {
        log(err);
        process.exit(0); // Exit if SSL certificates are not available
      }
      return https.createServer(options, this.app); // Return HTTPS server
    } else {
      return http.createServer(this.app); // Use HTTP server if HTTPS is not enabled
    }
  };

  /**
   * Logs a message when the server starts listening.
   * Displays the protocol (HTTP or HTTPS) and the server host/port.
   * @param {string} host - The host of the server.
   * @param {number} port - The port the server is listening on.
   * @param {boolean} silent - If true, suppress log output.
   */
  private readonly onListening = (
    host: string,
    port: number,
    silent: boolean
  ) => {
    if (!silent) {
      if (config.ssl.isHttps && config.isProd) {
        log(colorTxt.white(`-> Listening on https://${host}:${port} (SSL)`));
      } else {
        log(colorTxt.white(`-> Listening on http://${host}:${port}`));
        log(
          colorTxt.green(`-> Documentation on http://${host}:${port}/api-docs`)
        );
      }
    }
  };

  /**
   * Handles server errors and logs appropriate messages.
   * Handles common error cases such as permission issues or address already in use.
   * @param {any} error - The error object.
   * @param {string} host - The host of the server.
   * @param {number} port - The port the server is running on.
   * @param {Array<string>} connections - Active connections to the server.
   */
  private readonly onError = (
    error: any,
    host: string,
    port: number,
    connections: Array<string>
  ) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    // Handle specific error codes
    switch (error.code) {
      case 'EACCES':
        logger.error(
          `Http server error - Host ${host}:${port} requires elevated privileges (${error.code})`
        );
        this.shutDown(connections);
        break;
      case 'EADDRINUSE':
        logger.error(
          `Http server error - Host ${host}:${port} is already in use (${error.code})`
        );
        this.shutDown(connections);
        break;
      case 'EADDRNOTAVAIL':
        logger.error(
          `Http server error - Host ${host}:${port} not available (${error.code})`
        );
        this.shutDown(connections);
        break;
      default:
        logger.error(`Http server error: ${error.message}`);
        throw error;
    }
  };

  /**
   * Gracefully shuts down the server, closing active connections.
   * @param {Array<any>} connections - List of active connections.
   */
  private readonly shutDown = (connections: any) => {
    log(
      'Http server error - Received kill signal, shutting down gracefully (SHUTDOWN)'
    );

    logger.error(
      'Http server error - Received kill signal, shutting down gracefully (SHUTDOWN)'
    );
    this.close(() => {
      log('Http server error - Closed out remaining connections (SHUTDOWN)');
      process.exit(0); // Exit process after closing connections
    });

    setTimeout(() => {
      log(
        'Http server error - Could not close connections in time, forcefully shutting down (SHUTDOWN)'
      );
      process.exit(1); // Force exit after timeout
    }, 10000);

    // End all active connections
    connections.forEach((curr: any) => curr.end());
    setTimeout(() => connections.forEach((curr: any) => curr.destroy()), 5000);
  };

  /**
   * Periodically logs the number of open connections to the server.
   */
  private readonly getServerConnections = () => {
    setInterval(
      () =>
        this.getConnections((err: any, count: any) => {
          if (err) {
            logger.error(`Http server connections logs error: ${err}`);
          }
          if (!err) {
            log(`${count} connections currently open`);
          }
        }),
      1000
    );
  };

  /**
   * Initializes and starts the server.
   * @param {boolean} silent - If true, suppress log output.
   * @returns {Promise<Server>} - The running server instance.
   */
  private async runServer(silent: boolean) {
    const serverHost = config.app.host;
    const serverPort = config.app.port;
    let serverConnections: any = [];

    this.createServer();
    this.listen(serverPort);

    this.on('listening', () =>
      this.onListening(serverHost, serverPort, silent)
    );

    this.on('error', (error) =>
      this.onError(error, serverHost, serverPort, serverConnections)
    );

    this.on('connection', (connection: any) => {
      serverConnections.push(connection);

      // Remove closed connections from the list
      connection.on('close', () => {
        serverConnections = serverConnections.filter(
          (curr: any) => curr !== connection
        );
      });
    });

    if (config.debug.http_connection) {
      this.getServerConnections(); // Log connections if debug mode is enabled
    }

    // Handle system signals for graceful shutdown
    process.on('SIGTERM', () => this.shutDown(serverConnections));
    process.on('SIGINT', () => this.shutDown(serverConnections));

    return this;
  }

  /**
   * Checks the database connection and logs the result.
   * @param {boolean} silent - If true, suppress log output.
   */
  public async checkDatabase(silent: boolean) {
    try {
      const res = await this.prismaService.checkConnection();

      if (res.success) {
        if (!silent) {
          log(colorTxt.white(`-> Connected on database`));
        }
      }
    } catch (error) {
      throw new Error(
        colorTxt.red(
          `-> Unable to connect to the database : ${(error as Error).message}'`
        )
      );
    }
  }

  /**
   * Bootstraps the server by initializing necessary components and starting the server.
   * @param {boolean} silent - If true, suppress log output.
   * @returns {Promise<Server>} - The running server instance.
   */
  public async bootstrap(silent: boolean) {
    if (!silent) {
      const dateTime = format(new Date(), 'yyyy:MM:dd\tHH:mm:ss');

      // Log startup information
      log(
        colorTxt.bgBlackBright.yellow(
          `\n Starting ${pkg.name.toUpperCase()} `
        ) + colorTxt.bgGreen.white(` v${pkg.version} `)
      );
      log(
        colorTxt.bold.blue(`-> Running in ${process.env.NODE_ENV} environment`)
      );
      log(colorTxt.blue(`-> Started at ${dateTime}`));
    }

    return this.runServer(silent); // Start the server
  }
}

export default Server;
