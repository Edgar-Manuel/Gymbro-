import type { DiaRutina, WorkoutLog } from '@/types';

function getMusculos(dia: DiaRutina): string[] {
  if (dia.grupos?.length > 0) return dia.grupos as string[];
  return [...new Set(
    (dia.ejercicios ?? []).map(e => e.ejercicio?.grupoMuscular).filter(Boolean) as string[]
  )];
}

function getWorkoutMusculos(w: WorkoutLog): string[] {
  return [...new Set(
    (w.ejercicios ?? []).map(e => e.ejercicio?.grupoMuscular).filter(Boolean) as string[]
  )];
}

export function inferirSiguienteDia(
  activeDias: DiaRutina[],
  completados: WorkoutLog[]
): DiaRutina {
  const ultimo = completados[0];
  const lastMusculos = getWorkoutMusculos(ultimo);

  // Localizar el último workout en la rutina actual por solapamiento ≥40%
  const lastDayIdx = activeDias.findIndex(d => {
    const dm = getMusculos(d);
    if (!dm.length) return false;
    const overlap = dm.filter(m => lastMusculos.includes(m)).length;
    return overlap / Math.max(dm.length, 1) >= 0.4;
  });

  if (lastDayIdx >= 0) {
    return activeDias[(lastDayIdx + 1) % activeDias.length];
  }

  // Fallback: contar cuántos días únicos de la rutina ya se hicieron en los últimos 14 días
  const hace14d = Date.now() - 14 * 24 * 3600 * 1000;
  const recientes = completados.filter(w => new Date(w.fecha).getTime() > hace14d);

  const usados = new Set<number>();
  for (const w of recientes) {
    const wm = getWorkoutMusculos(w);
    const idx = activeDias.findIndex((d, i) => {
      if (usados.has(i)) return false;
      return getMusculos(d).some(m => wm.includes(m));
    });
    if (idx >= 0) usados.add(idx);
  }

  return activeDias[usados.size % activeDias.length];
}
