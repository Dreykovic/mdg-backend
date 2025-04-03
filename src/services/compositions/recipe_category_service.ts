import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class RecipeCategoryService extends ServiceDefinition {
  async createRecipeCategory(data: Prisma.RecipeCategoryUncheckedCreateInput) {
    try {
      const cleanData = data;

      const recipeCategory = await this.db.recipeCategory.create({
        data: cleanData,
      });

      return { recipeCategory };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recipeCategories(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.RecipeCategoryWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.recipeCategory.count({
          where: filters,
        }),

        this.db.recipeCategory.findMany({
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

  async recipeCategoriesList() {
    try {
      const recipeCategories = await this.db.recipeCategory.findMany();

      return { recipeCategories };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteRecipeCategory(filter: Prisma.RecipeCategoryWhereUniqueInput) {
    try {
      await this.db.recipeCategory.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRecipeCategory(
    data: Prisma.RecipeCategoryUncheckedUpdateInput,
    filter: Prisma.RecipeCategoryWhereUniqueInput
  ) {
    try {
      const updatedRecipeCategory = await this.db.recipeCategory.update({
        where: filter,
        data,
      });

      log(
        `Category updated successfully: ${JSON.stringify(updatedRecipeCategory)}`
      );

      return { recipeCategory: updatedRecipeCategory };
    } catch (error) {
      log(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
