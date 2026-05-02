import { describe, it, expect } from 'vitest';
import type { WorkoutLog, ExerciseKnowledge } from '@/types';
import {
  calcular1RM,
  getVideoForExercise,
  getVolumenSesion,
  getGruposMuscularesEntrenados,
} from './exerciseUtils';

describe('calcular1RM', () => {
  it('reps=1 devuelve el peso', () => {
    expect(calcular1RM(100, 1)).toBe(100);
    expect(calcular1RM(100, 1, 'brzycki')).toBe(100);
  });

  it('Epley 100kg × 5 reps = 116.67', () => {
    expect(calcular1RM(100, 5, 'epley')).toBeCloseTo(116.67, 2);
  });

  it('Epley es la fórmula por defecto', () => {
    expect(calcular1RM(100, 5)).toBe(calcular1RM(100, 5, 'epley'));
  });

  it('Brzycki 100kg × 5 reps ≈ 112.5', () => {
    // 100 × (36 / 32) = 112.5
    expect(calcular1RM(100, 5, 'brzycki')).toBeCloseTo(112.5, 2);
  });

  it('coinciden a 1 rep, divergen al subir reps', () => {
    expect(calcular1RM(100, 1, 'epley')).toBe(calcular1RM(100, 1, 'brzycki'));
    // A 12 reps las fórmulas difieren > 2kg
    const epley = calcular1RM(100, 12, 'epley');
    const brzycki = calcular1RM(100, 12, 'brzycki');
    expect(Math.abs(epley - brzycki)).toBeGreaterThan(2);
  });

  it('inputs inválidos devuelven 0', () => {
    expect(calcular1RM(0, 5)).toBe(0);
    expect(calcular1RM(100, 0)).toBe(0);
    expect(calcular1RM(-10, 5)).toBe(0);
    expect(calcular1RM(100, -3)).toBe(0);
  });

  it('Brzycki a reps imposibles (>=37) devuelve 0', () => {
    expect(calcular1RM(100, 37, 'brzycki')).toBe(0);
    expect(calcular1RM(100, 50, 'brzycki')).toBe(0);
  });
});

describe('getVideoForExercise', () => {
  it('encuentra video por relatedExercises', () => {
    // peso-muerto-convencional aparece en el primer video del catálogo
    const v = getVideoForExercise('peso-muerto-convencional');
    expect(v).toBeDefined();
    expect(v?.relatedExercises).toContain('peso-muerto-convencional');
  });

  it('devuelve undefined para ejercicio sin video', () => {
    expect(getVideoForExercise('xxxx-no-existe-xxxx')).toBeUndefined();
  });

  it('respeta ejercicio.videoId si está presente', () => {
    const ejercicio = {
      id: 'cualquier-cosa',
      videoId: 'hombros-crecimiento',  // existe en el catálogo
    } as ExerciseKnowledge & { videoId?: string };
    const v = getVideoForExercise('cualquier-cosa', ejercicio);
    expect(v?.id).toBe('hombros-crecimiento');
  });
});

describe('getVolumenSesion', () => {
  const mkExercise = (peso: number, reps: number, sets = 3) => ({
    ejercicioId: 'x',
    series: Array.from({ length: sets }, (_, i) => ({
      numero: i + 1,
      peso, repeticiones: reps, RIR: 2, tiempoDescanso: 60, completada: true,
    })),
    tecnicaCorrecta: true,
    sensacionMuscular: 4 as const,
  });

  it('suma peso × reps × sets', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [mkExercise(100, 5, 3)],   // 100 × 5 × 3 = 1500
      completado: true,
    };
    expect(getVolumenSesion(w)).toBe(1500);
  });

  it('suma volúmenes de varios ejercicios', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [
        mkExercise(100, 5, 3),    // 1500
        mkExercise(50, 10, 2),    // 1000
      ],
      completado: true,
    };
    expect(getVolumenSesion(w)).toBe(2500);
  });

  it('series de bodyweight (peso 0) no aportan volumen', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [mkExercise(0, 10, 3)],
      completado: true,
    };
    expect(getVolumenSesion(w)).toBe(0);
  });

  it('workout sin ejercicios devuelve 0', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [],
      completado: true,
    };
    expect(getVolumenSesion(w)).toBe(0);
  });
});

describe('getGruposMuscularesEntrenados', () => {
  const mkEx = (id: string, grupoMuscular: any): ExerciseKnowledge => ({
    id, nombre: id, grupoMuscular,
    categoria: 'compuesto', tier: 'A', dificultad: 'intermedio',
    equipamiento: [], enfoqueMuscular: [],
    tecnica: { posicionInicial: '', ejecucion: [], erroresComunes: [], consejosClave: [] },
    imagenes: { posicionInicial: '', ejecucion: [], errores: [] },
    variantes: [], descansoSugerido: 60,
  });

  const exercises = [
    mkEx('press-banca', 'pecho'),
    mkEx('remo', 'espalda'),
    mkEx('curl', 'biceps'),
  ];

  const mkLog = (ejercicioId: string, populated?: ExerciseKnowledge) => ({
    ejercicioId,
    ejercicio: populated,
    series: [] as never[],
    tecnicaCorrecta: true,
    sensacionMuscular: 3 as const,
  });

  it('lee del exercise populado', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [mkLog('press-banca', exercises[0]), mkLog('remo', exercises[1])],
      completado: true,
    };
    expect(getGruposMuscularesEntrenados(w)).toEqual(['pecho', 'espalda']);
  });

  it('busca en exercises[] cuando no está populado', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [mkLog('press-banca'), mkLog('curl')],
      completado: true,
    };
    expect(getGruposMuscularesEntrenados(w, exercises)).toEqual(['pecho', 'biceps']);
  });

  it('deduplica grupos repetidos', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [mkLog('press-banca', exercises[0]), mkLog('press-banca', exercises[0])],
      completado: true,
    };
    expect(getGruposMuscularesEntrenados(w)).toEqual(['pecho']);
  });

  it('ignora ejercicios desconocidos', () => {
    const w: WorkoutLog = {
      id: 'w1', userId: 'u1', fecha: new Date(),
      ejercicios: [mkLog('xxx-no-existe'), mkLog('remo', exercises[1])],
      completado: true,
    };
    expect(getGruposMuscularesEntrenados(w, exercises)).toEqual(['espalda']);
  });
});
