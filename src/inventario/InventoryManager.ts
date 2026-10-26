import { StockObserver } from "./StockObserver";
import { ProductoInexistenteError, StockInsuficienteError } from "./errores";

export const LOW_STOCK_THRESHOLD = 10;

/*
 * Valida que una cantidad sea un entero mayor o igual al mínimo indicado.
 */
function validarCantidad(
  cantidad: number,
  minimo: number,
  descripcion: string,
): void {
  if (!Number.isInteger(cantidad) || cantidad < minimo) {
    throw new RangeError(
      `${descripcion} debe ser un entero mayor o igual a ${minimo}`,
    );
  }
}

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
    validarCantidad(quantity, 0, "La cantidad");
    this.stock[productId] = quantity;
    this.checkLowStock(productId);
  }

  sell_product(productId: string, sold: number): void {
    const disponible = this.getStock(productId);
    validarCantidad(sold, 1, "La cantidad vendida");

    if (sold > disponible) {
      throw new StockInsuficienteError(productId, disponible, sold);
    }

    this.stock[productId] = disponible - sold;
    this.checkLowStock(productId);
  }

  getStock(productId: string): number {
    const cantidad = this.stock[productId];

    if (cantidad === undefined) {
      throw new ProductoInexistenteError(productId);
    }

    return cantidad;
  }

  private checkLowStock(productId: string): void {
    const quantity = this.getStock(productId);

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
