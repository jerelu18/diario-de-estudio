# Historial de Memoria - Diario de Estudio

## Versiones

### v1.2.6 (Documentación y Preparación GitHub)
- **Archivos**: Creados `README.md` (detallando metodología OpenCode, SDD, gobernanza y arquitectura) y `.gitignore`.

### v1.2.5 (Corrección Objetivo Semanal)
- **Corrección**: Conectado el evento del botón "Aplicar" (`#set-goal-btn`) y tecla Enter con `actualizarGoal()` y `render()`.
- **UI/Lógica**: Implementada `renderWeeklyGoal()` para sincronizar meta semanal, minutos acumulados de 7 días, barra de progreso y estado "Sin meta definida".
- **Persistencia**: Corregido `saveSessions()` para que no sobrescriba la meta establecida con 0 al agregar o eliminar sesiones.

### v1.2.4 (Cálculo de progreso)
- **Funcionalidad**: Añadida función `calcularProgreso(acumulado, goal)` en `app.js` que calcula el porcentaje de progreso semanal.
- **Detalles**: Recibe minutos acumulados en 7 días y el goal actual. Lógica:
  - Si `goal` es `0` → retorna `100` (cumplido automáticamente).
  - Si `goal` es `null`/`undefined` → retorna `null` (indicará UI que no hay porcentaje).
  - Si `acumulado` es `0` y `goal > 0` → retorna `0`.
  - Caso general → `Math.round(acumulado / goal * 100)`, máximo `100`.
- **RF cubierta**: RF-3

### v1.2.3 (Cálculo de minutos 7 días)
- **Funcionalidad**: Añadida función `calcularMinutos7Dias(sessions, hoy)` en `app.js` que calcula los minutos totales estudian en la ventana de 7 días (hoy - 6 días hasta hoy inclusive).
- **Detalles**: Recibe `sessions` (array de objetos con `date` en formato YYYY-MM-DD) y `hoy` (cadena YYYY-MM-DD). Filtra sesiones por rango de fechas sin usar `toISOString` ni conversiones UTC. Suma los `minutes` de sesiones comprendidas en el rango. Retorna `0` si no hay sesiones o datos inválidos.
- **RF cubierta**: RF-2

### v1.2.2 (Actualización de Goal)
- **Funcionalidad**: Añadida función `actualizarGoal(nuevoGoal)` en `app.js` que permite actualizar el goal semanal manteniendo las sesiones existentes.
- **Detalles**: Valida que `nuevoGoal` sea número entero ≥ 0. Si es válido, escribe `{goal: nuevoGoal, sessions: <actuales>}` en localStorage y retorna `true`. Si es inválido, no modifica el almacenamiento y retorna `false`. Mantiene retrocompatibilidad con datos migrados.

### v1.2.1 (Migración de Datos)
- **Funcionalidad**: Añadida función `migratarDatos()` que migra datos del formato array antiguo al nuevo formato `{goal, sessions}` en `app.js`.
- **Detalles**: Detecta si los datos son array puro (sin goal), ya están en formato nuevo, o hay datos corruptos. Ejecutada al cargar la aplicación.
- **También actualizadas**: `getSessions()` y `saveSessions()` para compatibilidad con ambos formatos.

### v1.2.0 (Planificación)
- **Funcionalidad**: Diseño y especificación del "Objetivo Semanal de Estudio" (002).
- **Estado**: Fase 1 (Migración) implementada. Siguientes fases: cálculo de minutos 7 días, progreso, componente UI, casos límite y tests.
- **Decisiones**: Migración automática al cargar; compatibilidad retroactiva con datos existentes.

### v1.1.0 (Octubre 2026)
- **Nueva Funcionalidad**: Añadida la "Mejor Racha" (récord histórico).
- **Lógica**: Implementada `calculateBestStreak` basada en fechas únicas ordenadas.
- **UI/UX**: Actualizada `.streak-card` en `index.html` y `styles.css`.

### v1.0.0 (Septiembre 2026)
- **Lanzamiento inicial**:
  - Registro de sesiones, cálculo de racha, persistencia en `localStorage` y estructura de 3 archivos.