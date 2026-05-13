import type { WorkoutLog, ExerciseKnowledge, GrupoMuscular } from '@/types';
import { exerciseVideos, type ExerciseVideo } from '@/data/exerciseVideos';

// ─── 1RM (Epley + Brzycki) ──────────────────────────────────────────────────

/**
 * Estima la 1RM (una repetición máxima) a partir de un peso y reps realizadas.
 *
 * - Epley:   1RM = peso × (1 + reps / 30)            — más popular y suave
 * - Brzycki: 1RM = peso × (36 / (37 - reps))         — más conservadora >12 reps
 *
 * Para reps = 1, ambas devuelven el peso. Para reps inválidos (0 o ≥37 en
 * Brzycki) devuelve 0.
 */
export function calcular1RM(
  peso: number,
  reps: number,
  formula: 'epley' | 'brzycki' = 'epley',
): number {
  if (peso <= 0 || reps <= 0) return 0;
  if (reps === 1) return peso;
  if (formula === 'brzycki') {
    if (reps >= 37) return 0;
    return peso * (36 / (37 - reps));
  }
  // Epley por defecto
  return peso * (1 + reps / 30);
}

// ─── Videos ─────────────────────────────────────────────────────────────────

/**
 * Devuelve el primer video del catálogo cuyo `relatedExercises` incluye el
 * ejercicio dado, o que coincide con `videoId` directo en el knowledge.
 */
export function getVideoForExercise(
  ejercicioId: string,
  ejercicio?: ExerciseKnowledge,
): ExerciseVideo | undefined {
  if (ejercicio?.videoId) {
    const direct = exerciseVideos.find(v => v.id === ejercicio.videoId);
    if (direct) return direct;
  }
  const byId = exerciseVideos.find(v => v.relatedExercises.includes(ejercicioId));
  if (byId) return byId;
  // Fallback: rutinas externas (CBum, FullW) generan slugs únicos por nombre
  // pero conservan `baseExerciseId` para encontrar videos de la variante canónica.
  if (ejercicio?.baseExerciseId) {
    return exerciseVideos.find(v => v.relatedExercises.includes(ejercicio.baseExerciseId!));
  }
  return undefined;
}

// ─── Volumen y grupos musculares de una sesión ──────────────────────────────

/**
 * Suma peso × repeticiones de todas las series de todos los ejercicios de
 * un workout. Series con peso 0 (bodyweight, etc.) no aportan volumen.
 */
export function getVolumenSesion(workout: WorkoutLog): number {
  return (workout.ejercicios ?? []).reduce((total, ej) => {
    return total + (ej.series ?? []).reduce(
      (sum, s) => sum + (s.peso ?? 0) * (s.repeticiones ?? 0),
      0,
    );
  }, 0);
}

/**
 * Devuelve la lista deduplicada de grupos musculares trabajados en un workout.
 * Usa el `grupoMuscular` del knowledge cuando está populado en `ej.ejercicio`,
 * o lo busca en `exercises` por `ejercicioId`.
 */
export function getGruposMuscularesEntrenados(
  workout: WorkoutLog,
  exercises?: ExerciseKnowledge[],
): GrupoMuscular[] {
  const exerciseMap = exercises
    ? new Map(exercises.map(e => [e.id, e]))
    : null;

  const grupos = new Set<GrupoMuscular>();
  for (const ej of workout.ejercicios ?? []) {
    const grupo =
      ej.ejercicio?.grupoMuscular ??
      exerciseMap?.get(ej.ejercicioId)?.grupoMuscular;
    if (grupo) grupos.add(grupo);
  }
  return [...grupos];
}
