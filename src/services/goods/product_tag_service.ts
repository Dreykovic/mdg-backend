import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class ProductTagService extends ServiceDefinition {
  async createProductTag(data: Prisma.ProductTagUncheckedCreateInput) {
    try {
      const cleanData = data;

      const productTag = await this.db.productTag.create({
        data: cleanData,
      });

      return { productTag };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async productTags(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.ProductTagWhereInput = {}
  ) {
    try {
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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async productTagsList() {
    try {
      const productTags = await this.db.productTag.findMany();

      return { productTags };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProductTag(filter: Prisma.ProductTagWhereUniqueInput) {
    try {
      await this.db.productTag.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProductTag(
    data: Prisma.ProductTagUncheckedUpdateInput,
    filter: Prisma.ProductTagWhereUniqueInput
  ) {
    try {
      const updatedProductTag = await this.db.productTag.update({
        where: filter,
        data,
      });

      log(
        `Product Tag updated successfully: ${JSON.stringify(updatedProductTag)}`
      );

      return { productTag: updatedProductTag };
    } catch (error) {
      log(`Error updating Product Tag: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
