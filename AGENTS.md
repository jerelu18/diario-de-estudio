# Guía para Agentes - Diario de Estudio

## 1. Visión General y Arquitectura
- **Tipo de proyecto**: Aplicación web frontend pura (Single Page Application ligera).
- **Stack tecnológico**: HTML5 semántico, CSS3 moderno (con variables CSS y Flexbox), JavaScript ES6+ Vanilla.
- **Dependencias**: Cero frameworks, cero librerías externas, sin empaquetadores ni Node.js (`no build tools`).
- **Punto de entrada**: `index.html` (debe funcionar al abrirse directamente mediante doble clic en el navegador).

## 2. Estructura de Archivos
El proyecto debe mantenerse estrictamente en estos tres archivos raíz:
- `index.html`: Estructura semántica, accesibilidad básica y contenedor de elementos visuales (incluyendo tarjeta doble de rachas: actual y mejor).
- `styles.css`: Estilos visuales, diseño responsive, tarjetas de racha en dos columnas (`.streaks-container`), variables de color y animaciones.
- `app.js`: Lógica de negocio, persistencia en `localStorage`, manipulación del DOM, cálculo de racha actual (`calculateStreak`), mejor racha histórica (`calculateBestStreak`) y sanitización.

## 3. Persistencia y Esquema de Datos
- **Almacenamiento**: `localStorage` del navegador bajo la clave `'diario_estudio_sesiones'`.
- **Estructura de un registro de sesión**:
  ```json
  [
    {
      "id": 1717000000000,
      "date": "2026-09-30",
      "subject": "JavaScript Asíncrono",
      "minutes": 45
    }
  ]
  ```

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## 4. Reglas de Negocio Clave
- **Manejo de Fechas**:
  - Utilizar **siempre la fecha local** del usuario en formato `YYYY-MM-DD`.
  - Evitar el uso de `toISOString()` o conversiones UTC directas para prevenir discrepancias de zona horaria que puedan alterar el día de estudio.
- **Lógica de la Racha Actual (Streak)**:
  - Un día es válido si contiene al menos 1 sesión registrada.
  - La racha cuenta los días consecutivos estudiados hasta hoy.
  - **Regla de tolerancia diaria**: Si el usuario no ha registrado sesiones hoy pero sí estudió ayer, la racha permanece activa (no se reinicia hasta que el día actual concluye sin registros).
- **Lógica de la Mejor Racha (Best Streak)**:
  - Se calcula dinámicamente a partir de todas las fechas únicas almacenadas, ordenadas cronológicamente.
  - Representa el récord histórico máximo de días consecutivos con sesiones registradas.
  - Debe respetar la regla de contar los días consecutivos estudiados hasta hoy. Es decir, no contar la racha con fechas posteriores a hoy.
- **Orden del Historial**:
  - Las sesiones deben mostrarse ordenadas cronológicamente de la más reciente a la más antigua (por fecha y luego por ID descendente).
## Comandos - Tests: `node --test` 
 
## Reglas 
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## 5. Convenciones de Código y Estilo
- **Idioma**: Todos los textos visibles en la interfaz de usuario, etiquetas y mensajes de error deben estar en **español**.
- **Seguridad**: Escapar o sanitizar cualquier entrada del usuario antes de inyectarla en el DOM (ej. mediante `escapeHtml` o `textContent`).
- **Diseño**: Mantener interfaz limpia, moderna y completamente responsiva para dispositivos móviles.

## 6. Ejecución
- **Ejecución**: Abrir `index.html` en cualquier navegador web moderno.

## 7. Verificación
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome 
DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la 
vista móvil.

