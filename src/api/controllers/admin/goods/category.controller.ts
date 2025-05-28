import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import CategoryService from '@/services/goods/category_service';
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
@Controller('/goods/categories', ['auth', 'rbac:ADMIN'])
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  @ControllerErrorHandler('Failed to fetch categories.')
  async categories(req: Request, res: Response): Promise<void> {
    logger.debug('Filtered List Categories Request Received');

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
        ? JSON.parse(req.query.filters as string)
        : {};

    const allowedFields = ['name'];

    const whereConditions = WhereConditionBuilder.generateWhereConditions(
      filters,
      allowedFields
    );

    const payload = await this.categoryService.categories(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Failed to fetch categories list.')
  async categoriesList(req: Request, res: Response): Promise<void> {
    logger.debug('List Categories Request Received');

    const payload = await this.categoryService.categoriesList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Failed to create category.')
  async createCategory(req: Request, res: Response): Promise<void> {
    logger.debug('Create Category Request Received');

    const data = req.body;

    const payload = await this.categoryService.createCategory(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Failed to delete category.')
  async deleteCategory(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Category Request Received');

    const filter = req.body;
    const payload = await this.categoryService.deleteCategory(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Failed to update category.')
  async updateCategory(req: Request, res: Response): Promise<void> {
    logger.debug('Update Category Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data = req.body;

    const payload = await this.categoryService.updateCategory(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
