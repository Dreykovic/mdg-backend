import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import IngredientService from '@/services/compositions/ingredient.service';

@Service()
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  async ingredients(req: Request, res: Response): Promise<void> {
    try {
      log('List Ingredient Categories Request Received');

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

      const payload = await this.ingredientService.ingredients(
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
          'An error occurred while fetching ingredient categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async ingredientsList(req: Request, res: Response): Promise<void> {
    try {
      log('List Ingredient Categories Request Received');
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const allowedFields = ['recipeId', 'description', 'stepNumber'];
      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );
      const payload =
        await this.ingredientService.ingredientsList(whereConditions);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching ingredient categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createIngredient(req: Request, res: Response): Promise<void> {
    try {
      log('Create Ingredient Category Request Received');

      const data = req.body;

      data.quantity = parseFloat(data.quantity);
      data.recipeId = parseInt(data.recipeId);

      data.unitOfMeasureId = parseInt(data.unitOfMeasureId);
      log(data);
      const payload = await this.ingredientService.createIngredient(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the ingredient category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteIngredient(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Ingredient Category Request Received');

      const filter = req.body;
      const payload = await this.ingredientService.deleteIngredient(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the ingredient category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateIngredient(req: Request, res: Response): Promise<void> {
    try {
      log('Update Ingredient Category Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;
      data.quantity = parseFloat(data.quantity);
      data.recipeId = parseInt(data.recipeId);

      data.unitOfMeasureId = parseInt(data.unitOfMeasureId);
      data.grindRequired = StringUtil.parseBool(data.grindRequired);

      const payload = await this.ingredientService.updateIngredient(
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
          'An error occurred while updating the ingredient category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
