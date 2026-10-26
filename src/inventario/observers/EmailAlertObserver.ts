import { StockObserver } from "../StockObserver";

export class EmailAlertObserver implements StockObserver {
  readonly sentEmails: string[] = [];

  onLowStock(productId: string, quantity: number): void {
    const email = `Stock bajo: ${productId} (quedan ${quantity} unidades)`;
    this.sentEmails.push(email);
    console.log(`[Email] ${email}`);
  }
}
