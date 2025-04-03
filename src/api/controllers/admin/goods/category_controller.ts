import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '../../../../core/utils/string.util';
import CategoryService from '@/services/goods/category_service';

@Service()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async categories(req: Request, res: Response): Promise<void> {
    try {
      log('Filtered List Categories Request Received');

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

      const payload = await this.categoryService.categories(
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
          'An error occurred while fetching filtered categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async categoriesList(req: Request, res: Response): Promise<void> {
    try {
      log('List Categories Request Received');

      const payload = await this.categoryService.categoriesList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      log('Create Category Request Received');

      const data = req.body;

      const payload = await this.categoryService.createCategory(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Category Request Received');

      const filter = req.body;
      const payload = await this.categoryService.deleteCategory(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      log('Update Category Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;

      const payload = await this.categoryService.updateCategory(data, filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
