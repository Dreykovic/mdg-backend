import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class StepService extends ServiceDefinition {
  async createStep(data: Prisma.StepCreateInput) {
    try {
      const cleanData = data;

      const step = await this.db.step.create({
        data: cleanData,
      });

      return { step };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async steps(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.StepWhereInput = {}
  ) {
    try {
      const skip = (page - 1) * pageSize;

      const [total, data] = await this.db.$transaction([
        this.db.step.count({
          where: filters,
        }),

        this.db.step.findMany({
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

  async stepsList(filters: Prisma.StepWhereInput = {}) {
    try {
      const steps = await this.db.step.findMany({
        where: filters,
        orderBy: { stepNumber: 'asc' },
      });

      return { steps };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStep(filter: Prisma.StepWhereUniqueInput) {
    try {
      await this.db.step.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStep(
    data: Prisma.StepUpdateInput,
    filter: Prisma.StepWhereUniqueInput
  ) {
    try {
      const updatedStep = await this.db.step.update({
        where: filter,
        data,
      });

      log(
        `Ingredient Step updated successfully: ${JSON.stringify(updatedStep)}`
      );

      return { step: updatedStep };
    } catch (error) {
      log(`Error updating Ingredient step: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
