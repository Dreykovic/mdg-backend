import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import { Prisma } from '@prisma/client';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import UOMService from '@/services/conversion/unit-of-measure.service';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import { CommonSchemas } from '@/api/validators/shared/common.validator';
import { UnitOfMeasureSchemas } from '@/api/validators/conversion/unit-of-measure.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/conversion/units', ['auth', 'rbac:ADMIN'])
export class UOMController {
  constructor(private readonly uOMService: UOMService) {}

  /**
   * Fetches a paginated and filtered list of uOM.
   *
   * @param {Request} req - The HTTP request object containing query parameters:
   *  - `page` (optional): The current page number (default is 1).
   *  - `pageSize` (optional): Number of items per page (default is 10).
   *  - `filters` (optional): JSON-encoded string with filter criteria.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the paginated list of uOMs.
   */
  @Get('/')
  @ControllerErrorHandler()
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async unitsOfMeasure(req: Request, res: Response): Promise<void> {
    logger.debug('List uOMs Request Received');

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
        ? JSON.parse(req.query.filters as string)
        : {};
    // Définir les champs dans lesquels vous autorisez la recherche
    const allowedFields = ['name', 'type']; // Par exemple, ces champs sont autorisés

    // Générer dynamiquement les conditions `where` avec `LIKE` et `OR`
    const whereConditions = WhereConditionBuilder.generateWhereConditions(
      filters,
      allowedFields
    );
    const payload = await this.uOMService.unitsOfMeasure(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Fetches a complete list of uOMs without pagination.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves with the full list of uOms.
   */
  @Get('/list')
  @ControllerErrorHandler()
  async unitsOfMeasureList(req: Request, res: Response): Promise<void> {
    logger.debug('List uOM Request Received');

    const payload = await this.uOMService.unitsOfMeasureList();

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
  @ControllerErrorHandler()
  @ValidateRequest({
    body: UnitOfMeasureSchemas.createUnitOfMeasure,
  })
  async createUnitOfMeasure(req: Request, res: Response): Promise<void> {
    logger.debug('Create uOM Request Received');

    const data = req.body;
    const payload = await this.uOMService.createUOM(data);

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
  @ControllerErrorHandler()
  @ValidateRequest({
    body: CommonSchemas.enntityWithNumberId,
  })
  async deleteUnitOfMeasure(req: Request, res: Response): Promise<void> {
    logger.debug('Delete uOM Request Received');

    const filter = req.body;
    const payload = await this.uOMService.deleteUnitOfMeasure(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Updates an existing uom.
   *
   * @param {Request} req - The HTTP request object containing the uom ID in the route parameters
   * and updated data in the body.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the uom is successfully updated.
   */
  @Put('/update/:modelId')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: UnitOfMeasureSchemas.updateUnitOfMeasure,
  })
  async updateUnitOfService(req: Request, res: Response): Promise<void> {
    logger.debug('Update uOM Request Received');

    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data: Prisma.UnitOfMeasureUpdateInput = req.body;

    const payload = await this.uOMService.updateUnitOfMeasure(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
