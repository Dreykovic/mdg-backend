import { Inventory, MovementType } from '@prisma/client';
import { Service } from 'typedi';

import { InventoryMetadata, StockValidator } from './stock.validator';
import StockService from './stock.service';

@Service()
export default class InventoryService extends StockService {
  /**
   * Creates a new inventory record for a product
   * @param sku Product SKU
   * @param inventoryMetadata Inventory settings
   * @param userId Optional user ID who is creating the inventory
   * @param warehouseId Optional warehouse ID (uses default if not provided)
   * @returns Created inventory record
   */
  async createInventory(
    sku: string,
    inventoryMetadata: InventoryMetadata,
    warehouseId?: string
  ): Promise<{ productInventory: Inventory }> {
    try {
      // Validate SKU
      StockValidator.validateSku(sku);

      // Find the product first
      const product = await this.db.product.findUniqueOrThrow({
        where: { sku },
      });

      // Validate and find warehouse - use specified or default
      if (warehouseId) {
        StockValidator.validateWarehouseId(warehouseId);
      }
      const warehouse = await this.findWarehouse(warehouseId);

      // Validate and normalize inventory metadata
      const normalizedMetadata =
        StockValidator.validateInventoryMetadata(inventoryMetadata);

      // Create inventory record
      const productInventory = await this.db.inventory.create({
        data: {
          quantity: normalizedMetadata.quantity,
          availableQuantity: normalizedMetadata.availableQuantity,
          reorderThreshold: normalizedMetadata.reorderThreshold,
          reorderQuantity: normalizedMetadata.reorderQuantity,
          inStock: normalizedMetadata.inStock,
          backorderable: normalizedMetadata.backorderable,
          warehouseId: warehouse.id,
          productId: product.id,
        },
      });

      // // Record the initial stock movement
      // if (normalizedMetadata.quantity > 0) {
      //   await this.recordStockMovement({
      //     inventoryId: productInventory.id,
      //     quantity: normalizedMetadata.quantity,
      //     type: 'STOCK_IN' as MovementType,
      //     notes: 'Initial inventory',
      //     referenceType: 'INITIALIZATION',
      //     userId,
      //     warehouseId: warehouse.id,
      //   });
      // }

      return { productInventory };
    } catch (error) {
      // Handle any database or validation errors
      throw this.handleError(error);
    }
  }

  /**
   * Update inventory and record stock movement
   */
  async updateInventoryQuantity(
    inventoryId: string,
    changeAmount: number,
    movementType: MovementType,
    notes?: string,
    referenceType?: string,
    referenceId?: string,
    userId?: string
  ): Promise<Inventory> {
    try {
      // Get current inventory
      const inventory = await this.db.inventory.findUniqueOrThrow({
        where: { id: inventoryId },
      });

      // Calculate new quantities
      const newQuantity = inventory.quantity + changeAmount;
      let newAvailableQuantity = inventory.availableQuantity + changeAmount;

      // Ensure available quantity doesn't go below 0 for non-backorderable items
      if (!inventory.backorderable && newAvailableQuantity < 0) {
        newAvailableQuantity = 0;
      }

      // Update the inventory
      const updatedInventory = await this.db.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: newQuantity,
          availableQuantity: newAvailableQuantity,
          inStock: newQuantity > 0,
        },
      });

      // Record the movement
      await this.db.stockMovement.create({
        data: {
          quantity: Math.abs(changeAmount), // Always store positive quantity
          type: movementType,
          notes,
          referenceType,
          referenceId,
          inventoryId,
          userId,
        },
      });

      return updatedInventory;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reserve inventory (for cart or pending order)
   */
  async reserveInventory(
    inventoryId: string,
    quantity: number,
    referenceType: string,
    referenceId: string,
    userId?: string
  ): Promise<Inventory> {
    try {
      const inventory = await this.db.inventory.findUniqueOrThrow({
        where: { id: inventoryId },
      });

      // Validate reservation
      StockValidator.validateInventoryReservation(
        inventory.availableQuantity,
        quantity,
        inventory.backorderable
      );

      // Update inventory
      const updatedInventory = await this.db.inventory.update({
        where: { id: inventoryId },
        data: {
          availableQuantity: { decrement: quantity },
          reservedQuantity: { increment: quantity },
        },
      });

      // Record the reservation
      await this.db.stockMovement.create({
        data: {
          quantity,
          type: 'STOCK_OUT',
          notes: `Reserved for ${referenceType} #${referenceId}`,
          referenceType,
          referenceId,
          inventoryId,
          userId,
        },
      });

      return updatedInventory;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
