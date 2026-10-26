# BUG: sell_product deja el stock en negativo cuando se vende más de lo disponible

Etiquetas: `bug`

## Descripción técnica del problema

`InventoryManager.sell_product(productId, sold)` resta la cantidad vendida sin validar que haya stock suficiente ni que el producto exista. El stock queda en negativo y los observadores reciben avisos con cantidades negativas. Con un producto que no existe el stock queda en `NaN`.

## Pasos para reproducir

1. Crear un `InventoryManager` y suscribir un `EmailAlertObserver`.
2. Ejecutar `update_stock("PROD-001", 5)`.
3. Ejecutar `sell_product("PROD-001", 8)`.
4. Consultar `getStock("PROD-001")`.
5. Ejecutar `sell_product("PROD-999", 1)` sobre un producto que nunca se cargó y consultar `getStock("PROD-999")`.

## Comportamiento esperado

- En el paso 3 la venta se rechaza con un error de stock insuficiente y el stock sigue en 5.
- No se envía ninguna notificación por la venta rechazada.
- En el paso 5 se rechaza la venta porque el producto no existe.

## Comportamiento observado

- El stock de PROD-001 queda en -3 y se envía el email "quedan -3 unidades".
- El stock de PROD-999 queda en `NaN`.

## Evidencias

```text
[Email] Stock bajo: PROD-001 (quedan 5 unidades)
[Email] Stock bajo: PROD-001 (quedan -3 unidades)
Stock final PROD-001: -3
Stock final PROD-999: NaN
```
