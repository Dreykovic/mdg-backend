import logger from '@/core/utils/logger.util';
import StringUtil from '@/core/utils/string.util';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { log, warn } from 'console';
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
        data.costPerGramWhole +
        (data.costPerGramWhole * marginLevel.margin) / 100;
      data.pricePerGramGround =
        data.costPerGramGround +
        (data.costPerGramGround * marginLevel.margin) / 100;
      // Generate the SKU first
      const sku = await this.generateSKU(
        data.categoryId,
        data.originId,
        data.supplierId,
        data.isGlutenFree,
        data.isGMOFree
      );

      const cleanData = { ...data, sku };
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
    page = 1,
    pageSize = 10,
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

  async product(filters: Prisma.ProductWhereUniqueInput) {
    try {
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
      log('Unique product', product);
      return { product };
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
      if (data.costPerGramWhole || data.costPerGramGround) {
        const oldProduct = await this.db.product.findUniqueOrThrow({
          where: filter,
        });
        const marginLevel = await this.db.marginLevel.findUnique({
          where: { id: oldProduct.marginLevelId },
        });

        if (!marginLevel) {
          throw new Error('MarginLevel not found');
        }
        if (data.costPerGramWhole) {
          const cost = data.costPerGramWhole as number;
          data.pricePerGramWhole = cost + (cost * marginLevel.margin) / 100;
        }
        if (data.costPerGramGround) {
          const cost = data.costPerGramGround as number;
          data.pricePerGramGround = cost + (cost * marginLevel.margin) / 100;
        }
      }
      if (data.marginLevelId) {
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
        data.pricePerGramWhole =
          costPerGramWhole + (costPerGramWhole * marginLevel.margin) / 100;

        const costPerGramGround = oldProduct.costPerGramGround as number;
        data.pricePerGramGround =
          costPerGramGround + (costPerGramGround * marginLevel.margin) / 100;
      }

      const cleanData = data;
      log(' Product to update', cleanData);
      const product = await this.db.product.update({
        where: filter,
        data: cleanData,
      });

      log('Updated Product : ', product);
      return { product };
    } catch (error) {
      log('Product Update Error', error);
      throw this.handleError(error);
    }
  }

  async generateSKU(
    categoryId: number,
    originId: number,
    supplierId: number,
    isGlutenFree = false,
    isGMOFree = false
  ): Promise<string> {
    try {
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
        warn('Error fetching entities:', fetchError);
        // Continue with nulls for any entities that couldn't be fetched
      }

      // Log warning if any required entity is missing
      if (!category || !origin || !supplier) {
        warn(
          `Warning: Missing entities for SKU generation - Category: ${!!category}, Origin: ${!!origin}, Supplier: ${!!supplier}`
        );
        // Continue with generation using fallbacks instead of throwing error
      }

      // Create codes from entity names (use first 3 letters, uppercase)
      // Add null checks for all properties
      const catCode = category?.name
        ? StringUtil.generateSlug(category.name).substring(0, 3).toUpperCase()
        : 'XXX';
      const origCode = origin?.country
        ? StringUtil.generateSlug(origin.country).substring(0, 2).toUpperCase()
        : 'XX';
      const supCode = supplier?.name
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
        existingProducts &&
        existingProducts.length > 0 &&
        existingProducts[0]?.sku
      ) {
        const lastSKU = existingProducts[0].sku;
        const parts = lastSKU.split('-');

        if (parts && parts.length > 0) {
          const lastPart = parts[parts.length - 1];

          // Extract the numeric portion
          const numericMatch = lastPart.match(/\d+/);
          if (numericMatch?.[0]) {
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
    } catch (error) {
      logger.error('Error generating SKU:', error);
      // Instead of throwing, return a fallback SKU with timestamp for uniqueness
      const timestamp = Date.now().toString().substr(-8);
      return `FALLBACK-${timestamp}`;
    }
  }
}
