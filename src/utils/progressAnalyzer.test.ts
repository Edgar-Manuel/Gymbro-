import { describe, it, expect } from 'vitest';
import {
  calcularEstadisticasGenerales,
  analizarProgresoEjercicio,
  calcularProximaCarga,
  generarDatosGrafico,
  calcular1RM
} from '@/utils/progressAnalyzer';
import type { WorkoutLog, ExerciseKnowledge } from '@/types';

// ─── Helpers ───────────────────────────────────────────

function makeWorkout(overrides: Partial<WorkoutLog> & { fecha: Date }): WorkoutLog {
  return {
    id: Math.random().toString(36).slice(2),
    userId: 'user-1',
    ejercicios: [],
    completado: true,
    sensacionGeneral: 3,
    duracionReal: 45,
    ...overrides
  };
}

function makeExercise(overrides?: Partial<ExerciseKnowledge>): ExerciseKnowledge {
  return {
    id: 'bench-press',
    nombre: 'Press de Banca',
    grupoMuscular: 'pecho',
    categoria: 'compuesto',
    tier: 'S',
    tecnica: { posicionInicial: '', ejecucion: [], erroresComunes: [], consejosClave: [] },
    equipamiento: ['barra'],
    dificultad: 'intermedio',
    enfoqueMuscular: ['pecho'],
    imagenes: { posicionInicial: '', ejecucion: [], errores: [] },
    variantes: [],
    descansoSugerido: 120,
    ...overrides
  };
}

// ─── Tests: calcular1RM ───────────────────────────────

describe('calcular1RM', () => {
  it('returns weight for 1 rep', () => {
    expect(calcular1RM(100, 1)).toBe(100);
  });
  it('applies Epley formula', () => {
    // 80 * (1 + 10/30) = 80 * 1.333 = 106.67
    expect(calcular1RM(80, 10)).toBeCloseTo(106.67, 1);
  });
  it('returns 0 for zero input', () => {
    expect(calcular1RM(0, 5)).toBe(0);
    expect(calcular1RM(50, 0)).toBe(0);
  });
});

// ─── Tests: calcularEstadisticasGenerales ─────────────

describe('calcularEstadisticasGenerales', () => {
  it('returns zeros for empty workouts', () => {
    const stats = calcularEstadisticasGenerales([]);
    expect(stats.mejorRacha).toBe(0);
    expect(stats.rachaActual).toBe(0);
    expect(stats.tiempoTotalMinutos).toBe(0);
    expect(stats.consistenciaSemanas).toBe(0);
  });

  it('calculates real streak from consecutive days', () => {
    const workouts = [
      makeWorkout({ fecha: new Date(2025, 0, 1) }),
      makeWorkout({ fecha: new Date(2025, 0, 2) }),
      makeWorkout({ fecha: new Date(2025, 0, 3) }),
      // gap
      makeWorkout({ fecha: new Date(2025, 0, 10) }),
    ];
    const stats = calcularEstadisticasGenerales(workouts);
    expect(stats.mejorRacha).toBe(3); // NOT 4 (total workouts)
  });

  it('calculates current streak when last workout is today', () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const anteayer = new Date(hoy);
    anteayer.setDate(anteayer.getDate() - 2);

    const workouts = [
      makeWorkout({ fecha: anteayer }),
      makeWorkout({ fecha: ayer }),
      makeWorkout({ fecha: hoy }),
    ];
    const stats = calcularEstadisticasGenerales(workouts);
    expect(stats.rachaActual).toBe(3);
  });

  it('current streak is 0 when last workout was 3 days ago', () => {
    const hace3Dias = new Date();
    hace3Dias.setDate(hace3Dias.getDate() - 3);
    const workouts = [makeWorkout({ fecha: hace3Dias })];
    const stats = calcularEstadisticasGenerales(workouts);
    expect(stats.rachaActual).toBe(0);
  });

  it('calculates total time', () => {
    const workouts = [
      makeWorkout({ fecha: new Date(), duracionReal: 30 }),
      makeWorkout({ fecha: new Date(), duracionReal: 45 }),
    ];
    const stats = calcularEstadisticasGenerales(workouts);
    expect(stats.tiempoTotalMinutos).toBe(75);
  });
});

// ─── Tests: analizarProgresoEjercicio ─────────────────

