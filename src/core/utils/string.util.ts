/**
 * Utility class providing various string manipulation methods.
 *
 * This class contains static methods for:
 * 1. Capitalizing the first letter of a string.
 * 2. Parsing different input types (such as boolean values in strings) to return a boolean.
 * 3. Generating a URL-friendly slug from a given title, which includes:
 *    - Converting the title to lowercase.
 *    - Removing any special characters.
 *    - Replacing spaces with hyphens.
 *
 * These methods are useful for common string-related operations such as formatting, validation,
 * and URL generation.
 *
 * Example Usage:
 *
 * StringUtil.capitalizeFirstLetter("hello"); // Output: "Hello"
 * StringUtil.parseBool("true"); // Output: true
 * StringUtil.generateSlug("Poivre noir moulu 50g !"); // Output: "poivre-noir-moulu-50g"
 */

export default class StringUtil {
  /**
   * Capitalize the first letter of the string.
   * @param str - The string to capitalize.
   * @returns The string with the first letter capitalized.
   */
  static readonly capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1); // Capitalize the first letter and return the rest unchanged.
  };

  /**
   * Convert various types to boolean.
   * Accepts booleans, strings like 'true', '1', 'false', '0'.
   * @param value - The value to convert to a boolean.
   * @returns A boolean value representing the input.
   */
  static parseBool(value: any): boolean {
    if (typeof value === 'boolean') {
      return value; // If already a boolean, return as is.
    } else if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1'; // Strings 'true' or '1' will return true.
    }
    return false; // Default to false if not a boolean or recognized string.
  }

  /**
   * Generate a URL-friendly slug from a title.
   * Converts the title to lowercase, removes special characters,
   * and replaces spaces with hyphens.
   * @param title - The title or string to convert to a slug.
   * @returns A URL-friendly slug.
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase() // Convert the entire string to lowercase.
      .replace(/[^a-z0-9\s-]/g, '') // Remove characters that are not lowercase letters, numbers, spaces, or hyphens.
      .replace(/\s+/g, '-') // Replace one or more spaces with a hyphen.
      .trim(); // Remove leading and trailing spaces that may have been added in the process.
  }

  /**
   * Validate and convert a parameter to a number.
   * @param param - The parameter to validate and convert.
   * @returns The converted number if valid, otherwise `null`.
   */
  static parseAndValidateNumber(param: string | undefined): number | null {
    if (param === undefined || param === null || param.trim() === '') {
      return null; // Return null if the parameter is undefined, null, or an empty string
    }
    const num = Number(param);
    return isNaN(num) ? null : num; // Return null if the parameter is not a valid number
  }
}
