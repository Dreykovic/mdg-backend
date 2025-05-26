import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class CategoryService extends ServiceDefinition {
  async createCategory(data: Prisma.ProductCategoryUncheckedCreateInput) {
    try {
      const cleanData = data;

      const category = await this.db.productCategory.create({
        data: cleanData,
      });
      log('Created Product Category : ', category);
      return { category };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async categories(
    page = 1,
    pageSize = 10,
    filters: Prisma.ProductCategoryWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.productCategory.count({
          where: filters,
        }),

        this.db.productCategory.findMany({
          where: filters,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      log('Filtered Product category List fetched successfully ');

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

  async categoriesList() {
    try {
      const categories = await this.db.productCategory.findMany();

      log('Product category List fetched successfully ');

      return { categories };
    } catch (error) {
      // Handle query errors
      throw this.handleError(error);
    }
  }

  async deleteCategory(filter: Prisma.ProductCategoryWhereUniqueInput) {
    try {
      await this.db.productCategory.delete({
        where: filter,
      });
      log(' Product category deleted successfully ');

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCategory(
    data: Prisma.ProductCategoryUncheckedUpdateInput,
    filter: Prisma.ProductCategoryWhereUniqueInput
  ) {
    try {
      const updatedCategory = await this.db.productCategory.update({
        where: filter,
        data,
      });

      log(`Category updated successfully : `, updatedCategory);

      return { category: updatedCategory };
    } catch (error) {
      log(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
