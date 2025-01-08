/**
 * Function to generate and merge the Swagger documentation configuration for the application.
 * It combines path and schema definitions from different modules and returns the complete Swagger document.
 */

import swaggerConfig from '@/config/swagger.config'; // Base Swagger configuration
import authDocs, { authSchemas } from '@/modules/adminAuth/adminAuth.swagger'; // Authentication module documentation

/**
 * Generates the complete Swagger documentation by merging the base config
 * with paths and schemas from various application modules.
 */
export const generateSwaggerDocument = () => {
  // Merge the paths from each module into the base Swagger config paths
  swaggerConfig.paths = {
    ...swaggerConfig.paths, // Existing paths in the base Swagger config
    ...authDocs, // Add authentication routes
  };

  // Merge the schemas from each module into the base Swagger config schemas
  swaggerConfig.components.schemas = {
    ...swaggerConfig.components.schemas, // Existing schemas in the base Swagger config
    ...authSchemas, // Add authentication schemas
  };

  // Return the updated Swagger configuration
  return swaggerConfig;
};
