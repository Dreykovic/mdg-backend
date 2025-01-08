import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';

import { log } from 'console';

import { Service } from 'typedi';

@Service()
export default class SubcategoryService extends ServiceDefinition {
  async createSubcategory(data: Prisma.ProductSubcategoryUncheckedCreateInput) {
    try {
      const cleanData = data;

      const subcategory = await this.db.productSubcategory.create({
        data: cleanData,
      });
      log('Created Sub Category', cleanData);

      return { subcategory };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async subcategories(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.ProductSubcategoryWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.productSubcategory.count({
          where: filters,
        }),

        this.db.productSubcategory.findMany({
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
      // Handle query errors
      throw this.handleError(error);
    }
  }

  async subcategoriesList() {
    try {
      const subcategories = await this.db.productSubcategory.findMany();

      return { subcategories };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSubcategory(filter: Prisma.ProductSubcategoryWhereUniqueInput) {
    try {
      await this.db.productSubcategory.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSubcategory(
    data: Prisma.ProductSubcategoryUncheckedUpdateInput,
    filter: Prisma.ProductSubcategoryWhereUniqueInput
  ) {
    try {
      // Update the subcategory in the database
      const updatedSubcategory = await this.db.productSubcategory.update({
        where: filter,
        data,
      });

      log(
        `Sub Category updated successfully: ${JSON.stringify(updatedSubcategory)}`
      );

      return { category: updatedSubcategory };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
