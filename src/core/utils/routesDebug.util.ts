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

import { Application, Request, Response, NextFunction } from 'express';
import listEndpoints from 'express-list-endpoints';
import config from '@/config';
import logger from '@/core/utils/logger.util';

interface RouteEndpoint {
  path: string;
  methods: string[];
  middlewares?: string[];
}

interface RouteAnalysis {
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

interface DebugResponse {
  routes: RouteEndpoint[];
  analysis: RouteAnalysis;
  metadata: {
    timestamp: string;
    nodeEnv: string;
    apiPrefix: string;
    totalEndpoints: number;
  };
}

interface ConsoleDisplayOptions {
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

interface DebugEndpointOptions {
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
        methods.forEach((method) => {
          analysis.byMethod[method] = (analysis.byMethod[method] || 0) + 1;
        });

        // Group by path
        if (!analysis.byPath[path]) {
          analysis.byPath[path] = [];
        }
        analysis.byPath[path].push(...methods);

        // Check for duplicates
        const key = path;
        if (pathMethodMap.has(key)) {
          const existingMethods = pathMethodMap.get(key) || [];
          const commonMethods = methods.filter((m) =>
            existingMethods.includes(m)
          );
          if (commonMethods.length > 0) {
            analysis.duplicates.push(`${path} (${commonMethods.join(', ')})`);
          }
        } else {
          pathMethodMap.set(key, [...methods]);
        }

