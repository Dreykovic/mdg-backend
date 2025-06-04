/**
 * This file is responsible for loading and managing environment variables in the application.
 * Using the `dotenv` library, it reads variables from a `.env` file located at the root of the project.
 *
 * Key functionalities:
 * - Loads environment variables into `process.env`
 * - Exports the `env` object for accessing environment variables throughout the application
 * - Defines the `nodeEnv` variable to determine the current environment (e.g., development, production)
 *
 * This setup ensures that environment-specific configurations are centralized and easily maintainable.
 */

import * as dotenv from 'dotenv'; // Importing the 'dotenv' library for environment variable management
import appRoot from 'app-root-path'; // Importing the root path of the application

// Configuring dotenv to load the .env file located at the application root
dotenv.config({ path: `${appRoot.path}/.env` });

// Exporting the environment variables as an object for use in the application
export const { env } = process;

// Exporting the current Node environment, defaulting to 'development' if not specified
export const nodeEnv: string = env.NODE_ENV ?? 'development';
