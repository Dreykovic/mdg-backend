import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma, Step } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class StepService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createStep(data: Prisma.StepCreateInput): Promise<{ step: Step }> {
    const cleanData = data;

    const step = await this.db.step.create({
      data: cleanData,
    });

    return { step };
  }

  @ServiceErrorHandler()
  async steps(
    page = 1,
    pageSize = 10,
    filters: Prisma.StepWhereInput = {}
  ): Promise<{ data: Step[]; total: number; page: number; pageSize: number }> {
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
  }

  @ServiceErrorHandler()
  async stepsList(
    filters: Prisma.StepWhereInput = {}
  ): Promise<{ steps: Step[] }> {
    const steps = await this.db.step.findMany({
      where: filters,
      orderBy: { stepNumber: 'asc' },
    });

    return { steps };
  }

  @ServiceErrorHandler()
  async deleteStep(filter: Prisma.StepWhereUniqueInput): Promise<boolean> {
    await this.db.step.delete({
      where: filter,
    });

    return true;
  }

  @ServiceErrorHandler()
  async updateStep(
    data: Prisma.StepUpdateInput,
    filter: Prisma.StepWhereUniqueInput
  ): Promise<{ step: Step }> {
    const updatedStep = await this.db.step.update({
      where: filter,
      data,
    });

    log(`Ingredient Step updated successfully: ${JSON.stringify(updatedStep)}`);

    return { step: updatedStep };
  }
}
