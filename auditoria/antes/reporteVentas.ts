var _ = require("lodash");
var moment = require("moment");

// Genera el reporte de ventas confirmadas entre dos fechas (DD/MM/YYYY)
export function generarReporte(
  ventas: any,
  tipo: any,
  desde: any,
  hasta: any,
  incluirComisiones: any,
): any {
  var resultado: any = {};
  var total = 0;
  var totalEfectivo = 0;
  var totalDebito = 0;
  var totalCredito = 0;
  var cantidad = 0;
  var fechaDesde = moment(desde, "DD/MM/YYYY");
  var fechaHasta = moment(hasta, "DD/MM/YYYY");
  var temp = null;

  for (var i = 0; i < ventas.length; i++) {
    var v = ventas[i];
    if (v != null) {
      if (
        moment(v.fecha, "DD/MM/YYYY").isBetween(
          fechaDesde,
          fechaHasta,
          null,
          "[]",
        )
      ) {
        if (v.estado == "confirmada") {
          if (v.medioPago == "efectivo") {
            var neto = v.monto;
            if (incluirComisiones) {
              neto = v.monto - v.monto * 0;
            }
            totalEfectivo = totalEfectivo + neto;
            total = total + neto;
            cantidad++;
          } else if (v.medioPago == "debito") {
            var neto = v.monto;
            if (incluirComisiones) {
              neto = v.monto - v.monto * 0.008;
            }
            totalDebito = totalDebito + neto;
            total = total + neto;
            cantidad++;
          } else if (v.medioPago == "credito") {
            var neto = v.monto;
            if (incluirComisiones) {
              neto = v.monto - v.monto * 0.035;
            }
            totalCredito = totalCredito + neto;
            total = total + neto;
            cantidad++;
          } else {
            console.log("medio de pago desconocido " + v.medioPago);
          }
        }
      }
    }
  }

  if (tipo == "diario") {
    var agrupado = _.groupBy(
      _.filter(ventas, function (v: any) {
        return (
          v != null &&
          v.estado == "confirmada" &&
          moment(v.fecha, "DD/MM/YYYY").isBetween(
            fechaDesde,
            fechaHasta,
            null,
            "[]",
          )
        );
      }),
      function (v: any) {
        return moment(v.fecha, "DD/MM/YYYY").format("YYYY-MM-DD");
      },
    );
    resultado.detalle = _.mapValues(agrupado, function (lista: any) {
      return _.sumBy(lista, "monto");
    });
  } else if (tipo == "mensual") {
    var agrupado2 = _.groupBy(
      _.filter(ventas, function (v: any) {
        return (
          v != null &&
          v.estado == "confirmada" &&
          moment(v.fecha, "DD/MM/YYYY").isBetween(
            fechaDesde,
            fechaHasta,
            null,
            "[]",
          )
        );
      }),
      function (v: any) {
        return moment(v.fecha, "DD/MM/YYYY").format("YYYY-MM");
      },
    );
    resultado.detalle = _.mapValues(agrupado2, function (lista: any) {
      return _.sumBy(lista, "monto");
    });
  }

  resultado.total = Math.round(total * 100) / 100;
  resultado.totalEfectivo = Math.round(totalEfectivo * 100) / 100;
  resultado.totalDebito = Math.round(totalDebito * 100) / 100;
  resultado.totalCredito = Math.round(totalCredito * 100) / 100;
  resultado.cantidad = cantidad;
  return resultado;
}
