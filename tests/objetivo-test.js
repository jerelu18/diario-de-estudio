const assert = require('node:assert');
const { describe, it } = require('node:test');

// --- migratarDatos ---
function migratarDatos(datos) {
    const STORAGE_KEY = 'diario_estudio_sesiones';
    
    if (!datos) {
        return { goal: 0, sessions: [] };
    }
    
    try {
        const parsed = JSON.parse(datos);
        
        if (parsed && typeof parsed === 'object' && 'goal' in parsed && Array.isArray(parsed.sessions)) {
            return parsed;
        }
        
        if (Array.isArray(parsed)) {
            return { goal: 0, sessions: parsed };
        }
        
        return { goal: 0, sessions: [] };
    } catch (e) {
        return { goal: 0, sessions: [] };
    }
}

// --- obtenerGoal ---
function obtenerGoal(datosLocalStorage) {
    if (!datosLocalStorage) return 0;
    
    try {
        const parsed = JSON.parse(datosLocalStorage);
        
        if (parsed && typeof parsed === 'object' && 'goal' in parsed) {
            const goal = parsed.goal;
            if (typeof goal === 'number' && Number.isInteger(goal) && goal >= 0) {
                return goal;
            }
        }
        
        if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 0) {
            return parsed;
        }
        
    } catch (e) {
        return 0;
    }
    
    return 0;
}

// --- actualizarGoal ---
function actualizarGoal(nuevoGoal, datosActuales) {
    if (typeof nuevoGoal !== 'number' || !Number.isInteger(nuevoGoal) || nuevoGoal < 0) {
        return false;
    }
    
    if (!datosActuales) {
        return true;
    }
    
    try {
        const parsed = JSON.parse(datosActuales);
        let currentSessions = [];
        
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sessions)) {
            currentSessions = parsed.sessions;
        } else if (Array.isArray(parsed)) {
            currentSessions = parsed;
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

// --- calcularMinutos7Dias ---
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
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    
    const limiteStr = formatoFecha(fechaLimite);
    
    let totalMinutos = 0;
    
    sessions.forEach(session => {
        const { date, minutes } = session;
        if (date && typeof minutes === 'number' && !isNaN(minutes) && date >= limiteStr && date <= hoy) {
            totalMinutos += minutes;
        }
    });
    
    return totalMinutos;
}

// --- calcularProgreso ---
function calcularProgreso(acumulado, goal) {
    if (goal === 0) return 100;
    if (goal === null || goal === undefined) return null;
    if (acumulado === 0 && goal > 0) return 0;
    const progreso = Math.round(acumulado / goal * 100);
    return progreso > 100 ? 100 : progreso;
}

