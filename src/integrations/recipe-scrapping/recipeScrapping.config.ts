export const allowedSitesSelectorsConfig = {
  'cooking.nytimes.com': {
    title: '.pantry--title-display',
    description: '.topnote_topnoteParagraphs__A3OtF',
    ingredients: {
      list: '.ingredient_ingredient__rfjvs',

      quantity: '.ingredient_quantity__Z_Mvw',
      textData: '',
    },
    steps: {
      list: '.preparation_step__nzZHP',
      title: '.preparation_stepNumber__qWIz4',
      description: '.preparation_stepContent__CFrQM',
    },
    times: '',
  },
  'allrecipes.com': {
    title: '.pantry--title-display',
    description: '.topnote_topnoteParagraphs__A3OtF',
    ingredients: {
      list: '.ingredient_ingredient__rfjvs',

      quantity: '.ingredient_quantity__Z_Mvw',
      textData: '',
    },
    steps: {
      list: '.preparation_step__nzZHP',
      title: '.preparation_stepNumber__qWIz4',
      description: '',
    },
    times: '',
  },
  'simplyrecipes.com': {
    title: '.pantry--title-display',
    description: '.topnote_topnoteParagraphs__A3OtF',
    ingredients: {
      list: '.ingredient_ingredient__rfjvs',

      quantity: '.ingredient_quantity__Z_Mvw',
      textData: '',
    },
    steps: {
      list: '.preparation_step__nzZHP',
      title: '.preparation_stepNumber__qWIz4',
      description: '',
    },
    times: '',
  },
} as const;

export type AllowedSitesSelectorsConfigType =
  typeof allowedSitesSelectorsConfig;
export type AllowedSiteSelectorConfigKeys =
  keyof AllowedSitesSelectorsConfigType;
export type SiteSelectorConfig =
  AllowedSitesSelectorsConfigType[AllowedSiteSelectorConfigKeys];
