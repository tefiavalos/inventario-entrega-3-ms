// Tests de caracterización: el reporte refactorizado debe devolver lo mismo
// que el código original para los mismos datos.
// Requiere las dependencias del código viejo: npm run auditoria:caracterizacion
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

import { generarReporte } from "../src/reportes/reporteVentas";
import { generarReporte as generarReporteLegacy } from "./antes/reporteVentas";

beforeEach(() => mock.method(console, "log", () => {}));
afterEach(() => mock.restoreAll());

const VENTAS = [
  {
    fecha: "01/03/2026",
    monto: 10000,
    medioPago: "efectivo",
    estado: "confirmada",
  },
  {
    fecha: "01/03/2026",
    monto: 20000.5,
    medioPago: "debito",
    estado: "confirmada",
  },
  {
    fecha: "15/03/2026",
    monto: 30000,
    medioPago: "credito",
    estado: "confirmada",
  },
  { fecha: "20/03/2026", monto: 5000, medioPago: "credito", estado: "anulada" },
  {
    fecha: "02/04/2026",
    monto: 8000,
    medioPago: "efectivo",
    estado: "confirmada",
  },
  {
    fecha: "28/02/2026",
    monto: 9999,
    medioPago: "debito",
    estado: "confirmada",
  },
  {
    fecha: "31/03/2026",
    monto: 1234.56,
    medioPago: "credito",
    estado: "confirmada",
  },
  {
    fecha: "10/03/2026",
    monto: 1500,
    medioPago: "cripto",
    estado: "confirmada",
  },
  null,
];

const CASOS: [string, string, string, boolean][] = [];
for (const tipo of ["diario", "mensual", "ninguno"]) {
  for (const incluirComisiones of [true, false]) {
    CASOS.push([tipo, "01/03/2026", "31/03/2026", incluirComisiones]);
    CASOS.push([tipo, "01/01/2026", "31/12/2026", incluirComisiones]);
  }
}

describe("Caracterización reporteVentas (antes vs. después)", () => {
  for (const [tipo, desde, hasta, comisiones] of CASOS) {
    it(`${tipo} ${desde}-${hasta} comisiones=${comisiones}`, () => {
      const esperado = generarReporteLegacy(
        VENTAS,
        tipo,
        desde,
        hasta,
        comisiones,
      );
      const obtenido = generarReporte(VENTAS, tipo, desde, hasta, comisiones);
      assert.deepEqual({ ...obtenido }, { ...esperado });
    });
  }
});
