import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import RecipeService from '@/services/compositions/recipe_service';
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
import { RecipeSchemas } from '@/api/validators/compositions/recipe.validator';

@Service()
@Controller('/compositions/recipes', ['auth', 'rbac:ADMIN'])
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get('/')
  @ControllerErrorHandler('Error getting recipes')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async recipes(req: Request, res: Response): Promise<void> {
    log('List Recipe Categories Request Received');

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

    const payload = await this.recipeService.recipes(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/details/:modelId')
  @ControllerErrorHandler('Error getting unique recipe')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
  })
  async recipe(req: Request, res: Response): Promise<void> {
    log('Fetch unique recipe  Request Received');

    const modelIdParam = req.params.modelId;
    const recipeId = StringUtil.parseAndValidateNumber(modelIdParam);

    if (recipeId === null) {
      throw Error(
        'An error occurred while fetching unique recipe, Please provide a valid recipe Id'
      );
    }
    const filters = { id: recipeId };

    const payload = await this.recipeService.recipe(filters);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Error getting recipe categories list')
  async recipesList(_req: Request, res: Response): Promise<void> {
    log('List Recipe Categories Request Received');

    const payload = await this.recipeService.recipesList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Error creating recipe')
  @ValidateRequest({
    body: RecipeSchemas.createRecipe,
  })
  async createRecipe(req: Request, res: Response): Promise<void> {
    log('Create Recipe Category Request Received');

    const data = req.body;
    log((req as any).user);
    log(data);

    data.userId = (req as any).user.id;
    data.preparationTime = parseInt(data.preparationTime);
    data.cookingTime = parseInt(data.cookingTime);
    data.servings = parseInt(data.servings);
    log(data);
    const payload = await this.recipeService.createRecipe(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Error deleting recipe')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteRecipe(req: Request, res: Response): Promise<void> {
    log('Delete Recipe Category Request Received');

    const filter = req.body;
    const payload = await this.recipeService.deleteRecipe(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating recipe')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: RecipeSchemas.updateRecipe,
  })
  async updateRecipe(req: Request, res: Response): Promise<void> {
    log('Update Recipe Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data = req.body;
    log('this is data to update', data);
    data.userId = (req as any).user.id;

    const payload = await this.recipeService.updateRecipe(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
