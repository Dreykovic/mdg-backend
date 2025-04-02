import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import RecipeService from './recipe.service';
import StringUtil from '@/core/utils/string.util';

@Service()
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  async recipes(req: Request, res: Response): Promise<void> {
    try {
      log('List Recipe Categories Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};
      const allowedFields = ['name'];

      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );

      const payload = await this.recipeService.recipes(
        page,
        pageSize,
        whereConditions
      );

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recipe categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  async recipe(req: Request, res: Response): Promise<void> {
    try {
      log('Fetch unique recipe  Request Received');

      const modelIdParam = req.params.modelId;
      const recipeId = StringUtil.parseAndValidateNumber(modelIdParam);

      if (recipeId === null) {
        throw Error(
          'An error occurred while fetching unique recipe, Please provide a valid recipe Id'
        );
      }
      const filters = { id: recipeId };

      const payload = await this.recipeService.recipe(filters);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http404({
        message:
          (error as Error).message ||
          'An error occurred while fetching filtered products',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  async recipesList(req: Request, res: Response): Promise<void> {
    try {
      log('List Recipe Categories Request Received');

      const payload = await this.recipeService.recipesList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recipe categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createRecipe(req: Request, res: Response): Promise<void> {
    try {
      log('Create Recipe Category Request Received');

      const data = req.body;
      log((req as any).user);
      log(data);

      data.userId = (req as any).user.id;
      data.preparationTime = parseInt(data.preparationTime);
      data.cookingTime = parseInt(data.cookingTime);
      data.servings = parseInt(data.servings);
      log(data);
      const payload = await this.recipeService.createRecipe(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the recipe category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Recipe Category Request Received');

      const filter = req.body;
      const payload = await this.recipeService.deleteRecipe(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the recipe category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateRecipe(req: Request, res: Response): Promise<void> {
    try {
      log('Update Recipe Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;
      log('this is data to update', data);
      data.userId = (req as any).user.id;
      data.preparationTime = req.body.preparationTime
        ? parseInt(data.preparationTime)
        : undefined;
      data.cookingTime = req.body.cookingTime
        ? parseInt(data.cookingTime)
        : undefined;
      data.isApproved = req.body.isApproved
        ? StringUtil.parseBool(data.isApproved)
        : undefined;
      data.isPromoAwarded = req.body.isPromoAwarded
        ? StringUtil.parseBool(data.isPromoAwarded)
        : undefined;
      data.servings = req.body.servings ? parseInt(data.servings) : undefined;

      const payload = await this.recipeService.updateRecipe(data, filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error: any) {
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the recipe category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
