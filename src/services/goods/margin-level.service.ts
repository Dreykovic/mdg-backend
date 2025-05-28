import ServiceDefinition from '@/services/definitions/base_service';
import { Service } from 'typedi';
import { MarginLevel, Prisma } from '@prisma/client';
import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';

@Service()
export default class MarginService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createMargin(
    data: Prisma.MarginLevelUncheckedCreateInput
  ): Promise<{ margin: MarginLevel }> {
    const cleanData = data;

    const margin = await this.db.marginLevel.create({
      data: cleanData,
    });
    logger.debug('Created Margin : ', margin);
    return { margin };
  }

  @ServiceErrorHandler()
  async margins(
    page = 1,
    pageSize = 10,
    filters: Prisma.MarginLevelWhereInput = {}
  ): Promise<{
    data: MarginLevel[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    const [total, data] = await this.db.$transaction([
      this.db.marginLevel.count({
        where: filters,
      }),

      this.db.marginLevel.findMany({
        where: filters,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    logger.debug('Filtered Margins fetched successfully');
    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  @ServiceErrorHandler()
  async marginsList(): Promise<{ margins: MarginLevel[] }> {
    const margins = await this.db.marginLevel.findMany();

    return { margins };
  }

  @ServiceErrorHandler()
  async deleteMargin(
    filter: Prisma.MarginLevelWhereUniqueInput
  ): Promise<boolean> {
    await this.db.marginLevel.delete({
      where: filter,
    });

    logger.debug('Margin deleted successfully');
    return true;
  }

  @ServiceErrorHandler()
  async updateMargin(
    data: Prisma.MarginLevelUncheckedUpdateInput,
    filter: Prisma.MarginLevelWhereUniqueInput
  ): Promise<{ margin: MarginLevel }> {
    try {
      const margin = await this.db.marginLevel.update({
        where: filter,
        data,
      });
      logger.debug('Updated Margin : ', margin);
      return { margin };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
