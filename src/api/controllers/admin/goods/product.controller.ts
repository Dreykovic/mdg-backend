import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import StringUtil from '@/core/utils/string.util';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import ProductService from '@/services/goods/product.service';
import logger from '@/core/utils/logger.util';
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
import { ProductSchemas } from '@/api/validators/goods/product.validator';

@Service()
@Controller('/goods/products', ['auth', 'rbac:ADMIN'])
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/')
  @ControllerErrorHandler('Error fetching products.')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async products(req: Request, res: Response): Promise<void> {
    logger.debug('List product  Request Received');

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
        ? JSON.parse(req.query.filters as string)
        : {};

    const allowedFields = ['name', 'description'];

    const whereConditions = WhereConditionBuilder.generateWhereConditions(
      filters,
      allowedFields
    );
    const payload = await this.productService.products(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/details/:modelId')
  @ControllerErrorHandler('Error fetching unique product.')
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
  })
  async product(req: Request, res: Response): Promise<void> {
    logger.debug('Fetch unique product  Request Received');

    const productId = req.params.modelId;
    if (productId === null || productId === undefined || productId === '') {
      const response = ApiResponse.http400({
        message:
          'An error occurred while fetching unique product, Please provide a valid product Id',
      });
      res.status(response.httpStatusCode).json(response.data);
      return;
    }
    const filters = { id: productId };

    const payload = await this.productService.product(filters);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Error fetching filtered products list.')
  async productsList(req: Request, res: Response): Promise<void> {
    logger.debug('Filtered List product  Request Received');

    const payload = await this.productService.productsList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Error creating product.')
  @ValidateRequest({
    body: ProductSchemas.createProduct,
  })
  async createProduct(req: Request, res: Response): Promise<void> {
    logger.debug('Create product Request Received');

    const data = req.body;
    logger.debug('data received to create a product before casting', data);

    data.isActive = StringUtil.parseBool(req.body.isActive);
    data.isGlutenFree = StringUtil.parseBool(req.body.isGlutenFree);
    data.isGMOFree = StringUtil.parseBool(req.body.isGMOFree);
    data.costPerGramGround = parseFloat(req.body.costPerGramGround);
    data.costPerGramWhole = parseFloat(req.body.costPerGramWhole);
    data.categoryId = parseFloat(req.body.categoryId);
    data.marginLevelId = parseFloat(req.body.marginLevelId);
    data.supplierId = parseFloat(req.body.supplierId);
    data.originId = parseFloat(req.body.originId);
    data.subcategoryId =
      req.body.subcategoryId !== undefined && req.body.subcategoryId !== null
        ? parseFloat(req.body.subcategoryId)
        : null;
    logger.debug('data received to create a product', data);
    const payload = await this.productService.createProduct(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Error deleting product.')
  @ValidateRequest({
    body: CommonSchemas.enntityWithStringId,
  })
  async deleteProduct(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Product Request Received');

    const filter = req.body;
    const payload = await this.productService.deleteProduct(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating product.')
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
    body: ProductSchemas.updateProduct,
  })
  async updateProduct(req: Request, res: Response): Promise<void> {
    logger.debug('Update product Def Request Received');

    const id = req.params.modelId;
    const filter = id !== null && id !== undefined && id !== '' ? { id } : null;
    if (filter === null) {
      throw Error('Invalid modelId provided');
    }
    const data = req.body;

    const payload = await this.productService.updateProduct(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
