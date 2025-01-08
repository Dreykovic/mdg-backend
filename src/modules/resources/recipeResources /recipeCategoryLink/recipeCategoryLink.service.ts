import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class RecipeCategoryLinkService extends ServiceDefinition {
  async createRecipeCategoryLink(
    data: Prisma.RecipeCategoryLinkUncheckedCreateInput
  ) {
    try {
      const cleanData = data;

      const recipeCategoryLink = await this.db.recipeCategoryLink.create({
        data: cleanData,
      });

      return { recipeCategoryLink };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recipeCategoryLinks(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.RecipeCategoryLinkWhereInput = {}
  ) {
    try {
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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recipeCategoryLinksList() {
    try {
      const recipeCategoryLinks = await this.db.recipeCategoryLink.findMany();

      return { recipeCategoryLinks };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteRecipeCategoryLink(
    filter: Prisma.RecipeCategoryLinkWhereUniqueInput
  ) {
    try {
      await this.db.recipeCategoryLink.delete({
        where: filter,
      });

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRecipeCategoryLink(
    data: Prisma.RecipeCategoryLinkUncheckedUpdateInput,
    filter: Prisma.RecipeCategoryLinkWhereUniqueInput
  ) {
    try {
      const updatedRecipeCategoryLink = await this.db.recipeCategoryLink.update(
        {
          where: filter,
          data,
        }
      );

      return { recipeCategoryLink: updatedRecipeCategoryLink };
    } catch (error) {
      log(`Error updating category: ${(error as any).message}`);
      throw this.handleError(error);
    }
  }
}
