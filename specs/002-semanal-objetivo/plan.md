# Plan de Implementación - Objetivo Semanal (002)

## Visión General
Este plan sigue el flujo SDD: spec aprobada → plan con tareas → implementación → validación. La funcionalidad añade una meta semanal de minutos de estudio, calcula el progreso en ventana de 7 días y muestra UI asociada.

## Fases Principales (orden de ejecución)

1. **Estructura de datos y migración** – Garantizar que localStorage tenga formato `{goal: number, sessions: array}` y funciones `obtenerGoal()` / `actualizarGoal()`.
2. **Cálculo de minutos en ventana de 7 días** – Función pura `calcularMinutos7Dias(sessions, hoy)` que suma minutos de sesiones entre `hoy - 6 días` y `hoy` inclusive, usando fechas locales `YYYY-MM-DD`.
3. **Cálculo de progreso y porcentaje** – Función `calcularProgreso(acumulado, goal)` con lógica de casos límite: goal 0 → 100 %, sin goal → null, acumulado 0 → 0 % (o 100 % si goal también 0).
4. **Componente UI en index.html** – Bloque después del mapa de calor con campo de entrada número, muestra de meta actual, minutos acumulados, barra de progreso y etiqueta de porcentaje. Estado "Sin meta definida" cuando no hay goal.
5. **Estilos responsivos en styles.css** – Layout para móvil (mínimo 320px, apilamiento vertical, inputs y barras de progreso táctil ≥ 44 px) y escritorio; variables CSS `--color-progreso-bajo/medio/alto` según porcentaje; estilo para "Sin meta definida".
6. **Manejo de casos límite y datos corruptos** – Validaciones en todas las funciones para goal ausente/NaN/negativo, sesiones inválidas, y tratamiento como 0; UI muestra "Sin meta definida" cuando corresponda.
7. **Tests unitarios con `node --test`** – Tests para `migratarDatos`, `obtenerGoal`, `actualizarGoal`, `calcularMinutos7Dias`, `calcularProgreso` cubriendo casos normales y límite.
8. **Verificación manual en navegador** – Flujo completo: abrir página, establecer meta, recargar, registrar sesiones, goal 0, vista móvil; sin errores de consola.

## RFs cubiertas
- RF‑1: Establecer objetivo semanal de minutos (≥ 0).
- RF‑2: Calcular minutos en ventana de 7 días (hoy + 6 días atrás).
- RF‑3: Mostrar meta, minutos acumulados y porcentaje de progreso.
- RF‑4: Persistencia en localStorage bajo clave `'diario_estudio_sesiones'`.