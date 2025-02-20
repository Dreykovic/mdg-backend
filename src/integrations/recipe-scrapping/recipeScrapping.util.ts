import { Service } from 'typedi';
import { fractionMap } from './recipeScrapping.types';
import { log } from 'console';

type Ingredient = {
  quantity: number | null;
  unit: string | null;
  name: string;
};

@Service()
export default class RecipeScrappingUtil {
  // Extract the domain name from a URL
  extractDomain(url: string): string | undefined | null {
    const match = url.match(/^(?:https?:\/\/)?(www\.)?([^/]+)/);
    log(match);
    return match ? match[2] : null;
  }

  // Function to convert a fraction to a float
  fractionToFloat(fraction: string | undefined): number {
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
  }

  convertTimeToMinutes = (timeStr: string): number | null => {
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
  };

  parseServings(servingsStr: string) {
    const match = servingsStr.match(/(\d+)\s*(to\s*(\d+))?/);
    if (!match) {
      return null;
    }
    return {
      min: parseInt(match[1] ?? ''),
      max: match[3] ? parseInt(match[3]) : parseInt(match[1] ?? ''),
    };
  }

  // Function to extract quantity, unit, and name of the ingredient
  parseIngredient(ingredient: string): Ingredient {
    const regex = /([\d\s½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞\/.-]+)?\s*([a-zA-Z-]+)?\s*(.+)/;
    const match = ingredient.match(regex);

    if (!match) {
      return { quantity: null, unit: null, name: ingredient };
    }

    const rawQuantity = match[1]?.trim() || null;
    let quantity: number | null = null;

    if (rawQuantity) {
      // Handle value ranges (e.g., "½ to 1")
      if (rawQuantity.includes('to')) {
        const [min, max] = rawQuantity
          .split('to')
          .map((q) => this.fractionToFloat(q.trim()));
        quantity = ((min ?? 0) + (max ?? 0)) / 2; // Average of the two values
      } else {
        quantity = this.fractionToFloat(rawQuantity);
      }
    }

    const unit = match[2]?.trim() || null;
    const name = match[3]?.trim();

    return { quantity, unit, name: name ?? '' };
  }
}
