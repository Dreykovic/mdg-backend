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
    // Initialize with fallback values in case of failure
    let category = null;
    let origin = null;
    let supplier = null;

    try {
      // Fetch related entities, catching errors for each individually
      [category, origin, supplier] = await Promise.all([
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
    } catch (fetchError) {
      logger.warn('Error fetching entities:', fetchError);
      // Continue with nulls for any entities that couldn't be fetched
    }

    // Log warning if any required entity is missing
    if (!category || !origin || !supplier) {
      logger.warn(
        `Warning: Missing entities for SKU generation - Category: ${!!category}, Origin: ${!!origin}, Supplier: ${!!supplier}`
      );
      // Continue with generation using fallbacks instead of throwing error
    }

    // Create codes from entity names (use first 3 letters, uppercase)
    // Add null checks for all properties
    const catCode =
      category &&
      typeof category.name === 'string' &&
      category.name.trim() !== ''
        ? StringUtil.generateSlug(category.name).substring(0, 3).toUpperCase()
        : 'XXX';
    const origCode =
      origin &&
      typeof origin.country === 'string' &&
      origin.country.trim() !== ''
        ? StringUtil.generateSlug(origin.country).substring(0, 2).toUpperCase()
        : 'XX';
    const supCode =
      supplier &&
      typeof supplier.name === 'string' &&
      supplier.name.trim() !== ''
        ? StringUtil.generateSlug(supplier.name).substring(0, 3).toUpperCase()
        : 'XXX';

    // Add optional attribute flags
    const glutenFlag = isGlutenFree ? 'GF' : '';
    const gmoFlag = isGMOFree ? 'NM' : ''; // NM for Non-GMO

    // Create base SKU pattern
    const basePattern = `${catCode}-${origCode}-${supCode}`;

    // Count existing products with the same pattern to determine sequence number
    let existingProducts: any[] = [];
    try {
      existingProducts = await this.db.product.findMany({
        where: {
          sku: {
            startsWith: basePattern,
          },
        },
        orderBy: {
          sku: 'desc',
        },
        take: 1,
      });
    } catch (queryError) {
      logger.error('Error querying existing products:', queryError);
      // Continue with empty array if query fails
    }

    // Determine sequence number
    let sequenceNumber = 1;

    if (
      existingProducts.length > 0 &&
      typeof existingProducts[0]?.sku === 'string' &&
      existingProducts[0].sku !== ''
    ) {
      const lastSKU = existingProducts[0].sku;
      const parts = lastSKU.split('-');

      if (Array.isArray(parts) && parts.length > 0) {
        const lastPart = parts[parts.length - 1];

        // Extract the numeric portion
        const numericMatch = lastPart.match(/\d+/);
        if (
          Array.isArray(numericMatch) &&
          typeof numericMatch[0] === 'string'
        ) {
          sequenceNumber = parseInt(numericMatch[0], 10) + 1;
        }
      }
    }

    // Format sequence number with leading zeros
    const sequenceStr = sequenceNumber.toString().padStart(4, '0');

    // Combine attribute flags if present
    const attributeFlags = [glutenFlag, gmoFlag].filter(Boolean).join('-');
    const attributePart = attributeFlags ? `-${attributeFlags}` : '';

    // Build final SKU
    const sku = `${basePattern}-${sequenceStr}${attributePart}`;

    // Verify uniqueness
    let existingSKU = null;
    try {
      existingSKU = await this.db.product.findUnique({
        where: { sku },
      });
    } catch (uniqueCheckError) {
      logger.error('Error checking SKU uniqueness:', uniqueCheckError);
      // If we can't verify uniqueness, assume it's not unique to be safe
      existingSKU = { id: 'unknown' };
    }

    if (existingSKU) {
      // If SKU already exists (rare case), add a random suffix
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      return `${sku}-${randomSuffix}`;
    }

    return sku;
  }
}
