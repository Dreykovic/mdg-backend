import {
  CriticalServiceErrorHandler,
  ServiceErrorHandler,
} from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import StringUtil from '@/core/utils/string.util';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma, Product } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class ProductService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createProduct(
    data: Prisma.ProductUncheckedCreateInput
  ): Promise<{ product: Product }> {
    const marginLevel = await this.db.marginLevel.findUnique({
      where: { id: data.marginLevelId },
    });

    if (!marginLevel) {
      throw new Error('MarginLevel not found');
    }
    const marginCostPerGramWhole =
      (data.costPerGramWhole * marginLevel.margin) / 100;
    const marginCostPerGramGround =
      (data.costPerGramGround * marginLevel.margin) / 100;
    data.pricePerGramWhole = data.costPerGramWhole + marginCostPerGramWhole;
    data.pricePerGramGround = data.costPerGramGround + marginCostPerGramGround;
    // Generate the SKU first
    const sku = await this.generateSKU(
      data.categoryId,
      data.originId,
      data.supplierId,
      data.isGlutenFree,
      data.isGMOFree
    );

    const cleanData = { ...data, sku };
    logger.debug('Created Product', cleanData);

    const product = await this.db.product.create({
      data: cleanData,
    });

    return { product };
  }

  @ServiceErrorHandler()
  async products(
    page = 1,
    pageSize = 10,
    filters: Prisma.ProductWhereInput = {}
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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
    logger.debug('Filtered Products Fetched successfully');
    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  @ServiceErrorHandler()
  async product(
    filters: Prisma.ProductWhereUniqueInput
  ): Promise<{ product: Product }> {
    const product = await this.db.product.findUniqueOrThrow({
      where: filters,
      include: {
        category: true,
        origin: true,
        supplier: true,
        volumeConversion: true,
        marginLevel: true,
        inventory: true,
        productTagLinks: {
          include: { productTag: true },
        },
      },
    });
    logger.debug('Unique product', product);
    return { product };
  }

  @ServiceErrorHandler()
  async productsList(): Promise<{ products: Product[] }> {
    const products = await this.db.product.findMany();
    logger.debug(' Products Fetched successfully');

    return { products };
  }

  @ServiceErrorHandler()
  async deleteProduct(
    filter: Prisma.ProductWhereUniqueInput
  ): Promise<boolean> {
    await this.db.product.delete({
      where: filter,
    });

    logger.debug('Product Deleted Successfully');
    return true;
  }

  @ServiceErrorHandler()
  async updateProduct(
    data: Prisma.ProductUncheckedUpdateInput,
    filter: Prisma.ProductWhereUniqueInput
  ): Promise<{ product: Product }> {
    if (
      data.costPerGramWhole !== undefined ||
      data.costPerGramGround !== undefined
    ) {
      const oldProduct = await this.db.product.findUniqueOrThrow({
        where: filter,
      });
      const marginLevel = await this.db.marginLevel.findUnique({
        where: { id: oldProduct.marginLevelId },
      });

      if (!marginLevel) {
        throw new Error('MarginLevel not found');
      }
      if (data.costPerGramWhole !== undefined) {
        const cost = data.costPerGramWhole as number;
        const marginCostPerGramWhole = (cost * marginLevel.margin) / 100;
        data.pricePerGramWhole = cost + marginCostPerGramWhole;
      }
      if (data.costPerGramGround !== undefined) {
        const cost = data.costPerGramGround as number;
        const marginCostPerGramGround = (cost * marginLevel.margin) / 100;
        data.pricePerGramGround = cost + marginCostPerGramGround;
      }
    }
    if (data.marginLevelId !== undefined && data.marginLevelId !== null) {
      const marginId = data.marginLevelId as number;
      const oldProduct = await this.db.product.findUniqueOrThrow({
        where: filter,
      });
      const marginLevel = await this.db.marginLevel.findUnique({
        where: { id: marginId },
      });

      if (!marginLevel) {
        throw new Error('MarginLevel not found');
      }

      const costPerGramWhole = oldProduct.costPerGramWhole as number;
      const marginCpstPerGramWhole =
        (costPerGramWhole * marginLevel.margin) / 100;
      data.pricePerGramWhole = costPerGramWhole + marginCpstPerGramWhole;

      const costPerGramGround = oldProduct.costPerGramGround as number;
      const marginCostPerGramGround =
        (costPerGramGround * marginLevel.margin) / 100;
      data.pricePerGramGround = costPerGramGround + marginCostPerGramGround;
    }

    const cleanData = data;
    logger.debug(' Product to update', cleanData);
    const product = await this.db.product.update({
      where: filter,
      data: cleanData,
    });

    logger.debug('Updated Product : ', product);
    return { product };
  }

  @CriticalServiceErrorHandler()
  async generateSKU(
    categoryId: number,
    originId: number,
    supplierId: number,
    isGlutenFree = false,
    isGMOFree = false
  ): Promise<string> {
    const entities = await this.fetchEntities(categoryId, originId, supplierId);
    const codes = this.generateEntityCodes(entities);
    const basePattern = this.buildBasePattern(codes);
    const sequenceNumber = await this.getNextSequenceNumber(basePattern);
    const attributeFlags = this.buildAttributeFlags(isGlutenFree, isGMOFree);

    return this.buildFinalSKU(basePattern, sequenceNumber, attributeFlags);
  }

  @CriticalServiceErrorHandler()
  private async fetchEntities(
    categoryId: number,
    originId: number,
    supplierId: number
  ): Promise<{ category: any; origin: any; supplier: any }> {
    try {
      const [category, origin, supplier] = await Promise.all([
        this.db.productCategory
          .findUnique({ where: { id: categoryId } })
          .catch(() => null),
        this.db.origin
          .findUnique({ where: { id: originId } })
          .catch(() => null),
        this.db.supplier
          .findUnique({ where: { id: supplierId } })
          .catch(() => null),
      ]);

      this.logMissingEntities(category, origin, supplier);
      return { category, origin, supplier };
    } catch (error) {
      logger.warn('Error fetching entities:', error);
      return { category: null, origin: null, supplier: null };
    }
  }

  @CriticalServiceErrorHandler()
  private logMissingEntities(category: any, origin: any, supplier: any): void {
    if (
      category === null ||
      category === undefined ||
      origin === null ||
      origin === undefined ||
      supplier === null ||
      supplier === undefined
    ) {
      logger.warn(
        `Missing entities for SKU generation - Category: ${category !== null && category !== undefined}, Origin: ${origin !== null && origin !== undefined}, Supplier: ${supplier !== null && supplier !== undefined}`
      );
    }
  }

  @CriticalServiceErrorHandler()
  private generateEntityCodes(entities: {
    category: any;
    origin: any;
    supplier: any;
  }): { catCode: string; origCode: string; supCode: string } {
    const { category, origin, supplier } = entities;

    return {
      catCode: this.extractCode(category?.name, 3, 'XXX'),
      origCode: this.extractCode(origin?.country, 2, 'XX'),
      supCode: this.extractCode(supplier?.name, 3, 'XXX'),
    };
  }

  @CriticalServiceErrorHandler()
  private extractCode(
    value: string | undefined,
    length: number,
    fallback: string
  ): string {
    if (value === null || typeof value !== 'string' || value.trim() === '') {
      return fallback;
    }
    return StringUtil.generateSlug(value).substring(0, length).toUpperCase();
  }

  @CriticalServiceErrorHandler()
  private buildBasePattern(codes: {
    catCode: string;
    origCode: string;
    supCode: string;
  }): string {
    return `${codes.catCode}-${codes.origCode}-${codes.supCode}`;
  }

  @CriticalServiceErrorHandler()
  private async getNextSequenceNumber(basePattern: string): Promise<number> {
    const existingProducts = await this.db.product.findMany({
      where: { sku: { startsWith: basePattern } },
      orderBy: { sku: 'desc' },
      take: 1,
    });

    return this.calculateSequenceNumber(existingProducts);
  }

  @CriticalServiceErrorHandler()
  private calculateSequenceNumber(existingProducts: any[]): number {
    if (
      existingProducts.length === 0 ||
      typeof existingProducts[0]?.sku !== 'string'
    ) {
      return 1;
    }

    const lastSKU = existingProducts[0].sku;
    const parts = lastSKU.split('-');
    const lastPart = parts[parts.length - 1];
    const numericMatch = lastPart.match(/\d+/);

    return numericMatch !== null ? parseInt(numericMatch[0], 10) + 1 : 1;
  }
  @CriticalServiceErrorHandler()
  private buildAttributeFlags(
    isGlutenFree: boolean,
    isGMOFree: boolean
  ): string {
    const flags = [];
    if (isGlutenFree) {
      flags.push('GF');
    }
    if (isGMOFree) {
      flags.push('NM');
    }
    return flags.join('-');
  }

  @CriticalServiceErrorHandler()
  private async buildFinalSKU(
    basePattern: string,
    sequenceNumber: number,
    attributeFlags: string
  ): Promise<string> {
    const sequenceStr = sequenceNumber.toString().padStart(4, '0');
    const attributePart = attributeFlags ? `-${attributeFlags}` : '';
    const sku = `${basePattern}-${sequenceStr}${attributePart}`;

    return this.ensureUniqueSKU(sku);
  }

  private async ensureUniqueSKU(sku: string): Promise<string> {
    try {
      const existingSKU = await this.db.product.findUnique({ where: { sku } });

      if (existingSKU) {
        const randomSuffix = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');
        return `${sku}-${randomSuffix}`;
      }

      return sku;
    } catch (error) {
      logger.error('Error checking SKU uniqueness:', error);
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      return `${sku}-${randomSuffix}`;
    }
  }
}
