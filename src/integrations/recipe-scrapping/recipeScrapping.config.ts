export const allowedSitesSelectorsConfig = {
  'cooking.nytimes.com': {
    title: '.pantry--title-display',
    description: '.topnote_topnoteParagraphs__A3OtF',
    ingredients: {
      list: '.ingredient_ingredient__rfjvs',

      quantity: '.ingredient_quantity__Z_Mvw',
      unit: 'span:not([class])',
      name: 'span:not([class])',
    },
    steps: {
      list: '.preparation_step__nzZHP',
      title: '.preparation_stepNumber__qWIz4',
      description: '.preparation_stepContent__CFrQM',
    },
    times: { label: '.stats_cookingTimeTable__b0moV dt', next: 'dd' },
    servings: '.ingredients_recipeYield__DN65p > span:last-child',
  },
  'allrecipes.com': {
    title: 'h1.article-heading',
    description: '.article-subheading',
    ingredients: {
      list: '.mm-recipes-structured-ingredients__list-item',

      quantity: 'p>span[data-ingredient-quantity="true"]',
      unit: 'p>span[data-ingredient-unit="true"]',
      name: 'p>span[data-ingredient-name="true"]',
    },
    steps: {
      list: '.recipeScTemplate .mm-recipes-steps .mntl-sc-block-group--OL>.mntl-sc-block-group--LI',
      title: '.comp.mntl-sc-block.mntl-sc-block-html',
      description: '.comp.mntl-sc-block.mntl-sc-block-html',
    },
    times: {
      label: '.mm-recipes-details__label',
      next: '.mm-recipes-details__value',
    },
    servings: '.mm-recipes-serving-size-adjuster__meta',
  },
  'simplyrecipes.com': {
    title: 'h2.comp.recipe-block__header.text-block',
    description:
      '.comp.article__header--project.mntl-sc-page.mntl-block.article-intro.text-passage.structured-content',
    ingredients: {
      list: '.structured-ingredients__list-item',

      quantity: 'p>span[data-ingredient-quantity="true"]',
      unit: 'p>span[data-ingredient-unit="true"]',
      name: 'p>span[data-ingredient-name="true"]',
    },
    steps: {
      list: '.comp.mntl-sc-block.mntl-sc-block-startgroup.mntl-sc-block-group--LI',
      title: '.mntl-sc-block-subheading__text',
      description: '.comp.mntl-sc-block.mntl-sc-block-html',
    },
    times: {
      label: '.project-meta__times-container .meta-text__label',
      next: '.meta-text__data',
    },
    servings: '.recipe-serving.project-meta__recipe-serving .meta-text__data',
  },
} as const;

export type AllowedSitesSelectorsConfigType =
  typeof allowedSitesSelectorsConfig;
export type AllowedSiteSelectorConfigKeys =
  keyof AllowedSitesSelectorsConfigType;
export type SiteSelectorConfig =
  AllowedSitesSelectorsConfigType[AllowedSiteSelectorConfigKeys];
