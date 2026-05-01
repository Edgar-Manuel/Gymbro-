import type { BodyGoal, UserProfile, BodyMeasurement } from '@/types';
import { readField } from './bodyCalculations';

// ─── Lectura/escritura en UserProfile.preferencias ──────────────────────────
export function getBodyGoals(user: UserProfile): Record<string, BodyGoal> {
  const raw = user.preferencias?.bodyGoals;
  if (!raw || typeof raw !== 'object') return {};
  return raw as Record<string, BodyGoal>;
}

export function getGoalForMetric(user: UserProfile, metric: string): BodyGoal | undefined {
  return getBodyGoals(user)[metric];
}

export function withUpdatedGoal(user: UserProfile, goal: BodyGoal): UserProfile {
  const existing = getBodyGoals(user);
  return {
    ...user,
    preferencias: {
      ...(user.preferencias ?? {}),
      bodyGoals: { ...existing, [goal.metric]: goal },
    },
  };
}

export function withoutGoal(user: UserProfile, metric: string): UserProfile {
  const existing = { ...getBodyGoals(user) };
  delete existing[metric];
  return {
    ...user,
    preferencias: {
      ...(user.preferencias ?? {}),
      bodyGoals: existing,
    },
  };
}

// ─── Cálculo de progreso ─────────────────────────────────────────────────────
export interface GoalProgress {
  /** % completo (0-100, clamped). Tras alcanzar = 100 aunque sigas pasando */
  percent: number;
  /** current − target (con signo: positivo si todavía estás por encima del target) */
  remaining: number;
  /** Días hasta la deadline (null si no tiene). Negativo si ya venció */
  daysToDeadline: number | null;
  /** Cambio por semana necesario para llegar al target en deadline (con signo) */
  paceRequired: number | null;
  /** Cambio por semana medido en las últimas 2 semanas (con signo) */
  paceCurrent: number | null;
  /** ¿Alcanzaste el objetivo (current cruzó el target en la dirección esperada)? */
  isReached: boolean;
  /** Dirección esperada del progreso */
  direction: 'down' | 'up' | 'flat';
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function calculateGoalProgress(
  goal: BodyGoal,
  current: number,
  measurements: BodyMeasurement[] = [],
  now: Date = new Date()
): GoalProgress {
  const start = goal.startValue ?? current;
  const direction: GoalProgress['direction'] =
    Math.abs(start - goal.target) < 0.01 ? 'flat' : start > goal.target ? 'down' : 'up';

  const totalRange = Math.abs(start - goal.target);
  const traversed = direction === 'down'
    ? Math.max(0, start - current)
    : Math.max(0, current - start);
  const percent = totalRange === 0
    ? 100
    : Math.min(100, Math.max(0, (traversed / totalRange) * 100));

  const remaining = current - goal.target;
  const isReached = direction === 'down'
    ? current <= goal.target
    : direction === 'up'
      ? current >= goal.target
      : Math.abs(remaining) < 0.01;

  let daysToDeadline: number | null = null;
  let paceRequired: number | null = null;
  if (goal.deadline) {
    const deadlineMs = new Date(goal.deadline + 'T23:59:59').getTime();
    daysToDeadline = Math.floor((deadlineMs - now.getTime()) / (24 * 60 * 60 * 1000));
    if (daysToDeadline > 0 && !isReached) {
      // Ritmo necesario por semana: lo que falta dividido por las semanas restantes
      const weeksRemaining = (deadlineMs - now.getTime()) / MS_PER_WEEK;
      paceRequired = (goal.target - current) / weeksRemaining;
    }
  }

  // Ritmo actual: tomar la primera medición de hace ≥14 días (o la más antigua disponible)
  // y comparar con la última.
  let paceCurrent: number | null = null;
  if (measurements.length >= 2) {
    const latest = measurements[0];
    const cutoff = now.getTime() - 14 * 24 * 60 * 60 * 1000;
    let baseline: BodyMeasurement | undefined;
    for (const m of measurements) {
      if (new Date(m.fecha).getTime() >= cutoff) baseline = m;
      else break;
    }
    if (!baseline || baseline.id === latest.id) {
      // No hay 2 mediciones en 14 días; usa la más antigua
      baseline = measurements[measurements.length - 1];
    }
    const currVal = readField(latest, goal.metric as any);
    const baseVal = readField(baseline, goal.metric as any);
    if (currVal != null && baseVal != null && baseline.id !== latest.id) {
      const weeks = (new Date(latest.fecha).getTime() - new Date(baseline.fecha).getTime()) / MS_PER_WEEK;
      if (weeks > 0) paceCurrent = (currVal - baseVal) / weeks;
    }
  }

  return {
    percent,
    remaining,
    daysToDeadline,
    paceRequired,
    paceCurrent,
    isReached,
    direction,
  };
}
