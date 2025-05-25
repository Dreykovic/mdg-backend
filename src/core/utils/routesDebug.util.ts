/**
 * routesDebug.util.ts
 *
 * Utility class for debugging and analyzing Express routes using express-list-endpoints.
 * Provides methods to list, analyze, and display route information for development purposes.
 *
 * Key Features:
 * - Lists all registered Express routes with detailed information.
 * - Provides multiple display formats (table, tree, detailed, compact).
 * - Includes route analysis with patterns and statistics.
 * - Supports filtering by HTTP method and path patterns.
 * - Creates debug HTTP endpoints for runtime route inspection.
 * - Optimized for development environment with security safeguards.
 */

import { Application, NextFunction, Request, Response } from 'express';
import listEndpoints from 'express-list-endpoints';
import config from '@/config';
import logger from '@/core/utils/logger.util';
import { log } from 'console';

export interface RouteEndpoint {
  path: string;
  methods: string[];
  middlewares?: string[];
}

export interface RouteAnalysis {
  total: number;
  byMethod: Record<string, number>;
  byPath: Record<string, string[]>;
  duplicates: string[];
  patterns: {
    parameterRoutes: string[];
    wildcardRoutes: string[];
    adminRoutes: string[];
    apiRoutes: string[];
  };
}

export interface DebugResponse {
  routes: RouteEndpoint[];
  analysis: RouteAnalysis;
  metadata: {
    timestamp: string;
    nodeEnv: string;
    apiPrefix: string;
    totalEndpoints: number;
  };
}

export interface ConsoleDisplayOptions {
  format?: 'table' | 'tree' | 'detailed' | 'compact';
  filter?: {
    method?: string;
    path?: string;
  };
  groupBy?: 'method' | 'path' | 'none';
  showAnalysis?: boolean;
  showMiddlewares?: boolean;
  colorize?: boolean;
}

export interface DebugEndpointOptions {
  enableInProduction?: boolean;
  requireAuth?: boolean;
  logAccess?: boolean;
  customPath?: string;
}

/**
 * Utility class for Express routes debugging and analysis
 */
