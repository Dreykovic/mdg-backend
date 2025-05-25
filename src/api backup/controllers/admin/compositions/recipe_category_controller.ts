import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import { Prisma } from '@prisma/client';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import RecipeCategoryService from '@/services/compositions/recipe_category_service';

@Service()
export class RecipeCategoryController {
  constructor(private readonly recipeCategoryService: RecipeCategoryService) {}

  async recipeCategories(req: Request, res: Response): Promise<void> {
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

      const payload = await this.recipeCategoryService.recipeCategories(
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

  async recipeCategoriesList(req: Request, res: Response): Promise<void> {
    try {
      log('List Recipe Categories Request Received');

      const payload = await this.recipeCategoryService.recipeCategoriesList();

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

  async createRecipeCategory(req: Request, res: Response): Promise<void> {
    try {
      log('Create Recipe Category Request Received');

      const data = req.body;

      const payload =
        await this.recipeCategoryService.createRecipeCategory(data);

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

  async deleteRecipeCategory(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Recipe Category Request Received');

      const filter = req.body;
      const payload =
        await this.recipeCategoryService.deleteRecipeCategory(filter);

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

  async updateRecipeCategory(req: Request, res: Response): Promise<void> {
    try {
      log('Update Recipe Category Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data: Prisma.RecipeCategoryUpdateInput = req.body;

      const payload = await this.recipeCategoryService.updateRecipeCategory(
        data,
        filter
      );

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the recipe category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
