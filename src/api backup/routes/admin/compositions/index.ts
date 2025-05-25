import express from 'express';
import recipeCategoriesRouter from './recipe_category_routes';
import recipeCategoryLinksRouter from './recipe_category_link';
import ingredientsRouter from './ingredient_routes';
import stepsRouter from './step_routes';
import recipesRouter from './recipe_routes';

const compositionRouter = express.Router();

compositionRouter.use('/compositions', recipeCategoriesRouter);
compositionRouter.use('/compositions', recipesRouter);
compositionRouter.use('/compositions', recipeCategoryLinksRouter);
compositionRouter.use('/compositions', ingredientsRouter);
compositionRouter.use('/compositions', stepsRouter);

export default compositionRouter;
