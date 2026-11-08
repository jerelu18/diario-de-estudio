# Tareas: Mapa de Calor (001)

- [ ] **T1: Estructura base y estilos CSS**
    - RF: Estructura visual (contexto)
    - Hecho cuando: El `index.html` incluye el contenedor `#heat-map` y `styles.css` define los colores y grid de 7 columnas sin errores de validación.

- [ ] **T2: Lógica pura `get84DayRange(hoy)`**
    - RF: RF-1
    - Hecho cuando: La función devuelve un array de 84 strings `YYYY-MM-DD` contando desde la fecha actual hacia atrás, probado con `node --test`.

- [ ] **T3: Lógica pura `sumMinutesByDate(sesiones)`**
    - RF: RF-2
    - Hecho cuando: La función suma correctamente los minutos de sesiones repetidas en el mismo día y retorna un objeto de acoplamiento `{ date: total }`.

- [ ] **T4: Lógica pura `getColorLevel(minutos)`**
    - RF: RF-3
    - Hecho cuando: La función retorna 0 para 0 min, 1 para 1-30 min, 2 para 31-60 min y 3 para >60 min, tal como aparecen en los tests.

- [ ] **T5: Renderizado `renderHeatMap()`**
    - RF: RF-1, RF-4
    - Hecho cuando: Se inyectan 84 celdas en `#heat-map` al cargar la página, organizadas en filas de 7, mostrando el color correspondiente a la actividad.

- [ ] **T5: Delegación de eventos y resumen**
    - RF: RF-4
    - Hecho cuando: Al hacer clic en cualquier celda, el área `#heat-map-summary` actualiza su texto a `"Fecha: DD/MM/AAAA - X minutos"`, y al cargar muestra por defecto `"Toca un día para ver detalles"`.

- [ ] **T6: Integración en `render()`**
    - RF: RF-1, RF-2, RF-3, RF-4
    - Hecho cuando: La función principal `render()` llama a `renderHeatMap()` al final, asegurando que la racha, el historial y el mapa se actualicen sincronizados tras añadir o eliminar sesiones.

- [ ] **T7: Pruebas unitarias `tests/heat_map.test.js`**
    - RF: Verificación
    - Hecho cuando: El archivo `tests/heat_map.test.js` existe y está estructurado para ejecutarse con `node --test`, verificando la existencia y tipos de las funciones puras.

- [ ] **T8: Verificación final de Constitución**
    - RF: Principios generales
    - Hecho cuando: Se confirma que el proyecto respeta `docs/constitution.md` (stack nativo, fechas locales, idioma español) y `AGENTS.md` (sin build, directo al navegador).