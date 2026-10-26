// Suite incompleta usada en la Práctica 2 (punto 3) para comparar métricas:
// ejecuta todas las líneas de calcularPrecioFinal pero no todas las ramas.
// Se corre con: npm run test:sentencias
import { it } from "node:test";
import assert from "node:assert/strict";

import { calcularPrecioFinal } from "../../src/ventas/calcularPrecioFinal";

it("S1: subtotal 0 lanza error", () => {
  assert.throws(
    () =>
      calcularPrecioFinal(
        0,
        { esMayorista: false, esSocio: false },
        "efectivo",
      ),
    RangeError,
  );
});

it("S2: mayorista con compra grande en crédito", () => {
  const total = calcularPrecioFinal(
    120000,
    { esMayorista: true, esSocio: false },
    "credito",
  );
  assert.equal(total, 112200);
});

it("S3: socio con compra chica en crédito", () => {
  const total = calcularPrecioFinal(
    10000,
    { esMayorista: false, esSocio: true },
    "credito",
  );
  assert.equal(total, 10450);
});
