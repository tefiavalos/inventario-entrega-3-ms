import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calcularPrecioFinal } from "../../src/ventas/calcularPrecioFinal";

// Casos diseñados para recorrer todas las ramas (ver Práctica 2, punto 3).
describe("calcularPrecioFinal – cobertura de ramas", () => {
  it("C1: subtotal 0 lanza error", () => {
    // Arrange
    const cliente = { esMayorista: false, esSocio: false };

    // Act
    const calcular = () => calcularPrecioFinal(0, cliente, "efectivo");

    // Assert
    assert.throws(calcular, RangeError);
  });

  it("C2: mayorista con compra >= 100.000 en efectivo, 15% sin recargo", () => {
    // Arrange
    const cliente = { esMayorista: true, esSocio: false };

    // Act
    const total = calcularPrecioFinal(120000, cliente, "efectivo");

    // Assert
    assert.equal(total, 102000);
  });

  it("C3: mayorista con compra < 100.000 y >= 50.000 en crédito, 5% con recargo", () => {
    // Arrange
    const cliente = { esMayorista: true, esSocio: false };

    // Act
    const total = calcularPrecioFinal(60000, cliente, "credito");

    // Assert
    assert.equal(total, 62700);
  });

  it("C4: socio minorista con compra chica en débito, 5% sin recargo", () => {
    // Arrange
    const cliente = { esMayorista: false, esSocio: true };

    // Act
    const total = calcularPrecioFinal(10000, cliente, "debito");

    // Assert
    assert.equal(total, 9500);
  });

  it("C5: cliente sin beneficios con compra chica en crédito, sin descuento y con recargo", () => {
    // Arrange
    const cliente = { esMayorista: false, esSocio: false };

    // Act
    const total = calcularPrecioFinal(10000, cliente, "credito");

    // Assert
    assert.equal(total, 11000);
  });
});

describe("calcularPrecioFinal – valores límite", () => {
  it("con exactamente 100.000 el mayorista ya tiene 15%", () => {
    const total = calcularPrecioFinal(
      100000,
      { esMayorista: true, esSocio: false },
      "efectivo",
    );
    assert.equal(total, 85000);
  });

  it("con exactamente 50.000 aplica la promoción del 5%", () => {
    const total = calcularPrecioFinal(
      50000,
      { esMayorista: false, esSocio: false },
      "efectivo",
    );
    assert.equal(total, 47500);
  });
});
