import { StockObserver } from "../StockObserver";

export class PushNotificationObserver implements StockObserver {
  readonly notifications: string[] = [];

  onLowStock(productId: string, quantity: number): void {
    const notification = `Quedan ${quantity} unidades de ${productId}`;
    this.notifications.push(notification);
    console.log(`[Push] Notificación enviada: ${notification}`);
  }
}
