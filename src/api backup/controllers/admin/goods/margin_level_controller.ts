import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';

import { Service } from 'typedi';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import MarginService from '@/services/goods/margin.service';

@Service()
export class MarginController {
  constructor(private readonly marginService: MarginService) {}

  async margins(req: Request, res: Response): Promise<void> {
    try {
      log('Filtered List Margins Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};
      const allowedFields = ['name', 'margin'];

      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );
      const payload = await this.marginService.margins(
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
          'An error occurred while fetching filtered margins.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async marginList(req: Request, res: Response): Promise<void> {
    try {
      log('List Margins Request Received');

      const payload = await this.marginService.marginsList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching margins.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createMargin(req: Request, res: Response): Promise<void> {
    try {
      log('Create Margin Request Received');

      const data = req.body;
      const payload = await this.marginService.createMargin(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the margin.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteMargin(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Margin Request Received');

      const filter = req.body;
      const payload = await this.marginService.deleteMargin(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the margin.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateMargin(req: Request, res: Response): Promise<void> {
    try {
      log('Update Margin Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;

      const payload = await this.marginService.updateMargin(data, filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the margin.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
