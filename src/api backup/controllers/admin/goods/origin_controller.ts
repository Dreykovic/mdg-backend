import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import OriginService from '@/services/goods/origin_service';

@Service()
export class OriginController {
  constructor(private readonly originService: OriginService) {}

  async origins(req: Request, res: Response): Promise<void> {
    try {
      log(' Filtered List Origins Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const allowedFields = ['country'];

      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );
      const payload = await this.originService.origins(
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
          'An error occurred while fetching filtered origins.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async originsList(req: Request, res: Response): Promise<void> {
    try {
      log('List Origins Request Received');

      const payload = await this.originService.originsList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching origins.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createOrigin(req: Request, res: Response): Promise<void> {
    try {
      log('Create Origin Request Received');

      const data = req.body;
      const payload = await this.originService.createOrigin(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the origin.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteOrigin(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Origin Request Received');

      const filter = req.body;
      const payload = await this.originService.deleteOrigin(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the origin.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateOrigin(req: Request, res: Response): Promise<void> {
    try {
      log('Update Origin Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;

      const payload = await this.originService.updateOrigin(data, filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the origin.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
