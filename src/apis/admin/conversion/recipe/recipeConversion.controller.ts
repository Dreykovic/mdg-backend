import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import RecipeScrappingService from '@/integrations/recipe-scrapping/recipeScrapping.service';

@Service()
export class RecipeConversionController {
  constructor(
    private readonly recipeScrappingService: RecipeScrappingService
  ) {}

  async getRecipe(req: Request, res: Response): Promise<void> {
    try {
      const url = req.body.url;

      log(`Get Recipe From Site ${url} Request Received`);

      const payload = await this.recipeScrappingService.extractRecipeData(url);
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching volume conversions.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
