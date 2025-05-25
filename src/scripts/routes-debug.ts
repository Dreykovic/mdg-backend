#!/usr/bin/env node

/**
 * CLI Script for displaying Express routes
 * Adapted for the application structure with TypeDI and class-based App
 */

import 'reflect-metadata'; // Required for TypeDI
import { Container } from 'typedi';
import RoutesDebugUtil from '@/core/utils/routesDebug.util';
import { log } from 'console';

interface CLIOptions {
  format: 'table' | 'tree' | 'detailed' | 'compact';
  method?: string;
  path?: string;
  groupBy: 'method' | 'path' | 'none';
  showAnalysis: boolean;
  showMiddlewares: boolean;
  colorize: boolean;
}

/**
 * Shows CLI help information
 */
function showHelp(): void {
  log(`
Express Routes CLI
==================

Usage:
  npm run routes [options]

Options:
  --format <type>       Display format: table, tree, detailed, compact (default: table)
  --method <method>     Filter by HTTP method: get, post, put, delete, etc.
  --path <pattern>      Filter by path pattern (case-insensitive)
  --group-by <type>     Group routes by: method, path, none (default: none)
  --no-analysis         Hide route analysis
  --no-middlewares      Hide middleware information
  --no-color            Disable colored output
  --help                Show this help message

Examples:
  npm run routes                           # Show all routes in table format
  npm run routes -- --format tree         # Show routes in tree format
  npm run routes -- --method get          # Show only GET routes
  npm run routes -- --path api            # Show only routes containing 'api'
  npm run routes -- --format compact --no-analysis  # Compact format without analysis
  npm run routes -- --group-by method     # Group routes by HTTP method
  `);
}

/**
 * Parses command line arguments
 */
function parseArguments(): CLIOptions {
  const ARG_START_INDEX = 2;
  const args = process.argv.slice(ARG_START_INDEX);
  const options: CLIOptions = {
    format: 'table',
    groupBy: 'none',
    showAnalysis: true,
    showMiddlewares: true,
    colorize: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--format':
        const format = args[i + 1] as CLIOptions['format'];
        if (['table', 'tree', 'detailed', 'compact'].includes(format)) {
          options.format = format;
          i++;
        }
        break;
      case '--method':
        options.method = args[i + 1];
        i++;
        break;
      case '--path':
        options.path = args[i + 1];
        i++;
        break;
      case '--group-by':
        const groupBy = args[i + 1] as CLIOptions['groupBy'];
        if (['method', 'path', 'none'].includes(groupBy)) {
          options.groupBy = groupBy;
          i++;
        }
        break;
      case '--no-analysis':
        options.showAnalysis = false;
        break;
      case '--no-middlewares':
        options.showMiddlewares = false;
        break;
      case '--no-color':
        options.colorize = false;
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
      default:
        // Optionally warn about unknown arguments
        // console.warn(`Unknown argument: ${arg}`);
        break;
    }
  }

  return options;
}

/**
 * Main CLI execution function
 */
async function runCLI(): Promise<void> {
  try {
    // Set environment to development for CLI usage
    process.env.NODE_ENV ??= 'development';

    // Parse command line options
    const options = parseArguments();

    // Import and initialize the App class
    const AppClass = await import('@/server/app');
    const AppConstructor = AppClass.default;

    // Get the App instance from TypeDI container
    const appInstance = Container.get(AppConstructor);

    if (appInstance?.express === null) {
      log('❌ Could not initialize Express app instance');
      log('Make sure your App class is properly configured with TypeDI');
      process.exit(1);
    }

    // Small delay to ensure all routes are registered
    const ROUTE_REGISTRATION_DELAY_MS = 100;
    setTimeout(() => {
      try {
        RoutesDebugUtil.logRoutes(appInstance.express, {
          format: options.format,
          filter: {
            method: options.method,
            path: options.path,
          },
          groupBy: options.groupBy,
          showAnalysis: options.showAnalysis,
          showMiddlewares: options.showMiddlewares,
          colorize: options.colorize,
        });

        process.exit(0);
      } catch (error) {
        log('❌ Error displaying routes:', error);
        process.exit(1);
      }
    }, ROUTE_REGISTRATION_DELAY_MS);
  } catch (error) {
    log('❌ Error initializing CLI:');
    log(error instanceof Error ? error.message : error);
    log('\nMake sure:');
    log('1. Your app is properly configured with TypeDI');
    log('2. All dependencies are installed');
    log('3. TypeScript paths are correctly configured');
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  log('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the CLI
void runCLI();
