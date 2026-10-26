import { StockObserver } from "./StockObserver";

export const LOW_STOCK_THRESHOLD = 10;

/*
 * Notificador (Publisher). Mantiene el stock de cada producto y avisa a los
 * observadores cuando queda por debajo del umbral.
 * No conoce a ningún observador concreto: solo la interfaz StockObserver.
 */
export class InventoryManager {
  private stock: Record<string, number> = {};
  private observers: StockObserver[] = [];

  subscribe(observer: StockObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: StockObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  update_stock(productId: string, quantity: number): void {
    this.stock[productId] = quantity;
    this.checkLowStock(productId);
  }

  sell_product(productId: string, sold: number): void {
    this.stock[productId] -= sold;
    this.checkLowStock(productId);
  }

  getStock(productId: string): number {
    return this.stock[productId];
  }

  private checkLowStock(productId: string): void {
    const quantity = this.stock[productId];

    if (quantity < LOW_STOCK_THRESHOLD) {
      this.notify(productId, quantity);
    }
  }

  private notify(productId: string, quantity: number): void {
    for (const observer of this.observers) {
      // El try/catch va dentro del loop: si un observador falla,
      // se registra el error y se sigue con el siguiente.
      try {
        observer.onLowStock(productId, quantity);
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);
        console.error(
          `[InventoryManager] Falló ${observer.constructor.name}: ${mensaje}. Se continúa con el siguiente.`,
        );
      }
    }
  }
}
