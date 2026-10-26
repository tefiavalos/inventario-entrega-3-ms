/*
 * Contrato con la API externa de pagos. CheckoutService depende solamente de
 * esta interfaz; la implementación real hace las llamadas HTTP al proveedor y
 * en los tests se reemplaza por un stub o un mock.
 */

export interface SolicitudCobro {
  monto: number;
  moneda: "ARS";
  token: string; // Token de la tarjeta generado por el proveedor.
}

export interface RespuestaCobro {
  estado: "aprobado" | "rechazado";
  idTransaccion?: string;
  motivo?: string;
}

export interface PasarelaPagos {
  cobrar(solicitud: SolicitudCobro): Promise<RespuestaCobro>;
  reembolsar(idTransaccion: string): Promise<void>;
}
