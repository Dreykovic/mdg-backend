import ServiceDefinition from '@/modules/definitions/service';
import logger from '@/core/utils/logger.util';

import { MovementType, MovementReason } from '@prisma/client';

import { Service } from 'typedi';

@Service()
export default class StockService extends ServiceDefinition {
  /**
   * Find a warehouse by ID or get the default
   */
  async findWarehouse(warehouseId?: string) {
    if (warehouseId) {
      return this.db.warehouse.findUniqueOrThrow({
        where: { id: warehouseId },
      });
    }

    return this.db.warehouse.findFirstOrThrow({
      where: { isDefault: true },
    });
  }

  /**
   * Generates a unique reference ID for stock movements
   * Format: [TYPE]-[YYYYMMDD]-[XXXX]
   *
   * TYPE: Short code for movement type (IN, OUT, ADJ, TRF, RET, DMG)
   * YYYYMMDD: Current date
   * XXXX: Sequential number for movements of the same type on the same day
   */
  async generateMovementReference(
    movementType: MovementType,
    warehouseId?: string
  ): Promise<string> {
    try {
      // Define type prefix based on movement type
      const typePrefix = this.getMovementTypePrefix(movementType);

      // Get current date in YYYYMMDD format
      const today = new Date();
      const dateStr =
        today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0');

      // Create base pattern for reference ID
      const basePattern = `${typePrefix}-${dateStr}`;

      // Add warehouse prefix if provided
      const warehousePrefix = warehouseId
        ? await this.getWarehousePrefix(warehouseId)
        : '';
      const fullPattern = warehousePrefix
        ? `${warehousePrefix}-${basePattern}`
        : basePattern;

      // Find the latest movement with this pattern
      let latestMovement;
      try {
        latestMovement = await this.db.stockMovement.findFirst({
          where: {
            reference: {
              startsWith: fullPattern,
            },
          },
          orderBy: {
            reference: 'desc',
          },
        });
      } catch (error) {
        logger.error('Error finding latest movement:', error);
        // Continue with null if query fails
      }

      // Determine sequence number
      let sequenceNumber = 1;
      if (latestMovement?.reference) {
        const parts = latestMovement.reference.split('-');
        if (parts && parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          if (lastPart && /^\d+$/.test(lastPart)) {
            sequenceNumber = parseInt(lastPart, 10) + 1;
          }
        }
      }

      // Format sequence number with leading zeros
      const sequenceStr = sequenceNumber.toString().padStart(4, '0');

      // Combine to create final reference ID
      const reference = `${fullPattern}-${sequenceStr}`;

      return reference;
    } catch (error) {
      logger.error('Error generating movement reference:', error);
      // Return fallback ID with timestamp
      const timestamp = Date.now().toString().substr(-8);
      return `MOV-FALLBACK-${timestamp}`;
    }
  }

  /**
   * Get prefix code for movement type
   */
  getMovementTypePrefix(movementType: MovementType): string {
    switch (movementType) {
      case 'INCOMING':
        return 'IN';
      case 'OUTGOING':
        return 'OUT';
      case 'TRANSFER':
        return 'TRF';
      case 'ADJUSTMENT':
        return 'ADJ';
      case 'RETURN':
        return 'RET';
      default:
        // TypeScript should catch this with exhaustive check
        return 'UNK'; // Unknown - fallback for runtime safety
    }
  }

  /**
   * Maps legacy MovementType to MovementReason
   */
  getMovementReasonFromType(
    movementType: MovementType,
    referenceType?: string
  ): MovementReason {
    switch (movementType) {
      case 'INCOMING':
        return 'PURCHASE';
      case 'OUTGOING':
        return referenceType === 'ORDER' ? 'SALE' : 'CONSUMPTION';
      case 'TRANSFER':
        return 'TRANSFER';
      case 'ADJUSTMENT':
        return 'ADJUSTMENT_INVENTORY';
      case 'RETURN':
        return 'RETURN_FROM_CUSTOMER';
      default:
        return 'OTHER';
    }
  }

  /**
   * Get warehouse code for reference ID
   */
  async getWarehousePrefix(warehouseId: string): Promise<string> {
    try {
      const warehouse = await this.db.warehouse.findUnique({
        where: { id: warehouseId },
      });

      if (warehouse?.name) {
        // Use first 2 characters of warehouse name, uppercase
        return warehouse.name.substring(0, 2).toUpperCase();
      }

      return 'WH'; // Default warehouse code
    } catch (error) {
      logger.error('Error getting warehouse prefix:', error);
      return 'WH'; // Default warehouse code on error
    }
  }

  /**
   * Calculate stock value based on quantity and unit cost
   */
  calculateStockValue(quantity: number, unitCost?: number): number | null {
    if (unitCost === undefined || unitCost === null) {
      return null;
    }
    return quantity * unitCost;
  }
}
