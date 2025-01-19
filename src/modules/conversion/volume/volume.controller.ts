import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import VolumeConversionService from './volume.service';
import WhereConditionBuilder from '@/core/utils/filter.utils';

@Service()
export class VolumeConversionController {
  constructor(
    private readonly volumeConversionService: VolumeConversionService
  ) {}

  /**
   * Fetches a paginated and filtered list of volumeConversion.
   *
   * @param {Request} req - The HTTP request object containing query parameters:
   *  - `page` (optional): The current page number (default is 1).
   *  - `pageSize` (optional): Number of items per page (default is 10).
   *  - `filters` (optional): JSON-encoded string with filter criteria.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the paginated list of volumeConversions.
   */
  async volumeConversions(req: Request, res: Response): Promise<void> {
    try {
      log('List volumeConversions Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};
      // Définir les champs dans lesquels vous autorisez la recherche
      const allowedFields = ['productId', 'stdVolId', 'unitOfMeasureId']; // Par exemple, ces champs sont autorisés

      // Générer dynamiquement les conditions `where` avec `LIKE` et `OR`
      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );
      const payload = await this.volumeConversionService.volumeConversions(
        page,
        pageSize,
        whereConditions
      );

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching volume conversions.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async volumeConversionsList(req: Request, res: Response): Promise<void> {
    try {
      log('List volumeConversion Request Received');

      const payload =
        await this.volumeConversionService.volumeConversionsList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching volume conversions.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Creates a new uom.
   *
   * @param {Request} req - The HTTP request object containing the new uom data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the uom is successfully created.
   */
  async createVolumeConversion(req: Request, res: Response): Promise<void> {
    try {
      log('Create volumeConversion Request Received');

      const data = req.body;
      data.m1 = parseFloat(data.m1);
      data.m2 = parseFloat(data.m2);
      data.m3 = parseFloat(data.m3);
      // data.stdVolId = parseFloat(data.stdVolId);
      const payload =
        await this.volumeConversionService.createVolumeConversion(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the volume conversion.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Deletes a uom based on the provided filter.
   *
   * @param {Request} req - The HTTP request object containing the filter in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the uom is successfully deleted.
   */
  async deleteVolumeConversion(req: Request, res: Response): Promise<void> {
    try {
      log('Delete volumeConversion Request Received');

      const filter = req.body;
      const payload =
        await this.volumeConversionService.deleteVolumeConversion(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the unit of service.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
