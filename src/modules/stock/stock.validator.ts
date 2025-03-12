import { MovementType } from '@prisma/client';

/**
 * Interface for inventory metadata validation
 */
export interface InventoryMetadata {
  quantity: number;
  availableQuantity?: number;
  reorderThreshold?: number;
  reorderQuantity?: number;
  inStock?: boolean;
  backOrderable?: boolean;
}

/**
 * Interface for stock movement validation
 */
export interface StockMovementData {
  inventoryId: string;
  quantity: number;
  type: MovementType;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
  userId?: string;
  warehouseId?: string;
}

/**
 * Class for validating inventory-related operations
 */
export class StockValidator {
  /**
   * Validates inventory metadata
   * @param metadata The inventory metadata to validate
   * @returns Validated and normalized inventory metadata
   * @throws Error if validation fails
   */
  static validateInventoryMetadata(
    metadata: InventoryMetadata
  ): Required<InventoryMetadata> {
    // Check for required fields
    if (metadata.quantity === undefined) {
      throw new Error('Quantity is required');
    }

    // Validate quantity is a number and not negative
    if (typeof metadata.quantity !== 'number' || isNaN(metadata.quantity)) {
      throw new Error('Quantity must be a valid number');
    }

    if (metadata.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Validate other numeric fields
    if (
      metadata.reorderThreshold !== undefined &&
      (typeof metadata.reorderThreshold !== 'number' ||
        isNaN(metadata.reorderThreshold) ||
        metadata.reorderThreshold < 0)
    ) {
      throw new Error('Reorder threshold must be a valid non-negative number');
    }

    if (
      metadata.reorderQuantity !== undefined &&
      (typeof metadata.reorderQuantity !== 'number' ||
        isNaN(metadata.reorderQuantity) ||
        metadata.reorderQuantity <= 0)
    ) {
      throw new Error('Reorder quantity must be a valid positive number');
    }

    if (
      metadata.availableQuantity !== undefined &&
      (typeof metadata.availableQuantity !== 'number' ||
        isNaN(metadata.availableQuantity))
    ) {
      throw new Error('Available quantity must be a valid number');
    }

    // For backOrderable false, available quantity can't be negative
    if (
      metadata.backOrderable === false &&
      metadata.availableQuantity !== undefined &&
      metadata.availableQuantity < 0
    ) {
      throw new Error(
        'Available quantity cannot be negative for non-backOrderable items'
      );
    }

    // Normalize and return data with default values
    return {
      quantity: metadata.quantity,
      availableQuantity: metadata.availableQuantity ?? metadata.quantity,
      reorderThreshold: metadata.reorderThreshold ?? 5,
      reorderQuantity: metadata.reorderQuantity ?? 10,
      inStock: metadata.inStock ?? metadata.quantity > 0,
      backOrderable: metadata.backOrderable ?? false,
    };
  }

  /**
   * Validates stock movement data
   * @param data The stock movement data to validate
   * @returns Validated stock movement data
   * @throws Error if validation fails
   */
  static validateStockMovement(data: StockMovementData): StockMovementData {
    // Check for required fields
    if (!data.inventoryId) {
      throw new Error('Inventory ID is required');
    }

    if (data.quantity === undefined) {
      throw new Error('Quantity is required');
    }

    // Validate quantity is a number and positive
    if (
      typeof data.quantity !== 'number' ||
      isNaN(data.quantity) ||
      data.quantity <= 0
    ) {
      throw new Error('Quantity must be a positive number');
    }

    // Validate movement type
    if (!Object.values(MovementType).includes(data.type)) {
      throw new Error(`Invalid movement type: ${data.type}`);
    }

    // Return validated data
    return data;
  }

  /**
   * Validates inventory reservation
   * @param availableQuantity Currently available quantity
   * @param requestedQuantity Quantity being requested
   * @param isBackorderable Whether the item can be backordered
   * @throws Error if reservation is not possible
   */
  static validateInventoryReservation(
    availableQuantity: number,
    requestedQuantity: number,
    isBackorderable: boolean
  ): void {
    if (requestedQuantity <= 0) {
      throw new Error('Requested quantity must be positive');
    }

    if (availableQuantity < requestedQuantity && !isBackorderable) {
      throw new Error(
        `Insufficient inventory: requested ${requestedQuantity}, available ${availableQuantity}`
      );
    }
  }

  /**
   * Validates that a warehouse ID is in the correct format
   * @param warehouseId Warehouse ID to validate
   * @throws Error if warehouse ID is invalid
   */
  static validateWarehouseId(warehouseId: string): void {
    if (!warehouseId || typeof warehouseId !== 'string') {
      throw new Error('Invalid warehouse ID');
    }

    // Add more specific validation if needed, such as UUID format check
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        warehouseId
      )
    ) {
      throw new Error('Warehouse ID must be a valid UUID');
    }
  }

  /**
   * Validates a product SKU
   * @param sku Product SKU to validate
   * @throws Error if SKU is invalid
   */
  static validateSku(sku: string): void {
    if (!sku || typeof sku !== 'string') {
      throw new Error('Invalid SKU');
    }

    if (sku.length < 3 || sku.length > 100) {
      throw new Error('SKU must be between 3 and 100 characters');
    }

    // You can add more specific validation for your SKU format
    // For example, check if it matches your SKU pattern: XX-XX-XX-XXXX
  }
}
