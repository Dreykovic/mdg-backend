/**
 * logger.util.ts
 *
 * This file configures the Winston logger for handling logs in different formats.
 * Logs are stored in the console and two separate files: application logs and error logs.
 */

import winston from 'winston';
import { resolve } from 'path';
import appRoot from 'app-root-path';

// Logger configuration
const logger = winston.createLogger({
  level: 'info', // Default logging level (captures 'info' and all higher levels)
  format: winston.format.combine(
    winston.format.timestamp(), // Adds a timestamp to each log entry
    winston.format.json() // Logs in JSON format for structured logging
  ),
  transports: [
    // Console transport to log 'info' and higher-level messages to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adds color to the log messages in the console
        winston.format.simple() // Simple format for console output
      ),
    }),
    // File transport for general application logs
    new winston.transports.File({
      filename: resolve(appRoot.path, 'logs/application.log'), // Path to the application log file
      level: 'info', // Logs of 'info' level and above
      format: winston.format.combine(
        winston.format.timestamp(), // Adds a timestamp to each log entry
        winston.format.json() // Logs in JSON format for structured logging
      ),
    }),
    // File transport for error logs, separate from application logs
    new winston.transports.File({
      filename: resolve(appRoot.path, 'logs/error.log'), // Path to the error log file
      level: 'error', // Only logs 'error' level and higher messages
      format: winston.format.combine(
        winston.format.timestamp(), // Adds a timestamp to each log entry
        winston.format.json() // Logs in JSON format for structured logging
      ),
    }),
  ],
});

export default logger;
