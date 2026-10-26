/*
 * Interfaz suscriptora: lo único que InventoryManager sabe de quienes
 * quieren enterarse cuando el stock de un producto baja.
 */
export interface StockObserver {
  onLowStock(productId: string, quantity: number): void;
}
