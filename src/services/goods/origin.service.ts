import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class OriginService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createOrigin(
    data: Prisma.OriginUncheckedCreateInput
  ): Promise<{ origin: any }> {
    const cleanData = data;

    const origin = await this.db.origin.create({
      data: cleanData,
    });
    log('Created Origin', origin);
    return { origin };
  }

  @ServiceErrorHandler()
  async origins(
    page = 1,
    pageSize = 10,
    filters: Prisma.OriginWhereInput = {}
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
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
  }

  @ServiceErrorHandler()
  async originsList(): Promise<{ origins: any[] }> {
    const origins = await this.db.origin.findMany();
    log(' Origins Fetched successfully');

    return { origins };
  }

  @ServiceErrorHandler()
  async deleteOrigin(filter: Prisma.OriginWhereUniqueInput): Promise<boolean> {
    await this.db.origin.delete({
      where: filter,
    });
    log(' Origin deleted successfully');

    return true;
  }

  @ServiceErrorHandler()
  async updateOrigin(
    data: Prisma.OriginUpdateInput,
    filter: Prisma.OriginWhereUniqueInput
  ): Promise<{ origin: any }> {
    const origin = await this.db.origin.update({
      where: filter,
      data,
    });
    log('Updated Origin', origin);

    return { origin };
  }
}
