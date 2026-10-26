export class PagoRechazadoError extends Error {
  constructor(motivo: string) {
    super(`Pago rechazado: ${motivo}`);
    this.name = "PagoRechazadoError";
  }
}
