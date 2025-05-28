import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';

import { Service } from 'typedi';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import MarginService from '@/services/goods/margin_level_service';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/goods/margins', ['auth', 'rbac:ADMIN'])
export class MarginController {
  constructor(private readonly marginService: MarginService) {}

  @Get('/')
  @ControllerErrorHandler('Failed to fetch margins.')
  async margins(req: Request, res: Response): Promise<void> {
    logger.debug('Filtered List Margins Request Received');

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
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
  }

  @Get('/list')
  @ControllerErrorHandler('Failed to fetch margins list.')
  async marginList(req: Request, res: Response): Promise<void> {
    logger.debug('List Margins Request Received');

    const payload = await this.marginService.marginsList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Failed to create margin.')
  async createMargin(req: Request, res: Response): Promise<void> {
    logger.debug('Create Margin Request Received');

    const data = req.body;
    const payload = await this.marginService.createMargin(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Failed to delete margin.')
  async deleteMargin(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Margin Request Received');

    const filter = req.body;
    const payload = await this.marginService.deleteMargin(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Failed to update margin.')
  async updateMargin(req: Request, res: Response): Promise<void> {
    logger.debug('Update Margin Request Received');

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
  }
}
