import ServiceDefinition from '@/modules/definitions/service';
import { Prisma } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export default class VolumeConversionService extends ServiceDefinition {
  /**
   * Creates a new Volume conversion in the database.
   * @param {Prisma.VolumeConversionUncheckedCreateInput} data - The data required to create a volume conversion.
   * @returns {Promise<{ volumeConversion: Prisma.UnitOFMeasure }>} The created volumeConversion.
   * @throws Will throw an error if the operation fails.
   */
  async createVolumeConversion(
    data: Prisma.VolumeConversionUncheckedCreateInput
  ) {
    try {
      // Sanitize input data (if needed, add specific sanitization logic here)
      const cleanData = data;
      const avg = (cleanData.m1 + cleanData.m2 + cleanData.m3) / 3;
      cleanData.avg = avg;
      // Create the volumeConversion in the database
      const volumeConversion = await this.db.volumeConversion.create({
        data: cleanData,
      });

      // Return the created volumeConversion
      return { volumeConversion };
    } catch (error) {
      // Handle any database or validation errors
      throw this.handleError(error);
    }
  }

  /**
   * Fetches a paginated and filtered list of volumeConversion.
   * @param {number} page - The current page number (default: 1).
   * @param {number} pageSize - The number of items per page (default: 10).
   * @param {Prisma.VolumeConversionWhereInput} filters - Optional filters for the query.
   * @returns {Promise<{ data: Prisma.VolumeConversion[]; total: number; page: number; pageSize: number }>}
   * An object containing the paginated results, total count, current page, and page size.
   * @throws Will throw an error if the query fails.
   */
  async volumeConversions(
    page: number = 1,
    pageSize: number = 10,
    filters: Prisma.VolumeConversionWhereInput = {}
  ) {
    try {
      // Calculate pagination parameters
      const skip = (page - 1) * pageSize;

      // Use Prisma's transaction feature to perform multiple queries atomically
      const [total, data] = await this.db.$transaction([
        // Count total volumeConversion matching the filters
        this.db.volumeConversion.count({
          where: filters,
        }),
        // Fetch the paginated and filtered volumeConversion
        this.db.volumeConversion.findMany({
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
   * Fetches a complete list of all volumeConversion without pagination.
   * @returns {Promise<{ volumeConversions: Prisma.VolumeConversion[] }>} The list of all volumeConversion.
   * @throws Will throw an error if the query fails.
   */
  async volumeConversionsList() {
    try {
      // Retrieve all volumeConversion
      const volumeConversions = await this.db.volumeConversion.findMany();

      // Return the list of volumeConversion
      return { volumeConversions };
    } catch (error) {
      // Handle query errors
      throw this.handleError(error);
    }
  }

  /**
   * Deletes a volumeConversion from the database.
   * @param {Prisma.VolumeConversionWhereUniqueInput} filter - The unique identifier of the volumeConversion to delete.
   * @returns {Promise<boolean>} Returns true if the deletion is successful.
   * @throws Will throw an error if the deletion fails.
   */
  async deleteVolumeConversion(
    filter: Prisma.VolumeConversionWhereUniqueInput
  ) {
    try {
      // Delete the volumeConversion based on the unique filter
      await this.db.volumeConversion.delete({
        where: filter,
      });

      // Return success status
      return true;
    } catch (error) {
      // Handle errors, such as trying to delete a non-existent volumeConversion
      throw this.handleError(error);
    }
  }
}
