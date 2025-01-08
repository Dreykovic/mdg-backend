import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';

import { log } from 'console';

import { Service } from 'typedi';

@Service()
export default class SupplierService extends ServiceDefinition {
  async createSupplier(data: Prisma.SupplierCreateInput) {
    try {
      const cleanData = data;

      const supplier = await this.db.supplier.create({
        data: cleanData,
      });

      return { supplier };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suppliers(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.SupplierWhereInput = {}
  ) {
    try {
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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suppliersList() {
    try {
      const suppliers = await this.db.supplier.findMany();

      return { suppliers };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSupplier(filter: Prisma.SupplierWhereUniqueInput) {
    try {
      await this.db.supplier.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSupplier(
    data: Prisma.SupplierUncheckedUpdateInput,
    filter: Prisma.SupplierWhereUniqueInput
  ) {
    try {
      const updatedSupplier = await this.db.supplier.update({
        where: filter,
        data,
      });

      log(`Supplier updated successfully: ${JSON.stringify(updatedSupplier)}`);

      return { supplier: updatedSupplier };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
