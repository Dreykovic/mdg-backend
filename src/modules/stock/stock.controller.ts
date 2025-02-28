import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';
import InventoryService from './inventory.service';
import StockMvtService from './stockMvt.service';
import { InventoryMetadata } from './stock.validator';

@Service()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly stockMvtService: StockMvtService
  ) {}

  async createInventory(req: Request, res: Response): Promise<void> {
    try {
      const sku: string = req.body.sku;
      const wareHouseId: string = req.body.wareHouseId;
      const inventoryMetaData: InventoryMetadata = req.body.inventoryMetaData;
      const userId = (req as any).user.id;

      log(`Get Create Inventory For Product ${sku} Request Received`);

      const inventory = await this.inventoryService.createInventory(
        sku,
        inventoryMetaData,
        wareHouseId
      );
      if (inventoryMetaData.quantity > 0) {
        await this.stockMvtService.recordStockMovement({
          inventoryId: inventory.productInventory.id,
          quantity: inventoryMetaData.quantity,
          type: 'STOCK_IN',
          notes: 'Initial stock',
          referenceType: 'INVENTORY',
          userId,
          warehouseId: inventory.productInventory.warehouseId,
        });
      }

      const payload = { inventory };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);

      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching volume conversions.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