describe('Objetivo Semanal - Lógica Pura', () => {
    describe('migratarDatos', () => {
        it('debe crear estructura inicial si no hay datos', () => {
            const result = migratarDatos(undefined);
            assert.strictEqual(result.goal, 0);
            assert.ok(Array.isArray(result.sessions));
        });
        
        it('debe migrar array puro a {goal, sessions}', () => {
            const oldFormat = JSON.stringify([{id: 1, date: '2026-11-05', subject: 'JS', minutes: 30}]);
            const result = migratarDatos(oldFormat);
            assert.strictEqual(result.goal, 0);
            assert.strictEqual(result.sessions.length, 1);
        });
        
        it('debe dejar intacto el formato nuevo {goal, sessions}', () => {
            const newFormat = JSON.stringify({ goal: 30, sessions: [{id: 1, date: '2026-11-05', subject: 'JS', minutes: 30}] });
            const result = migratarDatos(newFormat);
            assert.strictEqual(result.goal, 30);
            assert.strictEqual(result.sessions.length, 1);
        });
        
        it('debe resetear datos corruptos', () => {
            const result = migratarDatos('corrupt json {{{');
            assert.strictEqual(result.goal, 0);
            assert.ok(Array.isArray(result.sessions));
        });
    });
    
    describe('obtenerGoal', () => {
        it('debe retornar 0 si no hay datos', () => {
            const result = obtenerGoal(undefined);
            assert.strictEqual(result, 0);
        });
        
        it('debe retornar goal guardado cuando es válido', () => {
            const result = obtenerGoal(JSON.stringify({ goal: 30, sessions: [] }));
            assert.strictEqual(result, 30);
        });
        
        it('debe retornar 0 si goal es inválido (negativo)', () => {
            const result = obtenerGoal(JSON.stringify({ goal: -5, sessions: [] }));
            assert.strictEqual(result, 0);
        });
        
        it('debe retornar 0 si goal es NaN', () => {
            const result = obtenerGoal(JSON.stringify({ goal: NaN, sessions: [] }));
            assert.strictEqual(result, 0);
        });
        
        it('debe retornar 0 si datos están corruptos', () => {
            const result = obtenerGoal('not valid json');
            assert.strictEqual(result, 0);
        });
        
        it('debe retornar 0 si goal es 0 (meta por defecto)', () => {
            const result = obtenerGoal(JSON.stringify({ goal: 0, sessions: [] }));
            assert.strictEqual(result, 0);
        });
    });
    
    describe('actualizarGoal', () => {
        it('debe retornar true goal válido', () => {
            const result = actualizarGoal(20, JSON.stringify({ goal: 10, sessions: [] }));
            assert.strictEqual(result, true);
        });
        
        it('debe retornar false goal negativo', () => {
            const result = actualizarGoal(-5, JSON.stringify({ goal: 10, sessions: [] }));
            assert.strictEqual(result, false);
        });
        
        it('debe retornar false goal NaN', () => {
            const result = actualizarGoal(NaN, JSON.stringify({ goal: 10, sessions: [] }));
            assert.strictEqual(result, false);
        });
        
        it('debe retornar false goal no entero', () => {
            const result = actualizarGoal(3.5, JSON.stringify({ goal: 10, sessions: [] }));
            assert.strictEqual(result, false);
        });
        
        it('debe retornar true goal 0', () => {
            const result = actualizarGoal(0, JSON.stringify({ goal: 10, sessions: [] }));
            assert.strictEqual(result, true);
        });
    });
    
    describe('calcularMinutos7Dias', () => {
        it('debe retornar 0 si no hay sesiones', () => {
            const result = calcularMinutos7Dias([], '2026-11-05');
            assert.strictEqual(result, 0);
        });
        
        it('debe retornar 0 si formato de hoy es inválido', () => {
            const result = calcularMinutos7Dias([{id: 1, date: '2026-11-05', minutes: 30}], 'invalid');
            assert.strictEqual(result, 0);
        });
        
        it('debe sumar minutos de sesiones en el rango de 7 días', () => {
            const sessions = [
                { id: 1, date: '2026-11-05', minutes: 30 },
                { id: 2, date: '2026-11-04', minutes: 20 },
                { id: 3, date: '2026-11-03', minutes: 15 }
            ];
            const result = calcularMinutos7Dias(sessions, '2026-11-05');
            assert.strictEqual(result, 65);
        });
        
        it('debe excluir sesiones fuera del rango de 7 días', () => {
            const sessions = [
                { id: 1, date: '2026-10-20', minutes: 50 },
                { id: 2, date: '2026-11-05', minutes: 20 }
            ];
            const result = calcularMinutos7Dias(sessions, '2026-11-05');
            assert.strictEqual(result, 20);
        });
        
        it('debe manejar sessions sin fecha o minutos inválidos', () => {
            const sessions = [
                { id: 1, date: '2026-11-05', minutes: 30 },
                { id: 2, date: '2026-11-05', minutes: 'no válido' },
                { id: 3, minutes: 10 }
            ];
            const result = calcularMinutos7Dias(sessions, '2026-11-05');
            assert.strictEqual(result, 30);
        });
    });
    
    describe('calcularProgreso', () => {
        it('debe retornar 50 cuando acumulado es la mitad del goal', () => {
            const result = calcularProgreso(15, 30);
            assert.strictEqual(result, 50);
        });
        
        it('debe retornar 100 cuando goal es 0', () => {
            const result = calcularProgreso(0, 0);
            assert.strictEqual(result, 100);
        });
        
        it('debe retornar 0 cuando acumulado es 0 y goal > 0', () => {
            const result = calcularProgreso(0, 30);
            assert.strictEqual(result, 0);
        });
        
        it('debe retornar null cuando goal es null', () => {
            const result = calcularProgreso(10, null);
            assert.strictEqual(result, null);
        });
        
        it('debe retornar null cuando goal es undefined', () => {
            const result = calcularProgreso(10, undefined);
            assert.strictEqual(result, null);
        });
        
        it('debe acotar el resultado en 100', () => {
            const result = calcularProgreso(45, 30);
            assert.strictEqual(result, 100);
        });
        
        it('debe calcular porcentaje correcto en casos generales', () => {
            const result = calcularProgreso(20, 50);
            assert.strictEqual(result, 40);
        });
    });
});