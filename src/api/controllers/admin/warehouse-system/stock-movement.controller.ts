import { Request, Response } from 'express';
import { log } from 'console';
import ApiResponse from '@/core/utils/apiResponse.util';
import { Service } from 'typedi';

import StockMvtService from '@/services/warehouse-systeme/stock-mvt.service';

import { Controller } from '@/core/decorators/route.decorator';

@Service()
@Controller('/stock/movements', ['auth', 'rbac:ADMIN'])
export class InventoryController {
  constructor(private readonly stockMvtService: StockMvtService) {}

  /**
   * Create a stock movement
   */
  async createStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const movementData = req.body;
      const userId = (req as any).user.id;

      log('Create Stock Movement Request Received');

      // Ensure user ID is included
      movementData.createdById = userId;

      const movement =
        await this.stockMvtService.createStockMovement(movementData);

      const payload = { movement };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while creating stock movement.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Get a stock movement by ID
   */
  async getStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const { movementId } = req.params;

      if (!movementId) {
        throw new Error('Movement ID is required.');
      }

      log(`Get Stock Movement Request Received for ${movementId}`);

      const movement = await this.stockMvtService.getStockMovement(movementId);

      const payload = { movement };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching stock movement.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Get recent stock movements
   */
  async getRecentMovements(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;

      log('Get Recent Stock Movements Request Received');

      const movements = await this.stockMvtService.getRecentMovements(limit);

      const payload = { movements };
      const response = ApiResponse.http200(payload);
      res.status(response.httpStatusCode).json(response.data);
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while fetching recent movements.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
  //TODO: Use this controller

  /**
   * Process a stock movement
   */
  async processStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const { movementId } = req.params;
      const { action } = req.body;
      const userId = (req as any).user.id;

      if (!movementId) {
        throw new Error('Movement ID is required.');
      }

      if (!action) {
        throw new Error(
          'Action is required (approve, start, complete, cancel).'
        );
      }

      log(
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
    } catch (error) {
      log(error);
      const response = ApiResponse.http400({
        message:
          (error as Error).message ||
          'An error occurred while processing stock movement.',
      });
      res.status(response.httpStatusCode).json(response.data);
    }
  }
}
