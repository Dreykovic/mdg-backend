import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class MarginService extends ServiceDefinition {
  async createMargin(data: Prisma.MarginLevelUncheckedCreateInput) {
    try {
      const cleanData = data;

      const margin = await this.db.marginLevel.create({
        data: cleanData,
      });
      log('Created Margin : ', margin);
      return { margin };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async margins(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.MarginLevelWhereInput = {}
  ) {
    try {
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
      log('Filtered Margins fetched successfully');
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

  async marginsList() {
    try {
      const margins = await this.db.marginLevel.findMany();

      return { margins };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMargin(filter: Prisma.MarginLevelWhereUniqueInput) {
    try {
      await this.db.marginLevel.delete({
        where: filter,
      });

      log('Margin deleted successfully');
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMargin(
    data: Prisma.MarginLevelUncheckedUpdateInput,
    filter: Prisma.MarginLevelWhereUniqueInput
  ) {
    try {
      const margin = await this.db.marginLevel.update({
        where: filter,
        data,
      });
      log('Updated Margin : ', margin);
      return { margin };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
