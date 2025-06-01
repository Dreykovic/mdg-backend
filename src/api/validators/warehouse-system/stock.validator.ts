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

export const StockMvtSchemas = {
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

export type CreateStockMovementRequest = z.infer<
  typeof StockMvtSchemas.createStockMovement
>;

export type GetRecentMovementsRequest = z.infer<
  typeof StockMvtSchemas.getRecentMovements
>;
export type ProcessStockMovementRequest = z.infer<
  typeof StockMvtSchemas.processStockMovement
>;
export type BulkInventoryUpdateRequest = z.infer<
  typeof StockMvtSchemas.bulkInventoryUpdate
>;
export type SearchInventoryRequest = z.infer<
  typeof StockMvtSchemas.searchInventory
>;
export type GetMovementHistoryRequest = z.infer<
  typeof StockMvtSchemas.getMovementHistory
>;

// Export type for movement actions
export type MovementAction = z.infer<typeof MovementActionEnum>;
