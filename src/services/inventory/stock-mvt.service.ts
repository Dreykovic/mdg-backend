import { Inventory, MovementReason, StockMovement } from '@prisma/client';
import { Service } from 'typedi';

import { StockMovementData, StockValidator } from './stock.validator';
import StockService from './stock.service';
import {
  CriticalServiceErrorHandler,
  ServiceErrorHandler,
} from '@/core/decorators/error-handler.decorator';
import logger from '@/core/utils/logger.util';

@Service()
export default class StockMvtService extends StockService {
  /**
   * Create a new stock movement
   * @param data Stock movement data
   * @returns Created stock movement
   */
  @ServiceErrorHandler()
  async createStockMovement(data: StockMovementData): Promise<StockMovement> {
    return this.db.$transaction(async (tx) => {
      // Validate the movement data
      const validatedData = StockValidator.validateStockMovement(data);

      // Find the inventory record
      const inventory = await tx.inventory.findUniqueOrThrow({
        where: { id: validatedData.inventoryId },
        include: { warehouse: true },
      });

      // Generate a reference for the movement
      const reference = await this.generateMovementReference(
        validatedData.movementType,
        inventory.warehouseId
      );

      // Calculate total value
      const totalValue = this.calculateStockValue(
        validatedData.quantity,
        (validatedData.unitCost ?? inventory.unitCost) as number
      );

      // Create the movement
      const movement = await tx.stockMovement.create({
        data: {
          reference,
          inventoryId: validatedData.inventoryId,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          unitCost: validatedData.unitCost ?? inventory.unitCost,
          totalValue,
          movementType: validatedData.movementType,
          reason: validatedData.reason as MovementReason,
          status: validatedData.status,
          notes: validatedData.notes,
          lotNumber: validatedData.lotNumber,
          expiryDate: validatedData.expiryDate,
          batchId: validatedData.batchId,
          isAdjustment: validatedData.isAdjustment ?? false,
          documentNumber: validatedData.documentNumber ?? reference,
          scheduledAt: validatedData.scheduledAt,
          sourceWarehouseId: validatedData.sourceWarehouseId,
          destinationWarehouseId: validatedData.destinationWarehouseId,
          createdById: validatedData.createdById,
          approvedById: validatedData.approvedById,
          metadata:
            validatedData.referenceType !== null &&
            validatedData.referenceType !== undefined &&
            validatedData.referenceType !== ''
              ? {
                  legacy: {
                    referenceType: validatedData.referenceType,
                    referenceId: validatedData.referenceId,
                  },
                }
              : undefined,
        },
      });

      // If the movement is already completed, apply the inventory changes
      if (movement.status === 'COMPLETED') {
        await this.applyStockMovement(movement.id, tx);
      }

      return movement;
    });
  }

