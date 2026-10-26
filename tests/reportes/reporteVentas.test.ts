import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

import { generarReporte, aFechaIso } from "../../src/reportes/reporteVentas";

let log: ReturnType<typeof mock.method>;
beforeEach(() => {
  log = mock.method(console, "log", () => {});
});
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
    monto: 20000,
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
    medioPago: "efectivo",
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

describe("generarReporte", () => {
  it("suma solo las ventas confirmadas del período, sin comisiones", () => {
    // Act
    const reporte = generarReporte(
      VENTAS,
      "ninguno",
      "01/03/2026",
      "31/03/2026",
      false,
    );

    // Assert
    assert.deepEqual(reporte, {
      total: 60000,
      totalEfectivo: 10000,
      totalDebito: 20000,
      totalCredito: 30000,
      cantidad: 3,
    });
  });

  it("descuenta la comisión de cada medio de pago", () => {
    // Act
    const reporte = generarReporte(
      VENTAS,
      "ninguno",
      "01/03/2026",
      "31/03/2026",
      true,
    );

    // Assert
    assert.equal(reporte.totalEfectivo, 10000);
    assert.equal(reporte.totalDebito, 19840);
    assert.equal(reporte.totalCredito, 28950);
    assert.equal(reporte.total, 58790);
  });

  it("agrupa el monto bruto por día", () => {
    // Act
    const reporte = generarReporte(
      VENTAS,
      "diario",
      "01/03/2026",
      "31/03/2026",
      false,
    );

    // Assert
    assert.deepEqual(reporte.detalle, {
      "2026-03-01": 30000,
      "2026-03-10": 1500,
      "2026-03-15": 30000,
    });
  });

  it("agrupa el monto bruto por mes", () => {
    // Act
    const reporte = generarReporte(
      VENTAS,
      "mensual",
      "01/02/2026",
      "30/04/2026",
      false,
    );

    // Assert
    assert.deepEqual(reporte.detalle, {
      "2026-02": 9999,
      "2026-03": 61500,
      "2026-04": 8000,
    });
  });

  it("informa por consola los medios de pago desconocidos", () => {
    // Act
    generarReporte(VENTAS, "ninguno", "01/03/2026", "31/03/2026", false);

    // Assert
    assert.deepEqual(log.mock.calls[0].arguments, [
      "medio de pago desconocido cripto",
    ]);
  });
});

describe("aFechaIso", () => {
  it("convierte DD/MM/YYYY a YYYY-MM-DD", () => {
    assert.equal(aFechaIso("5/3/2026"), "2026-03-05");
  });

  it("devuelve null si el formato no es válido", () => {
    assert.equal(aFechaIso("2026-03-05"), null);
  });

  it("descarta ventas con fecha inválida", () => {
    const ventas = [
      {
        fecha: "sin fecha",
        monto: 100,
        medioPago: "efectivo",
        estado: "confirmada",
      },
    ];
    assert.equal(
      generarReporte(ventas, "diario", "01/01/2026", "31/12/2026", false)
        .cantidad,
      0,
    );
  });
});
