import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import SubcategoryService from './subcategory.service';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';

@Service()
export default class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  async subcategories(req: Request, res: Response): Promise<void> {
    try {
      log('Filtered List Subcategories Request Received');

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
      const payload = await this.subcategoryService.subcategories(
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
          'An error occurred while fetching filtered subcategories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async subcategoriesList(req: Request, res: Response): Promise<void> {
    try {
      log('List Subcategories Request Received');

      const payload = await this.subcategoryService.subcategoriesList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching subcategories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createSubcategory(req: Request, res: Response): Promise<void> {
    try {
      log('Create Subcategory Request Received');

      const data = req.body;
      data.categoryId = parseInt(data.categoryId);
      const payload = await this.subcategoryService.createSubcategory(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the subcategory.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteSubcategory(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Subcategory Request Received');

      const filter = req.body;
      const payload = await this.subcategoryService.deleteSubcategory(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the subcategory.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateSubcategory(req: Request, res: Response): Promise<void> {
    try {
      log('Update Subcategory Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;
      data.categoryId = parseInt(data.categoryId);

      const payload = await this.subcategoryService.updateSubcategory(
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
          'An error occurred while updating the subcategory.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
