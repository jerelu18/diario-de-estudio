# Especificación: Objetivo Semanal de Estudio (002)

### Contexto y objetivo
El usuario podrá fijar una meta de minutos de estudio por semana y visualizar su progreso actual respecto a esa meta, con el fin de mantener la motivación y la constancia. El sistema almacenará la meta semanal y calculará los minutos efectivamente estudiados en la ventana de 7 días que incluye hoy (cuenta hacia atrás desde la fecha actual).

### Usuarios
- Estudiante que utiliza el Diario de Estudio para registrar sesiones y mejorar hábitos de estudio.

### Historias de usuario
1. Como estudiante, quiero fijar un objetivo de minutos de estudio para cada semana, para tener una meta clara de dedicación.
2. Como estudiante, quiero ver mi progreso actual hacia el objetivo semanal (minutos estudian vs. meta y porcentaje), para sentirme motivado y consciente de mis hábitos.

### Requisitos funcionales (RF)
- **RF-1**: El sistema permitirá al usuario establecer un objetivo de minutos de estudio para la semana actual (número entero ≥ 0).
- **RF-2**: El sistema calculará los minutos totales estudian en la ventana de los últimos 7 días (inclusive hoy) sumando todos los registros de sesión en ese período.
- **RF-3**: Se mostrará en la interfaz la meta semanal, los minutos acumulados y el porcentaje de progreso (minutos acumulados / meta × 100, redondeado al entero más cercano).
- **RF-4**: La meta semanal y las sesiones se persistirán en localStorage bajo la clave 'diario_estudio_sesiones' en el formato `{goal: <número>, sessions: [<array>]}`, y se conservará entre sesiones del navegador.

### Requisitos no funcionales (RNF)
- **Idioma**: Todos los textos visibles deberán estar en español.
- **Responsividad**: El componente de objetivo semanal deberá ser usable en pantallas de móvil (mínimo 320px) y escritorio.
- **Persistencia**: La meta establecida debe sobrevivir al cierre y reapertura del navegador sin pérdida de datos.
- **Rendimiento**: El cálculo de los minutos en la ventana de 7 días debe completarse en menos de 100 ms sobre 1000 registros.

### Casos límite
- Si el usuario no ha establecido ninguna meta, el sistema mostrará "Sin meta definida" y no mostrará porcentaje de progreso.
- Si el usuario establece la meta en 0, se considerará cumplido automáticamente y se mostrará 100% de progreso.
- Si no hay sesiones registradas en los últimos 7 días, los minutos acumulados serán 0 y el progreso será 0% (salvo que la meta sea también 0).
- Datos corruptos en localStorage (goal ausente o corrupto, minutos negativos o NaN) se tratarán como 0 para los respectivos cálculos, y se mostrará 'Sin meta definida' si falta el goal.

### Fuera de alcance
- Definir el inicio de la semana (lunes vs. domingo vs. ventana móvil de 7 días); se usará la ventana de 7 días móvil terminando en hoy.
- Permitir metas diferentes por materia o por día de la semana.
- Estadísticas multianuales o comparativas de semanas anteriores.

### Criterios de finalización
- Interfaz visible en la página principal que muestra: campo de entrada para nueva meta (solo número), meta actual, minutos acumulados de los últimos 7 días, barra de progreso y porcentaje.
- Al establecer una nueva meta, el valor se guarda automáticamente y persiste al recargar la página.
- Si no hay meta establecida, el componente no muestra barra de progreso ni porcentaje, solo indica "Sin meta definida".
- El cálculo de los últimos 7 días incluye hoy y los 6 días anteriores (basado en la fecha YYYY-MM-DD).
- Verificación manual: meta 30 min, estudio 15 min en 3 días distintos → progreso 50% (15/30).

