import { Service } from 'typedi';
import { fractionMap } from './recipeScrapping.types';
import { log } from 'console';

@Service()
export default class RecipeScrappingUtil {
  // Extract the domain name from a URL
  extractDomain(url: string): string | undefined | null {
    try {
      const match = url.match(/^(?:https?:\/\/)?(www\.)?([^/]+)/);
      log(match);
      return match ? match[2] : null;
    } catch (error) {
      log(`Error extracting domain from URL: ${url}`, error);
      return null;
    }
  }

  // Function to convert a fraction to a float
  fractionToFloat(fraction: string | undefined): number {
    try {
      if (!fraction) {
        return NaN;
      } // Handle the case where fraction is undefined

      // Check if the fraction is in Unicode form (e.g., ½, ⅓)
      if (fractionMap[fraction]) {
        return fractionMap[fraction];
      }

      // Handle classic fractions like "1/2"
      const parts = fraction.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0] ?? '');
        const denominator = parseFloat(parts[1] ?? '');
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          return NaN; // Handle invalid cases
        }
        return numerator / denominator;
      }

      // Handle simple decimal numbers
      return parseFloat(fraction);
    } catch (error) {
      log(`Error converting fraction to float: ${fraction}`, error);
      return NaN;
    }
  }

  convertTimeToMinutes = (timeStr: string): number | null => {
    try {
      if (!timeStr) {
        return null;
      }

      const timeRegex = /(\d+)\s*(hour|hr|minute|min|second|sec)s?/gi;
      let totalMinutes = 0;

      let match;
      while ((match = timeRegex.exec(timeStr)) !== null) {
        const value = parseInt(match[1] ?? '', 10);
        const unit = match[2]?.toLowerCase();

        if (unit?.startsWith('hour') || unit?.startsWith('hr')) {
          totalMinutes += value * 60;
        } else if (unit?.startsWith('minute') || unit?.startsWith('min')) {
          totalMinutes += value;
        } else if (unit?.startsWith('second') || unit?.startsWith('sec')) {
          totalMinutes += Math.round(value / 60); // Convertir les secondes en minutes
        }
      }

      return totalMinutes > 0 ? totalMinutes : null;
    } catch (error) {
      log(`Error converting time to minutes: ${timeStr}`, error);
      return null;
    }
  };

  parseServings = (servingsStr: string): number | null => {
    try {
      if (!servingsStr) {
        return null;
      }

      // Format: "Original recipe (1X) yields 6 servings"
      let match = servingsStr.match(/yields\s+(\d+)/i);
      if (match) {
        return parseInt(match[1] ?? '', 10);
      }

      // Format: "6 to 8 servings"
      match = servingsStr.match(/(\d+)\s*to\s*(\d+)/i);
      if (match) {
        const minServings = parseInt(match[1] ?? '', 10);
        const maxServings = parseInt(match[2] ?? '', 10);
        return Math.round((minServings + maxServings) / 2); // Moyenne
      }

      // Format: "6 servings"
      match = servingsStr.match(/(\d+)\s+servings?/i);
      if (match) {
        return parseInt(match[1] ?? '', 10);
      }

      return null;
    } catch (error) {
      log(`Error parsing servings: ${servingsStr}`, error);
      return null;
    }
  };

  cleanUnit = (unit: string): string => {
    try {
      return unit.replace(/\(|\)/g, '').trim(); // Supprime toutes les parenthèses et espaces inutiles
    } catch (error) {
      log(`Error cleaning unit: ${unit}`, error);
      return unit; // Retourne l'unité originale en cas d'erreur
    }
  };

  normalizeQuantity = (quantity: string): number | null => {
    try {
      if (!quantity) {
        return null;
      }

      // Gérer les intervalles (ex: "3 1/2 to 4")
      const rangeMatch = quantity.match(/^([\d\s\/]+)\s*to\s*([\d\s\/]+)$/i);
      if (rangeMatch) {
        const num1 = this.normalizeQuantity(rangeMatch[1] ?? '');
        const num2 = this.normalizeQuantity(rangeMatch[2] ?? '');
        return num1 && num2 ? (num1 + num2) / 2 : (num1 ?? num2);
      }

      // Gérer les nombres mixtes et fractions (ex: "3 1/2", "1/4")
      const fractionMatch = quantity.match(/^(\d+)?\s*(\d+)\/(\d+)$/);
      if (fractionMatch) {
        const whole = fractionMatch[1] ? parseInt(fractionMatch[1], 10) : 0;
        const numerator = parseInt(fractionMatch[2] ?? '', 10);
        const denominator = parseInt(fractionMatch[3] ?? '', 10);
        return whole + numerator / denominator;
      }

      // Gérer les nombres normaux (ex: "6")
      const numericValue = parseFloat(quantity);
      return isNaN(numericValue) ? null : numericValue;
    } catch (error) {
      throw Error(
        `Error normalizing quantity: ${quantity}: ${(error as any).message}`
      );
    }
  };
}
