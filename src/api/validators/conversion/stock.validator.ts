import { z } from 'zod';
import { transformers } from '../shared/utils';

// Zod enums based on Prisma schema
export const MovementTypeEnum = z.enum([
  'INCOMING', // Stock arriving in the system
  'OUTGOING', // Stock leaving the system
  'TRANSFER', // Stock moving between locations
  'ADJUSTMENT', // Correction of inventory discrepancies
  'RETURN', // Customer returns
]);

export const MovementReasonEnum = z.enum([
  'PURCHASE', // Bought from supplier
  'SALE', // Sold to customer
  'TRANSFER', // Moving between locations
  'ADJUSTMENT_INVENTORY', // Reconciliation after count
  'ADJUSTMENT_DAMAGE', // Write-off due to damage
  'ADJUSTMENT_EXPIRY', // Write-off due to expiration
  'RETURN_FROM_CUSTOMER', // Customer returned product
  'RETURN_TO_SUPPLIER', // Returning to supplier
  'PRODUCTION', // Used in production process
  'CONSUMPTION', // Used internally
  'ORDER', // For customer order
  'PURCHASE_ORDER', // For supplier order
  'INVENTORY', // From inventory check
  'OTHER', // Miscellaneous reason
]);

export const MovementStatusEnum = z.enum([
  'DRAFT', // Initially created
  'PLANNED', // Scheduled for future
  'IN_PROGRESS', // Currently being processed
  'COMPLETED', // Fully processed
  'CANCELLED', // Cancelled movement
]);

export const ValuationMethodEnum = z.enum([
  'FIFO', // First In, First Out
  'LIFO', // Last In, First Out
  'WAC', // Weighted Average Cost
  'FEFO', // First Expired, First Out (for perishables)
]);

// Type inference for enums
export type MovementType = z.infer<typeof MovementTypeEnum>;
export type MovementReason = z.infer<typeof MovementReasonEnum>;
export type MovementStatus = z.infer<typeof MovementStatusEnum>;
export type ValuationMethod = z.infer<typeof ValuationMethodEnum>;