describe('analizarProgresoEjercicio', () => {
  const exercise = makeExercise();

  it('returns correct 1RM estimation', () => {
    const ahora = new Date();
    const hace8Semanas = new Date(ahora);
    hace8Semanas.setDate(hace8Semanas.getDate() - 56);

    const workouts: WorkoutLog[] = [
      makeWorkout({
        fecha: hace8Semanas,
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [{ numero: 1, repeticiones: 10, peso: 60, RIR: 2, tiempoDescanso: 90, completada: true }],
          tecnicaCorrecta: true, sensacionMuscular: 4
        }]
      }),
      makeWorkout({
        fecha: ahora,
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [{ numero: 1, repeticiones: 8, peso: 80, RIR: 2, tiempoDescanso: 90, completada: true }],
          tecnicaCorrecta: true, sensacionMuscular: 4
        }]
      })
    ];

    const result = analizarProgresoEjercicio('bench-press', workouts, exercise);
    expect(result.estimacion1RM.actual).toBeGreaterThan(0);
    expect(result.sesionesTotales).toBe(2);
    expect(result.frecuenciaSemanal).toBeGreaterThan(0);
  });

  it('handles volume calculation with date filtering', () => {
    const ahora = new Date();
    const hace3Dias = new Date(ahora);
    hace3Dias.setDate(hace3Dias.getDate() - 3);
    const hace10Dias = new Date(ahora);
    hace10Dias.setDate(hace10Dias.getDate() - 10);

    const workouts: WorkoutLog[] = [
      makeWorkout({
        fecha: hace10Dias,
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [{ numero: 1, repeticiones: 10, peso: 60, RIR: 2, tiempoDescanso: 90, completada: true }],
          tecnicaCorrecta: true, sensacionMuscular: 3
        }]
      }),
      makeWorkout({
        fecha: hace3Dias,
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [{ numero: 1, repeticiones: 10, peso: 70, RIR: 2, tiempoDescanso: 90, completada: true }],
          tecnicaCorrecta: true, sensacionMuscular: 4
        }]
      })
    ];

    const result = analizarProgresoEjercicio('bench-press', workouts, exercise);
    // This week's volume should be 70*10=700, last week's should be 60*10=600
    // The exact values depend on "today" but they should NOT be equal anymore
    expect(result.volumenTotal.semanaActual).not.toBe(result.volumenTotal.semanaAnterior);
  });
});

// ─── Tests: calcularProximaCarga ──────────────────────

describe('calcularProximaCarga', () => {
  const exercise = makeExercise();

  it('returns mantener for empty history', () => {
    const result = calcularProximaCarga([], exercise);
    expect(result.accion).toBe('mantener');
  });

  it('recommends subir_peso when RIR <= 1.5', () => {
    const logs = [{
      ejercicioId: 'bench-press',
      series: [
        { numero: 1, repeticiones: 8, peso: 80, RIR: 1, tiempoDescanso: 90, completada: true },
        { numero: 2, repeticiones: 8, peso: 80, RIR: 1, tiempoDescanso: 90, completada: true }
      ],
      tecnicaCorrecta: true, sensacionMuscular: 4 as const
    }];
    const result = calcularProximaCarga(logs, exercise);
    expect(result.accion).toBe('subir_peso');
    expect(result.nuevoPeso).toBe(82.5);
  });

  it('recommends subir_reps when RIR 2-3 and reps < 12', () => {
    const logs = [{
      ejercicioId: 'bench-press',
      series: [
        { numero: 1, repeticiones: 8, peso: 80, RIR: 2.5, tiempoDescanso: 90, completada: true }
      ],
      tecnicaCorrecta: true, sensacionMuscular: 4 as const
    }];
    const result = calcularProximaCarga(logs, exercise);
    expect(result.accion).toBe('subir_reps');
  });

  it('recommends subir_peso aggressively when RIR > 3', () => {
    const logs = [{
      ejercicioId: 'bench-press',
      series: [
        { numero: 1, repeticiones: 8, peso: 60, RIR: 4, tiempoDescanso: 90, completada: true }
      ],
      tecnicaCorrecta: true, sensacionMuscular: 3 as const
    }];
    const result = calcularProximaCarga(logs, exercise);
    expect(result.accion).toBe('subir_peso');
    expect(result.nuevoPeso).toBe(65); // 60 + 2.5*2
  });
});

// ─── Tests: generarDatosGrafico ───────────────────────

describe('generarDatosGrafico', () => {
  it('returns data points with 1RM and numSeries', () => {
    const workouts: WorkoutLog[] = [
      makeWorkout({
        fecha: new Date(2025, 0, 15),
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [
            { numero: 1, repeticiones: 8, peso: 80, RIR: 2, tiempoDescanso: 90, completada: true },
            { numero: 2, repeticiones: 6, peso: 85, RIR: 1, tiempoDescanso: 90, completada: true }
          ],
          tecnicaCorrecta: true, sensacionMuscular: 4
        }]
      })
    ];

    const data = generarDatosGrafico('bench-press', workouts);
    expect(data).toHaveLength(1);
    expect(data[0].pesoMaximo).toBe(85);
    expect(data[0].estimated1RM).toBeGreaterThan(85);
    expect(data[0].numSeries).toBe(2);
  });

  it('filters by date range', () => {
    const workouts: WorkoutLog[] = [
      makeWorkout({
        fecha: new Date(2024, 0, 1),
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [{ numero: 1, repeticiones: 8, peso: 60, RIR: 2, tiempoDescanso: 90, completada: true }],
          tecnicaCorrecta: true, sensacionMuscular: 3
        }]
      }),
      makeWorkout({
        fecha: new Date(),
        ejercicios: [{
          ejercicioId: 'bench-press',
          series: [{ numero: 1, repeticiones: 8, peso: 80, RIR: 2, tiempoDescanso: 90, completada: true }],
          tecnicaCorrecta: true, sensacionMuscular: 4
        }]
      })
    ];

    const desde = new Date();
    desde.setMonth(desde.getMonth() - 1);
    const data = generarDatosGrafico('bench-press', workouts, desde);
    expect(data).toHaveLength(1);
    expect(data[0].pesoMaximo).toBe(80);
  });
});
