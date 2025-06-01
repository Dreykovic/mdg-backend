import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import RecipeCategoryLinkService from '@/services/compositions/recipe-category-link.service';
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
import { RecipeCategoryLinkSchemas } from '@/api/validators/compositions/recipe-category-link.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/compositions/category-links', ['auth', 'rbac:ADMIN'])
export class RecipeCategoryLinkController {
  constructor(
    private readonly recipeCategoryLinkService: RecipeCategoryLinkService
  ) {}

  @Get('/')
  @ControllerErrorHandler()
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async recipeCategoryLinks(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('List RecipeCategoryLink Categories Request Received');

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

      const payload = await this.recipeCategoryLinkService.recipeCategoryLinks(
        page,
        pageSize,
        whereConditions
      );

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      logger.debug(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recipeCategoryLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  @Get('/list')
  @ControllerErrorHandler()
  async recipeCategoryLinksList(req: Request, res: Response): Promise<void> {
    try {
      logger.debug('List RecipeCategoryLink Categories Request Received');

      const payload =
        await this.recipeCategoryLinkService.recipeCategoryLinksList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      logger.debug(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recipeCategoryLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  @Post('/save')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: RecipeCategoryLinkSchemas.createRecipeCategoryLink,
  })
  async createRecipeCategoryLink(req: Request, res: Response): Promise<void> {
    logger.debug('Create RecipeCategoryLink Category Request Received');

    const data = req.body;

    data.categoryId = parseInt(data.categoryId);
    data.recipeId = parseInt(data.recipeId);

    const payload =
      await this.recipeCategoryLinkService.createRecipeCategoryLink(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteRecipeCategoryLink(req: Request, res: Response): Promise<void> {
    logger.debug('Delete RecipeCategoryLink Category Request Received');

    const filter = req.body;
    const payload =
      await this.recipeCategoryLinkService.deleteRecipeCategoryLink(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler()
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: RecipeCategoryLinkSchemas.createRecipeCategoryLink,
  })
  async updateRecipeCategoryLink(req: Request, res: Response): Promise<void> {
    logger.debug('Update RecipeCategoryLink Category Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data = req.body;

    data.categoryId = parseInt(data.categoryId);
    data.recipeId = parseInt(data.recipeId);
    const payload =
      await this.recipeCategoryLinkService.updateRecipeCategoryLink(
        data,
        filter
      );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
