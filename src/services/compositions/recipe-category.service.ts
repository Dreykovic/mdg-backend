import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base.service';
import { Prisma, RecipeCategory } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class RecipeCategoryService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createRecipeCategory(
    data: Prisma.RecipeCategoryUncheckedCreateInput
  ): Promise<{ recipeCategory: RecipeCategory }> {
    const cleanData = data;

    const recipeCategory = await this.db.recipeCategory.create({
      data: cleanData,
    });

    return { recipeCategory };
  }

  @ServiceErrorHandler()
  async recipeCategories(
    page = 1,
    pageSize = 10,
    filters: Prisma.RecipeCategoryWhereInput = {}
  ): Promise<{
    data: RecipeCategory[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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
  }

  @ServiceErrorHandler()
  async recipeCategoriesList(): Promise<{
    recipeCategories: RecipeCategory[];
  }> {
    const recipeCategories = await this.db.recipeCategory.findMany();

    return { recipeCategories };
  }

  @ServiceErrorHandler()
  async deleteRecipeCategory(
    filter: Prisma.RecipeCategoryWhereUniqueInput
  ): Promise<boolean> {
    await this.db.recipeCategory.delete({
      where: filter,
    });

    return true;
  }
  @ServiceErrorHandler()
  async updateRecipeCategory(
    data: Prisma.RecipeCategoryUncheckedUpdateInput,
    filter: Prisma.RecipeCategoryWhereUniqueInput
  ): Promise<{ recipeCategory: RecipeCategory }> {
    const updatedRecipeCategory = await this.db.recipeCategory.update({
      where: filter,
      data,
    });

    logger.debug(
      `Category updated successfully: ${JSON.stringify(updatedRecipeCategory)}`
    );

    return { recipeCategory: updatedRecipeCategory };
  }
}