        // Pattern analysis
        if (path.includes(':')) {
          analysis.patterns.parameterRoutes.push(
            `${methods.join('|')} ${path}`
          );
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
    if (!colorize) return method;

    const methodColors: Record<string, string> = {
      GET: this.colors.green,
      POST: this.colors.blue,
      PUT: this.colors.yellow,
      DELETE: this.colors.red,
      PATCH: this.colors.magenta,
      OPTIONS: this.colors.gray,
      HEAD: this.colors.cyan,
    };

    const color = methodColors[method.toUpperCase()] || this.colors.white;
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

    console.log(
      `\n${colorize ? this.colors.bright : ''}🛣️  Available Routes:${colorize ? this.colors.reset : ''}`
    );
    console.log('--------------------');

    const sortedRoutes = [...routes].sort((a, b) =>
      a.path.localeCompare(b.path)
    );

    sortedRoutes.forEach((route) => {
      const methodsStr = route.methods
        .map((m) => this.colorizeMethod(m, colorize))
        .join(', ');
      const methods = methodsStr.padEnd(colorize ? 35 : 20);
      const path = route.path.padEnd(40);
      const middlewares =
        showMiddlewares && route.middlewares
          ? `[${route.middlewares.join(', ')}]`
          : '';

      console.log(`${methods} ${path} ${middlewares}`);
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

    console.log(
      `\n${colorize ? this.colors.bright : ''}🌳 Routes Tree:${colorize ? this.colors.reset : ''}`
    );
    console.log('---------------');

    const tree: Record<string, RouteEndpoint[]> = {};

    routes.forEach((route) => {
      const basePath = route.path.split('/')[1] || '/';
      if (!tree[basePath]) tree[basePath] = [];
      tree[basePath].push(route);
    });

    Object.entries(tree)
      .sort()
      .forEach(([basePath, routeList]) => {
        console.log(
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
          console.log(`  ├── ${methodsStr} ${route.path}${middlewares}`);
        });
      });
  };

  /**
   * Displays comprehensive route analysis information.
   * @param analysis - Route analysis data.
   * @param options - Display configuration options.
   */
  private static readonly displayAnalysis = (
    analysis: RouteAnalysis,
    options: { colorize: boolean }
  ): void => {
    const { colorize } = options;

    console.log(
      `\n${colorize ? this.colors.bright : ''}📊 Route Analysis:${colorize ? this.colors.reset : ''}`
    );
    console.log('------------------');
    console.log(
      `Total endpoints: ${colorize ? this.colors.cyan : ''}${analysis.total}${colorize ? this.colors.reset : ''}`
    );

    console.log('\nBy HTTP Method:');
    Object.entries(analysis.byMethod)
      .sort(([, a], [, b]) => b - a)
      .forEach(([method, count]) => {
        console.log(`  ${this.colorizeMethod(method, colorize)}: ${count}`);
      });

    if (analysis.patterns.parameterRoutes.length > 0) {
      console.log(
        `\n${colorize ? this.colors.yellow : ''}🔗 Parameter Routes (${analysis.patterns.parameterRoutes.length}):${colorize ? this.colors.reset : ''}`
      );
      analysis.patterns.parameterRoutes
        .slice(0, 5)
        .forEach((route) => console.log(`  ${route}`));
      if (analysis.patterns.parameterRoutes.length > 5) {
        console.log(
          `  ... and ${analysis.patterns.parameterRoutes.length - 5} more`
        );
      }
    }

    if (analysis.patterns.apiRoutes.length > 0) {
      console.log(
        `\n${colorize ? this.colors.blue : ''}🌐 API Routes (${analysis.patterns.apiRoutes.length}):${colorize ? this.colors.reset : ''}`
      );
      analysis.patterns.apiRoutes
        .slice(0, 5)
        .forEach((route) => console.log(`  ${route}`));
      if (analysis.patterns.apiRoutes.length > 5) {
        console.log(`  ... and ${analysis.patterns.apiRoutes.length - 5} more`);
      }
    }

    if (analysis.patterns.adminRoutes.length > 0) {
      console.log(
        `\n${colorize ? this.colors.red : ''}🔒 Admin Routes (${analysis.patterns.adminRoutes.length}):${colorize ? this.colors.reset : ''}`
      );
      analysis.patterns.adminRoutes.forEach((route) =>
        console.log(`  ${route}`)
      );
    }

    if (analysis.duplicates.length > 0) {
      console.log(
        `\n${colorize ? this.colors.red : ''}⚠️  Potential Duplicates:${colorize ? this.colors.reset : ''}`
      );
      analysis.duplicates.forEach((duplicate) => console.log(`  ${duplicate}`));
    }
  };

  /**
   * Logs routes to console with customizable formatting and filtering options.
   * @param app - Express application instance.
   * @param options - Console display configuration options.
   * @throws Error if route logging fails.
   */
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
      let filteredRoutes = routes;
      if (filter?.method) {
        filteredRoutes = filteredRoutes.filter((route) =>
          route.methods.some(
            (m) => m.toLowerCase() === filter.method?.toLowerCase()
          )
        );
      }
      if (filter?.path) {
        filteredRoutes = filteredRoutes.filter((route) =>
          route.path.toLowerCase().includes(filter.path?.toLowerCase() || '')
        );
      }

      const title = colorize
        ? `${this.colors.bright}${this.colors.cyan}📋 Express Routes Debug Information${this.colors.reset}`
        : '📋 Express Routes Debug Information';
      console.log(`\n${title}`);
      console.log('=====================================');

      if (filteredRoutes.length === 0) {
        console.log(
          `${colorize ? this.colors.red : ''}❌ No routes found${colorize ? this.colors.reset : ''}`
        );
        return;
      }

      // Display routes based on format
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
          filteredRoutes.forEach((route, index) => {
            console.log(
              `\n${colorize ? this.colors.cyan : ''}Route ${index + 1}:${colorize ? this.colors.reset : ''}`
            );
            console.log(`  Path: ${route.path}`);
            console.log(
              `  Methods: ${route.methods.map((m) => this.colorizeMethod(m, colorize)).join(', ')}`
            );
            if (
              showMiddlewares &&
              route.middlewares &&
              route.middlewares.length > 0
            ) {
              console.log(`  Middlewares: ${route.middlewares.join(', ')}`);
            }
          });
          break;
        case 'compact':
          console.log(
            `\n${colorize ? this.colors.bright : ''}⚡ Compact Routes:${colorize ? this.colors.reset : ''}`
          );
          console.log('------------------');
          filteredRoutes.forEach((route) => {
            const methodsStr = route.methods
              .map((m) => this.colorizeMethod(m, colorize))
              .join('|');
            console.log(`${methodsStr} ${route.path}`);
          });
          break;
      }

      if (showAnalysis) {
        this.displayAnalysis(this.analyzeRoutes(routes), { colorize });
      }

      console.log('=====================================\n');

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
        if (method && typeof method === 'string') {
          filteredRoutes = filteredRoutes.filter((route) =>
            route.methods.some((m) => m.toLowerCase() === method.toLowerCase())
          );
        }

        // Filter by path pattern
        if (pathFilter && typeof pathFilter === 'string') {
          filteredRoutes = filteredRoutes.filter((route) =>
            route.path.toLowerCase().includes(pathFilter.toLowerCase())
          );
        }

        // Different response formats
        if (format === 'text') {
          res.set('Content-Type', 'text/plain');
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
            const methods = route.methods.join(', ').padEnd(15);
            const path = route.path.padEnd(40);
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
        app.get(
          customPath,
          (req: Request, res: Response, next: NextFunction) => {
            const auth = req.headers.authorization;
            const expectedToken = process.env.DEBUG_TOKEN;

            if (!expectedToken || !auth || auth !== `Bearer ${expectedToken}`) {
              logger.warn(
                'Unauthorized access attempt to debug routes endpoint'
              );
              return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
          }
        );
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
