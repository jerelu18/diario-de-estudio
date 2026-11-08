// Clave para localStorage
const STORAGE_KEY = 'diario_estudio_sesiones';

// --- MIGRACIÓN DE DATOS ---
// Ejecutar migración al cargar la aplicación para compatibilidad con datos antiguos
function migratarDatos() {
    const data = localStorage.getItem(STORAGE_KEY);

    // Si no hay datos, crear estructura inicial (sin meta definida por defecto)
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal: null, sessions: [] }));
        return;
    }

    try {
        const parsed = JSON.parse(data);

        // Si ya tiene el formato nuevo (propiedad goal), dejar intacto
        if (parsed && typeof parsed === 'object' && 'goal' in parsed && Array.isArray(parsed.sessions)) {
            // Datos ya en formato correcto
            return;
        }

        // Si es un array puro (formato antiguo sin goal), migrar preservando sesiones
        if (Array.isArray(parsed)) {
            const nuevoFormato = {
                goal: null,
                sessions: parsed
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoFormato));
            return;
        }

        // Caso desconocido: reestablecer a estructura inicial
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal: null, sessions: [] }));
    } catch (e) {
        // Error al parsear (datos corruptos): reestablecer a estructura inicial
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal: null, sessions: [] }));
    }
}

// Ejecutar migración inmediatamente
migratarDatos();

// Elementos del DOM
const form = document.getElementById('study-form');
const dateInput = document.getElementById('date');
const subjectInput = document.getElementById('subject');
const minutesInput = document.getElementById('minutes');
const streakNumber = document.getElementById('streak-number');
const bestStreakNumber = document.getElementById('best-streak-number');
const sessionsContainer = document.getElementById('sessions-container');
const heatMapContainer = document.getElementById('heat-map');
const heatMapSummary = document.getElementById('heat-map-summary');
const weeklyGoalValue = document.getElementById('weekly-goal-value');
const newGoalInput = document.getElementById('new-goal');
const setGoalBtn = document.getElementById('set-goal-btn');
const accumulatedMinutes = document.getElementById('accumulated-minutes');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');

// Obtener fecha local en formato YYYY-MM-DD
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Inicializar fecha por defecto en el formulario (hoy)
dateInput.value = getLocalDateString();

// Cargar sesiones desde localStorage
// Compatible con ambos formatos: array viejo y nuevo {goal, sessions}
function getSessions() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        // Nuevo formato: {goal: number, sessions: array}
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sessions)) {
            return parsed.sessions;
        }
        // Formato antiguo: array puro de sesiones
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];
    } catch (e) {
        return [];
    }
}

// Guardar sesiones en localStorage preservando la meta semanal configurada
function saveSessions(sessions) {
    const currentGoal = obtenerGoalRaw();
    const data = JSON.stringify({
        goal: currentGoal,
        sessions: Array.isArray(sessions) ? sessions : []
    });
    localStorage.setItem(STORAGE_KEY, data);
}

// Obtener goal crudo de localStorage (retorna número entero ≥ 0, o null si no hay meta definida)
function obtenerGoalRaw() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    try {
        const parsed = JSON.parse(data);

        // Si tiene formato nuevo {goal, sessions}
        if (parsed && typeof parsed === 'object' && 'goal' in parsed) {
            const goal = parsed.goal;
            if (typeof goal === 'number' && Number.isInteger(goal) && goal >= 0) {
                return goal;
            }
        }

        // Si es un número válido directo
        if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 0) {
            return parsed;
        }
    } catch (e) {
        return null;
    }

    return null;
}

// Obtener goal de localStorage con default a 0
// Retorna 0 si no hay goal, es null, undefined o no es un número entero ≥ 0
function obtenerGoal() {
    const raw = obtenerGoalRaw();
    return raw !== null ? raw : 0;
}

// Actualizar goal en localStorage
// Actualiza solo la propiedad goal, manteniendo las sesiones existentes
// Retorna true si se actualizó correctamente, false si el goal es inválido
function actualizarGoal(nuevoGoal) {
    // Validar que nuevoGoal sea un número entero ≥ 0
    if (typeof nuevoGoal !== 'number' || !Number.isInteger(nuevoGoal) || nuevoGoal < 0) {
        return false;
    }

    // Leer sesiones actuales de manera segura
    const currentSessions = getSessions();

    // Crear nuevo dato con goal actualizado y sesiones conservadas
    const nuevoDatos = {
        goal: nuevoGoal,
        sessions: currentSessions
    };

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoDatos));
    return true;
}

