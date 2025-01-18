import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import ProductService from './product.service';
import StringUtil from '@/core/utils/string.util';
import WhereConditionBuilder from '@/core/utils/filter.utils';

@Service()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async products(req: Request, res: Response): Promise<void> {
    try {
      log('List product  Request Received');

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const allowedFields = ['name', 'description'];

      const whereConditions = WhereConditionBuilder.generateWhereConditions(
        filters,
        allowedFields
      );
      const payload = await this.productService.products(
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
          'An error occurred while fetching filtered products',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async productsList(req: Request, res: Response): Promise<void> {
    try {
      log('Filtered List product  Request Received');

      const payload = await this.productService.productsList();

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching products.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      log('Create product Request Received');

      const data = req.body;
      log('data received to create a product before casting', data);

      data.isActive = StringUtil.parseBool(req.body.isActive);
      data.isPublic = StringUtil.parseBool(req.body.isPublic);
      data.isGlutenFree = StringUtil.parseBool(req.body.isGlutenFree);
      data.isGMOFree = StringUtil.parseBool(req.body.isGMOFree);
      data.costPerGramGround = parseFloat(req.body.costPerGramGround);
      data.costPerGramWhole = parseFloat(req.body.costPerGramWhole);
      data.categoryId = parseFloat(req.body.categoryId);
      data.marginLevelId = parseFloat(req.body.marginLevelId);
      data.supplierId = parseFloat(req.body.supplierId);
      data.originId = parseFloat(req.body.originId);
      data.subcategoryId = req.body.subcategoryId
        ? parseFloat(req.body.subcategoryId)
        : null;
      log('data received to create a product', data);
      const payload = await this.productService.createProduct(data);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating the product.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      log('Delete Product Request Received');

      const filter = req.body;
      const payload = await this.productService.deleteProduct(filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while deleting the product.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      log('Update product Def Request Received');

      const id = req.params.modelId;
      const filter = id ? { id } : null;
      if (filter === null) {
        throw Error('Invalid modelId provided');
      }
      const data = req.body;

      data.isActive = StringUtil.parseBool(req.body.isActive);
      data.isPublic = StringUtil.parseBool(req.body.isPublic);
      data.isGlutenFree = StringUtil.parseBool(req.body.isGlutenFree);
      data.isGMOFree = StringUtil.parseBool(req.body.isGMOFree);
      data.costPerGramGround = parseFloat(req.body.costPerGramGround);
      data.costPerGramWhole = parseFloat(req.body.costPerGramWhole);
      data.categoryId = parseFloat(req.body.categoryId);
      data.marginLevelId = parseFloat(req.body.marginLevelId);
      data.supplierId = parseFloat(req.body.supplierId);
      data.originId = parseFloat(req.body.originId);
      data.subcategoryId = req.body.subcategoryId
        ? parseFloat(req.body.subcategoryId)
        : null;
      const payload = await this.productService.updateProduct(data, filter);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating the the product .',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
