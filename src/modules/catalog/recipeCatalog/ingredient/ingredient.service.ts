import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class IngredientService extends ServiceDefinition {
  async createIngredient(data: Prisma.IngredientUncheckedCreateInput) {
    try {
      const cleanData = data;

      const ingredient = await this.db.ingredient.create({
        data: cleanData,
      });

      return { ingredient };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async ingredients(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.IngredientWhereInput = {}
  ) {
    try {
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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async ingredientsList(filters: Prisma.IngredientWhereInput = {}) {
    try {
      const ingredients = await this.db.ingredient.findMany({
        where: filters,
        include: {
          product: true,
          unitOfMeasure: true,
        },
      });

      return { ingredients };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteIngredient(filter: Prisma.IngredientWhereUniqueInput) {
    try {
      await this.db.ingredient.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateIngredient(
    data: Prisma.IngredientUncheckedUpdateInput,
    filter: Prisma.IngredientWhereUniqueInput
  ) {
    try {
      const updatedIngredient = await this.db.ingredient.update({
        where: filter,
        data,
      });

      log(
        `Category updated successfully: ${JSON.stringify(updatedIngredient)}`
      );

      return { ingredient: updatedIngredient };
    } catch (error) {
      log(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
