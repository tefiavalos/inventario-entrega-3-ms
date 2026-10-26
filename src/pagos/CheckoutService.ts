import { InventoryManager } from "../inventario/InventoryManager";
import { StockInsuficienteError } from "../inventario/errores";
import {
  calcularPrecioFinal,
  Cliente,
  MedioPago,
} from "../ventas/calcularPrecioFinal";
import { PagoRechazadoError } from "./errores";
import { PasarelaPagos } from "./PasarelaPagos";

export interface ItemPedido {
  productId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  items: ItemPedido[];
  cliente: Cliente;
  medioPago: MedioPago;
  tokenTarjeta: string;
}

export interface CompraConfirmada {
  idTransaccion: string;
  total: number;
}

/*
 * Confirma una compra: controla el stock, cobra a través de la pasarela de
 * pagos y recién con el pago aprobado descuenta el stock.
 */
export class CheckoutService {
  constructor(
    private readonly inventario: InventoryManager,
    private readonly pasarela: PasarelaPagos,
  ) {}

  async confirmarCompra(pedido: Pedido): Promise<CompraConfirmada> {
    this.verificarStock(pedido.items);

    const subtotal = pedido.items.reduce(
      (suma, item) => suma + item.cantidad * item.precioUnitario,
      0,
    );
    const total = calcularPrecioFinal(
      subtotal,
      pedido.cliente,
      pedido.medioPago,
    );

    const respuesta = await this.pasarela.cobrar({
      monto: total,
      moneda: "ARS",
      token: pedido.tokenTarjeta,
    });

    if (respuesta.estado !== "aprobado" || !respuesta.idTransaccion) {
      throw new PagoRechazadoError(respuesta.motivo ?? "sin motivo informado");
    }

    const vendidos: ItemPedido[] = [];
    try {
      for (const item of pedido.items) {
        this.inventario.sell_product(item.productId, item.cantidad);
        vendidos.push(item);
      }
    } catch (error) {
      // El cobro ya se hizo (por ejemplo, otra venta consumió el stock mientras
      // se esperaba la respuesta de la pasarela): se repone lo descontado y se
      // devuelve el dinero.
      this.reponerStock(vendidos);
      await this.pasarela.reembolsar(respuesta.idTransaccion);
      throw error;
    }

    return { idTransaccion: respuesta.idTransaccion, total };
  }

  private verificarStock(items: ItemPedido[]): void {
    const pedidas = new Map<string, number>();
    for (const item of items) {
      pedidas.set(
        item.productId,
        (pedidas.get(item.productId) ?? 0) + item.cantidad,
      );
    }

    for (const [productId, cantidad] of pedidas) {
      const disponible = this.inventario.getStock(productId);

      if (cantidad > disponible) {
        throw new StockInsuficienteError(productId, disponible, cantidad);
      }
    }
  }

  private reponerStock(items: ItemPedido[]): void {
    for (const item of items) {
      const actual = this.inventario.getStock(item.productId);
      this.inventario.update_stock(item.productId, actual + item.cantidad);
    }
  }
}