// Base schemas for reusability
const BaseSchemas = {
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  positiveQuantity: z.number().min(0.01, 'Quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative').optional(),
  warehouseId: transformers.uuidString,
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(100, 'SKU must be at most 100 characters'),
  reference: z.string().min(1, 'Reference is required'),
};
export const StockSchemas = {
  // Complete inventory schema based on Prisma model
  inventoryMetadata: z
    .object({
      // Stock information
      quantity: BaseSchemas.quantity,
      availableQuantity: BaseSchemas.quantity,
      reservedQuantity: BaseSchemas.quantity.optional().default(0),

      // Stock level management
      minimumQuantity: BaseSchemas.quantity.optional().default(0),
      maximumQuantity: transformers.optionalFloat,
      safetyStockLevel: BaseSchemas.quantity.default(0),
      economicOrderQuantity: transformers.optionalFloat,

      // Cost and valuation
      unitCost: transformers.optionalFloat,
      totalValue: transformers.optionalFloat,
      valuationMethod: ValuationMethodEnum.default('WAC'),

      // Reorder information
      reorderThreshold: BaseSchemas.quantity.default(5),
      reorderQuantity: BaseSchemas.quantity.default(10),
      leadTimeInDays: transformers.optionalInt,

      // Stock status
      inStock: z.boolean().default(true),
      backOrderable: z.boolean().default(false),
      isActive: z.boolean().default(true),

      // Tracking dates
      lastStockCheck: z.date().optional(),
      nextScheduledCheck: z.date().optional(),
      lastReceivedDate: z.date().optional(),
      expiryDate: z.date().optional(),

      // Additional attributes
      stockLocation: transformers.trimmedString.optional(),
      notes: transformers.trimmedString.optional(),
      turnoverRate: transformers.optionalFloat,

      // Required relationships
      productId: z.string().min(1, 'Product ID is required'),
      warehouseId: BaseSchemas.warehouseId,
    })
    .refine(
      (data) => {
        // Available quantity cannot exceed total quantity
        if (data.availableQuantity > data.quantity) {
          return false;
        }
        return true;
      },
      {
        message: 'Available quantity cannot exceed total quantity',
        path: ['availableQuantity'],
      }
    )
    .refine(
      (data) => {
        // Reserved quantity cannot exceed total quantity
        const reservedQty = data.reservedQuantity || 0;
        if (reservedQty > data.quantity) {
          return false;
        }
        return true;
      },
      {
        message: 'Reserved quantity cannot exceed total quantity',
        path: ['reservedQuantity'],
      }
    )
    .refine(
      (data) => {
        // For non-backOrderable items, available quantity should not be negative
        if (data.backOrderable === false && data.availableQuantity < 0) {
          return false;
        }
        return true;
      },
      {
        message:
          'Available quantity cannot be negative for non-backOrderable items',
        path: ['availableQuantity'],
      }
    )
    .refine(
      (data) => {
        // Maximum quantity should be greater than minimum if both are set
        if (
          typeof data.maximumQuantity === 'number' &&
          !isNaN(data.maximumQuantity) &&
          typeof data.minimumQuantity === 'number' &&
          !isNaN(data.minimumQuantity) &&
          data.maximumQuantity <= data.minimumQuantity
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Maximum quantity must be greater than minimum quantity',
        path: ['maximumQuantity'],
      }
    ),

  // Schema for inventory update validation (partial updates)
  inventoryUpdate: z.object({
    quantity: BaseSchemas.quantity.optional(),
    availableQuantity: BaseSchemas.quantity.optional(),
    reservedQuantity: BaseSchemas.quantity.optional(),
    minimumQuantity: BaseSchemas.quantity.optional(),
    maximumQuantity: transformers.optionalFloat,
    safetyStockLevel: BaseSchemas.quantity.optional(),
    economicOrderQuantity: transformers.optionalFloat,
    unitCost: transformers.optionalFloat,
    totalValue: transformers.optionalFloat,
    valuationMethod: ValuationMethodEnum.optional(),
    reorderThreshold: BaseSchemas.quantity.optional(),
    reorderQuantity: BaseSchemas.quantity.optional(),
    leadTimeInDays: transformers.optionalInt,
    inStock: z.boolean().optional(),
    backOrderable: z.boolean().optional(),
    isActive: z.boolean().optional(),
    lastStockCheck: z.date().optional(),
    nextScheduledCheck: z.date().optional(),
    lastReceivedDate: z.date().optional(),
    expiryDate: z.date().optional(),
    stockLocation: transformers.trimmedString.optional(),
    notes: transformers.trimmedString.optional(),
    turnoverRate: transformers.optionalFloat,
  }),

  // Complete stock movement schema based on Prisma model
  stockMovement: z
    .object({
      // Reference and basic info
      reference: BaseSchemas.reference.optional(), // Auto-generated if not provided

      // Movement details
      quantity: BaseSchemas.positiveQuantity,
      unitCost: transformers.optionalFloat,
      totalValue: transformers.optionalFloat,

      // Movement classification
      movementType: MovementTypeEnum,
      reason: MovementReasonEnum.optional(),
      status: MovementStatusEnum.default('COMPLETED'),

      // Traceability
      lotNumber: z.string().optional(),
      expiryDate: z.date().optional(),
      batchId: z.string().optional(),
      isAdjustment: z.boolean().default(false),

      // Document references
      documentNumber: z.string().optional(),
      notes: transformers.trimmedString.optional(),
      metadata: z.record(z.any()).optional(),

      // Temporal data
      scheduledAt: z.date().optional(),
      executedAt: z.date().optional(),
      version: z.number().int().min(0).default(0),

      // Required relationships
      inventoryId: z.string().min(1, 'Inventory ID is required'),
      productId: z.string().min(1, 'Product ID is required'),
      createdById: z.string().min(1, 'Created by user ID is required'),

      // Optional relationships
      sourceWarehouseId: z.string().optional(),
      destinationWarehouseId: z.string().optional(),
      approvedById: z.string().optional(),
      executedById: z.string().optional(),
      parentMovementId: z.string().optional(),
    })
    .refine(
      (data) => {
        // Transfer movements require both warehouses
        if (data.movementType === 'TRANSFER') {
          if (
            data.sourceWarehouseId === null ||
            data.sourceWarehouseId === '' ||
            data.destinationWarehouseId === null ||
            data.destinationWarehouseId === ''
          ) {
            return false;
          }
          if (data.sourceWarehouseId === data.destinationWarehouseId) {
            return false;
          }
        }
        return true;
      },
      {
        message:
          'Transfer movements require different source and destination warehouses',
        path: ['movementType'],
      }
    )
    .refine(
      (data) => {
        // Incoming movements should not have source warehouse (external)
        if (
          data.movementType === 'INCOMING' &&
          data.sourceWarehouseId !== null &&
          data.sourceWarehouseId !== ''
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Incoming movements should not specify a source warehouse',
        path: ['sourceWarehouseId'],
      }
    )
    .refine(
      (data) => {
        // Outgoing movements should not have destination warehouse (external)
        if (
          data.movementType === 'OUTGOING' &&
          data.destinationWarehouseId !== null &&
          data.destinationWarehouseId !== ''
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          'Outgoing movements should not specify a destination warehouse',
        path: ['destinationWarehouseId'],
      }
    )
    .transform((data) => {
      // Apply business logic defaults
      const reason = data.reason ?? getDefaultReasonForType(data.movementType);
      const totalValue =
        data.totalValue ??
        (typeof data.unitCost === 'number' && !isNaN(data.unitCost)
          ? data.quantity * data.unitCost
          : undefined);

      return {
        ...data,
        reason,
        totalValue,
        reference:
          data.reference ?? generateMovementReference(data.movementType),
      };
    }),

  // Warehouse schema
  warehouse: z.object({
    name: z.string().min(1, 'Warehouse name is required'),
    location: transformers.trimmedString.optional(),
    isDefault: z.boolean().default(false),
    address: transformers.trimmedString.optional(),
    city: transformers.trimmedString.optional(),
    postalCode: z.string().optional(),
    country: transformers.trimmedString.optional(),
    capacity: transformers.optionalFloat,
    isActive: z.boolean().default(true),
  }),

  // Schema for inventory reservation validation
  inventoryReservation: z
    .object({
      availableQuantity: BaseSchemas.quantity,
      requestedQuantity: BaseSchemas.positiveQuantity,
      isBackorderable: z.boolean(),
    })
    .refine(
      (data) => {
        if (
          data.availableQuantity < data.requestedQuantity &&
          !data.isBackorderable
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Insufficient inventory for non-backorderable items',
        path: ['requestedQuantity'],
      }
    ),

  // Schema for bulk operations
  bulkStockMovement: z.object({
    movements: z
      .array(z.lazy((): z.ZodTypeAny => StockSchemas.stockMovement))
      .min(1, 'At least one movement is required'),
    batchId: z.string().optional(), // Group related movements
  }),

  // Schema for stock adjustment
  stockAdjustment: z.object({
    inventoryId: z.string().min(1, 'Inventory ID is required'),
    adjustmentQuantity: z.number(), // Can be negative for reductions
    reason: MovementReasonEnum.default('ADJUSTMENT_INVENTORY'),
    notes: transformers.trimmedString.optional(),
    createdById: z.string().min(1, 'User ID is required'),
    documentNumber: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),

  // Schema for inventory filters and search
  inventoryFilters: z.object({
    warehouseId: BaseSchemas.warehouseId.optional(),
    productId: z.string().optional(),
    inStock: z.boolean().optional(),
    isActive: z.boolean().optional(),
    belowSafetyStock: z.boolean().optional(),
    belowReorderThreshold: z.boolean().optional(),
    expiringBefore: z.date().optional(),
    valuationMethod: ValuationMethodEnum.optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),
    sortBy: z
      .enum([
        'quantity',
        'availableQuantity',
        'unitCost',
        'totalValue',
        'updatedAt',
      ])
      .default('updatedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Schema for stock movement filters
  movementFilters: z.object({
    movementType: MovementTypeEnum.optional(),
    reason: MovementReasonEnum.optional(),
    status: MovementStatusEnum.optional(),
    productId: z.string().optional(),
    inventoryId: z.string().optional(),
    warehouseId: z.string().optional(),
    createdById: z.string().optional(),
    batchId: z.string().optional(),
    lotNumber: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),
  }),

  // Schema for warehouse validation
  warehouseId: BaseSchemas.warehouseId,
  sku: BaseSchemas.sku,
};

// Helper functions
function getDefaultReasonForType(movementType: MovementType): MovementReason {
  switch (movementType) {
    case 'INCOMING':
      return 'PURCHASE';
    case 'OUTGOING':
      return 'SALE';
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

function generateMovementReference(movementType: MovementType): string {
  const prefix = movementType.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Type inference from schemas
export type InventoryMetadata = z.infer<typeof StockSchemas.inventoryMetadata>;
export type InventoryUpdateData = z.infer<typeof StockSchemas.inventoryUpdate>;
export type StockMovementData = z.infer<typeof StockSchemas.stockMovement>;
export type WarehouseData = z.infer<typeof StockSchemas.warehouse>;
export type InventoryReservationData = z.infer<
  typeof StockSchemas.inventoryReservation
>;
export type BulkStockMovementData = z.infer<
  typeof StockSchemas.bulkStockMovement
>;
export type StockAdjustmentData = z.infer<typeof StockSchemas.stockAdjustment>;
export type InventoryFiltersData = z.infer<
  typeof StockSchemas.inventoryFilters
>;
export type MovementFiltersData = z.infer<typeof StockSchemas.movementFilters>;
export type StockSchemasType = typeof StockSchemas;
