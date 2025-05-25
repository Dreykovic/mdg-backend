import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import StepService from '@/services/compositions/step_service';

@Service()
export class StepController {
  constructor(private readonly stepService: StepService) {}

  async steps(req: Request, res: Response): Promise<void> {
    try {
      log('List Step Categories Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const allowedFields = ['description', 'stepNumber'];
      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );

      const payload = await this.stepService.steps(
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
          'An error occurred while fetching step categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async stepsList(req: Request, res: Response): Promise<void> {
    try {
      log('List Step Categories Request Received');
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const allowedFields = ['recipeId', 'description', 'stepNumber'];

      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );
      const payload = await this.stepService.stepsList(whereConditions);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching step categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createStep(req: Request, res: Response): Promise<void> {
    try {
      log('Create Step Category Request Received');

      const data = req.body;

      data.duration = parseInt(data.duration);
      data.stepNumber = parseInt(data.stepNumber);
      data.recipeId = parseInt(data.recipeId);

      log(data);
      const payload = await this.stepService.createStep(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the step category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteStep(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Step Category Request Received');

      const filter = req.body;
      const payload = await this.stepService.deleteStep(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the step category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateStep(req: Request, res: Response): Promise<void> {
    try {
      log('Update Step Category Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;

      data.duration = parseInt(data.duration);
      data.stepNumber = parseInt(data.stepNumber);
      data.recipeId = parseInt(data.recipeId);

      log(data);
      const payload = await this.stepService.updateStep(data, filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the step category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
