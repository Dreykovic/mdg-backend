import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import ServiceDefinition from '@/services/definitions/base_service';
import { Prisma, RecipeCategoryLink } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class RecipeCategoryLinkService extends ServiceDefinition {
  @ServiceErrorHandler()
  async createRecipeCategoryLink(
    data: Prisma.RecipeCategoryLinkUncheckedCreateInput
  ): Promise<{ recipeCategoryLink: RecipeCategoryLink }> {
    const cleanData = data;

    const recipeCategoryLink = await this.db.recipeCategoryLink.create({
      data: cleanData,
    });

    return { recipeCategoryLink };
  }

  @ServiceErrorHandler()
  async recipeCategoryLinks(
    page = 1,
    pageSize = 10,
    filters: Prisma.RecipeCategoryLinkWhereInput = {}
  ): Promise<{
    data: RecipeCategoryLink[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    const [total, data] = await this.db.$transaction([
      this.db.recipeCategoryLink.count({
        where: filters,
      }),

      this.db.recipeCategoryLink.findMany({
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
  async recipeCategoryLinksList(): Promise<{
    recipeCategoryLinks: RecipeCategoryLink[];
  }> {
    const recipeCategoryLinks = await this.db.recipeCategoryLink.findMany();

    return { recipeCategoryLinks };
  }

  @ServiceErrorHandler()
  async deleteRecipeCategoryLink(
    filter: Prisma.RecipeCategoryLinkWhereUniqueInput
  ): Promise<boolean> {
    await this.db.recipeCategoryLink.delete({
      where: filter,
    });

    return true;
  }

  @ServiceErrorHandler()
  async updateRecipeCategoryLink(
    data: Prisma.RecipeCategoryLinkUncheckedUpdateInput,
    filter: Prisma.RecipeCategoryLinkWhereUniqueInput
  ): Promise<{ recipeCategoryLink: RecipeCategoryLink }> {
    const updatedRecipeCategoryLink = await this.db.recipeCategoryLink.update({
      where: filter,
      data,
    });

    return { recipeCategoryLink: updatedRecipeCategoryLink };
  }
}
