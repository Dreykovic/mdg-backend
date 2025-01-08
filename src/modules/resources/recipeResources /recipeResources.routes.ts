import express from 'express';
import recipeCategoriesRouter from './recipeCategory/recipeCategory.routes';
import recipesRouter from './recipe/recipe.routes';
import recipeCategoryLinksRouter from './recipeCategoryLink/recipeCategoryLink.routes';
import ingredientsRouter from './ingredient/ingredient.routes';
import stepsRouter from './step/step.routes';

const recipeResourcesRouter = express.Router();

recipeResourcesRouter.use('/recipe-resources', recipeCategoriesRouter);
recipeResourcesRouter.use('/recipe-resources', recipesRouter);
recipeResourcesRouter.use('/recipe-resources', recipeCategoryLinksRouter);
recipeResourcesRouter.use('/recipe-resources', ingredientsRouter);
recipeResourcesRouter.use('/recipe-resources', stepsRouter);

export default recipeResourcesRouter;
