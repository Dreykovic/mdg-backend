import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';

import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import SupplierService from '@/services/goods/supplier.service';
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
import { SupplierSchemas } from '@/api/validators/goods/supplier.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/goods/suppliers', ['auth', 'rbac:ADMIN'])
export default class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get('/')
  @ControllerErrorHandler('Error fetching suppliers.')
  @ValidateRequest({
    query: CommonSchemas.getEntities,
  })
  async suppliers(req: Request, res: Response): Promise<void> {
    logger.debug('Filtered list Suppliers Request Received');

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters =
      req.query.filters !== undefined && req.query.filters !== null
        ? JSON.parse(req.query.filters as string)
        : {};
    const allowedFields = ['name', 'address1', 'city', 'state', 'country'];

    const whereConditions = WhereConditionBuilder.generateWhereConditions(
      filters,
      allowedFields
    );
    const payload = await this.supplierService.suppliers(
      page,
      pageSize,
      whereConditions
    );

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Get('/list')
  @ControllerErrorHandler('Error fetching suppliers list.')
  async suppliersList(_req: Request, res: Response): Promise<void> {
    logger.debug('List Suppliers Request Received');

    const payload = await this.supplierService.suppliersList();

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Post('/save')
  @ControllerErrorHandler('Error creating supplier.')
  @ValidateRequest({
    body: SupplierSchemas.createSupplier,
  })
  async createSupplier(req: Request, res: Response): Promise<void> {
    logger.debug('Create Supplier Request Received');

    const data = req.body;
    const payload = await this.supplierService.createSupplier(data);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Delete('/delete')
  @ControllerErrorHandler('Error deleting supplier.')
  @ValidateRequest({
    body: CommonSchemas.deleteEntityWithNumberId,
  })
  async deleteSupplier(req: Request, res: Response): Promise<void> {
    logger.debug('Delete Supplier Request Received');

    const filter = req.body;
    const payload = await this.supplierService.deleteSupplier(filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  @Put('/update/:modelId')
  @ControllerErrorHandler('Error updating supplier.')
  @ValidateRequest({
    params: CommonSchemas.entityNumberParam,
    body: SupplierSchemas.updateSupplier,
  })
  async updateSupplier(req: Request, res: Response): Promise<void> {
    logger.debug('Update Supplier Request Received');
    const modelIdParam = req.params.modelId;
    const id = StringUtil.parseAndValidateNumber(modelIdParam);

    if (id === null) {
      throw Error("Invalid modelId parameter'");
    }
    const filter = { id };
    const data = req.body;

    const payload = await this.supplierService.updateSupplier(data, filter);

    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
