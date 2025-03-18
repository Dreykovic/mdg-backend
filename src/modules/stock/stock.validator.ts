import {
  MovementType,
  MovementReason,
  MovementStatus,
  ValuationMethod,
  Inventory,
} from '@prisma/client';

/**
 * Interface for inventory metadata validation
 */
export interface InventoryMetadata {
  quantity: number;
  availableQuantity: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  safetyStockLevel: number;
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
    if (metadata.availableQuantity === undefined) {
      throw new Error('Available quantity is required');
    }

    if (metadata.safetyStockLevel === undefined) {
      throw new Error('Safety stock level is required');
    }

    // Validate quantity is a number and not negative
    if (typeof metadata.quantity !== 'number' || isNaN(metadata.quantity)) {
      throw new Error('Quantity must be a valid number');
    }

    if (metadata.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Validate availableQuantity is a number and not negative
    if (
      typeof metadata.availableQuantity !== 'number' ||
      isNaN(metadata.availableQuantity)
    ) {
      throw new Error('Quantity must be a valid number');
    }

    if (metadata.availableQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Validate safetyStockLevel is a number and not negative
    if (
      typeof metadata.safetyStockLevel !== 'number' ||
      isNaN(metadata.safetyStockLevel)
    ) {
      throw new Error('Quantity must be a valid number');
    }

    if (metadata.safetyStockLevel < 0) {
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
        metadata.inStock ??
        metadata.availableQuantity > metadata.safetyStockLevel,
      backOrderable: metadata.backOrderable ?? false,
      stockLocation: metadata.stockLocation ?? '',
      notes: metadata.notes ?? '',
    };
  }
  /**
   * Validates inventory update payload (excluding quantity, availableQuantity, reservedQuantity)
   * @param updates Partial inventory fields to validate
   * @returns Validated and normalized update fields
   * @throws Error if validation fails
   */
  static validateInventoryUpdateData(
    updates: Partial<
      Omit<Inventory, 'quantity' | 'availableQuantity' | 'reservedQuantity'>
    >
  ): Partial<
    Omit<Inventory, 'quantity' | 'availableQuantity' | 'reservedQuantity'>
  > {
    const validated: Partial<
      Omit<Inventory, 'quantity' | 'availableQuantity' | 'reservedQuantity'>
    > = {};

    if (updates.minimumQuantity !== undefined) {
      if (
        typeof updates.minimumQuantity !== 'number' ||
        updates.minimumQuantity < 0
      ) {
        throw new Error('Minimum quantity must be a non-negative number');
      }
      validated.minimumQuantity = updates.minimumQuantity;
    }

    if (updates.maximumQuantity !== undefined) {
      if (
        typeof updates.maximumQuantity !== 'number' ||
        updates.maximumQuantity < 0
      ) {
        throw new Error('Maximum quantity must be a non-negative number');
      }
      validated.maximumQuantity = updates.maximumQuantity;
    }

    if (updates.safetyStockLevel !== undefined) {
      if (
        typeof updates.safetyStockLevel !== 'number' ||
        updates.safetyStockLevel < 0
      ) {
        throw new Error('Safety stock level must be a non-negative number');
      }
      validated.safetyStockLevel = updates.safetyStockLevel;
    }

    if (updates.economicOrderQuantity !== undefined) {
      if (
        typeof updates.economicOrderQuantity !== 'number' ||
        updates.economicOrderQuantity < 0
      ) {
        throw new Error(
          'Economic order quantity must be a non-negative number'
        );
      }
      validated.economicOrderQuantity = updates.economicOrderQuantity;
    }

    if (updates.reorderThreshold !== undefined) {
      if (
        typeof updates.reorderThreshold !== 'number' ||
        updates.reorderThreshold < 0
      ) {
        throw new Error('Reorder threshold must be a non-negative number');
      }
      validated.reorderThreshold = updates.reorderThreshold;
    }

    if (updates.reorderQuantity !== undefined) {
      if (
        typeof updates.reorderQuantity !== 'number' ||
        updates.reorderQuantity <= 0
      ) {
        throw new Error('Reorder quantity must be a positive number');
      }
      validated.reorderQuantity = updates.reorderQuantity;
    }

    if (updates.leadTimeInDays !== undefined) {
      if (
        typeof updates.leadTimeInDays !== 'number' ||
        updates.leadTimeInDays < 0
      ) {
        throw new Error('Lead time must be a non-negative number');
      }
      validated.leadTimeInDays = updates.leadTimeInDays;
    }

    if (updates.unitCost !== undefined) {
      if (typeof updates.unitCost !== 'number' || updates.unitCost < 0) {
        throw new Error('Unit cost must be a non-negative number');
      }
      validated.unitCost = updates.unitCost;
    }

    if (updates.valuationMethod !== undefined) {
      if (!Object.values(ValuationMethod).includes(updates.valuationMethod)) {
        throw new Error(`Invalid valuation method: ${updates.valuationMethod}`);
      }
      validated.valuationMethod = updates.valuationMethod;
    }

    if (updates.inStock !== undefined) {
      if (typeof updates.inStock !== 'boolean') {
        throw new Error('inStock must be a boolean');
      }
      validated.inStock = updates.inStock;
    }

    if (updates.backOrderable !== undefined) {
      if (typeof updates.backOrderable !== 'boolean') {
        throw new Error('backOrderable must be a boolean');
      }
      validated.backOrderable = updates.backOrderable;
    }

    if (updates.stockLocation !== undefined) {
      if (typeof updates.stockLocation !== 'string') {
        throw new Error('Stock location must be a string');
      }
      validated.stockLocation = updates.stockLocation.trim();
    }

    if (updates.notes !== undefined) {
      if (typeof updates.notes !== 'string') {
        throw new Error('Notes must be a string');
      }
      validated.notes = updates.notes.trim();
    }

    return validated;
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
