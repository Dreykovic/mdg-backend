import { ServiceErrorHandler } from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';
import ServiceDefinition from '@/services/definitions/base.service';
import { Prisma, UnitOfMeasure, UOMType } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class UOMService extends ServiceDefinition {
  /**
   * Creates a new unit of mesure in the database.
   * @param {Prisma.UnitOfMeasureCreateInput} data - The data required to create an unit of mesure.
   * @returns {Promise<{ uOM: Prisma.UnitOFMeasure }>} The created uOM.
   * @throws Will throw an error if the operation fails.
   */
  @ServiceErrorHandler()
  async createUOM(
    data: Prisma.UnitOfMeasureCreateInput
  ): Promise<{ uOM: UnitOfMeasure }> {
    // Sanitize input data (if needed, add specific sanitization logic here)
    const cleanData = data;
    const standardUnit = await this.db.unitOfMeasure.findUniqueOrThrow({
      where: {
        name: cleanData.type === UOMType.WEIGHT ? 'Gram' : 'Tablespoon',
      },
    });

    cleanData.standardUnit = {
      connect: { id: standardUnit.id },
    };
    // Create the uOM in the database
    const uOM = await this.db.unitOfMeasure.create({
      data: cleanData,
    });

    // Return the created uOM
    return { uOM };
  }

  /**
   * Fetches a paginated and filtered list of uOM.
   * @param {number} page - The current page number (default: 1).
   * @param {number} pageSize - The number of items per page (default: 10).
   * @param {Prisma.UnitOfMeasureWhereInput} filters - Optional filters for the query.
   * @returns {Promise<{ data: Prisma.UnitOfMeasure[]; total: number; page: number; pageSize: number }>}
   * An object containing the paginated results, total count, current page, and page size.
   * @throws Will throw an error if the query fails.
   */
  @ServiceErrorHandler()
  async unitsOfMeasure(
    page = 1,
    pageSize = 10,
    filters: Prisma.UnitOfMeasureWhereInput = {}
  ): Promise<{
    data: UnitOfMeasure[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Calculate pagination parameters
    const skip = (page - 1) * pageSize;

    // Use Prisma's transaction feature to perform multiple queries atomically
    const [total, data] = await this.db.$transaction([
      // Count total uOM matching the filters
      this.db.unitOfMeasure.count({
        where: filters,
      }),
      // Fetch the paginated and filtered uOM
      this.db.unitOfMeasure.findMany({
        where: filters,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }, // Order by creation date descending
      }),
    ]);

    // Return paginated response
    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Fetches a complete list of all uOM without pagination.
   * @returns {Promise<{ uOMs: Prisma.UnitOfMeasure[] }>} The list of all uOM.
   * @throws Will throw an error if the query fails.
   */
  @ServiceErrorHandler()
  async unitsOfMeasureList(): Promise<{ uOMs: UnitOfMeasure[] }> {
    // Retrieve all uOM
    const uOMs = await this.db.unitOfMeasure.findMany();

    // Return the list of uOM
    return { uOMs };
  }

  /**
   * Deletes a uOM from the database.
   * @param {Prisma.UnitOfMeasureWhereUniqueInput} filter - The unique identifier of the uOM to delete.
   * @returns {Promise<boolean>} Returns true if the deletion is successful.
   * @throws Will throw an error if the deletion fails.
   */
  @ServiceErrorHandler()
  async deleteUnitOfMeasure(
    filter: Prisma.UnitOfMeasureWhereUniqueInput
  ): Promise<boolean> {
    // Delete the uOM based on the unique filter
    await this.db.unitOfMeasure.delete({
      where: filter,
    });

    // Return success status
    return true;
  }

  /**
   * Updates a uOM in the database.
   * @param {Prisma.UnitOfMeasureUpdateInput} data - The data to update the uOM with.
   * @param {Prisma.UnitOfMeasureWhereUniqueInput} filter - The unique identifier of the uOM to update.
   * @returns {Promise<{ UOM: Prisma.UnitOfMeasure }>} The updated uOM.
   * @throws Will throw an error if the update operation fails.
   */
  @ServiceErrorHandler()
  async updateUnitOfMeasure(
    data: Prisma.UnitOfMeasureUpdateInput,
    filter: Prisma.UnitOfMeasureWhereUniqueInput
  ): Promise<{ uOM: UnitOfMeasure }> {
    const standardUnit = await this.db.unitOfMeasure.findUniqueOrThrow({
      where: {
        name: data.type === UOMType.WEIGHT ? 'Gram' : 'Tablespoon',
      },
    });
    logger.debug('stdUnit: ', standardUnit);
    logger.debug('filter: ', filter);

    if (filter.id === standardUnit.id) {
      throw Error('This record update is forbidden');
    }

    data.standardUnit = {
      connect: { id: standardUnit.id },
    };
    // Update the uOM in the database
    const uOM = await this.db.unitOfMeasure.update({
      where: filter,
      data,
    });

    // Return the updated uOM
    return { uOM };
  }
}
