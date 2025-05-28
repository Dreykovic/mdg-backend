import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class CategoryService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createCategory(
    data: Prisma.ProductCategoryUncheckedCreateInput
  ): Promise<{ category: any }> {
    const cleanData = data;

    const category = await this.db.productCategory.create({
      data: cleanData,
    });
    logger.debug('Created Product Category : ', category);
    return { category };
  }

  @ServiceErrorHandler()
  async categories(
    page = 1,
    pageSize = 10,
    filters: Prisma.ProductCategoryWhereInput = {}
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
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
    logger.debug('Filtered Product category List fetched successfully ');

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  @ServiceErrorHandler()
  async categoriesList(): Promise<{ categories: any[] }> {
    const categories = await this.db.productCategory.findMany();

    logger.debug('Product category List fetched successfully ');

    return { categories };
  }

  @ServiceErrorHandler()
  async deleteCategory(
    filter: Prisma.ProductCategoryWhereUniqueInput
  ): Promise<boolean> {
    await this.db.productCategory.delete({
      where: filter,
    });
    logger.debug(' Product category deleted successfully ');

    return true;
  }

  @ServiceErrorHandler()
  async updateCategory(
    data: Prisma.ProductCategoryUncheckedUpdateInput,
    filter: Prisma.ProductCategoryWhereUniqueInput
  ): Promise<{ category: any }> {
    const updatedCategory = await this.db.productCategory.update({
      where: filter,
      data,
    });

    logger.debug(`Category updated successfully : `, updatedCategory);

    return { category: updatedCategory };
  }
}
