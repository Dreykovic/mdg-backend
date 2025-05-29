import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma, ProductTagLink } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class ProductTagLinkService extends ServiceDefinition {
  @ServiceErrorHandler('Error in ProductTagLinkService')
  async createProductTagLink(
    data: Prisma.ProductTagLinkUncheckedCreateInput
  ): Promise<{ productTagLink: ProductTagLink }> {
    const cleanData = data;
    log(cleanData);
    const productTagLink = await this.db.productTagLink.create({
      data: cleanData,
    });

    return { productTagLink };
  }

  @ServiceErrorHandler('Error in ProductTagLinkService')
  async productTagLinks(
    page = 1,
    pageSize = 10,
    filters: Prisma.ProductTagLinkWhereInput = {}
  ): Promise<{
    data: ProductTagLink[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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
  }

  @ServiceErrorHandler('Error in ProductTagLinkService')
  async tagLinksList(): Promise<{
    tagLinks: (ProductTagLink & { productTag: any })[];
  }> {
    const tagLinks = await this.db.productTagLink.findMany({
      include: {
        productTag: true,
      },
    });

    return { tagLinks };
  }

  @ServiceErrorHandler('Error in ProductTagLinkService')
  async productTagLinksList(
    productId: string
  ): Promise<{ productTagLinks: (ProductTagLink & { productTag: any })[] }> {
    const productTagLinks = await this.db.productTagLink.findMany({
      where: {
        productId,
      },
      include: {
        productTag: true,
      },
    });

    return { productTagLinks };
  }

  @ServiceErrorHandler('Error in ProductTagLinkService')
  async deleteProductTagLink(
    filter: Prisma.ProductTagLinkWhereUniqueInput
  ): Promise<boolean> {
    await this.db.productTagLink.delete({
      where: filter,
    });

    return true;
  }
  @ServiceErrorHandler('Error in ProductTagLinkService')
  async updateProductTagLink(
    data: Prisma.ProductTagLinkUncheckedUpdateInput,
    filter: Prisma.ProductTagLinkWhereUniqueInput
  ): Promise<{ productTagLink: ProductTagLink }> {
    const updatedProductTagLink = await this.db.productTagLink.update({
      where: filter,
      data,
    });

    return { productTagLink: updatedProductTagLink };
  }
}
