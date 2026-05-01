import { describe, it, expect } from 'vitest';
import type { BodyGoal, UserProfile, BodyMeasurement } from '@/types';
import {
  getBodyGoals,
  getGoalForMetric,
  withUpdatedGoal,
  withoutGoal,
  calculateGoalProgress,
} from './bodyGoals';

const baseUser: UserProfile = {
  id: 'u1',
  nombre: 'Test',
  nivel: 'intermedio',
  objetivo: 'hipertrofia',
  diasDisponibles: 4,
  equipamiento: ['barra'],
  pesoActual: 80,
  altura: 175,
  edad: 30,
};

const goalPeso: BodyGoal = {
  metric: 'peso',
  target: 75,
  deadline: '2026-06-30',
  startValue: 80,
  createdAt: '2026-04-01T00:00:00Z',
};

describe('getBodyGoals / withUpdatedGoal / withoutGoal', () => {
  it('user vacío → {}', () => {
    expect(getBodyGoals(baseUser)).toEqual({});
  });

  it('añade y lee', () => {
    const u = withUpdatedGoal(baseUser, goalPeso);
    expect(getGoalForMetric(u, 'peso')).toEqual(goalPeso);
    expect(getGoalForMetric(u, 'cintura')).toBeUndefined();
  });

  it('reemplaza la misma métrica sin tocar otras', () => {
    const u1 = withUpdatedGoal(baseUser, goalPeso);
    const u2 = withUpdatedGoal(u1, { ...goalPeso, target: 70 });
    expect(getGoalForMetric(u2, 'peso')?.target).toBe(70);
  });

  it('borra una métrica conservando el resto', () => {
    const goalCintura: BodyGoal = { metric: 'cintura', target: 78, createdAt: '2026-04-01T00:00:00Z' };
    let u = withUpdatedGoal(baseUser, goalPeso);
    u = withUpdatedGoal(u, goalCintura);
    u = withoutGoal(u, 'peso');
    expect(getGoalForMetric(u, 'peso')).toBeUndefined();
    expect(getGoalForMetric(u, 'cintura')).toEqual(goalCintura);
  });
});

describe('calculateGoalProgress', () => {
  const now = new Date('2026-04-30T12:00:00Z');

  it('objetivo de bajada: 50% si voy por la mitad', () => {
    // start 80, target 75, current 77.5 → 50%
    const p = calculateGoalProgress(goalPeso, 77.5, [], now);
    expect(p.percent).toBe(50);
    expect(p.direction).toBe('down');
    expect(p.remaining).toBeCloseTo(2.5, 2);
    expect(p.isReached).toBe(false);
  });

  it('objetivo alcanzado', () => {
    const p = calculateGoalProgress(goalPeso, 75, [], now);
    expect(p.isReached).toBe(true);
    expect(p.percent).toBe(100);
  });

  it('objetivo superado (mejor que el target)', () => {
    const p = calculateGoalProgress(goalPeso, 73, [], now);
    expect(p.isReached).toBe(true);
    expect(p.percent).toBe(100);
    expect(p.remaining).toBe(-2);
  });

  it('aún no empezaste (current = start)', () => {
    const p = calculateGoalProgress(goalPeso, 80, [], now);
    expect(p.percent).toBe(0);
  });

  it('objetivo de subida (ganar masa)', () => {
    const goalSubida: BodyGoal = {
      metric: 'peso',
      target: 85,
      startValue: 80,
      createdAt: '2026-04-01T00:00:00Z',
    };
    const p = calculateGoalProgress(goalSubida, 82.5, [], now);
    expect(p.direction).toBe('up');
    expect(p.percent).toBe(50);
  });

  it('paceRequired calculado a partir del deadline', () => {
    // deadline = 30 jun 2026. now = 30 abr 2026. ~8.7 semanas. Faltan 75-77.5 = -2.5kg
    // pace = -2.5/8.7 ≈ -0.287/semana
    const p = calculateGoalProgress(goalPeso, 77.5, [], now);
    expect(p.paceRequired).not.toBeNull();
    expect(p.paceRequired!).toBeLessThan(0); // bajar peso → pace negativo
    expect(Math.abs(p.paceRequired!)).toBeGreaterThan(0.2);
    expect(Math.abs(p.paceRequired!)).toBeLessThan(0.4);
    expect(p.daysToDeadline).toBeGreaterThan(50);
    expect(p.daysToDeadline).toBeLessThan(70);
  });

  it('paceCurrent a partir del historial', () => {
    const day = 24 * 60 * 60 * 1000;
    const measurements: BodyMeasurement[] = [
      { id: 'm1', userId: 'u1', fecha: new Date(now.getTime()), peso: 77.5 } as BodyMeasurement,
      { id: 'm2', userId: 'u1', fecha: new Date(now.getTime() - 14 * day), peso: 79 } as BodyMeasurement,
    ];
    const p = calculateGoalProgress(goalPeso, 77.5, measurements, now);
    // 77.5 − 79 = −1.5 kg en 2 semanas = −0.75/semana
    expect(p.paceCurrent).toBeCloseTo(-0.75, 1);
  });

  it('sin deadline → paceRequired null', () => {
    const goalSinDeadline: BodyGoal = { ...goalPeso, deadline: undefined };
    const p = calculateGoalProgress(goalSinDeadline, 77.5, [], now);
    expect(p.paceRequired).toBeNull();
    expect(p.daysToDeadline).toBeNull();
  });

  it('deadline vencida → daysToDeadline negativo', () => {
    const past: BodyGoal = { ...goalPeso, deadline: '2026-04-01' };
    const p = calculateGoalProgress(past, 77.5, [], now);
    expect(p.daysToDeadline).toBeLessThan(0);
    expect(p.paceRequired).toBeNull();
  });
});
