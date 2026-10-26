import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

import { InventoryManager } from "../../src/inventario/InventoryManager";
import { EmailAlertObserver } from "../../src/inventario/observers/EmailAlertObserver";
import { ReplenishObserver } from "../../src/inventario/observers/ReplenishObserver";
import {
  ProductoInexistenteError,
  StockInsuficienteError,
} from "../../src/inventario/errores";

// Los observadores escriben por consola; en los tests se silencia la salida.
beforeEach(() => {
  mock.method(console, "log", () => {});
  mock.method(console, "error", () => {});
});
afterEach(() => mock.restoreAll());

describe("InventoryManager.sell_product", () => {
  it("descuenta la cantidad vendida del stock", () => {
    // Arrange
    const manager = new InventoryManager();
    manager.update_stock("PROD-001", 50);

    // Act
    manager.sell_product("PROD-001", 20);

    // Assert
    assert.equal(manager.getStock("PROD-001"), 30);
  });

  it("permite vender todo el stock disponible (queda en 0)", () => {
    // Arrange
    const manager = new InventoryManager();
    manager.update_stock("PROD-001", 8);

    // Act
    manager.sell_product("PROD-001", 8);

    // Assert
    assert.equal(manager.getStock("PROD-001"), 0);
  });

  it("notifica la cantidad restante cuando el stock queda por debajo de 10", () => {
    // Arrange
    const manager = new InventoryManager();
    const email = new EmailAlertObserver();
    manager.update_stock("PROD-001", 50);
    manager.subscribe(email);

    // Act
    manager.sell_product("PROD-001", 45);

    // Assert
    assert.deepEqual(email.sentEmails, [
      "Stock bajo: PROD-001 (quedan 5 unidades)",
    ]);
  });

  it("no notifica si el stock queda exactamente en 10", () => {
    // Arrange
    const manager = new InventoryManager();
    const email = new EmailAlertObserver();
    manager.update_stock("PROD-001", 15);
    manager.subscribe(email);

    // Act
    manager.sell_product("PROD-001", 5);

    // Assert
    assert.equal(email.sentEmails.length, 0);
  });

  it("rechaza vender más de lo disponible y no modifica el stock (issue #1)", () => {
    // Arrange
    const manager = new InventoryManager();
    const email = new EmailAlertObserver();
    manager.update_stock("PROD-001", 5);
    manager.subscribe(email);

    // Act
    const vender = () => manager.sell_product("PROD-001", 8);

    // Assert
    assert.throws(vender, StockInsuficienteError);
    assert.equal(manager.getStock("PROD-001"), 5);
    assert.equal(email.sentEmails.length, 0);
  });

  it("rechaza un producto que no existe", () => {
    // Arrange
    const manager = new InventoryManager();

    // Act
    const vender = () => manager.sell_product("NO-EXISTE", 1);

    // Assert
    assert.throws(vender, ProductoInexistenteError);
  });

  for (const cantidad of [0, -3, 2.5, Number.NaN]) {
    it(`rechaza la cantidad inválida ${cantidad}`, () => {
      // Arrange
      const manager = new InventoryManager();
      manager.update_stock("PROD-001", 20);

      // Act
      const vender = () => manager.sell_product("PROD-001", cantidad);

      // Assert
      assert.throws(vender, RangeError);
      assert.equal(manager.getStock("PROD-001"), 20);
    });
  }

  it("un observador que falla no impide que los demás reciban el aviso", () => {
    // Arrange
    const manager = new InventoryManager();
    const email = new EmailAlertObserver();
    const reposicion = new ReplenishObserver();
    const roto = {
      onLowStock() {
        throw new Error("error de red simulado");
      },
    };
    manager.update_stock("PROD-001", 12);
    manager.subscribe(email);
    manager.subscribe(roto);
    manager.subscribe(reposicion);

    // Act
    manager.sell_product("PROD-001", 4);

    // Assert
    assert.equal(email.sentEmails.length, 1);
    assert.deepEqual(reposicion.orders, [
      { productId: "PROD-001", quantity: 100 },
    ]);
  });
});

describe("InventoryManager.update_stock", () => {
  it("rechaza una cantidad negativa", () => {
    // Arrange
    const manager = new InventoryManager();

    // Act
    const cargar = () => manager.update_stock("PROD-001", -1);

    // Assert
    assert.throws(cargar, RangeError);
  });

  it("un observador desuscripto deja de recibir avisos", () => {
    // Arrange
    const manager = new InventoryManager();
    const email = new EmailAlertObserver();
    manager.subscribe(email);
    manager.unsubscribe(email);

    // Act
    manager.update_stock("PROD-001", 3);

    // Assert
    assert.equal(email.sentEmails.length, 0);
  });
});
