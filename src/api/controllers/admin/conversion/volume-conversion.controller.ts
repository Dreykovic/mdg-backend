import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import VolumeConversionService from '@/services/conversion/volume-conversion.service';
import {
  Controller,
  Delete,
  Get,
  Post,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import { CommonSchemas } from '@/api/validators/shared/common.validator';
import { VolumeConversionSchemas } from '@/api/validators/conversion/volume-conversion.validator';

@Service()
@Controller('/admin/conversion/volume-conversion', ['auth', 'rbac:ADMIN'])
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
  @Get('/')
  @ControllerErrorHandler('VolumeConversionController.volumeConversions')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async volumeConversions(req: Request, res: Response): Promise<void> {
    log('List volumeConversions Request Received');

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const filters =
      typeof req.query.filters === 'string' && req.query.filters
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
  }

  @Get('/list')
  @ControllerErrorHandler('VolumeConversionController.volumeConversionsList')
  async volumeConversionsList(req: Request, res: Response): Promise<void> {
    log('List volumeConversion Request Received');

    const payload = await this.volumeConversionService.volumeConversionsList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Creates a new uom.
   *
   * @param {Request} req - The HTTP request object containing the new uom data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the uom is successfully created.
   */
  @Post('/save')
  @ControllerErrorHandler('VolumeConversionController.createVolumeConversion')
  @ValidateRequest({
    body: VolumeConversionSchemas.createVolumeConversion,
  })
  async createVolumeConversion(req: Request, res: Response): Promise<void> {
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
  }

  /**
   * Deletes a uom based on the provided filter.
   *
   * @param {Request} req - The HTTP request object containing the filter in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the uom is successfully deleted.
   */
  @Delete('/delete')
  @ControllerErrorHandler('VolumeConversionController.deleteVolumeConversion')
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteVolumeConversion(req: Request, res: Response): Promise<void> {
    log('Delete volumeConversion Request Received');

    const filter = req.body;
    const payload =
      await this.volumeConversionService.deleteVolumeConversion(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
