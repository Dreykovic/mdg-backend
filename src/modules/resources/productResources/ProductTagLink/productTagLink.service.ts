import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class ProductTagLinkService extends ServiceDefinition {
  async createProductTagLink(data: Prisma.ProductTagLinkUncheckedCreateInput) {
    try {
      const cleanData = data;
      log(cleanData);
      const productTagLink = await this.db.productTagLink.create({
        data: cleanData,
      });

      return { productTagLink };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async productTagLinks(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.ProductTagLinkWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.productTagLink.count({
          where: filters,
        }),

        this.db.productTagLink.findMany({
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

  async productTagLinksList() {
    try {
      const productTagLinks = await this.db.productTagLink.findMany();

      return { productTagLinks };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProductTagLink(filter: Prisma.ProductTagLinkWhereUniqueInput) {
    try {
      await this.db.productTagLink.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProductTagLink(
    data: Prisma.ProductTagLinkUncheckedUpdateInput,
    filter: Prisma.ProductTagLinkWhereUniqueInput
  ) {
    try {
      const updatedProductTagLink = await this.db.productTagLink.update({
        where: filter,
        data,
      });

      return { productTagLink: updatedProductTagLink };
    } catch (error) {
      log(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
