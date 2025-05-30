import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import StepService from '@/services/compositions/step.service';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import { CommonSchemas } from '@/api/validators/shared/common.validator';
import { StepSchemas } from '@/api/validators/compositions/step.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/compositions/steps', ['auth', 'rbac:ADMIN'])
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Get('/')
  @ControllerErrorHandler('Error getting steps')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async steps(req: Request, res: Response): Promise<void> {
    logger.debug('List Step Categories Request Received');

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
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
  }
  // TODO: Create a validator for this endpoint
  @Get('/list')
  @ControllerErrorHandler('Error getting steps list')
  async stepsList(req: Request, res: Response): Promise<void> {
    logger.debug('List Step Categories Request Received');
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
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
  }

  @Post('/save')
  @ControllerErrorHandler('Error creating step category')
  @ValidateRequest({
    body: StepSchemas.createStep,
  })
  async createStep(req: Request, res: Response): Promise<void> {
    logger.debug('Create Step Category Request Received');

    const data = req.body;

    data.duration = parseInt(data.duration);
    data.stepNumber = parseInt(data.stepNumber);
    data.recipeId = parseInt(data.recipeId);

    logger.debug(data);
    const payload = await this.stepService.createStep(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Error deleting step category')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteStep(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Step Category Request Received');

    const filter = req.body;
    const payload = await this.stepService.deleteStep(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating step category')
  @ValidateRequest({
    body: StepSchemas.updateStep,
    params: CommonSchemas.entityNumberParam,
  })
  async updateStep(req: Request, res: Response): Promise<void> {
    logger.debug('Update Step Category Request Received');

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

    logger.debug(data);
    const payload = await this.stepService.updateStep(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
