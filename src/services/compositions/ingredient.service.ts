import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class IngredientService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createIngredient(
    data: Prisma.IngredientUncheckedCreateInput
  ): Promise<{ ingredient: any }> {
    const cleanData = data;

    const ingredient = await this.db.ingredient.create({
      data: cleanData,
    });

    return { ingredient };
  }

  @ServiceErrorHandler()
  async ingredients(
    page = 1,
    pageSize = 10,
    filters: Prisma.IngredientWhereInput = {}
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;

    const [total, data] = await this.db.$transaction([
      this.db.ingredient.count({
        where: filters,
      }),

      this.db.ingredient.findMany({
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
  async ingredientsList(
    filters: Prisma.IngredientWhereInput = {}
  ): Promise<{ ingredients: any[] }> {
    const ingredients = await this.db.ingredient.findMany({
      where: filters,
      include: {
        product: true,
        unitOfMeasure: true,
      },
    });

    return { ingredients };
  }

  @ServiceErrorHandler()
  async deleteIngredient(
    filter: Prisma.IngredientWhereUniqueInput
  ): Promise<boolean> {
    await this.db.ingredient.delete({
      where: filter,
    });

    return true;
  }

  @ServiceErrorHandler()
  async updateIngredient(
    data: Prisma.IngredientUncheckedUpdateInput,
    filter: Prisma.IngredientWhereUniqueInput
  ): Promise<{ ingredient: any }> {
    const updatedIngredient = await this.db.ingredient.update({
      where: filter,
      data,
    });

    logger.debug(
      `Category updated successfully: ${JSON.stringify(updatedIngredient)}`
    );

    return { ingredient: updatedIngredient };
  }
}
