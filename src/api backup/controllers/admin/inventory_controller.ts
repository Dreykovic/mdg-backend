import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import StringUtil from '@/core/utils/string.util';
import InventoryService from '@/services/inventory/inventory_service';
import StockMvtService from '@/services/inventory/stock_mvt_service';
import { InventoryMetadata } from '@/services/inventory/stock_validator';

@Service()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly stockMvtService: StockMvtService
  ) {}

  /**
   * Create a new inventory with initial stock
   */
  async createInventory(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.body;
      const { wareHouseId } = req.body;
      const userId = (req as any).user.id;

      // Parse and prepare inventory metadata
      const inventoryMetaData: InventoryMetadata = {
        ...req.body.inventoryMetaData,
        inStock: StringUtil.parseBool(req.body.inventoryMetaData.inStock),
        backOrderable: StringUtil.parseBool(
          req.body.inventoryMetaData.backOrderable
        ),
      };

      log(
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
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating inventory.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Update an existing inventory (excluding quantity, availableQuantity, reservedQuantity)
   */
  async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const inventoryId: string | undefined = req.params.modelId;

      if (
        !inventoryId ||
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

      log(
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
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating inventory.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }

  /**
   * Get inventory details for a product
   */
  async getInventory(req: Request, res: Response): Promise<void> {
    try {
      log('Get Inventory Request Received');
      const productId = req.params.modelId;
      if (!productId) {
        throw new Error('Product ID is required to fetch inventory.');
      }
      const inventory = await this.inventoryService.inventory(productId);
      const payload = { inventory };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching inventory.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller
  /**
   * Get inventory summary stats
   */
  async getInventorySummary(req: Request, res: Response): Promise<void> {
    try {
      log('Get Inventory Summary Request Received');
      const summary = await this.inventoryService.getInventorySummary();
      const payload = { summary };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching inventory summary.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Update inventory quantity
   */
  async updateInventoryQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { inventoryId } = req.params;
      const { quantity } = req.body;
      const userId = (req as any).user.id;

      if (!inventoryId) {
        throw new Error('Inventory ID is required.');
      }

      if (quantity === undefined || isNaN(Number(quantity))) {
        throw new Error('Valid quantity is required.');
      }

      log(`Update Inventory Quantity Request Received for ${inventoryId}`);

      const updatedInventory =
        await this.inventoryService.updateInventoryQuantity(
          inventoryId,
          Number(quantity),
          userId
        );

      const payload = { inventory: updatedInventory };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while updating inventory quantity.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Create a stock movement
   */
  async createStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const movementData = req.body;
      const userId = (req as any).user.id;

      log('Create Stock Movement Request Received');

      // Ensure user ID is included
      movementData.createdById = userId;

      const movement =
        await this.stockMvtService.createStockMovement(movementData);

      const payload = { movement };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating stock movement.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Get a stock movement by ID
   */
  async getStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const { movementId } = req.params;

      if (!movementId) {
        throw new Error('Movement ID is required.');
      }

      log(`Get Stock Movement Request Received for ${movementId}`);

      const movement = await this.stockMvtService.getStockMovement(movementId);

      const payload = { movement };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching stock movement.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Get recent stock movements
   */
  async getRecentMovements(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;

      log('Get Recent Stock Movements Request Received');

      const movements = await this.stockMvtService.getRecentMovements(limit);

      const payload = { movements };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recent movements.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Process a stock movement
   */
  async processStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const { movementId } = req.params;
      const { action } = req.body;
      const userId = (req as any).user.id;

      if (!movementId) {
        throw new Error('Movement ID is required.');
      }

      if (!action) {
        throw new Error(
          'Action is required (approve, start, complete, cancel).'
        );
      }

      log(
        `Process Stock Movement Request Received for ${movementId} with action ${action}`
      );

      let result;

      switch (action) {
        case 'approve':
          result = await this.stockMvtService.approveStockMovement(
            movementId,
            userId
          );
          break;
        case 'start':
          result = await this.stockMvtService.startProcessingMovement(
            movementId,
            userId
          );
          break;
        case 'complete':
          result = await this.stockMvtService.completeStockMovement(
            movementId,
            userId
          );
          break;
        case 'cancel':
          result = await this.stockMvtService.cancelStockMovement(
            movementId,
            userId
          );
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }

      const payload = { result };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while processing stock movement.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
