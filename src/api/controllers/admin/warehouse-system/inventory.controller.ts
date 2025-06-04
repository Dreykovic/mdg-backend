import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import StringUtil from '@/core/utils/string.util';
import InventoryService from '@/services/warehouse-systeme/inventory.service';
// import { InventoryMetadata } from '@/services/warehouse-systeme/stock.validator';
import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import { InventorySchemas } from '@/api/validators/warehouse-system/inventory,validator';
import { CommonSchemas } from '@/api/validators/shared/common.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/warehouse-system/inventory', ['auth', 'rbac:ADMIN'])
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Create a new inventory with initial stock
   */
  @Post('/save')
  @ControllerErrorHandler()
  @ValidateRequest({
    body: InventorySchemas.createInventory,
  })
  async createInventory(req: Request, res: Response): Promise<void> {
    const { sku } = req.body;
    const { wareHouseId } = req.body;
    const userId = (req as any).user.id;

    // Parse and prepare inventory metadata
    const inventoryMetaData = {
      ...req.body.inventoryMetaData,
      inStock: StringUtil.parseBool(req.body.inventoryMetaData.inStock),
      backOrderable: StringUtil.parseBool(
        req.body.inventoryMetaData.backOrderable
      ),
    };

    logger.debug(
      `Get Create Inventory For Product ${sku} Request Received `,
      inventoryMetaData
    );
    const inventory =
      await this.inventoryService.createInventoryWithStockMovement(
        sku,
        inventoryMetaData,
        wareHouseId,
        userId
      );

    const payload = { inventory };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Update an existing inventory (excluding quantity, availableQuantity, reservedQuantity)
   */
  @Put('/update/:modelId')
  @ControllerErrorHandler()
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
    body: InventorySchemas.updateInventory,
  })
  async updateInventory(req: Request, res: Response): Promise<void> {
    const inventoryId: string | undefined = req.params.modelId;

    if (
      inventoryId === null ||
      inventoryId === undefined ||
      typeof inventoryId !== 'string' ||
      inventoryId.trim() === ''
    ) {
      throw new Error(
        'Inventory ID is required and must be a non-empty string.'
      );
    }

    // const userId = (req as any).user.id;

    // Parse and sanitize update payload
    const updatePayload = {
      ...req.body,
      inStock:
        req.body.inStock !== undefined
          ? StringUtil.parseBool(req.body.inStock)
          : undefined,
      backOrderable:
        req.body.backOrderable !== undefined
          ? StringUtil.parseBool(req.body.backOrderable)
          : undefined,
    };

    logger.debug(
      `Received Update Inventory Request for ID: ${inventoryId}`,
      updatePayload
    );

    // Update the inventory
    const updatedInventory = await this.inventoryService.updateInventory(
      inventoryId,
      updatePayload
      // userId
    );

    const payload = { inventory: updatedInventory };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }

  /**
   * Get inventory details for a product
   */
  @Get('/get/:modelId')
  @ControllerErrorHandler()
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
  })
  async getInventory(req: Request, res: Response): Promise<void> {
    const productId = req.params.modelId;
    if (
      productId === null ||
      productId === undefined ||
      typeof productId !== 'string' ||
      productId.trim() === ''
    ) {
      throw new Error('Product ID is required to fetch inventory.');
    }

    const inventory = await this.inventoryService.inventory(productId);
    const payload = { inventory };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
  //TODO: Use this controller
  /**
   * Get inventory summary stats
   */
  @Get('/summary')
  @ControllerErrorHandler()
  async getInventorySummary(req: Request, res: Response): Promise<void> {
    logger.debug('Get Inventory Summary Request Received');
    const summary = await this.inventoryService.getInventorySummary();
    const payload = { summary };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
  //TODO: Use this controller

  /**
   * Update inventory quantity
   */
  @Patch('/update-quantity/:modelId')
  @ControllerErrorHandler()
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
    body: InventorySchemas.updateInventoryQuantity,
  })
  async updateInventoryQuantity(req: Request, res: Response): Promise<void> {
    const { inventoryId } = req.params;
    const { quantity } = req.body;
    const userId = (req as any).user.id;

    if (
      inventoryId === null ||
      inventoryId === undefined ||
      typeof inventoryId !== 'string' ||
      inventoryId.trim() === ''
    ) {
      throw new Error(
        'Inventory ID is required and must be a non-empty string.'
      );
    }

    if (quantity === undefined || isNaN(Number(quantity))) {
      throw new Error('Valid quantity is required.');
    }

    logger.debug(
      `Update Inventory Quantity Request Received for ${inventoryId}`
    );

    const updatedInventory =
      await this.inventoryService.updateInventoryQuantity(
        inventoryId,
        Number(quantity),
        userId
      );

    const payload = { inventory: updatedInventory };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
