import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
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
    page: number = 1,
    pageSize: number = 10,
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

      log(`Category updated successfully: ${JSON.stringify(updatedRecipe)}`);

      return { recipe: updatedRecipe };
    } catch (error) {
      log(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
