import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

import { CheckoutService, Pedido } from "../../src/pagos/CheckoutService";
import { PagoRechazadoError } from "../../src/pagos/errores";
import { InventoryManager } from "../../src/inventario/InventoryManager";
import { StockInsuficienteError } from "../../src/inventario/errores";
import { MedioPago } from "../../src/ventas/calcularPrecioFinal";
import { PasarelaPagos, RespuestaCobro } from "../../src/pagos/PasarelaPagos";

beforeEach(() => mock.method(console, "log", () => {}));
afterEach(() => mock.restoreAll());

const CLIENTE = { esMayorista: false, esSocio: false };

function pedidoDe(cantidad: number, medioPago: MedioPago = "efectivo"): Pedido {
  return {
    items: [{ productId: "PROD-001", cantidad, precioUnitario: 1000 }],
    cliente: CLIENTE,
    medioPago,
    tokenTarjeta: "tok_123",
  };
}

function inventarioCon(stock: number): InventoryManager {
  const inventario = new InventoryManager();
  inventario.update_stock("PROD-001", stock);
  return inventario;
}

/*
 * STUB: devuelve siempre la misma respuesta enlatada. Solo sirve para
 * controlar la entrada indirecta que recibe CheckoutService.
 */
function pasarelaStub(respuesta: RespuestaCobro): PasarelaPagos {
  return {
    cobrar: async () => respuesta,
    reembolsar: async () => {},
  };
}

describe("CheckoutService con stubs (estado resultante)", () => {
  it("con pago aprobado descuenta el stock y devuelve la transacción", async () => {
    // Arrange
    const inventario = inventarioCon(20);
    const pasarela = pasarelaStub({
      estado: "aprobado",
      idTransaccion: "TX-1",
    });
    const checkout = new CheckoutService(inventario, pasarela);

    // Act
    const resultado = await checkout.confirmarCompra(pedidoDe(3));

    // Assert
    assert.deepEqual(resultado, { idTransaccion: "TX-1", total: 3000 });
    assert.equal(inventario.getStock("PROD-001"), 17);
  });

  it("con pago rechazado lanza PagoRechazadoError y no toca el stock", async () => {
    // Arrange
    const inventario = inventarioCon(20);
    const pasarela = pasarelaStub({
      estado: "rechazado",
      motivo: "fondos insuficientes",
    });
    const checkout = new CheckoutService(inventario, pasarela);

    // Act
    const compra = checkout.confirmarCompra(pedidoDe(3));

    // Assert
    await assert.rejects(compra, PagoRechazadoError);
    assert.equal(inventario.getStock("PROD-001"), 20);
  });

  it("una respuesta sin id de transacción se toma como rechazo", async () => {
    // Arrange
    const inventario = inventarioCon(20);
    const pasarela = pasarelaStub({ estado: "aprobado" });
    const checkout = new CheckoutService(inventario, pasarela);

    // Act
    const compra = checkout.confirmarCompra(pedidoDe(3));

    // Assert
    await assert.rejects(compra, /sin motivo informado/);
    assert.equal(inventario.getStock("PROD-001"), 20);
  });

  it("si la pasarela no responde se propaga el error y no toca el stock", async () => {
    // Arrange
    const inventario = inventarioCon(20);
    const pasarela: PasarelaPagos = {
      cobrar: async () => {
        throw new Error("timeout");
      },
      reembolsar: async () => {},
    };
    const checkout = new CheckoutService(inventario, pasarela);

    // Act
    const compra = checkout.confirmarCompra(pedidoDe(3));

    // Assert
    await assert.rejects(compra, /timeout/);
    assert.equal(inventario.getStock("PROD-001"), 20);
  });
});

describe("CheckoutService con mocks (protocolo de interacción)", () => {
  it("cobra una sola vez con el monto final, la moneda y el token", async () => {
    // Arrange
    const cobrar = mock.fn(
      async (): Promise<RespuestaCobro> => ({
        estado: "aprobado",
        idTransaccion: "TX-2",
      }),
    );
    const reembolsar = mock.fn(async () => {});
    const checkout = new CheckoutService(inventarioCon(20), {
      cobrar,
      reembolsar,
    });

    // Act
    await checkout.confirmarCompra(pedidoDe(10, "credito"));

    // Assert
    assert.equal(cobrar.mock.callCount(), 1);
    assert.deepEqual(cobrar.mock.calls[0].arguments, [
      { monto: 11000, moneda: "ARS", token: "tok_123" },
    ]);
    assert.equal(reembolsar.mock.callCount(), 0);
  });

  it("sin stock suficiente no llama a la pasarela", async () => {
    // Arrange
    const cobrar = mock.fn(
      async (): Promise<RespuestaCobro> => ({ estado: "aprobado" }),
    );
    const checkout = new CheckoutService(inventarioCon(2), {
      cobrar,
      reembolsar: mock.fn(async () => {}),
    });

    // Act
    const compra = checkout.confirmarCompra(pedidoDe(5));

    // Assert
    await assert.rejects(compra, StockInsuficienteError);
    assert.equal(cobrar.mock.callCount(), 0);
  });

  it("si el stock se consume durante el cobro, reembolsa una vez y repone el stock", async () => {
    // Arrange
    const inventario = new InventoryManager();
    inventario.update_stock("PROD-001", 20);
    inventario.update_stock("PROD-002", 5);
    // Mientras se espera la respuesta de la pasarela, otra venta se lleva PROD-002.
    const cobrar = mock.fn(async (): Promise<RespuestaCobro> => {
      inventario.sell_product("PROD-002", 5);
      return { estado: "aprobado", idTransaccion: "TX-3" };
    });
    const reembolsar = mock.fn(async () => {});
    const checkout = new CheckoutService(inventario, { cobrar, reembolsar });
    const pedido: Pedido = {
      ...pedidoDe(4),
      items: [
        { productId: "PROD-001", cantidad: 4, precioUnitario: 1000 },
        { productId: "PROD-002", cantidad: 2, precioUnitario: 500 },
      ],
    };

    // Act
    const compra = checkout.confirmarCompra(pedido);

    // Assert
    await assert.rejects(compra, StockInsuficienteError);
    assert.equal(reembolsar.mock.callCount(), 1);
    assert.deepEqual(reembolsar.mock.calls[0].arguments, ["TX-3"]);
    assert.equal(inventario.getStock("PROD-001"), 20);
  });
});
