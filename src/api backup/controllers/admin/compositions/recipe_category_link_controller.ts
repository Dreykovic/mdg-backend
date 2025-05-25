import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import RecipeCategoryLinkService from '@/services/compositions/recipe_category_link_service';

@Service()
export class RecipeCategoryLinkController {
  constructor(
    private readonly recipeCategoryLinkService: RecipeCategoryLinkService
  ) {}

  async recipeCategoryLinks(req: Request, res: Response): Promise<void> {
    try {
      log('List RecipeCategoryLink Categories Request Received');

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

      const payload = await this.recipeCategoryLinkService.recipeCategoryLinks(
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
          'An error occurred while fetching recipeCategoryLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async recipeCategoryLinksList(req: Request, res: Response): Promise<void> {
    try {
      log('List RecipeCategoryLink Categories Request Received');

      const payload =
        await this.recipeCategoryLinkService.recipeCategoryLinksList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recipeCategoryLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createRecipeCategoryLink(req: Request, res: Response): Promise<void> {
    try {
      log('Create RecipeCategoryLink Category Request Received');

      const data = req.body;

      data.categoryId = parseInt(data.categoryId);
      data.recipeId = parseInt(data.recipeId);

      const payload =
        await this.recipeCategoryLinkService.createRecipeCategoryLink(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the recipeCategoryLink category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteRecipeCategoryLink(req: Request, res: Response): Promise<void> {
    try {
      log('Delete RecipeCategoryLink Category Request Received');

      const filter = req.body;
      const payload =
        await this.recipeCategoryLinkService.deleteRecipeCategoryLink(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the recipeCategoryLink category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateRecipeCategoryLink(req: Request, res: Response): Promise<void> {
    try {
      log('Update RecipeCategoryLink Category Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;

      data.categoryId = parseInt(data.categoryId);
      data.recipeId = parseInt(data.recipeId);
      const payload =
        await this.recipeCategoryLinkService.updateRecipeCategoryLink(
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
          'An error occurred while updating the recipeCategoryLink category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
