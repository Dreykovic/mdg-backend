import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import StringUtil from '@/core/utils/string.util';
import WhereConditionBuilder from '@/core/utils/filter.utils';
import ProductService from '@/services/goods/product_service';

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
  async product(req: Request, res: Response): Promise<void> {
    try {
      log('Fetch unique product  Request Received');

      const productId = req.params.modelId;
      if (!productId) {
        const response = ApiResponse.http400({
          message:
            'An error occurred while fetching unique product, Please provide a valid product Id',
        });
        res.status(response.httpStatusCode).json(response.data);
      }
      const filters = { id: productId };

      const payload = await this.productService.product(filters);

      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http404({
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

      data.isActive = req.body.isActive
        ? StringUtil.parseBool(req.body.isActive)
        : undefined;
      data.isFeatured = req.body.isFeatured
        ? StringUtil.parseBool(req.body.isFeatured)
        : undefined;
      data.isArchived = req.body.isArchived
        ? StringUtil.parseBool(req.body.isArchived)
        : undefined;
      data.isGlutenFree = req.body.isGlutenFree
        ? StringUtil.parseBool(req.body.isGlutenFree)
        : undefined;
      data.isGMOFree = req.body.isGMOFree
        ? StringUtil.parseBool(req.body.isGMOFree)
        : undefined;
      data.costPerGramGround = req.body.costPerGramGround
        ? parseFloat(req.body.costPerGramGround)
        : undefined;
      data.costPerGramWhole = req.body.costPerGramWhole
        ? parseFloat(req.body.costPerGramWhole)
        : undefined;
      data.categoryId = req.body.categoryId
        ? parseFloat(req.body.categoryId)
        : undefined;
      data.marginLevelId = req.body.marginLevelId
        ? parseFloat(req.body.marginLevelId)
        : undefined;
      data.supplierId = req.body.supplierId
        ? parseFloat(req.body.supplierId)
        : undefined;
      data.originId = req.body.originId
        ? parseFloat(req.body.originId)
        : undefined;
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
