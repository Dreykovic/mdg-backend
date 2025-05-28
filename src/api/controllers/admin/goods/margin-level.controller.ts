import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import MarginService from '@/services/goods/margin-level.service';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.dacorator';
import { MarginSchemas } from '@/api/validators/goods/margin.validator';
import logger from '@/core/utils/logger.util';
import { CommonSchemas } from '@/api/validators/shared/common.validator';

@Service()
@Controller('/goods/margins', ['auth', 'rbac:ADMIN'])
export class MarginController {
  constructor(private readonly marginService: MarginService) {}

  /**
   * Retrieves a paginated and filtered list of margins.
   *
   * @param {Request} req - The HTTP request object containing pagination and filter parameters.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with paginated margins data.
   */
  @Get('/')
  @ControllerErrorHandler('Failed to fetch margins.')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async margins(req: Request, res: Response): Promise<void> {
    logger.debug('Filtered List Margins Request Received');

    const { page, pageSize, filters } = req.query as any;
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
  }

  /**
   * Retrieves a complete list of all margins without pagination.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with all margins data.
   */
  @Get('/list')
  @ControllerErrorHandler('Failed to fetch margins list.')
  async marginList(req: Request, res: Response): Promise<void> {
    logger.debug('List Margins Request Received');

    const payload = await this.marginService.marginsList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Creates a new margin.
   *
   * @param {Request} req - The HTTP request object containing margin data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the created margin data.
   */
  @Post('/')
  @ControllerErrorHandler('Failed to create margin.')
  @ValidateRequest({
    body: MarginSchemas.createMargin,
  })
  async createMargin(req: Request, res: Response): Promise<void> {
    logger.debug('Create Margin Request Received');

    const data = req.body;
    const payload = await this.marginService.createMargin(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Deletes a margin based on provided filter criteria.
   *
   * @param {Request} req - The HTTP request object containing deletion criteria in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the margin is successfully deleted.
   */
  @Delete('/')
  @ControllerErrorHandler('Failed to delete margin.')
  @ValidateRequest({
    body: CommonSchemas.deleteEntityWithNumberId,
  })
  async deleteMargin(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Margin Request Received');

    const filter = req.body;
    const payload = await this.marginService.deleteMargin(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Updates an existing margin by ID.
   *
   * @param {Request} req - The HTTP request object containing the margin ID in params and update data in body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the updated margin data.
   */
  @Put('/:modelId')
  @ControllerErrorHandler('Failed to update margin.')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: MarginSchemas.updateMargin,
  })
  async updateMargin(req: Request, res: Response): Promise<void> {
    logger.debug('Update Margin Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw new Error('Invalid modelId parameter');
    }

    const filter = { id };
    const data = req.body;

    const payload = await this.marginService.updateMargin(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
