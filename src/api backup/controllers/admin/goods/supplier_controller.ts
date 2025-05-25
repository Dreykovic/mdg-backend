import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';

import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import SupplierService from '@/services/goods/supplier_service';

@Service()
export default class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  async suppliers(req: Request, res: Response): Promise<void> {
    try {
      log('Filtered list Suppliers Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
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
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching suppliers.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async suppliersList(req: Request, res: Response): Promise<void> {
    try {
      log('List Suppliers Request Received');

      const payload = await this.supplierService.suppliersList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching suppliers.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createSupplier(req: Request, res: Response): Promise<void> {
    try {
      log('Create Supplier Request Received');

      const data = req.body;
      const payload = await this.supplierService.createSupplier(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the supplier.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteSupplier(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Supplier Request Received');

      const filter = req.body;
      const payload = await this.supplierService.deleteSupplier(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the supplier.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateSupplier(req: Request, res: Response): Promise<void> {
    try {
      log('Update Supplier Request Received');
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
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the supplier.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
