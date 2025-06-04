import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import { Prisma } from '@prisma/client';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import ProductTagService from '@/services/goods/product-tag.service';
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
import logger from '@/core/utils/logger.util';
import { CategorySchemas } from '@/api/validators/category.validator';

@Service()
@Controller('/goods/tags', ['auth', 'rbac:ADMIN'])
export class ProductTagController {
  constructor(private readonly productTagService: ProductTagService) {}

  @Get('/')
  @ControllerErrorHandler('Error fetching product tags.')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async productTags(req: Request, res: Response): Promise<void> {
    logger.debug('List Recipe Categories Request Received');

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
        ? JSON.parse(req.query.filters as string)
        : {};
    const allowedFields = ['name'];
    const whereConditions = WhereConditionBuilder.generateWhereConditions(
      filters,
      allowedFields
    );

    const payload = await this.productTagService.productTags(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Error fetching product tags list.')
  async productTagsList(_req: Request, res: Response): Promise<void> {
    logger.debug('List Recipe Categories Request Received');

    const payload = await this.productTagService.productTagsList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Error creating product tag.')
  @ValidateRequest({
    body: CategorySchemas.createCategory,
  })
  async createProductTag(req: Request, res: Response): Promise<void> {
    logger.debug('Create Product Tag Request Received');

    const data = req.body;
    logger.debug(data);
    const payload = await this.productTagService.createProductTag(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Error deleting product tag.')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteProductTag(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Product Tag Request Received');

    const filter = req.body;
    const payload = await this.productTagService.deleteProductTag(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating product tag.')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: CategorySchemas.updateCategory,
  })
  async updateProductTag(req: Request, res: Response): Promise<void> {
    logger.debug('Update Product Tag Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data: Prisma.ProductTagUpdateInput = req.body;

    const payload = await this.productTagService.updateProductTag(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
