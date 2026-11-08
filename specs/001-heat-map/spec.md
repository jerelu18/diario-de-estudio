# Especificación: Mapa de Calor de Estudio (001)

### Contexto y objetivo
Visualización de actividad tipo "GitHub" de los últimos 84 días (12 semanas) para motivar la consistencia y visualizar la intensidad de estudio.

### Usuarios
Estudiante que desea ver su racha y nivel de dedicación reciente.

### Historias de usuario
- Como estudiante, quiero ver mi actividad de los últimos 84 días para identificar patrones.
- Como estudiante, quiero saber cuánto estudié un día concreto tocando su celda.

### Requisitos funcionales (RF)
- **RF-1**: El sistema mostrará un gráfico de actividad de los últimos 84 días naturales (ventana deslizante).
- **RF-2**: El total de minutos diarios se calcula sumando todos los registros de una fecha.
- **RF-3**: Niveles de color: 0 min (Vacío), 1-30 min (Nivel 1), 31-60 min (Nivel 2), >60 min (Nivel 3).
- **RF-4**: Al tocar una celda, se actualizará un área de resumen con: "Fecha: [Fecha] - [Minutos] minutos".

### Requisitos no funcionales
- **Responsividad**: El mapa se organizará en filas de 7 días para asegurar objetivos táctiles usables en móviles.
- **Desacoplamiento**: La lógica de cálculo de colores y suma de minutos será independiente de la generación del HTML.
- **Idioma**: Español nativo en todos los textos.

### Casos límite
- Datos corruptos (minutos negativos, formato erróneo): Se tratarán como 0 minutos.
- Días sin sesiones: Se mostrarán como Nivel 0.
- Cambio de año: El cálculo de los 84 días es absoluto, ignorando el año natural.

### Fuera de alcance
- Exportación, estadísticas multianuales, personalización de colores.

### Criterios de finalización
- Verificación manual: Comprobación de que 0, 30, 60 y 61 minutos generan los 4 niveles de color correctos.
- Correcta visualización en 375px (sin desbordamiento).
- El resumen inferior se actualiza al tocar cualquier celda (incluso celdas vacías).

