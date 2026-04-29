import type { DiaRutina, WorkoutLog } from '@/types';

function getMusculosDia(dia: DiaRutina): string[] {
  if (dia.grupos?.length > 0) return dia.grupos as string[];
  return [...new Set(
    (dia.ejercicios ?? []).map(e => e.ejercicio?.grupoMuscular).filter(Boolean) as string[]
  )];
}

function getMusculosWorkout(w: WorkoutLog): string[] {
  return [...new Set(
    (w.ejercicios ?? []).map(e => e.ejercicio?.grupoMuscular).filter(Boolean) as string[]
  )];
}

/**
 * Infers the next workout day using best-overlap muscle matching.
 * Works across routine changes — never relies on day IDs or names.
 *
 * Strategy:
 *  1. For each recent workout (last 14 days), find the routine day with the
 *     highest muscle overlap score (not just first hit ≥ threshold).
 *  2. Track the most recently trained index.
 *  3. Return the next index in sequence.
 */
export function inferirSiguienteDia(
  activeDias: DiaRutina[],
  completados: WorkoutLog[]
): DiaRutina {
  if (activeDias.length === 1) return activeDias[0];

  const hace14d = Date.now() - 14 * 24 * 3600 * 1000;
  const recientes = completados.filter(w => new Date(w.fecha).getTime() > hace14d);

  if (!recientes.length) return activeDias[0];

  // Build a map: dayIndex → timestamp of the most-recent workout matched to that day
  const diasTrainados = new Map<number, number>();

  for (const w of recientes) {
    const wm = getMusculosWorkout(w);
    if (!wm.length) continue;

    // Pick the day with the HIGHEST overlap score (best-match, not first-hit)
    let bestIdx = -1;
    let bestScore = 0;

    activeDias.forEach((dia, idx) => {
      const dm = getMusculosDia(dia);
      if (!dm.length) return;
      // Score = fraction of the day's muscles that appear in the workout
      const score = dm.filter(m => wm.includes(m)).length / dm.length;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    // Require at least 25% overlap to count as a match
    if (bestIdx >= 0 && bestScore >= 0.25) {
      const wTime = new Date(w.fecha).getTime();
      const prev = diasTrainados.get(bestIdx);
      if (!prev || wTime > prev) diasTrainados.set(bestIdx, wTime);
    }
  }

  if (diasTrainados.size === 0) return activeDias[0];

  // Find the most-recently trained day
  let mostRecentIdx = 0;
  let mostRecentTime = 0;
  diasTrainados.forEach((time, idx) => {
    if (time > mostRecentTime) {
      mostRecentTime = time;
      mostRecentIdx = idx;
    }
  });

  return activeDias[(mostRecentIdx + 1) % activeDias.length];
}
