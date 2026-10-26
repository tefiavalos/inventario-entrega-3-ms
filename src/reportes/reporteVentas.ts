/*
 * Versión refactorizada de auditoria/antes/reporteVentas.ts.
 * Mantiene el mismo resultado, sin lodash ni moment.
 */

export type MedioPago = "efectivo" | "debito" | "credito";

export interface Venta {
  fecha: string; // DD/MM/YYYY
  monto: number;
  medioPago: string;
  estado: string;
}

export interface Reporte {
  total: number;
  totalEfectivo: number;
  totalDebito: number;
  totalCredito: number;
  cantidad: number;
  detalle?: Record<string, number>; // monto bruto por día o por mes
}

/* Comisión que cobra cada medio de pago sobre el monto de la venta. */
export const COMISIONES: Readonly<Record<MedioPago, number>> = {
  efectivo: 0,
  debito: 0.008,
  credito: 0.035,
};

/* Largo de la clave ISO según el agrupamiento: YYYY-MM-DD o YYYY-MM. */
const LARGO_CLAVE: Readonly<Record<string, number>> = {
  diario: 10,
  mensual: 7,
};

const FORMATO_FECHA = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/* Convierte DD/MM/YYYY a YYYY-MM-DD. Devuelve null si el formato no es válido. */
export function aFechaIso(fecha: string | undefined): string | null {
  const partes = FORMATO_FECHA.exec(fecha ?? "");
  if (!partes) {
    return null;
  }

  const [, dia, mes, anio] = partes;
  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

const redondear = (valor: number): number => Math.round(valor * 100) / 100;

const esMedioConocido = (medioPago: string): medioPago is MedioPago =>
  Object.hasOwn(COMISIONES, medioPago);

function montoNeto(
  venta: Venta,
  medio: MedioPago,
  incluirComisiones: boolean,
): number {
  const comision = incluirComisiones ? COMISIONES[medio] : 0;
  return venta.monto - venta.monto * comision;
}

function sumarPorPeriodo(
  ventas: Venta[],
  largoClave: number,
): Record<string, number> {
  const detalle: Record<string, number> = {};
  for (const venta of ventas) {
    const clave = (aFechaIso(venta.fecha) ?? "").slice(0, largoClave);
    detalle[clave] = (detalle[clave] ?? 0) + venta.monto;
  }
  return detalle;
}

function sumarTotales(
  ventas: Venta[],
  incluirComisiones: boolean,
): { totales: Record<MedioPago, number>; cantidad: number } {
  const totales: Record<MedioPago, number> = {
    efectivo: 0,
    debito: 0,
    credito: 0,
  };
  let cantidad = 0;
  for (const venta of ventas) {
    if (!esMedioConocido(venta.medioPago)) {
      console.log(`medio de pago desconocido ${venta.medioPago}`);
      continue;
    }
    totales[venta.medioPago] += montoNeto(
      venta,
      venta.medioPago,
      incluirComisiones,
    );
    cantidad++;
  }
  return { totales, cantidad };
}

/*
 * Genera el reporte de ventas confirmadas entre dos fechas (inclusive).
 * tipo: "diario", "mensual" o cualquier otro valor para omitir el detalle.
 */
export function generarReporte(
  ventas: (Venta | null | undefined)[],
  tipo: string,
  desde: string,
  hasta: string,
  incluirComisiones: boolean,
): Reporte {
  const inicio = aFechaIso(desde) ?? "";
  const fin = aFechaIso(hasta) ?? "";

  const confirmadas = ventas.filter((venta): venta is Venta => {
    const fecha = venta ? aFechaIso(venta.fecha) : null;
    return (
      venta?.estado === "confirmada" &&
      fecha !== null &&
      fecha >= inicio &&
      fecha <= fin
    );
  });

  const { totales, cantidad } = sumarTotales(confirmadas, incluirComisiones);

  const reporte: Reporte = {
    total: redondear(totales.efectivo + totales.debito + totales.credito),
    totalEfectivo: redondear(totales.efectivo),
    totalDebito: redondear(totales.debito),
    totalCredito: redondear(totales.credito),
    cantidad,
  };

  if (Object.hasOwn(LARGO_CLAVE, tipo)) {
    reporte.detalle = sumarPorPeriodo(confirmadas, LARGO_CLAVE[tipo]);
  }

  return reporte;
}
