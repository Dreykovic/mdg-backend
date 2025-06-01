import { Request, Response } from 'express';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import StockMvtService from '@/services/warehouse-systeme/stock-mvt.service';

import {
  Controller,
  Get,
  Patch,
  Post,
} from '@/core/decorators/route.decorator';
import { ControllerErrorHandler } from '@/core/decorators/error-handler.decorator';
import { ValidateRequest } from '@/core/decorators/validation.decorator';
import { StockMvtSchemas } from '@/api/validators/warehouse-system/stock.validator';
import { CommonSchemas } from '@/api/validators/shared/common.validator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('/warehouse-system/movements', ['auth', 'rbac:ADMIN'])
export class StockMvtController {
  constructor(private readonly stockMvtService: StockMvtService) {}

  /**
   * Create a stock movement
   */
  @Post('/save')
  @ControllerErrorHandler('StockMvtController.createStockMovement')
  @ValidateRequest({
    body: StockMvtSchemas.createStockMovement,
  })
  async createStockMovement(req: Request, res: Response): Promise<void> {
    const movementData = req.body;
    const userId = (req as any).user.id;

    logger.debug('Create Stock Movement Request Received');

    // Ensure user ID is included
    movementData.createdById = userId;

    const movement =
      await this.stockMvtService.createStockMovement(movementData);

    const payload = { movement };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
  //TODO: Use this controller

  /**
   * Get a stock movement by ID
   */
  @Get('/:modelId')
  @ControllerErrorHandler('StockMvtController.getStockMovement')
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
  })
  async getStockMovement(req: Request, res: Response): Promise<void> {
    const { movementId } = req.params;

    if (movementId === null || movementId === undefined || movementId === '') {
      throw new Error('Movement ID is required.');
    }

    logger.debug(`Get Stock Movement Request Received for ${movementId}`);

    const movement = await this.stockMvtService.getStockMovement(movementId);

    const payload = { movement };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
  //TODO: Use this controller

  /**
   * Get recent stock movements
   */

  @Get('/recent')
  @ControllerErrorHandler('StockMvtController.getRecentMovements')
  @ValidateRequest({
    query: StockMvtSchemas.getRecentMovements,
  })
  async getRecentMovements(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 10;

    logger.debug('Get Recent Stock Movements Request Received');

    const movements = await this.stockMvtService.getRecentMovements(limit);

    const payload = { movements };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
  //TODO: Use this controller

  /**
   * Process a stock movement
   */
  @Patch('/:modelId/process')
  @ControllerErrorHandler('StockMvtController.processStockMovement')
  @ValidateRequest({
    params: CommonSchemas.entityStringParam,
    body: StockMvtSchemas.processStockMovement,
  })
  async processStockMovement(req: Request, res: Response): Promise<void> {
    const { movementId } = req.params;
    const { action } = req.body;
    const userId = (req as any).user.id;

    if (movementId === null || movementId === undefined || movementId === '') {
      throw new Error('Movement ID is required.');
    }

    if (action === undefined || action === null || action === '') {
      throw new Error('Action is required (approve, start, complete, cancel).');
    }

    logger.debug(
      `Process Stock Movement Request Received for ${movementId} with action ${action}`
    );

    let result;

    switch (action) {
      case 'approve':
        result = await this.stockMvtService.approveStockMovement(
          movementId,
          userId
        );
        break;
      case 'start':
        result = await this.stockMvtService.startProcessingMovement(
          movementId,
          userId
        );
        break;
      case 'complete':
        result = await this.stockMvtService.completeStockMovement(
          movementId,
          userId
        );
        break;
      case 'cancel':
        result = await this.stockMvtService.cancelStockMovement(
          movementId,
          userId
        );
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }

    const payload = { result };
    const response = ApiResponse.http200(payload);
    res.status(response.httpStatusCode).json(response.data);
  }
}