export default class RoutesDebugUtil {
  private static readonly colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
  };

  /**
   * Analyzes routes and provides detailed insights including patterns and statistics.
   * @param routes - Array of route endpoints to analyze.
   * @returns Comprehensive route analysis with statistics and patterns.
   */
  private static readonly countByMethod = (
    analysis: RouteAnalysis,
    methods: string[]
  ): void => {
    methods.forEach((method) => {
      const current = analysis.byMethod[method];
      analysis.byMethod[method] =
        (typeof current === 'number' && !isNaN(current) ? current : 0) + 1;
    });
  };

  private static readonly groupByPath = (
    analysis: RouteAnalysis,
    path: string,
    methods: string[]
  ): void => {
    analysis.byPath[path] ??= [];
    analysis.byPath[path].push(...methods);
  };

  private static readonly checkDuplicates = (
    analysis: RouteAnalysis,
    pathMethodMap: Map<string, string[]>,
    path: string,
    methods: string[]
  ): void => {
    const key = path;
    if (pathMethodMap.has(key)) {
      const existingMethods = pathMethodMap.get(key) ?? [];
      const commonMethods = methods.filter((m) => existingMethods.includes(m));
      if (commonMethods.length > 0) {
        analysis.duplicates.push(`${path} (${commonMethods.join(', ')})`);
      }
    } else {
      pathMethodMap.set(key, [...methods]);
    }
  };

  private static readonly analyzePatterns = (
    analysis: RouteAnalysis,
    path: string,
    methods: string[]
  ): void => {
    if (path.includes(':')) {
      analysis.patterns.parameterRoutes.push(`${methods.join('|')} ${path}`);
    }
    if (path.includes('*')) {
      analysis.patterns.wildcardRoutes.push(`${methods.join('|')} ${path}`);
    }
    if (path.toLowerCase().includes('/admin')) {
      analysis.patterns.adminRoutes.push(`${methods.join('|')} ${path}`);
    }
    if (path.toLowerCase().includes(`/${config.api.prefix}`)) {
      analysis.patterns.apiRoutes.push(`${methods.join('|')} ${path}`);
    }
  };

  static readonly analyzeRoutes = (routes: RouteEndpoint[]): RouteAnalysis => {
    try {
      const analysis: RouteAnalysis = {
        total: routes.length,
        byMethod: {},
        byPath: {},
        duplicates: [],
        patterns: {
          parameterRoutes: [],
          wildcardRoutes: [],
          adminRoutes: [],
          apiRoutes: [],
        },
      };

      const pathMethodMap = new Map<string, string[]>();

      routes.forEach((route) => {
        const { path, methods } = route;

        // Count by method
        this.countByMethod(analysis, methods);

        // Group by path
        this.groupByPath(analysis, path, methods);

        // Check for duplicates
        this.checkDuplicates(analysis, pathMethodMap, path, methods);

        // Pattern analysis
        this.analyzePatterns(analysis, path, methods);
      });

      return analysis;
    } catch (error) {
      logger.error('Error analyzing routes:', error);
      throw new Error(`Failed to analyze routes: ${(error as Error).message}`);
    }
  };

  /**
   * Retrieves all registered routes from the Express application.
   * @param app - Express application instance.
   * @returns Array of route endpoints with path, methods, and middleware information.
   * @throws Error if route extraction fails.
   */
  static readonly getRoutes = (app: Application): RouteEndpoint[] => {
    try {
      const routes: RouteEndpoint[] = listEndpoints(app);
      logger.debug(
        `Retrieved ${routes.length} routes from Express application`
      );
      return routes;
    } catch (error) {
      logger.error('Error retrieving routes from Express app:', error);
      throw new Error(`Failed to retrieve routes: ${(error as Error).message}`);
    }
  };

  /**
   * Colorizes HTTP method text for console output.
   * @param method - HTTP method to colorize.
   * @param colorize - Whether to apply colors (default: true).
   * @returns Colorized or plain method string.
   */
  private static readonly colorizeMethod = (
    method: string,
    colorize = true
  ): string => {
    if (!colorize) {
      return method;
    }

    const methodColors: Record<string, string> = {
      GET: this.colors.green,
      POST: this.colors.blue,
      PUT: this.colors.yellow,
      DELETE: this.colors.red,
      PATCH: this.colors.magenta,
      OPTIONS: this.colors.gray,
      HEAD: this.colors.cyan,
    };

    const color =
      (methodColors[method.toUpperCase()] ?? '') || this.colors.white;
    return `${color}${method}${this.colors.reset}`;
  };

  /**
   * Displays routes in table format to console.
   * @param routes - Array of routes to display.
   * @param options - Display configuration options.
   */
  private static readonly displayTableFormat = (
    routes: RouteEndpoint[],
    options: { colorize: boolean; showMiddlewares: boolean }
  ): void => {
    const { colorize, showMiddlewares } = options;

    log(
      `\n${colorize ? this.colors.bright : ''}🛣️  Available Routes:${colorize ? this.colors.reset : ''}`
    );
    log('--------------------');

    const sortedRoutes = [...routes].sort((a, b) =>
      a.path.localeCompare(b.path)
    );

    const METHOD_PAD_LENGTH = 20;
    const METHOD_PAD_LENGTH_COLOR = 35;
    const PATH_PAD_LENGTH = 40;

    sortedRoutes.forEach((route) => {
      const methodsStr = route.methods
        .map((m) => this.colorizeMethod(m, colorize))
        .join(', ');
      const methods = methodsStr.padEnd(
        colorize ? METHOD_PAD_LENGTH_COLOR : METHOD_PAD_LENGTH
      );
      const path = route.path.padEnd(PATH_PAD_LENGTH);
      const middlewares =
        showMiddlewares && route.middlewares
          ? `[${route.middlewares.join(', ')}]`
          : '';

      log(`${methods} ${path} ${middlewares}`);
    });
  };

  /**
   * Displays routes in tree format grouped by base path.
   * @param routes - Array of routes to display.
   * @param options - Display configuration options.
   */
  private static readonly displayTreeFormat = (
    routes: RouteEndpoint[],
    options: { colorize: boolean; showMiddlewares: boolean }
  ): void => {
    const { colorize, showMiddlewares } = options;

    log(
      `\n${colorize ? this.colors.bright : ''}🌳 Routes Tree:${colorize ? this.colors.reset : ''}`
    );
    log('---------------');

    const tree: Record<string, RouteEndpoint[]> = {};

    routes.forEach((route) => {
      const basePath = (route.path.split('/')[1] ?? '') || '/';
      tree[basePath] ??= [];
      tree[basePath].push(route);
    });

    Object.entries(tree)
      .sort()
      .forEach(([basePath, routeList]) => {
        log(
          `${colorize ? this.colors.yellow : ''}📁 /${basePath}${colorize ? this.colors.reset : ''}`
        );
        routeList.forEach((route) => {
          const methodsStr = route.methods
            .map((m) => this.colorizeMethod(m, colorize))
            .join(', ');
          const middlewares =
            showMiddlewares && route.middlewares
              ? ` ${colorize ? this.colors.gray : ''}[${route.middlewares.join(', ')}]${colorize ? this.colors.reset : ''}`
              : '';
          log(`  ├── ${methodsStr} ${route.path}${middlewares}`);
        });
      });
  };

  /**
   * Displays comprehensive route analysis information.
   * @param analysis - Route analysis data.
   * @param options - Display configuration options.
   */
  // eslint-disable-next-line no-magic-numbers
  private static readonly ROUTE_DISPLAY_LIMIT = 5;

  private static readonly displayParameterRoutes = (
    parameterRoutes: string[],
    colorize: boolean
  ): void => {
    if (parameterRoutes.length > 0) {
      log(
        `\n${colorize ? this.colors.yellow : ''}🔗 Parameter Routes (${parameterRoutes.length}):${colorize ? this.colors.reset : ''}`
      );
      parameterRoutes
        .slice(0, this.ROUTE_DISPLAY_LIMIT)
        .forEach((route) => log(`  ${route}`));
      if (parameterRoutes.length > this.ROUTE_DISPLAY_LIMIT) {
        log(
          `  ... and ${parameterRoutes.length - this.ROUTE_DISPLAY_LIMIT} more`
        );
      }
    }
  };

  private static readonly displayApiRoutes = (
    apiRoutes: string[],
    colorize: boolean
  ): void => {
    if (apiRoutes.length > 0) {
      log(
        `\n${colorize ? this.colors.blue : ''}🌐 API Routes (${apiRoutes.length}):${colorize ? this.colors.reset : ''}`
      );
      apiRoutes
        .slice(0, this.ROUTE_DISPLAY_LIMIT)
        .forEach((route) => log(`  ${route}`));
      if (apiRoutes.length > this.ROUTE_DISPLAY_LIMIT) {
        log(`  ... and ${apiRoutes.length - this.ROUTE_DISPLAY_LIMIT} more`);
      }
    }
  };

  private static readonly displayAdminRoutes = (
    adminRoutes: string[],
    colorize: boolean
  ): void => {
    if (adminRoutes.length > 0) {
      log(
        `\n${colorize ? this.colors.red : ''}🔒 Admin Routes (${adminRoutes.length}):${colorize ? this.colors.reset : ''}`
      );
      adminRoutes.forEach((route) => log(`  ${route}`));
    }
  };

  private static readonly displayDuplicates = (
    duplicates: string[],
    colorize: boolean
  ): void => {
    if (duplicates.length > 0) {
      log(
        `\n${colorize ? this.colors.red : ''}⚠️  Potential Duplicates:${colorize ? this.colors.reset : ''}`
      );
      duplicates.forEach((duplicate) => log(`  ${duplicate}`));
    }
  };

  private static readonly displayAnalysis = (
    analysis: RouteAnalysis,
    options: { colorize: boolean }
  ): void => {
    const { colorize } = options;

    log(
      `\n${colorize ? this.colors.bright : ''}📊 Route Analysis:${colorize ? this.colors.reset : ''}`
    );
    log('------------------');
    log(
      `Total endpoints: ${colorize ? this.colors.cyan : ''}${analysis.total}${colorize ? this.colors.reset : ''}`
    );

    log('\nBy HTTP Method:');
    Object.entries(analysis.byMethod)
      .sort(([, a], [, b]) => b - a)
      .forEach(([method, count]) => {
        log(`  ${this.colorizeMethod(method, colorize)}: ${count}`);
      });

    this.displayParameterRoutes(analysis.patterns.parameterRoutes, colorize);
    this.displayApiRoutes(analysis.patterns.apiRoutes, colorize);
    this.displayAdminRoutes(analysis.patterns.adminRoutes, colorize);
    this.displayDuplicates(analysis.duplicates, colorize);
  };

  /**
   * Logs routes to console with customizable formatting and filtering options.
   * @param app - Express application instance.
   * @param options - Console display configuration options.
   * @throws Error if route logging fails.
   */
  private static readonly filterRoutesByMethod = (
    routes: RouteEndpoint[],
    method?: string
  ): RouteEndpoint[] => {
    if (typeof method === 'string' && method.trim() !== '') {
      return routes.filter((route) =>
        route.methods.some((m) => m.toLowerCase() === method.toLowerCase())
      );
    }
    return routes;
  };

  private static readonly filterRoutesByPath = (
    routes: RouteEndpoint[],
    path?: string
  ): RouteEndpoint[] => {
    if (typeof path === 'string' && path.trim() !== '') {
      const pathLower = path.toLowerCase();
      return routes.filter((route) =>
        route.path.toLowerCase().includes(pathLower)
      );
    }
    return routes;
  };

  private static readonly displayDetailedFormat = (
    filteredRoutes: RouteEndpoint[],
    colorize: boolean,
    showMiddlewares: boolean
  ): void => {
    filteredRoutes.forEach((route, index) => {
      log(
        `\n${colorize ? this.colors.cyan : ''}Route ${index + 1}:${colorize ? this.colors.reset : ''}`
      );
      log(`  Path: ${route.path}`);
      log(
        `  Methods: ${route.methods.map((m) => this.colorizeMethod(m, colorize)).join(', ')}`
      );
      if (
        showMiddlewares &&
        route.middlewares &&
        route.middlewares.length > 0
      ) {
        log(`  Middlewares: ${route.middlewares.join(', ')}`);
      }
    });
  };

  private static readonly displayCompactFormat = (
    filteredRoutes: RouteEndpoint[],
    colorize: boolean
  ): void => {
    log(
      `\n${colorize ? this.colors.bright : ''}⚡ Compact Routes:${colorize ? this.colors.reset : ''}`
    );
    log('------------------');
    filteredRoutes.forEach((route) => {
      const methodsStr = route.methods
        .map((m) => this.colorizeMethod(m, colorize))
        .join('|');
      log(`${methodsStr} ${route.path}`);
    });
  };

  private static readonly displayRoutesByFormat = (
    format: string,
    filteredRoutes: RouteEndpoint[],
    options: { colorize: boolean; showMiddlewares: boolean }
  ): void => {
    const { colorize, showMiddlewares } = options;
    switch (format) {
      case 'table':
        this.displayTableFormat(filteredRoutes, {
          colorize,
          showMiddlewares,
        });
        break;
      case 'tree':
        this.displayTreeFormat(filteredRoutes, { colorize, showMiddlewares });
        break;
      case 'detailed':
        this.displayDetailedFormat(filteredRoutes, colorize, showMiddlewares);
        break;
      case 'compact':
        this.displayCompactFormat(filteredRoutes, colorize);
        break;
      default:
        log(
          `${colorize ? this.colors.red : ''}❓ Unknown format: ${format}. Showing table format.${colorize ? this.colors.reset : ''}`
        );
        this.displayTableFormat(filteredRoutes, {
          colorize,
          showMiddlewares,
        });
        break;
    }
  };

  private static readonly getFilteredRoutes = (
    routes: RouteEndpoint[],
    filter?: { method?: string; path?: string }
  ): RouteEndpoint[] => {
    let filteredRoutes = routes;
    if (filter) {
      filteredRoutes = this.filterRoutesByMethod(filteredRoutes, filter.method);
      filteredRoutes = this.filterRoutesByPath(filteredRoutes, filter.path);
    }
    return filteredRoutes;
  };

  private static readonly logRoutesHeader = (colorize: boolean): void => {
    const title = colorize
      ? `${this.colors.bright}${this.colors.cyan}📋 Express Routes Debug Information${this.colors.reset}`
      : '📋 Express Routes Debug Information';
    log(`\n${title}`);
    log('=====================================');
  };

  private static readonly logRoutesFooter = (): void => {
    log('=====================================\n');
  };

  static readonly logRoutes = (
    app: Application,
    options: ConsoleDisplayOptions = {}
  ): void => {
    try {
      const {
        format = 'table',
        filter,
        showAnalysis = true,
        showMiddlewares = true,
        colorize = !config.isTest, // Disable colors in test environment
      } = options;

      const routes = this.getRoutes(app);

      // Filter routes
      const filteredRoutes = this.getFilteredRoutes(routes, filter);

      this.logRoutesHeader(colorize);

      if (filteredRoutes.length === 0) {
        log(
          `${colorize ? this.colors.red : ''}❌ No routes found${colorize ? this.colors.reset : ''}`
        );
        return;
      }

      this.displayRoutesByFormat(format, filteredRoutes, {
        colorize,
        showMiddlewares,
      });

      if (showAnalysis) {
        this.displayAnalysis(this.analyzeRoutes(routes), { colorize });
      }

      this.logRoutesFooter();

      logger.debug(
        `Displayed ${filteredRoutes.length} routes in ${format} format`
      );
    } catch (error) {
      logger.error('Error logging routes to console:', error);
      throw new Error(`Failed to log routes: ${(error as Error).message}`);
    }
  };

  /**
   * Creates a debug endpoint handler for HTTP route inspection.
   * @param app - Express application instance.
   * @returns Express route handler function.
   */
  private static readonly createDebugEndpointHandler = (app: Application) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const routes = this.getRoutes(app);
        const analysis = this.analyzeRoutes(routes);

        const debugInfo: DebugResponse = {
          routes,
          analysis,
          metadata: {
            timestamp: new Date().toISOString(),
            nodeEnv: config.nodeEnv,
            apiPrefix: config.api.prefix,
            totalEndpoints: routes.length,
          },
        };

        // Query parameters for filtering
        const { format, method, path: pathFilter } = req.query;

        let filteredRoutes = routes;

        // Filter by method
        if (method !== null && typeof method === 'string') {
          filteredRoutes = filteredRoutes.filter((route) =>
            route.methods.some((m) => m.toLowerCase() === method.toLowerCase())
          );
        }

        // Filter by path pattern
        if (pathFilter !== null && typeof pathFilter === 'string') {
          filteredRoutes = filteredRoutes.filter((route) =>
            route.path.toLowerCase().includes(pathFilter.toLowerCase())
          );
        }

        // Different response formats
        if (format === 'text') {
          res.set('Content-Type', 'text/plain');
          const METHOD_PAD_LENGTH_TEXT = 15;
          const PATH_PAD_LENGTH_TEXT = 40;
          const output = [
            'EXPRESS ROUTES DEBUG',
            '==================',
            '',
            `Total Routes: ${analysis.total}`,
            `API Prefix: ${config.api.prefix}`,
            `Generated: ${new Date().toISOString()}`,
            '',
            'ROUTES:',
            '-------',
          ];

          filteredRoutes.forEach((route) => {
            const methods = route.methods
              .join(', ')
              .padEnd(METHOD_PAD_LENGTH_TEXT);
            const path = route.path.padEnd(PATH_PAD_LENGTH_TEXT);
            const middlewares = route.middlewares
              ? `[${route.middlewares.join(', ')}]`
              : '';
            output.push(`${methods} ${path} ${middlewares}`);
          });

          res.send(output.join('\n'));
        } else {
          // Default JSON format
          res.json({
            ...debugInfo,
            routes: filteredRoutes,
            filters: { method, path: pathFilter },
          });
        }

        logger.info(
          `Debug routes endpoint accessed - returned ${filteredRoutes.length} routes`
        );
      } catch (error) {
        logger.error('Error in debug routes endpoint:', error);
        next(error);
      }
    };
  };

  /**
   * Adds a debug endpoint to the Express application for runtime route inspection.
   * @param app - Express application instance.
   * @param options - Debug endpoint configuration options.
   * @throws Error if endpoint creation fails.
   */
  static readonly addDebugEndpoint = (
    app: Application,
    options: DebugEndpointOptions = {}
  ): void => {
    try {
      const {
        enableInProduction = false,
        requireAuth = false,
        logAccess = true,
        customPath = '/debug/routes',
      } = options;

      // Security check - only enable in development by default
      if (!enableInProduction && config.isProd) {
        logger.warn(
          'Routes debug endpoint disabled in production for security'
        );
        return;
      }

      // Optional authentication middleware
      if (requireAuth) {
        app.get(customPath, this.createDebugEndpointHandler(app));
      }

      // Add the debug endpoint
      app.get(customPath, this.createDebugEndpointHandler(app));

      if (logAccess) {
        logger.info(`Routes debug endpoint available at: ${customPath}`);
        logger.debug(`Endpoint formats: ${customPath}?format=json|text`);
        logger.debug(`Endpoint filters: ${customPath}?method=get&path=api`);
      }
    } catch (error) {
      logger.error('Error adding debug endpoint:', error);
      throw new Error(
        `Failed to add debug endpoint: ${(error as Error).message}`
      );
    }
  };

  /**
   * Gets comprehensive route analysis for programmatic use.
   * @param app - Express application instance.
   * @returns Complete route analysis including statistics and patterns.
   * @throws Error if analysis fails.
   */
  static readonly getRouteAnalysis = (app: Application): RouteAnalysis => {
    try {
      const routes = this.getRoutes(app);
      const analysis = this.analyzeRoutes(routes);

      logger.debug(`Generated route analysis for ${routes.length} routes`);
      return analysis;
    } catch (error) {
      logger.error('Error generating route analysis:', error);
      throw new Error(
        `Failed to generate route analysis: ${(error as Error).message}`
      );
    }
  };
}
