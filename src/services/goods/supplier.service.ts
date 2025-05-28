import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma, Supplier } from '@prisma/client';

import { log } from 'console';

import { Service } from 'typedi';

@Service()
export default class SupplierService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createSupplier(
    data: Prisma.SupplierCreateInput
  ): Promise<{ supplier: Supplier }> {
    const cleanData = data;

    const supplier = await this.db.supplier.create({
      data: cleanData,
    });

    return { supplier };
  }

  @ServiceErrorHandler()
  async suppliers(
    page = 1,
    pageSize = 10,
    filters: Prisma.SupplierWhereInput = {}
  ): Promise<{
    data: Supplier[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    const [total, data] = await this.db.$transaction([
      this.db.supplier.count({
        where: filters,
      }),

      this.db.supplier.findMany({
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
  @ServiceErrorHandler()
  async suppliersList(): Promise<{ suppliers: Supplier[] }> {
    const suppliers = await this.db.supplier.findMany();

    return { suppliers };
  }

  @ServiceErrorHandler()
  async deleteSupplier(
    filter: Prisma.SupplierWhereUniqueInput
  ): Promise<boolean> {
    await this.db.supplier.delete({
      where: filter,
    });

    return true;
  }

  @ServiceErrorHandler()
  async updateSupplier(
    data: Prisma.SupplierUncheckedUpdateInput,
    filter: Prisma.SupplierWhereUniqueInput
  ): Promise<{ supplier: Supplier }> {
    const updatedSupplier = await this.db.supplier.update({
      where: filter,
      data,
    });

    log(`Supplier updated successfully: ${JSON.stringify(updatedSupplier)}`);

    return { supplier: updatedSupplier };
  }
}
