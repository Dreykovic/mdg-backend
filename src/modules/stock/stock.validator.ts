import {
  MovementType,
  MovementReason,
  MovementStatus,
  ValuationMethod,
} from '@prisma/client';

/**
 * Interface for inventory metadata validation
 */
export interface InventoryMetadata {
  quantity: number;
  availableQuantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  safetyStockLevel?: number;
  economicOrderQuantity?: number;
  reorderThreshold: number;
  reorderQuantity?: number;
  leadTimeInDays?: number;
  unitCost?: number;
  valuationMethod?: ValuationMethod;
  inStock?: boolean;
  backOrderable?: boolean;
  stockLocation?: string;
  notes?: string;
}

/**
 * Interface for stock movement validation
 */
export interface StockMovementData {
  inventoryId: string;
  productId: string;
  quantity: number;
  unitCost?: number;
  movementType: MovementType;
  reason?: MovementReason;
  status?: MovementStatus;
  notes?: string;
  lotNumber?: string;
  expiryDate?: Date;
  batchId?: string;
  isAdjustment?: boolean;
  documentNumber?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  createdById: string;
  approvedById?: string;
  referenceType?: string; // Legacy support
  referenceId?: string; // Legacy support or document reference
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

    // Validate unit cost
    if (
      metadata.unitCost !== undefined &&
      (typeof metadata.unitCost !== 'number' ||
        isNaN(metadata.unitCost) ||
        metadata.unitCost < 0)
    ) {
      throw new Error('Unit cost must be a valid non-negative number');
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
      minimumQuantity: metadata.minimumQuantity ?? 0,
      maximumQuantity: metadata.maximumQuantity ?? 0,
      safetyStockLevel: metadata.safetyStockLevel ?? 0,
      economicOrderQuantity: metadata.economicOrderQuantity ?? 0,
      reorderThreshold: metadata.reorderThreshold ?? 5,
      reorderQuantity: metadata.reorderQuantity ?? 10,
      leadTimeInDays: metadata.leadTimeInDays ?? 0,
      unitCost: metadata.unitCost ?? 0,
      valuationMethod: metadata.valuationMethod ?? ValuationMethod.FIFO,
      inStock:
        metadata.inStock ?? metadata.quantity > metadata.reorderThreshold,
      backOrderable: metadata.backOrderable ?? false,
      stockLocation: metadata.stockLocation ?? '',
      notes: metadata.notes ?? '',
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

    if (!data.productId) {
      throw new Error('Product ID is required');
    }

    if (!data.createdById) {
      throw new Error('User ID is required');
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

    // Validate unit cost if provided
    if (
      data.unitCost !== undefined &&
      (typeof data.unitCost !== 'number' ||
        isNaN(data.unitCost) ||
        data.unitCost < 0)
    ) {
      throw new Error('Unit cost must be a valid non-negative number');
    }

    // Validate movement type
    if (!Object.values(MovementType).includes(data.movementType)) {
      throw new Error(`Invalid movement type: ${data.movementType}`);
    }

    // Validate scheduled date
    if (data.scheduledAt && !(data.scheduledAt instanceof Date)) {
      throw new Error('Scheduled date must be a valid date');
    }

    // Validate expiry date
    if (data.expiryDate && !(data.expiryDate instanceof Date)) {
      throw new Error('Expiry date must be a valid date');
    }

    // Validate warehouse IDs if transfer
    if (data.movementType === 'TRANSFER') {
      if (!data.sourceWarehouseId) {
        throw new Error('Source warehouse ID is required for transfers');
      }
      if (!data.destinationWarehouseId) {
        throw new Error('Destination warehouse ID is required for transfers');
      }
      if (data.sourceWarehouseId === data.destinationWarehouseId) {
        throw new Error('Source and destination warehouses must be different');
      }
    }

    // Return validated data with defaults
    return {
      ...data,
      reason:
        data.reason ||
        this.getDefaultReasonForType(data.movementType, data.referenceType),
      status: data.status || MovementStatus.DRAFT,
    };
  }

  /**
   * Get default reason based on movement type and reference type
   */
  private static getDefaultReasonForType(
    movementType: MovementType,
    referenceType?: string
  ): MovementReason {
    switch (movementType) {
      case 'INCOMING':
      case 'STOCK_IN':
        return 'PURCHASE';
      case 'OUTGOING':
      case 'STOCK_OUT':
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
