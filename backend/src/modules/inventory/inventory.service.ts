import { Transaction } from 'sequelize';
import {
  sequelize,
  Inventory,
  InventoryMovement,
  ProductVariant,
  Product,
} from '../../database/index.js';
import { InventoryError, NotFoundError, BusinessRuleError } from '../../common/errors/index.js';
import { logger } from '../../common/logger/index.js';

export interface ReserveItemParams {
  variantId: string;
  quantity: number;
}

export class InventoryService {
  /**
   * Atomically reserves stock during checkout with row-level locking (FOR UPDATE)
   */
  public async reserveStock(
    items: ReserveItemParams[],
    referenceId: string,
    t: Transaction
  ): Promise<void> {
    for (const item of items) {
      const inventory = await Inventory.findOne({
        where: { variant_id: item.variantId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!inventory) {
        throw new NotFoundError(`Inventory for variant ${item.variantId}`);
      }

      const available = inventory.on_hand - inventory.reserved;
      if (available < item.quantity) {
        logger.warn(
          { variantId: item.variantId, requested: item.quantity, available },
          'Checkout rejected: Insufficient inventory'
        );
        throw new InventoryError(
          `Insufficient stock available for one of your selected items. Available: ${available}`
        );
      }

      inventory.reserved += item.quantity;
      inventory.available = inventory.on_hand - inventory.reserved;
      await inventory.save({ transaction: t });

      await InventoryMovement.create(
        {
          variant_id: item.variantId,
          quantity: -item.quantity,
          type: 'RESERVATION',
          actor: 'SYSTEM',
          reason: `Reserved for Order checkout`,
          reference_id: referenceId,
        },
        { transaction: t }
      );
    }
  }

  /**
   * Releases previously reserved stock (e.g. payment failed / checkout timed out / cancelled)
   */
  public async releaseStock(
    items: ReserveItemParams[],
    referenceId: string,
    t?: Transaction
  ): Promise<void> {
    const execute = async (trx: Transaction) => {
      for (const item of items) {
        const inventory = await Inventory.findOne({
          where: { variant_id: item.variantId },
          lock: trx.LOCK.UPDATE,
          transaction: trx,
        });

        if (inventory) {
          inventory.reserved = Math.max(0, inventory.reserved - item.quantity);
          inventory.available = inventory.on_hand - inventory.reserved;
          await inventory.save({ transaction: trx });

          await InventoryMovement.create(
            {
              variant_id: item.variantId,
              quantity: item.quantity,
              type: 'RELEASE',
              actor: 'SYSTEM',
              reason: `Released from reservation`,
              reference_id: referenceId,
            },
            { transaction: trx }
          );
        }
      }
    };

    if (t) {
      await execute(t);
    } else {
      await sequelize.transaction(execute);
    }
  }

  /**
   * Commits reserved stock to a permanent sale upon successful payment confirmation
   */
  public async commitSale(
    items: ReserveItemParams[],
    referenceId: string,
    t: Transaction
  ): Promise<void> {
    for (const item of items) {
      const inventory = await Inventory.findOne({
        where: { variant_id: item.variantId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (inventory) {
        inventory.on_hand = Math.max(0, inventory.on_hand - item.quantity);
        inventory.reserved = Math.max(0, inventory.reserved - item.quantity);
        inventory.available = Math.max(0, inventory.on_hand - inventory.reserved);
        await inventory.save({ transaction: t });

        await InventoryMovement.create(
          {
            variant_id: item.variantId,
            quantity: -item.quantity,
            type: 'SALE',
            actor: 'SYSTEM',
            reason: `Sale completed for Order`,
            reference_id: referenceId,
          },
          { transaction: t }
        );
      }
    }
  }

  /**
   * Manual administrative stock adjustment with movement audit record
   */
  public async adjustStock(data: {
    variantId: string;
    quantity: number;
    type: 'ADJUSTMENT' | 'RESTOCK' | 'DAMAGE' | 'RETURN';
    reason: string;
    actor: string;
  }) {
    return sequelize.transaction(async (t) => {
      const inventory = await Inventory.findOne({
        where: { variant_id: data.variantId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!inventory) throw new NotFoundError('Inventory');

      const newOnHand = inventory.on_hand + data.quantity;
      if (newOnHand < 0) {
        throw new BusinessRuleError('Inventory on hand cannot be negative');
      }

      inventory.on_hand = newOnHand;
      inventory.available = Math.max(0, inventory.on_hand - inventory.reserved);
      await inventory.save({ transaction: t });

      await InventoryMovement.create(
        {
          variant_id: data.variantId,
          quantity: data.quantity,
          type: data.type,
          actor: data.actor,
          reason: data.reason,
        },
        { transaction: t }
      );

      return inventory;
    });
  }

  /**
   * Lists inventory movements for audit / reporting
   */
  public async getMovements(variantId?: string, limit = 50) {
    const where: any = {};
    if (variantId) where.variant_id = variantId;

    return InventoryMovement.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
    });
  }
}

export const inventoryService = new InventoryService();
