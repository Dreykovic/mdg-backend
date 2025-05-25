import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import { Prisma } from '@prisma/client';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import StringUtil from '@/core/utils/string.util';
import ProductTagService from '@/services/goods/product_tag_service';

@Service()
export class ProductTagController {
  constructor(private readonly productTagService: ProductTagService) {}

  async productTags(req: Request, res: Response): Promise<void> {
    try {
      log('List Recipe Categories Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const allowedFields = ['name'];
      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );

      const payload = await this.productTagService.productTags(
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
          'An error occurred while fetching recipe categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async productTagsList(req: Request, res: Response): Promise<void> {
    try {
      log('List Recipe Categories Request Received');

      const payload = await this.productTagService.productTagsList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recipe categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createProductTag(req: Request, res: Response): Promise<void> {
    try {
      log('Create Product Tag Request Received');

      const data = req.body;
      log(data);
      const payload = await this.productTagService.createProductTag(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the product tag.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteProductTag(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Product Tag Request Received');

      const filter = req.body;
      const payload = await this.productTagService.deleteProductTag(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the product tag.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateProductTag(req: Request, res: Response): Promise<void> {
    try {
      log('Update Product Tag Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data: Prisma.ProductTagUpdateInput = req.body;

      const payload = await this.productTagService.updateProductTag(
        data,
        filter
      );

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the product tag.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
