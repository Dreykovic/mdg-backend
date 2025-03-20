import { Inventory } from '@prisma/client';
import { Service } from 'typedi';

import { InventoryMetadata, StockValidator } from './stock.validator';
import StockService from './stock.service';
import logger from '@/core/utils/logger.util';

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

        if (!userId) {
          throw new Error('User ID is required to create inventory');
        }

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

        // Calculate total value if unit cost is provided
        const totalValue = this.calculateStockValue(
          normalizedMetadata.quantity,
          normalizedMetadata.unitCost
        );

        // Create inventory record
        const productInventory = await tx.inventory.create({
          data: {
            quantity: normalizedMetadata.quantity,
            availableQuantity: normalizedMetadata.availableQuantity,
            minimumQuantity: normalizedMetadata.minimumQuantity,
            maximumQuantity: normalizedMetadata.maximumQuantity,
            safetyStockLevel: normalizedMetadata.safetyStockLevel,
            economicOrderQuantity: normalizedMetadata.economicOrderQuantity,
            reorderThreshold: normalizedMetadata.reorderThreshold,
            reorderQuantity: normalizedMetadata.reorderQuantity,
            leadTimeInDays: normalizedMetadata.leadTimeInDays,
            unitCost: normalizedMetadata.unitCost,
            totalValue,
            valuationMethod: normalizedMetadata.valuationMethod,
            inStock: normalizedMetadata.inStock,
            backOrderable: normalizedMetadata.backOrderable,
            stockLocation: normalizedMetadata.stockLocation,
            notes: normalizedMetadata.notes,
            warehouseId: warehouse.id,
            productId: product.id,
          },
        });

        // Vérifier si un mouvement de stock doit être enregistré
        if (productInventory.quantity > 0) {
          // Générer une référence pour le mouvement de stock
          const reference = await this.generateMovementReference(
            'INCOMING', // Utilisation du nouveau type
            warehouse.id
          );

          // Enregistrer le mouvement de stock avec le nouveau schéma
          await tx.stockMovement.create({
            data: {
              reference,
              inventoryId: productInventory.id,
              productId: product.id,
              quantity: normalizedMetadata.quantity,
              unitCost: normalizedMetadata.unitCost,
              totalValue,
              movementType: 'INCOMING',
              reason: 'INVENTORY',
              status: 'COMPLETED',
              notes: 'Initial stock',
              isAdjustment: false,
              documentNumber: reference,
              createdById: userId,
              executedAt: new Date(),
              metadata: {
                legacy: {
                  referenceType: 'INVENTORY',
                },
              },
            },
          });
        }

        return productInventory;
      } catch (error) {
        logger.error('Error creating inventory:', error);
        throw this.handleError(error);
      }
    });
  }

  /**
   * Get inventory details for a product including stock movements
   * @param productId Product ID
   * @returns Inventory details with stock movements
   */
  async inventory(productId: string): Promise<any> {
    try {
      const inventory = this.db.inventory.findUnique({
        where: { productId },
        include: {
          stockMovements: {
            include: {
              createdBy: true,
              executedBy: true,
              sourceWarehouse: true,
              destinationWarehouse: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          warehouse: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });
      return inventory;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get inventory levels summary
   * @returns Summary of inventory levels by status
   */
  async getInventorySummary() {
    try {
      const [total, inStock, lowStock, outOfStock, totalValue] =
        await Promise.all([
          this.db.inventory.count(),
          this.db.inventory.count({
            where: { inStock: true },
          }),
          this.db.inventory.count({
            where: {
              inStock: true,
              quantity: {
                lte: this.db.inventory.fields.reorderThreshold,
              },
            },
          }),
          this.db.inventory.count({
            where: { inStock: false },
          }),
          this.db.inventory.aggregate({
            _sum: {
              totalValue: true,
            },
          }),
        ]);

      return {
        total,
        inStock,
        lowStock,
        outOfStock,
        totalValue: totalValue._sum.totalValue || 0,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update inventory quantities and recalculate values
   * @param inventoryId Inventory ID
   * @param newQuantity New quantity
   * @param userId User making the change
   * @returns Updated inventory
   */
  async updateInventoryQuantity(
    inventoryId: string,
    newQuantity: number,
    userId: string
  ): Promise<Inventory> {
    return this.db.$transaction(async (tx) => {
      try {
        // Find the inventory
        const inventory = await tx.inventory.findUniqueOrThrow({
          where: { id: inventoryId },
          include: { warehouse: true, product: true },
        });

        const oldQuantity = inventory.quantity;
        const difference = newQuantity - oldQuantity;

        if (difference === 0) {
          return inventory; // No change needed
        }

        // Determine if this is an increase or decrease
        const movementType = difference > 0 ? 'INCOMING' : 'OUTGOING';
        const absoluteDifference = Math.abs(difference);

        // Generate reference
        const reference = await this.generateMovementReference(
          movementType,
          inventory.warehouseId
        );

        // Calculate values
        const totalValue = this.calculateStockValue(
          newQuantity,
          inventory.unitCost ?? undefined
        );

        // Update inventory
        const updatedInventory = await tx.inventory.update({
          where: { id: inventoryId },
          data: {
            quantity: newQuantity,
            availableQuantity: inventory.availableQuantity + difference,
            totalValue,
            inStock: newQuantity > 0,
            lastStockCheck: new Date(),
          },
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            reference,
            inventoryId,
            productId: inventory.productId as string,
            quantity: absoluteDifference,
            unitCost: inventory.unitCost,
            totalValue: this.calculateStockValue(
              absoluteDifference,
              inventory.unitCost ?? undefined
            ),
            movementType,
            reason: 'ADJUSTMENT_INVENTORY',
            status: 'COMPLETED',
            notes: `Manual adjustment from ${oldQuantity} to ${newQuantity}`,
            isAdjustment: true,
            documentNumber: reference,
            createdById: userId,
            executedById: userId,
            executedAt: new Date(),
          },
        });

        return updatedInventory;
      } catch (error) {
        logger.error('Error updating inventory quantity:', error);
        throw this.handleError(error);
      }
    });
  }

  /**
   * Updates an existing inventory record (excluding quantity, availableQuantity, reservedQuantity)
   * @param inventoryId ID of the inventory record to update
   * @param updates Partial inventory fields to update
   * @param userId Optional user ID performing the update
   * @returns Updated inventory record
   */
  async updateInventory(
    inventoryId: string,
    updates: Partial<
      Omit<Inventory, 'quantity' | 'availableQuantity' | 'reservedQuantity'>
    >
    // userId?: string
  ): Promise<Inventory> {
    return this.db.$transaction(async (tx) => {
      try {
        // Fetch current inventory
        const existingInventory = await tx.inventory.findUniqueOrThrow({
          where: { id: inventoryId },
        });

        // Filter out non-editable fields if present in update payload
        const safeUpdates = { ...updates };
        const bufferLevel =
          updates.safetyStockLevel ?? existingInventory.safetyStockLevel;
        // Optionally, validate updates if needed
        const validatedUpdates =
          StockValidator.validateInventoryUpdateData(safeUpdates);
        validatedUpdates.inStock =
          existingInventory.availableQuantity > bufferLevel &&
          existingInventory.availableQuantity > 0;
        // Perform update
        const updatedInventory = await tx.inventory.update({
          where: { id: inventoryId },
          data: {
            ...validatedUpdates,
            updatedAt: new Date(), // Optional: Track update time
          },
        });

        // Optionally log the update or track change history
        // if (userId) {
        //   await tx.inventoryLog.create({
        //     data: {
        //       inventoryId,
        //       userId,
        //       action: 'UPDATE',
        //       description:
        //         'Inventory fields updated (excluding quantity and availability)',
        //       metadata: { updatedFields: Object.keys(validatedUpdates) },
        //       createdAt: new Date(),
        //     },
        //   });
        // }

        return updatedInventory;
      } catch (error) {
        logger.error('Error updating inventory:', error);
        throw this.handleError(error);
      }
    });
  }
}
