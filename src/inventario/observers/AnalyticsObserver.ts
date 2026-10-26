import { StockObserver } from "../StockObserver";

export class AnalyticsObserver implements StockObserver {
  readonly events: string[] = [];

  onLowStock(productId: string): void {
    this.events.push(`low_stock ${productId}`);
    console.log(`[Analytics] Evento registrado: low_stock ${productId}`);
  }
}
