export class ProductoInexistenteError extends Error {
  constructor(productId: string) {
    super(`Producto inexistente: ${productId}`);
    this.name = "ProductoInexistenteError";
  }
}

export class StockInsuficienteError extends Error {
  constructor(
    readonly productId: string,
    readonly disponible: number,
    readonly solicitado: number,
  ) {
    super(
      `Stock insuficiente para ${productId}: hay ${disponible} y se pidieron ${solicitado}`,
    );
    this.name = "StockInsuficienteError";
  }
}
