import ServiceDefinition from '@/modules/definitions/service';
import { Prisma, UOMType } from '@prisma/client';
import { log } from 'console';
import { Service } from 'typedi';

@Service()
export default class UOMService extends ServiceDefinition {
  /**
   * Creates a new unit of mesure in the database.
   * @param {Prisma.UnitOfMeasureCreateInput} data - The data required to create an unit of mesure.
   * @returns {Promise<{ uOM: Prisma.UnitOFMeasure }>} The created uOM.
   * @throws Will throw an error if the operation fails.
   */
  async createUOM(data: Prisma.UnitOfMeasureCreateInput) {
    try {
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
    } catch (error) {
      // Handle any database or validation errors
      throw this.handleError(error);
    }
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
  async unitsOfMeasure(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.UnitOfMeasureWhereInput = {}
  ) {
    try {
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
    } catch (error) {
      // Handle query or transaction errors
      throw this.handleError(error);
    }
  }

  /**
   * Fetches a complete list of all uOM without pagination.
   * @returns {Promise<{ uOMs: Prisma.UnitOfMeasure[] }>} The list of all uOM.
   * @throws Will throw an error if the query fails.
   */
  async unitsOfMeasureList() {
    try {
      // Retrieve all uOM
      const uOMs = await this.db.unitOfMeasure.findMany();

      // Return the list of uOM
      return { uOMs };
    } catch (error) {
      // Handle query errors
      throw this.handleError(error);
    }
  }

  /**
   * Deletes a uOM from the database.
   * @param {Prisma.UnitOfMeasureWhereUniqueInput} filter - The unique identifier of the uOM to delete.
   * @returns {Promise<boolean>} Returns true if the deletion is successful.
   * @throws Will throw an error if the deletion fails.
   */
  async deleteUnitOfMeasure(filter: Prisma.UnitOfMeasureWhereUniqueInput) {
    try {
      // Delete the uOM based on the unique filter
      await this.db.unitOfMeasure.delete({
        where: filter,
      });

      // Return success status
      return true;
    } catch (error) {
      // Handle errors, such as trying to delete a non-existent uOM
      throw this.handleError(error);
    }
  }

  /**
   * Updates a uOM in the database.
   * @param {Prisma.UnitOfMeasureUpdateInput} data - The data to update the uOM with.
   * @param {Prisma.UnitOfMeasureWhereUniqueInput} filter - The unique identifier of the uOM to update.
   * @returns {Promise<{ UOM: Prisma.UnitOfMeasure }>} The updated uOM.
   * @throws Will throw an error if the update operation fails.
   */
  async updateUnitOfMeasure(
    data: Prisma.UnitOfMeasureUpdateInput,
    filter: Prisma.UnitOfMeasureWhereUniqueInput
  ) {
    try {
      const standardUnit = await this.db.unitOfMeasure.findUniqueOrThrow({
        where: {
          name: data.type === UOMType.WEIGHT ? 'Gram' : 'Tablespoon',
        },
      });
      log('stdUnit: ', standardUnit);
      log('filter: ', filter);

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
    } catch (error) {
      // Handle validation or query errors
      throw this.handleError(error);
    }
  }
}
