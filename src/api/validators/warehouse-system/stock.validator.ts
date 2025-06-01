import { z } from 'zod';
import { transformers } from '../shared/utils';

// Utility transformers for the controller

// Base validation schemas
const BaseSchemas = {
  uuid: z.string().uuid('Must be a valid UUID'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  positiveQuantity: z.number().min(0.01, 'Quantity must be positive'),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU too long'),
  warehouseId: z.string().uuid('Warehouse ID must be a valid UUID'),
  userId: z.string().min(1, 'User ID is required'),
};

// Movement action enum for processing
const MovementActionEnum = z.enum(['approve', 'start', 'complete', 'cancel']);

export const InventorySchemas = {
  // Schema for creating inventory
  createInventory: z.object({
    sku: BaseSchemas.sku,
    wareHouseId: BaseSchemas.warehouseId,
    inventoryMetaData: z
      .object({
        // Stock information
        quantity: BaseSchemas.quantity,
        availableQuantity: BaseSchemas.quantity.optional(),
        reservedQuantity: BaseSchemas.quantity.optional().default(0),

        // Stock level management
        minimumQuantity: BaseSchemas.quantity.optional().default(0),
        maximumQuantity: z.number().min(0).optional(),
        safetyStockLevel: BaseSchemas.quantity.default(0),
        economicOrderQuantity: z.number().min(0).optional(),

        // Cost and valuation
        unitCost: z.number().min(0).optional(),
        totalValue: z.number().min(0).optional(),
        valuationMethod: z.enum(['FIFO', 'LIFO', 'WAC', 'FEFO']).default('WAC'),

        // Reorder information
        reorderThreshold: BaseSchemas.quantity.default(5),
        reorderQuantity: BaseSchemas.positiveQuantity.default(10),
        leadTimeInDays: z.number().int().min(0).optional(),

        // Stock status - handle string conversion
        inStock: transformers.stringToBoolean.default(true),
        backOrderable: transformers.stringToBoolean.default(false),
        isActive: z.boolean().default(true),

        // Tracking dates
        lastStockCheck: z
          .string()
          .datetime()
          .transform((val) => new Date(val))
          .optional(),
        nextScheduledCheck: z
          .string()
          .datetime()
          .transform((val) => new Date(val))
          .optional(),
        lastReceivedDate: z
          .string()
          .datetime()
          .transform((val) => new Date(val))
          .optional(),
        expiryDate: z
          .string()
          .datetime()
          .transform((val) => new Date(val))
          .optional(),

        // Additional attributes
        stockLocation: transformers.trimmedString.optional(),
        notes: transformers.trimmedString.optional(),
        turnoverRate: z.number().min(0).optional(),
      })
      .refine(
        (data) => {
          const availableQty = data.availableQuantity ?? data.quantity;
          return availableQty <= data.quantity;
        },
        {
          message: 'Available quantity cannot exceed total quantity',
          path: ['availableQuantity'],
        }
      )
      .refine(
        (data) => {
          const reservedQty = data.reservedQuantity || 0;
          return reservedQty <= data.quantity;
        },
        {
          message: 'Reserved quantity cannot exceed total quantity',
          path: ['reservedQuantity'],
        }
      ),
  }),

  // Schema for updating inventory (excluding quantity fields)
  updateInventory: z.object({
    minimumQuantity: BaseSchemas.quantity.optional(),
    maximumQuantity: z.number().min(0).optional(),
    safetyStockLevel: BaseSchemas.quantity.optional(),
    economicOrderQuantity: z.number().min(0).optional(),
    unitCost: z.number().min(0).optional(),
    totalValue: z.number().min(0).optional(),
    valuationMethod: z.enum(['FIFO', 'LIFO', 'WAC', 'FEFO']).optional(),
    reorderThreshold: BaseSchemas.quantity.optional(),
    reorderQuantity: BaseSchemas.positiveQuantity.optional(),
    leadTimeInDays: z.number().int().min(0).optional(),
    inStock: transformers.stringToBoolean.optional(),
    backOrderable: transformers.stringToBoolean.optional(),
    isActive: z.boolean().optional(),
    lastStockCheck: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional(),
    nextScheduledCheck: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional(),
    lastReceivedDate: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional(),
    expiryDate: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional(),
    stockLocation: transformers.trimmedString.optional(),
    notes: transformers.trimmedString.optional(),
    turnoverRate: z.number().min(0).optional(),
  }),

  // Schema for getting inventory summary
  getInventorySummary: z.object({
    warehouseId: transformers.optionalUuid,
    includeInactive: z.boolean().optional().default(false),
  }),

  // Schema for updating inventory quantity
  updateInventoryQuantity: z.object({
    quantity: z.union([
      z.number().min(0, 'Quantity must be non-negative'),
      z.string().transform((val) => {
        const num = Number(val);
        if (isNaN(num)) {
          throw new Error('Quantity must be a valid number');
        }
        if (num < 0) {
          throw new Error('Quantity must be non-negative');
        }
        return num;
      }),
    ]),
  }),

  // Schema for creating stock movement
  createStockMovement: z
    .object({
      // Required fields
      inventoryId: z.string().min(1, 'Inventory ID is required'),
      productId: z.string().min(1, 'Product ID is required'),
      quantity: BaseSchemas.positiveQuantity,
      movementType: z.enum([
        'INCOMING',
        'OUTGOING',
        'TRANSFER',
        'ADJUSTMENT',
        'RETURN',
      ]),

      // Optional fields
      unitCost: z.number().min(0).optional(),
      totalValue: z.number().min(0).optional(),
      reason: z
        .enum([
          'PURCHASE',
          'SALE',
          'TRANSFER',
          'ADJUSTMENT_INVENTORY',
          'ADJUSTMENT_DAMAGE',
          'ADJUSTMENT_EXPIRY',
          'RETURN_FROM_CUSTOMER',
          'RETURN_TO_SUPPLIER',
          'PRODUCTION',
          'CONSUMPTION',
          'ORDER',
          'PURCHASE_ORDER',
          'INVENTORY',
          'OTHER',
        ])
        .optional(),
      status: z
        .enum(['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
        .default('COMPLETED'),

      // Traceability
      reference: z.string().optional(),
      lotNumber: z.string().optional(),
      expiryDate: z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
      batchId: z.string().optional(),
      isAdjustment: z.boolean().default(false),

      // Document references
      documentNumber: z.string().optional(),
      notes: transformers.trimmedString.optional(),
      metadata: z.record(z.any()).optional(),

      // Temporal data
      scheduledAt: z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
      executedAt: z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .optional(),

      // Warehouse references
      sourceWarehouseId: z.string().uuid().optional(),
      destinationWarehouseId: z.string().uuid().optional(),

      // User references (createdById will be set from auth)
      approvedById: z.string().optional(),
      executedById: z.string().optional(),
      parentMovementId: z.string().uuid().optional(),
    })
    .refine(
      (data) => {
        // Transfer movements require both warehouses
        if (data.movementType === 'TRANSFER') {
          return (
            typeof data.sourceWarehouseId === 'string' &&
            data.sourceWarehouseId.trim() !== '' &&
            typeof data.destinationWarehouseId === 'string' &&
            data.destinationWarehouseId.trim() !== '' &&
            data.sourceWarehouseId !== data.destinationWarehouseId
          );
        }
        return true;
      },
      {
        message:
          'Transfer movements require different source and destination warehouses',
        path: ['movementType'],
      }
    ),

  // Schema for getting recent movements
  getRecentMovements: z.object({
    limit: z
      .string()
      .transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 1) {
          return 10;
        }
        return Math.min(num, 100); // Cap at 100
      })
      .default('10'),
    movementType: z
      .enum(['INCOMING', 'OUTGOING', 'TRANSFER', 'ADJUSTMENT', 'RETURN'])
      .optional(),
    status: z
      .enum(['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
      .optional(),
    warehouseId: transformers.optionalUuid,
    productId: z.string().optional(),
  }),

  // Schema for processing stock movement
  processStockMovement: z.object({
    action: MovementActionEnum,
    notes: transformers.trimmedString.optional(),
    metadata: z.record(z.any()).optional(),
  }),

  // Additional schemas for common operations

  // Schema for bulk inventory operations
  bulkInventoryUpdate: z.object({
    body: z.object({
      inventoryIds: z
        .array(BaseSchemas.uuid)
        .min(1, 'At least one inventory ID required'),
      updates: z.object({
        safetyStockLevel: BaseSchemas.quantity.optional(),
        reorderThreshold: BaseSchemas.quantity.optional(),
        reorderQuantity: BaseSchemas.positiveQuantity.optional(),
        isActive: z.boolean().optional(),
        notes: transformers.trimmedString.optional(),
      }),
    }),
    params: z.object({}),
    query: z.object({}),
  }),

  // Schema for inventory search and filtering
  searchInventory: z.object({
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      search: z.string().optional(),
      warehouseId: transformers.optionalUuid,
      inStock: z.boolean().optional(),
      isActive: z.boolean().optional(),
      belowSafetyStock: z.boolean().optional(),
      belowReorderThreshold: z.boolean().optional(),
      valuationMethod: z.enum(['FIFO', 'LIFO', 'WAC', 'FEFO']).optional(),
      page: z
        .string()
        .transform((val) => Math.max(1, Number(val) || 1))
        .default('1'),
      pageSize: z
        .string()
        .transform((val) => Math.min(100, Math.max(1, Number(val) || 10)))
        .default('10'),
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
  }),

  // Schema for stock movement history
  getMovementHistory: z.object({
    body: z.object({}),
    params: z.object({
      inventoryId: BaseSchemas.uuid,
    }),
    query: z.object({
      dateFrom: z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
      dateTo: z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
      movementType: z
        .enum(['INCOMING', 'OUTGOING', 'TRANSFER', 'ADJUSTMENT', 'RETURN'])
        .optional(),
      page: z
        .string()
        .transform((val) => Math.max(1, Number(val) || 1))
        .default('1'),
      pageSize: z
        .string()
        .transform((val) => Math.min(100, Math.max(1, Number(val) || 10)))
        .default('10'),
    }),
  }),
};

// Type inference for controller schemas
export type CreateInventoryRequest = z.infer<
  typeof InventorySchemas.createInventory
>;
export type UpdateInventoryRequest = z.infer<
  typeof InventorySchemas.updateInventory
>;

export type GetInventorySummaryRequest = z.infer<
  typeof InventorySchemas.getInventorySummary
>;
export type UpdateInventoryQuantityRequest = z.infer<
  typeof InventorySchemas.updateInventoryQuantity
>;
export type CreateStockMovementRequest = z.infer<
  typeof InventorySchemas.createStockMovement
>;

export type GetRecentMovementsRequest = z.infer<
  typeof InventorySchemas.getRecentMovements
>;
export type ProcessStockMovementRequest = z.infer<
  typeof InventorySchemas.processStockMovement
>;
export type BulkInventoryUpdateRequest = z.infer<
  typeof InventorySchemas.bulkInventoryUpdate
>;
export type SearchInventoryRequest = z.infer<
  typeof InventorySchemas.searchInventory
>;
export type GetMovementHistoryRequest = z.infer<
  typeof InventorySchemas.getMovementHistory
>;

// Export type for movement actions
export type MovementAction = z.infer<typeof MovementActionEnum>;
