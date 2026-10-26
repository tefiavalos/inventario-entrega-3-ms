# inventario-ventas

Sistema de inventario y ventas usado en los prácticos de la Unidad 3 (Verificación y Validación con herramientas). Parte del inventario con Observer del TP de Patrones y le agrega ventas, cobro con una pasarela de pagos externa y un reporte de ventas.

## Lenguaje elegido

TypeScript. Se compila con `tsc` a `dist/` y las pruebas usan el test runner nativo de Node (`node:test`), que también calcula la cobertura. No hay dependencias de producción.

Requiere Node.js 22.8 o superior.

## Estructura

- `src/inventario/`: `InventoryManager` (notificador), `StockObserver` y observadores concretos.
- `src/ventas/calcularPrecioFinal.ts`: descuentos y recargo por medio de pago.
- `src/pagos/`: `CheckoutService` y la interfaz `PasarelaPagos` (API externa).
- `src/reportes/reporteVentas.ts`: reporte refactorizado (Práctica 3).
- `tests/`: pruebas unitarias con patrón AAA, stubs y mocks.
- `auditoria/antes/`: código original del reporte, con baja calidad y dependencias desactualizadas.
- `.githooks/pre-commit`: hook que corre Formatter, Linter y tests.
- `.github/`: plantilla de issues y etiquetas.
- `DEFINITION_OF_DONE.md`: criterios para dar una tarea por terminada.
- `evidencias/`: logs y reportes generados.

## Ejecución

```bash
npm install            # instala las herramientas y activa el pre-commit hook
npm run build          # compila con tsc
npm run format:check   # Prettier
npm run lint           # oxlint
npm test               # compila, corre los tests y mide cobertura (falla si baja del 80%)
npm run test:sentencias
```

Auditoría del código viejo:

```bash
npm run auditoria:antes            # oxlint sobre auditoria/antes
npm run auditoria:caracterizacion  # compara el reporte viejo con el nuevo
npm run metricas                   # complejidad y duplicación (requiere: pip install lizard)
```

## Etiquetas

Las etiquetas del repositorio están en `.github/labels.json`. Se pueden crear con GitHub CLI:

```bash
gh label create bug --color d73a4a --description "Fallo confirmado que rompe un comportamiento esperado" --force
```

(una línea por cada etiqueta del archivo).
