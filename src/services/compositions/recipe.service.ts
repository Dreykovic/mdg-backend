import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma, Recipe } from '@prisma/client';

import { Service } from 'typedi';

@Service()
export default class RecipeService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createRecipe(
    data: Prisma.RecipeUncheckedCreateInput
  ): Promise<{ recipe: Recipe }> {
    const cleanData = data;

    const recipe = await this.db.recipe.create({
      data: cleanData,
    });

    return { recipe };
  }

  @ServiceErrorHandler()
  async recipes(
    page = 1,
    pageSize = 10,
    filters: Prisma.RecipeWhereInput = {}
  ): Promise<{
    data: Recipe[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    const [total, data] = await this.db.$transaction([
      this.db.recipe.count({
        where: filters,
      }),

      this.db.recipe.findMany({
        where: filters,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  @ServiceErrorHandler()
  async recipesList(): Promise<{ recipes: Recipe[] }> {
    const recipes = await this.db.recipe.findMany();

    return { recipes };
  }

  @ServiceErrorHandler()
  async recipe(
    filters: Prisma.RecipeWhereUniqueInput
  ): Promise<{ recipe: Recipe }> {
    const recipe = await this.db.recipe.findUniqueOrThrow({
      where: filters,
      include: {
        steps: true,
        ingredients: true,
      },
    });

    return { recipe };
  }

  @ServiceErrorHandler()
  async deleteRecipe(filter: Prisma.RecipeWhereUniqueInput): Promise<boolean> {
    await this.db.recipe.delete({
      where: filter,
    });

    return true;
  }

  async updateRecipe(
    data: Prisma.RecipeUncheckedUpdateInput,
    filter: Prisma.RecipeWhereUniqueInput
  ): Promise<{ recipe: Recipe }> {
    const updatedRecipe = await this.db.recipe.update({
      where: filter,
      data,
    });

    logger.debug(
      `Recipe updated successfully: ${JSON.stringify(updatedRecipe)}`
    );

    return { recipe: updatedRecipe };
  }
}
