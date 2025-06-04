import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import { Prisma } from '@prisma/client';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import RecipeCategoryService from '@/services/compositions/recipe-category.service';
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
import { CategorySchemas } from '@/api/validators/category.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/compositions/recipe-categories', ['auth', 'rbac:ADMIN'])
export class RecipeCategoryController {
  constructor(private readonly recipeCategoryService: RecipeCategoryService) {}

  @Get('/')
  @ControllerErrorHandler('Failed to fetch recipe categories.')
  @ValidateRequest({ query: CommonSchemas.getEntities })
  async recipeCategories(req: Request, res: Response): Promise<void> {
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

    const payload = await this.recipeCategoryService.recipeCategories(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Failed to fetch recipe categories list.')
  async recipeCategoriesList(req: Request, res: Response): Promise<void> {
    logger.debug('List Recipe Categories Request Received');

    const payload = await this.recipeCategoryService.recipeCategoriesList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Failed to create recipe category.')
  @ValidateRequest({
    body: CategorySchemas.createCategory,
  })
  async createRecipeCategory(req: Request, res: Response): Promise<void> {
    logger.debug('Create Recipe Category Request Received');

    const data = req.body;

    const payload = await this.recipeCategoryService.createRecipeCategory(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Failed to delete recipe category.')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteRecipeCategory(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Recipe Category Request Received');

    const filter = req.body;
    const payload =
      await this.recipeCategoryService.deleteRecipeCategory(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Failed to update recipe category.')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: CategorySchemas.updateCategory,
  })
  async updateRecipeCategory(req: Request, res: Response): Promise<void> {
    logger.debug('Update Recipe Category Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data: Prisma.RecipeCategoryUpdateInput = req.body;

    const payload = await this.recipeCategoryService.updateRecipeCategory(
      data,
      filter
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
