/**
 * Utility class for handling date and time operations.
 *
 * This class provides helper functions to work with durations, parse them, and calculate dates
 * based on intervals. Specifically, it includes methods for:
 *
 * - `parseDurationToMilliseconds`: Parses a duration string (e.g., "5m", "2h", "1d")
 *   into its equivalent in milliseconds.
 * - `getDateToInterval`: Calculates a future date by adding an interval in milliseconds to the current date.
 *
 * Dependencies:
 * - `RegExp`: For parsing the duration string and extracting the amount and unit.
 *
 * Usage examples:
 * - `DateUtil.parseDurationToMilliseconds('10m')`: Returns the equivalent of 10 minutes in milliseconds.
 * - `DateUtil.getDateToInterval(86400000)`: Returns the date 24 hours from the current date.
 */

export default class DateUtil {
  /**
   * Parses a duration string (e.g., '10m', '2h', '1d') into milliseconds.
   *
   * @param duration - A duration string where the number is followed by a unit ('s', 'm', 'h', 'd').
   * @returns The equivalent duration in milliseconds.
   * @throws Error if the format of the duration is invalid.
   */
  static parseDurationToMilliseconds(duration: string): number {
    // Regex to match duration string like "5m", "2h", "1d"
    const matches = RegExp(/^(\d+)([smhd])$/).exec(duration);
    if (!matches) {
      throw new Error('Invalid duration format');
    }

    const amount = parseInt(matches[1] as string);
    const unit = matches[2];

    // Convert the duration based on the unit
    switch (unit) {
      case 's': // seconds
        return amount * 1000;
      case 'm': // minutes
        return amount * 60 * 1000;
      case 'h': // hours
        return amount * 60 * 60 * 1000;
      case 'd': // days
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid duration unit');
    }
  }

  /**
   * Returns the date after adding a specific interval to the current date.
   *
   * @param interval - The interval in milliseconds to add to the current date.
   * @returns A `Date` object representing the calculated future date.
   */
  static getDateToInterval(interval: number): Date {
    return new Date(Date.now() + interval);
  }
}
