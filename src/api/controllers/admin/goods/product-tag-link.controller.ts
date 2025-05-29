import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import ProductTagLinkService from '@/services/goods/product-tag-link.service';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { CommonSchemas } from '@/api/validators/shared/common.validator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import logger from '@/core/utils/logger.util';
import { ProductTagLinkSchemas } from '@/api/validators/goods/product-tag-link.validator';

@Service()
@Controller('/goods/product-tag-links', ['auth', 'rbac:ADMIN'])
export class ProductTagLinkController {
  constructor(private readonly productTagLinkService: ProductTagLinkService) {}

  @Get('/')
  @ControllerErrorHandler('Error fetching product tag links.')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async productTagLinks(req: Request, res: Response): Promise<void> {
    logger.debug('List ProductTagLink  Request Received');

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

    const payload = await this.productTagLinkService.productTagLinks(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Error fetching product tag links list.')
  async tagLinksList(req: Request, res: Response): Promise<void> {
    logger.debug('List TagLink  Request Received');

    const payload = await this.productTagLinkService.tagLinksList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list/:modelId')
  @ControllerErrorHandler(
    'Error fetching product tag links list by product ID.'
  )
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
  })
  async productTagLinksList(req: Request, res: Response): Promise<void> {
    logger.debug('List ProductTagLink  Request Received');
    const productId = req.params.modelId;
    if (productId === null || productId === undefined || productId === '') {
      throw Error('Product Id is required to fetch tag links');
    }
    const payload =
      await this.productTagLinkService.productTagLinksList(productId);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Error creating product tag link.')
  @ValidateRequest({
    body: ProductTagLinkSchemas.createProductTagLink,
  })
  async createProductTagLink(req: Request, res: Response): Promise<void> {
    logger.debug('Create ProductTagLink  Request Received');

    const data = req.body;
    logger.debug('data received ', data);
    data.productTagId = parseInt(data.productTagId);

    const payload = await this.productTagLinkService.createProductTagLink(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Error deleting product tag link.')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteProductTagLink(req: Request, res: Response): Promise<void> {
    logger.debug('Delete ProductTagLink  Request Received');

    const filter = req.body;
    const payload =
      await this.productTagLinkService.deleteProductTagLink(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating product tag link.')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: ProductTagLinkSchemas.createProductTagLink,
  })
  async updateProductTagLink(req: Request, res: Response): Promise<void> {
    logger.debug('Update ProductTagLink  Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data = req.body;

    data.productTagId = parseInt(data.productTagId);

    const payload = await this.productTagLinkService.updateProductTagLink(
      data,
      filter
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
