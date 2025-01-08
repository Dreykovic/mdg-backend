import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class ProductService extends ServiceDefinition {
  async createProduct(data: Prisma.ProductUncheckedCreateInput) {
    try {
      const marginLevel = await this.db.marginLevel.findUnique({
        where: { id: data.marginLevelId },
      });

      if (!marginLevel) {
        throw new Error('MarginLevel not found');
      }

      data.pricePerGramWhole =
        data.costPerGramWhole + data.costPerGramWhole * marginLevel.margin;
      data.pricePerGramGround =
        data.costPerGramGround + data.costPerGramGround * marginLevel.margin;

      const cleanData = data;
      log('Created Product', cleanData);

      const product = await this.db.product.create({
        data: cleanData,
      });

      return { product };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async products(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.ProductWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.product.count({
          where: filters,
        }),

        this.db.product.findMany({
          where: filters,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
          },
        }),
      ]);
      log('Filtered Products Fetched successfully');
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

  async productsList() {
    try {
      const products = await this.db.product.findMany();
      log(' Products Fetched successfully');

      return { products };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(filter: Prisma.ProductWhereUniqueInput) {
    try {
      await this.db.product.delete({
        where: filter,
      });

      log('Product Deleted Successfully');
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(
    data: Prisma.ProductUncheckedUpdateInput,
    filter: Prisma.ProductWhereUniqueInput
  ) {
    try {
      const product = await this.db.product.update({
        where: filter,
        data,
      });

      log('Updated Product : ', product);
      return { product };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
