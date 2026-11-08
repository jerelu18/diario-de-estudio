# Tasks - Objetivo Semanal de Estudio (002)

## Leyenda
- **RF**: Requisito funcional cubierto.
- **Hecho cuando**: Condición de finalización de la tarea.

### T1: Función de migración de datos existentes
- **Descripción**: Crear función `migratarDatos()` que lea el contenido actual de `localStorage` bajo la clave `'diario_estudio_sesiones'`. Si los datos son un array puro de sesiones (sin `goal`), lo convertirá al formato `{goal: 0, sessions: <array>}` y lo sobrescribirá. Si ya existe el formato nuevo, dejará los datos intactos. Si no hay datos, creará la estructura inicial con `goal: 0` y `sessions: []`.
- **RF**: RF-1, RF-4
- **Hecho cuando**: Ejecutar la función una vez y verificar en la consola de `localStorage` que la clave contiene `{goal: number, sessions: array}`. Si no había datos previos, `goal` será `0`.

### T2: Función obtenerGoal con default
- **Descripción**: Implementar función `obtenerGoal()` que lea `localStorage` y devuelva el valor de `goal`. Si la clave no existe, el `goal` es `null` o no es un número entero ≥ 0, retornará `0` como default. La función debería usar `JSON.parse` y manejar errores de forma segura (try/catch), retornando `0` en caso de datos corruptos.
- **RF**: RF-1, RF-4
- **Hecho cuando**: `obtenerGoal()` devuelve `0` cuando no hay meta guardada, y devuelve el número guardado cuando existe un `goal` válido (ej. `30`).

### T3: Función actualizarGoal en localStorage
- **Descripción**: Crear función `actualizarGoal(nuevoGoal)` que reciba un número entero ≥ 0 y lo escriba en `localStorage` bajo la clave `'diario_estudio_sesiones'`, manteniendo el array de sesiones existente (solo actualiza la propiedad `goal`). Si `nuevoGoal` es inválido (negativo, NaN, undefined), la función no modificará el almacenamiento y retornará `false`;otherwise retornará `true`.
- **RF**: RF-1, RF-4
- **Hecho cuando**: Llamar a `actualizarGoal(20)` y después `obtenerGoal()` devuelva `20`. Llamar con `-5` y confirmar que `obtenerGoal()` siga retornando el valor anterior.

### T4: Cálculo de minutos en ventana de 7 días
- **Descripción**: Implementar función pura `calcularMinutos7Dias(sessions, hoy)` donde:
  - `sessions` es un array de objetos `{id, date, subject, minutes}` con `date` en formato `YYYY-MM-DD`.
  - `hoy` es una cadena `YYYY-MM-DD` representando la fecha local actual.
  - La función filtra las sesiones cuya `date` está comprendida entre `hoy - 6 días` y `hoy` inclusive y suma sus `minutes`. No usar `toISOString` ni conversiones UTC.
- **RF**: RF-2
- **Hecho cuando**: Probar con datos de ejemplo: sesiones en las últimas 7 días suman X minutos; la función devuelve esa suma. Caso sin sesiones devuelve `0`.

### T5: Cálculo de progreso y porcentaje
- **Descripción**: Crear función `calcularProgreso(acumulado, goal)` que reciba los minutos acumulados en 7 días y el goal actual. Devolverá un entero 0-100 con la siguiente lógica:
  - Si `goal` es `0` → retornar `100` (cumplido automáticamente).
  - Si `goal` es `null`/`undefined` (no hay meta) → retornar `null` (indicará UI que no hay porcentaje).
  - Si `acumulado` es `0` y `goal > 0` → retornar `0`.
  - Caso general → `Math.round(acumulado / goal * 100)`, asegurándose de que el resultado no supere `100`.
- **RF**: RF-3
- **Hecho cuando**: Ejecutar pruebas unitarias:
  - `calcularProgreso(15, 30)` → `50`.
  - `calcularProgreso(0, 0)` → `100`.
  - `calcularProgreso(0, 30)` → `0`.
  - `calcularProgreso(10, null)` → `null`.

### T6: Componente UI - campo de entrada y visualización de meta
- **Descripción**: Añadir en `index.html` un nuevo bloque después del mapa de calor que incluya:
  - Un campo de entrada `<type="number">` para establecer una nueva meta (solo números enteros ≥ 0). El campo debe tener validación HTML (`min="0"`).
  - Un párrafo que muestre la meta actual: "Meta semanal: X min" (usando `obtenerGoal()`).
  - Un párrafo que muestre minutos acumulados: "Estudiado Y min en los últimos 7 días".
  - Un elemento `<progress>` o `<div class="progress-bar">` que refleje el porcentaje (solo si hay goal definida).
  - Un elemento `<span>` con el porcentaje y la etiqueta "Progreso Z%" (oculto cuando no haya goal).
