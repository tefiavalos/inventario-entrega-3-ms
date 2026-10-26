# Definition of Done – inventario-ventas

Una tarea (issue) se considera **terminada** solo si cumple todos los puntos de esta lista. Si falta uno, el Pull Request no se integra a `main`. La DoD es la misma para todas las tareas; los criterios de aceptación de cada issue se agregan aparte.

## 1. Integridad de compilación

- `npm run build` (tsc en modo `strict`) compila sin errores.
- No quedan warnings del linter ni del compilador.

## 2. Validación de pruebas automatizadas

- `npm test` se ejecuta completo y el 100% de las pruebas pasa.
- Un solo test fallido bloquea la integración. No se permite marcar tests como `skip` o `todo` para que la suite pase.
- Todo bug corregido incluye un test que reproduce el fallo.

## 3. Umbral mínimo de cobertura

- Cobertura mínima del 80% de líneas, 80% de ramas y 80% de funciones sobre `src/`.
- El umbral se controla en el propio `npm test` (`--test-coverage-lines/branches/functions=80`): si no se alcanza, el comando termina con error.
- El código nuevo no puede bajar la cobertura que tenía el proyecto.

## 4. Revisión por pares

- Todo cambio entra por Pull Request desde una rama propia. No se hace push directo a `main`.
- El PR necesita la aprobación de al menos un integrante del equipo que no sea el autor.
- El revisor controla que no haya malas prácticas, que se respete la estructura del proyecto (por ejemplo, el Observer del inventario) y que no se agregue complejidad innecesaria.
- Los comentarios del review se resuelven antes de aprobar.

## 5. Gobernanza de estilo

- El código pasa `npm run format:check` (Prettier) y `npm run lint` (oxlint) sin errores.
- Las reglas están en `.prettierrc.json` y `.oxlintrc.json`. No se desactivan reglas en el código (`oxlint-disable`) sin justificarlo en el PR.
- No se usa `any`.
- Límites acordados: complejidad ciclomática máxima 8 por función, anidamiento máximo 3, funciones de hasta 50 líneas.

## 6. Documentación técnica

- Las clases y funciones públicas nuevas o modificadas tienen un comentario que explica qué hacen. Los tipos de parámetros y retorno se declaran explícitamente.
- Si cambia un contrato (por ejemplo, la forma de `PasarelaPagos` o el formato del reporte) se actualiza la interfaz, su comentario y el README.
- El PR describe qué se cambió y enlaza el issue con `Closes #n`.

## Control automático

Los puntos 1, 2, 3 y 5 se controlan con el pre-commit hook (`.githooks/pre-commit`). Los puntos 4 y 6 se controlan en la revisión del Pull Request.
