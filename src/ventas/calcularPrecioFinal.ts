export const MONTO_MAYORISTA = 100000;
export const MONTO_PROMOCION = 50000;
export const DESCUENTO_MAYORISTA = 0.15;
export const DESCUENTO_PROMOCION = 0.05;
export const RECARGO_CREDITO = 0.1;

export interface Cliente {
  esMayorista: boolean;
  esSocio: boolean;
}

export type MedioPago = "efectivo" | "debito" | "credito";

/*
 * Calcula el total a cobrar aplicando el descuento que corresponda al cliente
 * y el recargo por pago con tarjeta de crédito.
 */
export function calcularPrecioFinal(
  subtotal: number,
  cliente: Cliente,
  medioPago: MedioPago,
): number {
  if (subtotal <= 0) {
    throw new RangeError("El subtotal debe ser mayor a 0");
  }

  let descuento = 0;
  if (cliente.esMayorista && subtotal >= MONTO_MAYORISTA) {
    descuento = DESCUENTO_MAYORISTA;
  } else if (cliente.esSocio || subtotal >= MONTO_PROMOCION) {
    descuento = DESCUENTO_PROMOCION;
  }

  const recargo = medioPago === "credito" ? RECARGO_CREDITO : 0;
  const total = subtotal * (1 - descuento) * (1 + recargo);

  return Math.round(total * 100) / 100;
}