  /**
   * Process a stock movement and update inventory
   * @param movementId Movement ID
   * @param tx Optional transaction object for nested transactions
   * @returns Updated inventory
   */
  @CriticalServiceErrorHandler()
  async applyStockMovement(movementId: string, tx?: any): Promise<Inventory> {
    const prisma = tx ?? this.db;

    // Get the movement with related inventory
    const movement = await prisma.stockMovement.findUniqueOrThrow({
      where: { id: movementId },
      include: { inventory: true },
    });

    // Ensure the movement isn't already completed
    if (
      movement.status === 'COMPLETED' &&
      movement.executedAt !== null &&
      movement.executedAt !== undefined
    ) {
      throw new Error('Movement already completed');
    }

    const { inventory } = movement;
    let updatedQuantity = inventory.quantity;
    let updatedAvailableQuantity = inventory.availableQuantity;

    // Update inventory based on movement type
    switch (movement.movementType) {
      case 'INCOMING':
        updatedQuantity += movement.quantity;
        updatedAvailableQuantity += movement.quantity;
        break;

      case 'OUTGOING':
        // Validate we have enough available quantity
        if (
          inventory.backOrderable === false &&
          updatedAvailableQuantity < movement.quantity
        ) {
          throw new Error(
            `Insufficient inventory: available ${updatedAvailableQuantity}, requested ${movement.quantity}`
          );
        }
        updatedQuantity -= movement.quantity;
        updatedAvailableQuantity -= movement.quantity;
        break;

      case 'ADJUSTMENT':
        // For adjustments, the quantity is absolute (not relative)
        if (movement.isAdjustment === true) {
          const difference = movement.quantity - updatedQuantity;
          updatedQuantity = movement.quantity;
          updatedAvailableQuantity += difference;
        }
        break;

      case 'TRANSFER':
        // For transfers, we need to handle both source and destination inventories
        if (
          movement.sourceWarehouseId !== null &&
          movement.sourceWarehouseId !== undefined &&
          movement.destinationWarehouseId !== null &&
          movement.destinationWarehouseId !== undefined
        ) {
          // This is handled separately in a transfer-specific method
          const invemtory = await this.processTransfer(movement.id, tx);
          return invemtory;
        }
        break;

      default:
        throw new Error(`Unsupported movement type: ${movement.movementType}`);
    }

    // Calculate new total value
    const totalValue = this.calculateStockValue(
      updatedQuantity,
      inventory.unitCost
    );

    // Update the inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: updatedQuantity,
        availableQuantity: updatedAvailableQuantity,
        totalValue,
        inStock: updatedAvailableQuantity > inventory.safetyStockLevel,
        lastStockCheck: new Date(),
      },
    });

    // Update the movement status to completed
    await prisma.stockMovement.update({
      where: { id: movement.id },
      data: {
        status: 'COMPLETED',
        executedAt: new Date(),
      },
    });

    return updatedInventory;
  }

  /**
   * Process a transfer between warehouses
   * @param movementId Transfer movement ID
   * @param tx Optional transaction object
   * @returns Destination inventory
   */
  // eslint-disable-next-line max-lines-per-function
  @CriticalServiceErrorHandler()
  private async processTransfer(
    movementId: string,
    tx?: any
  ): Promise<Inventory> {
    const prisma = tx ?? this.db;

    // Get the transfer movement
    const movement = await prisma.stockMovement.findUniqueOrThrow({
      where: { id: movementId },
      include: {
        inventory: true,
        product: true,
      },
    });

    if (movement.movementType !== 'TRANSFER') {
      throw new Error('This method only handles transfer movements');
    }

    if (
      movement.sourceWarehouseId === null ||
      movement.sourceWarehouseId === undefined ||
      movement.destinationWarehouseId === null ||
      movement.destinationWarehouseId === undefined
    ) {
      throw new Error('Transfer requires source and destination warehouses');
    }

    // Get source inventory
    const sourceInventory = movement.inventory;

    // Verify we have enough stock
    if (
      sourceInventory.backOrderable === false &&
      sourceInventory.availableQuantity < movement.quantity
    ) {
      throw new Error(
        `Insufficient inventory for transfer: available ${sourceInventory.availableQuantity}, requested ${movement.quantity}`
      );
    }

    // Find or create destination inventory
    let destinationInventory = await prisma.inventory.findFirst({
      where: {
        productId: movement.productId,
        warehouseId: movement.destinationWarehouseId,
      },
    });

    destinationInventory ??= await prisma.inventory.create({
      data: {
        productId: movement.productId,
        warehouseId: movement.destinationWarehouseId,
        quantity: 0,
        availableQuantity: 0,
        reorderThreshold: sourceInventory.reorderThreshold,
        reorderQuantity: sourceInventory.reorderQuantity,
        unitCost: sourceInventory.unitCost,
        valuationMethod: sourceInventory.valuationMethod,
        inStock: false,
        backOrderable: sourceInventory.backOrderable,
      },
    });

    // Update source inventory (decrease)
    const updatedSourceInventory = await prisma.inventory.update({
      where: { id: sourceInventory.id },
      data: {
        quantity: sourceInventory.quantity - movement.quantity,
        availableQuantity:
          sourceInventory.availableQuantity - movement.quantity,
        totalValue: this.calculateStockValue(
          sourceInventory.quantity - movement.quantity,
          sourceInventory.unitCost
        ),
        inStock: sourceInventory.quantity - movement.quantity > 0,
      },
    });
    logger.debug(updatedSourceInventory);
    // Update destination inventory (increase)
    const updatedDestinationInventory = await prisma.inventory.update({
      where: { id: destinationInventory.id },
      data: {
        quantity: destinationInventory.quantity + movement.quantity,
        availableQuantity:
          destinationInventory.availableQuantity + movement.quantity,
        totalValue: this.calculateStockValue(
          destinationInventory.quantity + movement.quantity,
          destinationInventory.unitCost ?? sourceInventory.unitCost
        ),
        inStock: true,
        lastReceivedDate: new Date(),
      },
    });

    // Update the movement status
    await prisma.stockMovement.update({
      where: { id: movement.id },
      data: {
        status: 'COMPLETED',
        executedAt: new Date(),
      },
    });

    return updatedDestinationInventory;
  }

  /**
   * Get stock movement details
   * @param movementId Movement ID
   * @returns Stock movement with related data
   */
  @ServiceErrorHandler()
  async getStockMovement(movementId: string): Promise<any> {
    return this.db.stockMovement.findUniqueOrThrow({
      where: { id: movementId },
      include: {
        inventory: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        executedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        sourceWarehouse: true,
        destinationWarehouse: true,
        parentMovement: true,
        childMovements: true,
      },
    });
  }

  /**
   * Get recent stock movements
   * @param limit Number of movements to return
   * @returns Recent stock movements
   */
  @ServiceErrorHandler()
  async getRecentMovements(limit = 10): Promise<any> {
    return this.db.stockMovement.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        inventory: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
    });
  }

  /**
   * Cancel a pending stock movement
   * @param movementId Movement ID
   * @param userId User ID making the cancellation
   * @returns Updated movement
   */
  @ServiceErrorHandler()
  async cancelStockMovement(
    movementId: string,
    userId: string
  ): Promise<StockMovement> {
    const movement = await this.db.stockMovement.findUniqueOrThrow({
      where: { id: movementId },
    });

    if (movement.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed movement');
    }

    return this.db.stockMovement.update({
      where: { id: movementId },
      data: {
        status: 'CANCELLED',
        notes:
          movement.notes !== null && movement.notes !== ''
            ? `${movement.notes} | Cancelled by user.`
            : 'Cancelled by user.',
        executedById: userId,
      },
    });
  }

  /**
   * Update movement status to IN_PROGRESS
   * @param movementId Movement ID
   * @param userId User ID making the update
   * @returns Updated movement
   */
  @ServiceErrorHandler()
  async startProcessingMovement(
    movementId: string,
    userId: string
  ): Promise<StockMovement> {
    const movement = await this.db.stockMovement.findUniqueOrThrow({
      where: { id: movementId },
    });

    if (movement.status !== 'DRAFT' && movement.status !== 'PLANNED') {
      throw new Error(
        `Cannot start processing a movement with status: ${movement.status}`
      );
    }

    return this.db.stockMovement.update({
      where: { id: movementId },
      data: {
        status: 'IN_PROGRESS',
        executedById: userId,
      },
    });
  }

  /**
   * Approve a stock movement
   * @param movementId Movement ID
   * @param userId User ID approving the movement
   * @returns Approved movement
   */
  @ServiceErrorHandler()
  async approveStockMovement(
    movementId: string,
    userId: string
  ): Promise<StockMovement> {
    const movement = await this.db.stockMovement.findUniqueOrThrow({
      where: { id: movementId },
    });

    // Only draft or planned movements can be approved
    if (movement.status !== 'DRAFT' && movement.status !== 'PLANNED') {
      throw new Error(
        `Cannot approve a movement with status: ${movement.status}`
      );
    }

    return this.db.stockMovement.update({
      where: { id: movementId },
      data: {
        approvedById: userId,
        // If scheduled for future, keep as PLANNED, otherwise move to IN_PROGRESS
        status:
          movement.scheduledAt && movement.scheduledAt > new Date()
            ? 'PLANNED'
            : 'IN_PROGRESS',
      },
    });
  }

  /**
   * Complete a stock movement and apply it to inventory
   * @param movementId Movement ID
   * @param userId User completing the movement
   * @returns Updated inventory
   */
  @ServiceErrorHandler()
  async completeStockMovement(
    movementId: string,
    userId: string
  ): Promise<Inventory> {
    return this.db.$transaction(async (tx) => {
      const movement = await tx.stockMovement.findUniqueOrThrow({
        where: { id: movementId },
      });

      // Can only complete movements that are in progress
      if (movement.status !== 'IN_PROGRESS') {
        throw new Error(
          `Cannot complete a movement with status: ${movement.status}`
        );
      }

      // Update executor
      await tx.stockMovement.update({
        where: { id: movementId },
        data: { executedById: userId },
      });

      // Apply the movement to inventory
      return this.applyStockMovement(movementId, tx);
    });
  }
}
