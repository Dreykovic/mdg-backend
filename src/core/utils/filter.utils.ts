/**
 * Utility class for generating dynamic "where" conditions for database queries.
 *
 * This class provides methods for generating filtering conditions:
 * 1. `generateWhereConditions`: Generates a set of OR-based conditions from multiple filters
 *    across several fields. Useful for complex search operations where multiple conditions
 *    are applied on different fields.
 *
 * 2. `generateWhereCondition`: Generates a condition for a single field based on a filter.
 *    Useful when only one condition needs to be checked and applied for a specific field.
 *
 * Example Usage:
 *
 * WhereConditionBuilder.generateWhereConditions({ name: 'John', age: 30 }, ['name', 'age']);
 * // Output: { OR: [{ name: { contains: 'John', mode: 'insensitive' } }, { age: 30 }] }
 *
 * WhereConditionBuilder.generateWhereCondition({ name: 'John' }, 'name');
 * // Output: { name: 'John' }
 */

interface IFilters {
  [key: string]: string; // Represents a filter key-value pair, where the key is the field name and the value is the filter value (string)
}

export default class WhereConditionBuilder {
  /**
   * Generates dynamic "where" conditions with OR logic for multiple filters across fields.
   *
   * @param filters - An object where the keys are the field names and values are the filter criteria.
   * @param fields - A list of fields that are accepted for filtering.
   * @returns A condition object for use in database queries (e.g., Prisma, Sequelize).
   */
  static readonly generateWhereConditions = (
    filters: IFilters,
    fields: string[]
  ) => {
    const whereConditions: any = {
      OR: [], // Array for OR conditions
    };

    // Iterate through filters and create conditions
    for (const [field, value] of Object.entries(filters)) {
      // Ensure the value is valid and the field is accepted
      if (value !== undefined && value !== null && fields.includes(field)) {
        // Handle string values with case-insensitive search
        if (typeof value === 'string' && value.trim() !== '') {
          whereConditions.OR.push({
            [field]: {
              contains: value.trim(), // SQL equivalent: LIKE %value%
              mode: 'insensitive', // Case-insensitive
            },
          });
        } else if (typeof value === 'number') {
          // Handle numeric values directly
          whereConditions.OR.push({
            [field]: value,
          });
        }
      }
    }

    // Return the condition object if there are any OR conditions; otherwise, return an empty object
    return whereConditions.OR.length > 0 ? whereConditions : {};
  };

  /**
   * Generates a condition for a single field based on a filter.
   *
   * @param filters - An object containing filter criteria.
   * @param acceptedField - The field name to check in the filters.
   * @returns A condition for the field or an empty object if no valid condition is found.
   */
  static readonly generateWhereCondition = (
    filters: IFilters,
    acceptedField: string
  ): Record<string, any> => {
    const whereConditions: Record<string, any> = {};

    // Check if the filter matches the accepted field and is valid
    for (const [field, value] of Object.entries(filters)) {
      if (
        field === acceptedField &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        whereConditions[field] = value; // Add valid condition
      }
    }

    // Return the condition or an empty object if no condition is found
    return Object.keys(whereConditions).length > 0 ? whereConditions : {};
  };
}
