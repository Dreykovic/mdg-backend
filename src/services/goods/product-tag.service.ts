import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base.service';
import { Prisma, ProductTag } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class ProductTagService extends ServiceDefinition {
  @ServiceErrorHandler('Error creating Product Tag.')
  async createProductTag(
    data: Prisma.ProductTagUncheckedCreateInput
  ): Promise<{ productTag: ProductTag }> {
    const cleanData = data;

    const productTag = await this.db.productTag.create({
      data: cleanData,
    });

    return { productTag };
  }

  @ServiceErrorHandler('Error fetching Product Tags.')
  async productTags(
    page = 1,
    pageSize = 10,
    filters: Prisma.ProductTagWhereInput = {}
  ): Promise<{
    data: ProductTag[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    const [total, data] = await this.db.$transaction([
      this.db.productTag.count({
        where: filters,
      }),

      this.db.productTag.findMany({
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

  @ServiceErrorHandler('Error fetching Product Tags.')
  async productTagsList(): Promise<{ productTags: ProductTag[] }> {
    const productTags = await this.db.productTag.findMany();

    return { productTags };
  }

  @ServiceErrorHandler('Error fetching Product Tag by ID.')
  async deleteProductTag(
    filter: Prisma.ProductTagWhereUniqueInput
  ): Promise<boolean> {
    await this.db.productTag.delete({
      where: filter,
    });

    return true;
  }

  @ServiceErrorHandler('Error updating Product Tag.')
  async updateProductTag(
    data: Prisma.ProductTagUncheckedUpdateInput,
    filter: Prisma.ProductTagWhereUniqueInput
  ): Promise<{ productTag: ProductTag }> {
    const updatedProductTag = await this.db.productTag.update({
      where: filter,
      data,
    });

    logger.debug(
      `Product Tag updated successfully: ${JSON.stringify(updatedProductTag)}`
    );

    return { productTag: updatedProductTag };
  }
}
