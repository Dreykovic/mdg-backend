import { Inventory } from '@prisma/client';
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
  async createInventoryWithStockMovement(
    sku: string,
    inventoryMetadata: InventoryMetadata,
    warehouseId?: string,
    userId?: string
  ): Promise<Inventory> {
    return this.db.$transaction(async (tx) => {
      try {
        // Validate SKU
        StockValidator.validateSku(sku);

        // Find the product first
        const product = await tx.product.findUniqueOrThrow({
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
        const productInventory = await tx.inventory.create({
          data: {
            quantity: normalizedMetadata.quantity,
            availableQuantity: normalizedMetadata.availableQuantity,
            reorderThreshold: normalizedMetadata.reorderThreshold,
            reorderQuantity: normalizedMetadata.reorderQuantity,
            inStock: normalizedMetadata.inStock,
            backOrderable: normalizedMetadata.backOrderable,
            warehouseId: warehouse.id,
            productId: product.id,
          },
        });

        // Vérifier si un mouvement de stock doit être enregistré
        if (productInventory.quantity > 0) {
          // Générer un ID de référence pour le mouvement de stock
          const referenceId = await this.generateMovementReferenceId(
            'STOCK_IN',
            warehouse.id
          );

          // Enregistrer le mouvement de stock
          await tx.stockMovement.create({
            data: {
              inventoryId: productInventory.id,
              quantity: inventoryMetadata.quantity,
              type: 'STOCK_IN',
              notes: 'Initial stock',
              referenceType: 'INVENTORY',
              referenceId,
              userId,
            },
          });
        }

        return productInventory;
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async inventory(productId: string): Promise<any> {
    try {
      const inventory = this.db.inventory.findUnique({
        where: { productId },
        include: {
          stockMovements: {
            include: { user: true },
          },
          warehouse: true,
        },
      });
      return inventory;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
