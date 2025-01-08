/**
 * cors.util.ts
 *
 * Utility function to parse a JSON string into an array of allowed origins.
 * Ensures that the provided string is correctly formatted and represents a valid array.
 * Logs errors if parsing fails and provides a default fallback.
 */

import logger from './logger.util';

/**
 * Parses a JSON string to extract an array of allowed origins for CORS.
 * @param originsString - A JSON string representing an array of allowed origins.
 * @returns An array of allowed origins, or a fallback value (`['*']`) if parsing fails.
 */
export function parseAllowedOrigins(originsString: string): string[] {
  try {
    // Attempt to parse the JSON string
    const array = JSON.parse(originsString);

    // Validate that the parsed value is an array
    if (Array.isArray(array)) {
      return array;
    } else {
      // Throw an error if the parsed value is not an array
      throw new Error('The JSON string does not represent a valid array.');
    }
  } catch (error) {
    // Log an error message if parsing fails
    logger.error(
      'Error while parsing CORS_ALLOW_ORIGINS:',
      (error as Error).message
    );

    // Return a default value to allow all origins
    return ['*'];
  }
}
