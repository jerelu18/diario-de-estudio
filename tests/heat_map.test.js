const assert = require('node:assert');
const { describe, it } = require('node:test');

// Funciones puras a testear (se importarán o definirán para test)
function getColorLevel(minutes) {
    if (minutes <= 0) return 0;
    if (minutes <= 30) return 1;
    if (minutes <= 60) return 2;
    return 3;
}

function sumMinutesByDate(sessions) {
    const totals = {};
    for (const s of sessions) {
        const mins = Number(s.minutes);
        const validMins = isNaN(mins) || mins < 0 ? 0 : mins;
        totals[s.date] = (totals[s.date] || 0) + validMins;
    }
    return totals;
}

function get84DayRange(hoy) {
    const dates = [];
    const baseDate = new Date(hoy + 'T00:00:00');
    for (let i = 83; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }
    return dates;
}

describe('Mapa de Calor - Lógica Pura', () => {
    it('getColorLevel asigna los niveles correctos según RF-3', () => {
        assert.strictEqual(getColorLevel(0), 0);
        assert.strictEqual(getColorLevel(1), 1);
        assert.strictEqual(getColorLevel(30), 1);
        assert.strictEqual(getColorLevel(31), 2);
        assert.strictEqual(getColorLevel(60), 2);
        assert.strictEqual(getColorLevel(61), 3);
        assert.strictEqual(getColorLevel(-10), 0); // Caso límite datos corruptos
    });

    it('sumMinutesByDate agrupa y valida correctamente (RF-2)', () => {
        const sessions = [
            { date: '2026-11-05', minutes: 30 },
            { date: '2026-11-05', minutes: 15 },
            { date: '2026-11-04', minutes: -5 }, // Corrupto -> 0
            { date: '2026-11-04', minutes: 'abc' } // Corrupto -> 0
        ];
        const result = sumMinutesByDate(sessions);
        assert.deepStrictEqual(result, {
            '2026-11-05': 45,
            '2026-11-04': 0
        });
    });

    it('get84DayRange genera exactamente 84 días incluyendo hoy (RF-1)', () => {
        const range = get84DayRange('2026-11-05');
        assert.strictEqual(range.length, 84);
        assert.strictEqual(range[range.length - 1], '2026-11-05');
    });
});
