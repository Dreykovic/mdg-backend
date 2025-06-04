import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import RecipeScrappingService from '@/integrations/recipe-scrapping/service';
import { Controller, Get } from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import { z } from 'zod';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/conversion/recipe')
export class RecipeConversionController {
  constructor(
    private readonly recipeScrappingService: RecipeScrappingService
  ) {}

  @Get('/')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: z.object({
      url: z.string().url(),
    }),
  })
  async getRecipe(req: Request, res: Response): Promise<void> {
    const { url } = req.body;

    logger.debug(`Get Recipe From Site ${url} Request Received`);

    const payload = await this.recipeScrappingService.extractRecipeData(url);
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
