import { IngredientController } from './ingredient.controller';
import { RecipeCategoryLinkController } from './recipe-category-link.controller';
import { RecipeCategoryController } from './recipe-category.controller';
import { RecipeController } from './recipe.controller';
import { StepController } from './step.controller';
export const compositionsModuleController = [
  RecipeCategoryController,
  RecipeController,
  StepController,
  RecipeCategoryLinkController,
  IngredientController,
];