// Calcular minutos en ventana de 7 días (RF-2)
// Función pura: no tiene efectos secundarios, solo recibe parámetros y devuelve resultado
// 'hoy' es cadena YYYY-MM-DD (fecha local)
// Filtra sesiones entre hoy-6 días y hoy inclusive, sin usar toISOString ni UTC
function calcularMinutos7Dias(sessions, hoy) {
    if (!sessions || sessions.length === 0) return 0;
    if (typeof hoy !== 'string' || !hoy.match(/^\d{4}-\d{2}-\d{2}$/)) return 0;

    const [year, month, day] = hoy.split('-').map(Number);
    const fechaHoy = new Date(year, month - 1, day);
    const fechaLimite = new Date(fechaHoy);
    fechaLimite.setDate(fechaHoy.getDate() - 6);

    const formatoFecha = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dayStr}`;
    };

    const limiteStr = formatoFecha(fechaLimite);
    let totalMinutos = 0;

    sessions.forEach(session => {
        const { date, minutes } = session;
        const mins = Number(minutes);
        if (date && typeof mins === 'number' && !isNaN(mins) && mins > 0 && date >= limiteStr && date <= hoy) {
            totalMinutos += mins;
        }
    });

    return totalMinutos;
}

// Calcular progreso y porcentaje (RF-3)
// Recibe minutos acumulados en 7 días y el goal actual
// Devuelve entero 0-100 o null si no hay goal definido
function calcularProgreso(acumulado, goal) {
    // Si no hay goal definido (null/undefined), indicar que no hay porcentaje
    if (goal === null || goal === undefined) return null;

    // Si goal es 0, se considera cumplido automáticamente
    if (goal === 0) return 100;

    // Si acumulado es 0 y goal > 0, progreso es 0
    if (acumulado === 0 && goal > 0) return 0;

    // Caso general: redondear al entero más cercano, máximo 100
    const progreso = Math.round(acumulado / goal * 100);
    return progreso > 100 ? 100 : progreso;
}

// Parsear fecha local string a objeto Date
function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Calcular racha actual según reglas especificadas
function calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const dateSet = new Set(sessions.map(s => s.date));
    const todayStr = getLocalDateString(new Date());

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    let checkDate;

    if (dateSet.has(todayStr)) {
        checkDate = parseLocalDate(todayStr);
    } else if (dateSet.has(yesterdayStr)) {
        checkDate = parseLocalDate(yesterdayStr);
    } else {
        return 0;
    }

    let streak = 0;
    while (true) {
        const dateStr = getLocalDateString(checkDate);
        if (dateSet.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// Calcular la mejor racha histórica
function calculateBestStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const dateSet = new Set(sessions.map(s => s.date));
    const sortedDates = Array.from(dateSet).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
        const currentDate = parseLocalDate(dateStr);
        if (!prevDate) {
            currentStreak = 1;
        } else {
            const diffTime = currentDate - prevDate;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else if (diffDays === 0) {
                // Mismo día, ignorar duplicados
            } else {
                currentStreak = 1;
            }
        }
        prevDate = currentDate;
        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
        }
    }

    return maxStreak;
}

// --- LÓGICA DEL MAPA DE CALOR ---

/**
 * Devuelve un array con los strings de fecha de los últimos 84 días (12 semanas)
 * contados desde la fecha "hoy" hacia atrás.
 * @param {Date} hoy
 * @returns {string[]}
 */
function get84DayRange(hoy) {
    const range = [];
    for (let i = 0; i < 84; i++) {
        const date = new Date(hoy);
        date.setDate(hoy.getDate() - i);
        range.push(getLocalDateString(date));
    }
    return range;
}

/**
 * Suma los minutos totales por fecha a partir de un array de sesiones.
 * @param {{date: string, minutes: number}[]} sesiones
 * @returns {{[key: string]: number}}
 */
function sumMinutesByDate(sesiones) {
    const totals = {};
    sesiones.forEach(s => {
        if (s.minutes > 0) {
            totals[s.date] = (totals[s.date] || 0) + s.minutes;
        }
    });
    return totals;
}

/**
 * Determina el nivel de color (0, 1, 2 o 3) basado en los minutos acumulados.
 * @param {number} minutos
 * @returns {number}
 */
function getColorLevel(minutos) {
    if (minutos === 0) return 0;
    if (minutos <= 30) return 1;
    if (minutos <= 60) return 2;
    return 3;
}

/**
 * Renderiza el mapa de calor basándose en las sesiones guardadas.
 */
function renderHeatMap() {
    const sessions = getSessions();
    const hoy = new Date();
    const dateRange = get84DayRange(hoy);
    const minutesByDate = sumMinutesByDate(sessions);
    const container = document.getElementById('heat-map');
    const summary = document.getElementById('heat-map-summary');

    // Limpiamos el contenedor
    container.innerHTML = '';

    dateRange.forEach(date => {
        const minutes = minutesByDate[date] || 0;
        const level = getColorLevel(minutes);

        const cell = document.createElement('div');
        cell.className = `heat-map-cell level-${level}`;
        cell.dataset.date = date;
        cell.dataset.minutes = minutes;
        // Delegación de eventos: al hacer clic, mostramos el resumen
        cell.addEventListener('click', () => {
            summary.textContent = `Fecha: ${formatDateReadable(date)} - ${minutes} minutos`;
        });

        container.appendChild(cell);
    });

    // Texto inicial del resumen
    summary.textContent = 'Toca un día para ver detalles';
}

// Formatear fecha para mostrar amigable (ej: "10 jun 2026")
function formatDateReadable(dateStr) {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Renderizar interfaz
function render() {
    const sessions = getSessions();

    // 1. Calcular y mostrar rachas
    const streak = calculateStreak(sessions);
    const bestStreak = calculateBestStreak(sessions);
    streakNumber.textContent = streak;
    bestStreakNumber.textContent = bestStreak;

    // 2. Ordenar sesiones: de la más reciente a la más antigua
    sessions.sort((a, b) => {
        if (b.date !== a.date) {
            return b.date.localeCompare(a.date);
        }
        return b.id - a.id;
    });

    // 3. Renderizar lista
    if (sessions.length === 0) {
        sessionsContainer.innerHTML = '<p class="empty-state">No hay sesiones registradas todavía. ¡Empieza hoy!</p>';
    } else {
        sessionsContainer.innerHTML = '';
        sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = 'session-item';

            item.innerHTML = `
                <div class="session-info">
                    <span class="session-subject">${escapeHtml(session.subject)}</span>
                    <span class="session-date">${formatDateReadable(session.date)}</span>
                </div>
                <div class="session-right">
                    <span class="session-badge">${session.minutes} min</span>
                    <button class="btn-delete" title="Eliminar sesión" data-id="${session.id}">✕</button>
                </div>
            `;
            sessionsContainer.appendChild(item);
        });
    }

    // 4. Renderizar mapa de calor (RF-1, RF-4)
    renderHeatMap();

    // 5. Renderizar objetivo semanal
    renderWeeklyGoal();
}

// Renderizar sección de objetivo semanal
function renderWeeklyGoal() {
    if (!weeklyGoalValue || !accumulatedMinutes || !progressBar || !progressPercentage) return;

    const sessions = getSessions();
    const hoy = getLocalDateString();
    const minutos7Dias = calcularMinutos7Dias(sessions, hoy);
    const goal = obtenerGoalRaw();

    accumulatedMinutes.textContent = minutos7Dias;

    if (goal === null) {
        weeklyGoalValue.textContent = 'Sin meta definida';
        progressBar.style.display = 'none';
        progressPercentage.style.display = 'none';
        progressPercentage.classList.add('percentage-hidden');
    } else {
        weeklyGoalValue.textContent = `${goal} min`;
        const progreso = calcularProgreso(minutos7Dias, goal);
        progressBar.style.display = 'block';
        progressBar.value = progreso;
        progressPercentage.style.display = 'inline-block';
        progressPercentage.classList.remove('percentage-hidden');
        progressPercentage.textContent = `Progreso ${progreso}%`;
    }
}

// Escapar HTML para seguridad básica
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Manejar envío del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = dateInput.value;
    const subject = subjectInput.value.trim();
    const minutes = parseInt(minutesInput.value, 10);

    if (!date || !subject || isNaN(minutes) || minutes <= 0) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
    }

    const sessions = getSessions();
    const newSession = {
        id: Date.now(),
        date,
        subject,
        minutes
    };

    sessions.push(newSession);
    saveSessions(sessions);

    // Resetear formulario y volver fecha a hoy
    subjectInput.value = '';
    minutesInput.value = '';
    dateInput.value = getLocalDateString();

    render();
});

// Manejar eliminación de sesión
sessionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = Number(e.target.getAttribute('data-id'));
        let sessions = getSessions();
        sessions = sessions.filter(s => s.id !== id);
        saveSessions(sessions);
        render();
    }
});

// Manejar establecimiento de meta semanal
if (setGoalBtn) {
    setGoalBtn.addEventListener('click', () => {
        const valStr = newGoalInput.value.trim();
        if (valStr === '') {
            alert('Por favor, ingresa un número de minutos.');
            return;
        }

        const goal = Number(valStr);
        if (isNaN(goal) || !Number.isInteger(goal) || goal < 0) {
            alert('Por favor, ingresa una meta válida (número entero mayor o igual a 0).');
            return;
        }

        const exito = actualizarGoal(goal);
        if (exito) {
            newGoalInput.value = '';
            render();
        }
    });
}

if (newGoalInput) {
    newGoalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (setGoalBtn) setGoalBtn.click();
        }
    });
}

// Cargar al iniciar
render();