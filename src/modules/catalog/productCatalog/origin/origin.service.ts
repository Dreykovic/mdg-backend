import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class OriginService extends ServiceDefinition {
  async createOrigin(data: Prisma.OriginUncheckedCreateInput) {
    try {
      const cleanData = data;

      const origin = await this.db.origin.create({
        data: cleanData,
      });
      log('Created Origin', origin);
      return { origin };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async origins(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.OriginWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.origin.count({
          where: filters,
        }),

        this.db.origin.findMany({
          where: filters,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      log('Filtered Origins Fetched successfully');

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

  async originsList() {
    try {
      const origins = await this.db.origin.findMany();
      log(' Origins Fetched successfully');

      return { origins };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteOrigin(filter: Prisma.OriginWhereUniqueInput) {
    try {
      await this.db.origin.delete({
        where: filter,
      });
      log(' Origin deleted successfully');

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrigin(
    data: Prisma.OriginUpdateInput,
    filter: Prisma.OriginWhereUniqueInput
  ) {
    try {
      const origin = await this.db.origin.update({
        where: filter,
        data,
      });
      log('Updated Origin', origin);

      return { origin };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
