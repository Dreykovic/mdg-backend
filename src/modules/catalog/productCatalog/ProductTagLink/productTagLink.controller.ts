import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import WhereConditionBuilder from '@/core/utils/filter.utils';
import ProductTagLinkService from './productTagLink.service';
import StringUtil from '@/core/utils/string.util';

@Service()
export class ProductTagLinkController {
  constructor(private readonly productTagLinkService: ProductTagLinkService) {}

  async productTagLinks(req: Request, res: Response): Promise<void> {
    try {
      log('List ProductTagLink  Request Received');

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

      const payload = await this.productTagLinkService.productTagLinks(
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
          'An error occurred while fetching productTagLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async tagLinksList(req: Request, res: Response): Promise<void> {
    try {
      log('List TagLink  Request Received');

      const payload = await this.productTagLinkService.tagLinksList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching productTagLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  async productTagLinksList(req: Request, res: Response): Promise<void> {
    try {
      log('List ProductTagLink  Request Received');
      const productId = req.params.modelId;
      if (!productId) {
        throw Error('Product Id is required to fetch tag links');
      }
      const payload =
        await this.productTagLinkService.productTagLinksList(productId);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching productTagLink categories.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createProductTagLink(req: Request, res: Response): Promise<void> {
    try {
      log('Create ProductTagLink  Request Received');

      const data = req.body;
      log('data received ', data);
      data.productTagId = parseInt(data.productTagId);

      const payload =
        await this.productTagLinkService.createProductTagLink(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the productTagLink category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteProductTagLink(req: Request, res: Response): Promise<void> {
    try {
      log('Delete ProductTagLink  Request Received');

      const filter = req.body;
      const payload =
        await this.productTagLinkService.deleteProductTagLink(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the productTagLink category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateProductTagLink(req: Request, res: Response): Promise<void> {
    try {
      log('Update ProductTagLink  Request Received');

      const modelIdParam = req.params.modelId;
      const id = StringUtil.parseAndValidateNumber(modelIdParam);

      if (id === null) {
        throw Error("Invalid modelId parameter'");
      }
      const filter = { id };
      const data = req.body;

      data.productTagId = parseInt(data.productTagId);

      const payload = await this.productTagLinkService.updateProductTagLink(
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
          'An error occurred while updating the productTagLink category.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
