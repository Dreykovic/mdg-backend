import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';

import { Service } from 'typedi';

@Service()
export default class RecipeService extends ServiceDefinition {
  async createRecipe(data: Prisma.RecipeUncheckedCreateInput) {
    try {
      const cleanData = data;

      const recipe = await this.db.recipe.create({
        data: cleanData,
      });

      return { recipe };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recipes(
    page = 1,
    pageSize = 10,
    filters: Prisma.RecipeWhereInput = {}
  ) {
    try {
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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recipesList() {
    try {
      const recipes = await this.db.recipe.findMany();

      return { recipes };
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async recipe(filters: Prisma.RecipeWhereUniqueInput) {
    try {
      const recipe = await this.db.recipe.findUniqueOrThrow({
        where: filters,
        include: {
          steps: true,
          ingredients: true,
        },
      });

      return { recipe };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteRecipe(filter: Prisma.RecipeWhereUniqueInput) {
    try {
      await this.db.recipe.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRecipe(
    data: Prisma.RecipeUncheckedUpdateInput,
    filter: Prisma.RecipeWhereUniqueInput
  ) {
    try {
      const updatedRecipe = await this.db.recipe.update({
        where: filter,
        data,
      });

      logger.debug(
        `Recipe updated successfully: ${JSON.stringify(updatedRecipe)}`
      );

      return { recipe: updatedRecipe };
    } catch (error) {
      logger.debug(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
