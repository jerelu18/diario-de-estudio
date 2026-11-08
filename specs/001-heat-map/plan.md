# Plan de Implementación: Mapa de Calor (001)

### Archivos
*   `app.js`: Se añadirán funciones puras para la lógica de cálculo (RF-2, RF-3) y se actualizará `render` para pintar el mapa.
*   `styles.css`: Se añadirán estilos para la cuadrícula del mapa, colores de intensidad (`.level-0`, `.level-1`, `.level-2`, `.level-3`) y el área de resumen.
*   `index.html`: Se añadirá un contenedor para el mapa (`#heat-map`) y un área para el resumen (`#heat-map-summary`).
*   `tests/heat_map.test.js`: Se creará para testear la lógica pura.

### Lógica (Funciones puras, parámetro `hoy`)
- `get84DayRange(hoy)`: Devuelve un array de strings `YYYY-MM-DD` desde `hoy` hacia atrás 84 días.
- `sumMinutesByDate(sessions)`: Devuelve un objeto `{ "YYYY-MM-DD": minutes }`.
- `getColorLevel(minutes)`: Devuelve 0, 1, 2 o 3 (RF-3).

### Algoritmo
```text
dates = get84DayRange(hoy)
totals = sumMinutesByDate(sessions)
container = document.getElementById('heat-map')
container.innerHTML = ''

dates.forEach(date => {
  minutes = totals[date] || 0
  level = getColorLevel(minutes)
  cell = createElement('div', class: `level-${level}`)
  cell.dataset.date = date
  cell.dataset.minutes = minutes
  container.appendChild(cell)
})
```

### Interfaz
Se utilizará `flexbox` o `grid` en `.level-container` para organizar las celdas en filas de 7. Un único *event listener* en `#heat-map` gestionará el `click` (delegación de eventos), buscando `data-date` y `data-minutes` para actualizar el `#heat-map-summary` (RF-4).

### Decisiones Técnicas
*   **Decisión**: Usar clases CSS para los niveles de color (`.level-0`...`.level-3`) en lugar de estilos *inline*.
    *   *Alternativa descartada*: Calcular colores en JS. *Justificación*: El CSS es más fácil de mantener y cambiar globalmente (Constitución: Simplicidad).
*   **Decisión**: Delegación de eventos en el contenedor del mapa para manejar los clics.
    *   *Alternativa descartada*: Añadir un listener a cada celda. *Justificación*: Mejor rendimiento y simplicidad (Constitución: Simplicidad).

### Estrategia de tests (`node --test`)
- Tests unitarios en `tests/heat_map.test.js` usando `node:assert`.
- Mocking de `hoy` para verificar la generación correcta de fechas.
- Verificación de la lógica de `getColorLevel` contra los valores límite definidos en RF-3.
- Verificación de `sumMinutesByDate` con sesiones de la misma fecha.
