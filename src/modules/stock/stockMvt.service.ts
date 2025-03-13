import { Service } from 'typedi';
import { StockMovementData, StockValidator } from './stock.validator';
import StockService from './stock.service';

@Service()
export default class StockMvtService extends StockService {
  /**
   * Record a stock movement
   */
  async recordStockMovement(movementData: StockMovementData) {
    // Validate the stock movement data
    const validatedData = StockValidator.validateStockMovement(movementData);

    const {
      inventoryId,
      quantity,
      type,
      notes,
      referenceType,
      userId,
      warehouseId,
    } = validatedData;
    // Generate a reference ID
    const referenceId = await this.generateMovementReferenceId(
      type,
      warehouseId
    );

    return this.db.stockMovement.create({
      data: {
        quantity,
        type,
        notes,
        referenceType,
        referenceId,
        inventoryId,
        userId,
      },
    });
  }
}