- **RF**: RF-3, RF-4 (visualización en UI)
- **Hecho cuando**: El bloque aparece en la página principal al abrir `index.html`. Los valores se actualizan dinámicamente cuando se cambia la meta.

### T7: Estilos responsivos para el componente de objetivo
- **Descripción**: Añadir en `styles.css` los estilos necesarios para que el bloque del objetivo semanal se muestre correctamente en:
  - Pantallas móviles (mínimo 320px, apilamiento vertical, inputs y barras de progreso con tamaño táctil mínimo 44px).
  - Pantallas escritorio (disposición en línea o tarjeta compacta).
  - Uso de variables CSS `--color-progreso-bajo`, `--color-progreso-medio`, `--color-progreso-alto` para colorear la barra según el porcentaje.
  - Estilos para el estado "Sin meta definida" (mostrar texto en lugar de barra).
- **RNF**: Responsividad (ver spec)
- **Hecho cuando**: El componente se ve usable en el viewport del móvil sin desbordes y la barra de progreso tiene un color coherente con el porcentaje (ej. verde si > 70%, amarillo si 30-70%, rojo si < 30%).

### T8: Manejo de casos límite y datos corruptos
- **Descripción**: Implementar validaciones en las funciones anteriores y en el componente UI para los siguientes escenarios:
  - **Sin meta definida**: Si `obtenerGoal()` devuelve `0` y no hay goal guardado (o era `undefined`), el UI debe mostrar "Sin meta definida" y ocultar la barra/porcentaje.
  - **Goal 0**: Si el usuario establece meta en `0`, el UI muestra `100%` de progreso y la barra llena, sin importar los minutos acumulados.
  - **Datos corruptos en localStorage**: Si `JSON.parse` falla o el estructura no tiene `goal`, tratar el goal como `0` y sesiones como array vacío. Mostrar "Sin meta definida".
  - **Sin sesiones en 7 días**: Los minutos acumulados serán `0`, y el progreso será `0%` si `goal > 0`, o `100%` si `goal` es también `0`.
- **RF**: Casos límite (RF-4 implícito)
- **Hecho cuando**: Probar cada escenario manualmente en el navegador y confirmar que el comportamiento coincide con la descripción. Ejecutar tests que incluyan datos corruptos y verificar que la función no lanza errores.

### T9: Tests unitarios con node --test
- **Descripción**: Crear un archivo de test (ej. `specs/002-semanal-objetivo/test/objetivo-test.mjs` o dentro de `tests/` si existe) que importe y teste las funciones puras: `migratarDatos`, `obtenerGoal`, `actualizarGoal`, `calcularMinutos7Dias`, `calcularProgreso`. Usar la sintaxis `node --test` (ESM o CommonJS según configuración del proyecto) y asegurar al menos un test por función cubriendo caso normal y caso límite.
- **RF**: Todas (verificación global)
- **Hecho cuando**: Ejecutar `node --test` en el directorio del proyecto y obtener "OK" para todos los tests. No deben haber fallos ni errores de excepción no capturada.

### T10: Verificación manual en navegador
- **Descripción**: Abrir `index.html` en un navegador y realizar el flujo completo:
  1. Verificar que al abrir la página sin datos previos, aparece "Sin meta definida".
  2. Ingresar una meta (ej. 30 minutos) mediante el campo de entrada y confirmar que se guarda al recargar (comprobar en Application > LocalStorage).
  3. Registrar algunas sesiones con `minutos` distintos en días recientes; verificar que la meta, minutos acumulados y porcentaje se actualicen correctamente.
  4. Probar el caso goal `0` y confirmar que muestra 100%.
  5. Probar modo móvil reduciendo el viewport y confirmar que el diseño se adapta sin cortes.
- **RF**: Todas
- **Hecho cuando**: Todas las interacciones funcionan según lo especificado y no hay errores en la consola del desarrollador.

## Orden y Dependencias
Las tareas están ordenadas en secuencia lógica: T1 → T2 → T3 configuran el almacenamiento; T4 → T5 proveen la lógica de cálculo; T6 → T7 definen la presentación visual; T8 asegura robustez; T9 y T10 validan funcionamiento. Cada tarea depende de que las anteriores estén funcionando como mínimo en nivel unitario.