import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import OriginService from '@/services/goods/origin.service';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import {
  CreateOriginRequest,
  OriginSchemas,
} from '@/api/validators/goods/origin.validator';
import logger from '@/core/utils/logger.util';
import { CommonSchemas } from '@/api/validators/shared/common.validator';

@Service()
@Controller('/goods/origins', ['auth', 'rbac:ADMIN'])
export class OriginController {
  constructor(private readonly originService: OriginService) {}

  /**
   * Retrieves a paginated and filtered list of origins.
   *
   * @param {Request} req - The HTTP request object containing pagination and filter parameters.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with paginated origins data.
   */
  @Get('/')
  @ControllerErrorHandler('Error fetching origins.')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async origins(req: Request, res: Response): Promise<void> {
    logger.debug('Filtered List Origins Request Received');

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
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
  }

  /**
   * Retrieves a complete list of all origins without pagination.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with all origins data.
   */
  @Get('/list')
  @ControllerErrorHandler('Error fetching origins list.')
  async originsList(_req: Request, res: Response): Promise<void> {
    logger.debug('List Origins Request Received');

    const payload = await this.originService.originsList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Creates a new origin.
   *
   * @param {Request} req - The HTTP request object containing origin data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the created origin data.
   */
  @Post('/save')
  @ControllerErrorHandler('Error creating origin.')
  @ValidateRequest({
    body: OriginSchemas.createOrigin,
  })
  async createOrigin(req: Request, res: Response): Promise<void> {
    logger.debug('Create Origin Request Received');

    const data: CreateOriginRequest = req.body;
    const payload = await this.originService.createOrigin(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Deletes an origin based on provided filter criteria.
   *
   * @param {Request} req - The HTTP request object containing deletion criteria in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the origin is successfully deleted.
   */
  @Delete('/delete')
  @ControllerErrorHandler('Error deleting origin.')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteOrigin(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Origin Request Received');

    const filter = req.body;
    const payload = await this.originService.deleteOrigin(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Updates an existing origin by ID.
   *
   * @param {Request} req - The HTTP request object containing the origin ID in params and update data in body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the updated origin data.
   */
  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating origin.')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: OriginSchemas.updateOrigin,
  })
  async updateOrigin(req: Request, res: Response): Promise<void> {
    logger.debug('Update Origin Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw new Error('Invalid modelId parameter');
    }

    const filter = { id };
    const data = req.body;

    const payload = await this.originService.updateOrigin(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
