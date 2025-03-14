export const allowedSitesArray = [
  'allrecipes.com',
  'cooking.nytimes.com',
  'simplyrecipes.com',
] as const;

export type AllowedSitesType = (typeof allowedSitesArray)[number];

// Map des fractions unicode en décimal
export const fractionMap: { [key: string]: number } = {
  '½': 1 / 2,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅕': 1 / 5,
  '⅖': 2 / 5,
  '⅗': 3 / 5,
  '⅘': 4 / 5,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
};

export type ExtractedRecipeContent = {
  title: string;
  description: string;
  servings: string;
  times: Record<string, string>;
  ingredients: Ingredient[];
  steps: Record<string, string>;
};

export type Ingredient = {
  quantity: string;
  unit: string;
  name: string;
};
