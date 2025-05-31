import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import IngredientService from '@/services/compositions/ingredient.service';
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
import { IngredientSchemas } from '@/api/validators/compositions/ingredient.validator';

@Service()
@Controller('/compositions/ingredient', ['auth', 'rbac:ADMIN'])
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get('/')
  @ControllerErrorHandler()
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async ingredients(req: Request, res: Response): Promise<void> {
    log('List Ingredient Categories Request Received');

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

    const payload = await this.ingredientService.ingredients(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler()
  async ingredientsList(req: Request, res: Response): Promise<void> {
    log('List Ingredient Categories Request Received');
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
        ? JSON.parse(req.query.filters as string)
        : {};

    const allowedFields = ['recipeId', 'description', 'stepNumber'];
    const whereConditions = WhereConditionBuilder.generateWhereConditions(
      filters,
      allowedFields
    );
    const payload =
      await this.ingredientService.ingredientsList(whereConditions);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: IngredientSchemas.createIngredient,
  })
  async createIngredient(req: Request, res: Response): Promise<void> {
    log('Create Ingredient Category Request Received');

    const data = req.body;

    data.quantity = parseFloat(data.quantity);
    data.recipeId = parseInt(data.recipeId);

    data.unitOfMeasureId = parseInt(data.unitOfMeasureId);
    log(data);
    const payload = await this.ingredientService.createIngredient(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteIngredient(req: Request, res: Response): Promise<void> {
    log('Delete Ingredient Category Request Received');

    const filter = req.body;
    const payload = await this.ingredientService.deleteIngredient(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler()
  @ValidateRequest({
    params: IngredientSchemas.ingredientParam,
    body: IngredientSchemas.updateIngredient,
  })
  async updateIngredient(req: Request, res: Response): Promise<void> {
    log('Update Ingredient Category Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data = req.body;
    // data.quantity = parseFloat(data.quantity);
    // data.recipeId = parseInt(data.recipeId);

    // data.unitOfMeasureId = parseInt(data.unitOfMeasureId);
    // data.grindRequired = StringUtil.parseBool(data.grindRequired);

    const payload = await this.ingredientService.updateIngredient(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
