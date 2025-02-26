import express from 'express';
import recipeCategoriesRouter from './recipeCategory/recipeCategory.routes';
import recipesRouter from './recipe/recipe.routes';
import recipeCategoryLinksRouter from './recipeCategoryLink/recipeCategoryLink.routes';
import ingredientsRouter from './ingredient/ingredient.routes';
import stepsRouter from './step/step.routes';

const recipeCatalogRouter = express.Router();

recipeCatalogRouter.use('/recipe-catalog', recipeCategoriesRouter);
recipeCatalogRouter.use('/recipe-catalog', recipesRouter);
recipeCatalogRouter.use('/recipe-catalog', recipeCategoryLinksRouter);
recipeCatalogRouter.use('/recipe-catalog', ingredientsRouter);
recipeCatalogRouter.use('/recipe-catalog', stepsRouter);

export default recipeCatalogRouter;
