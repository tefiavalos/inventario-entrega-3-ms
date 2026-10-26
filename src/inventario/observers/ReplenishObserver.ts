import { StockObserver } from "../StockObserver";

const REORDER_QUANTITY = 100;

export class ReplenishObserver implements StockObserver {
  readonly orders: { productId: string; quantity: number }[] = [];

  onLowStock(productId: string): void {
    this.orders.push({ productId, quantity: REORDER_QUANTITY });
    console.log(
      `[Reposición] Orden creada: ${productId} x ${REORDER_QUANTITY} unidades`,
    );
  }
}
