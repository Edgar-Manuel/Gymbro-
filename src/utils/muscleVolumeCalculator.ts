import { dbHelpers } from '@/db';

export type MuscleSetMap = Partial<Record<string, number>>;

export async function getWeeklySetsByMuscle(userId: string): Promise<MuscleSetMap> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const workouts = await dbHelpers.getWorkoutsByUser(userId, 30);

  const sets: MuscleSetMap = {};

  for (const workout of workouts) {
    if (new Date(workout.fecha) < sevenDaysAgo) continue;
    for (const exLog of workout.ejercicios) {
      const grupo = exLog.ejercicio?.grupoMuscular;
      if (!grupo) continue;
      sets[grupo] = (sets[grupo] ?? 0) + exLog.series.length;
    }
  }

  return sets;
}

export function setsToColor(sets: number): string {
  if (sets === 0) return '#94a3b8';   // gris — sin entrenar
  if (sets <= 3)  return '#60a5fa';   // azul — bajo volumen
  if (sets <= 7)  return '#34d399';   // verde — moderado
  if (sets <= 12) return '#fbbf24';   // amarillo — buen volumen
  return '#f87171';                    // rojo — alto volumen / fatiga
}

export function setsToLabel(sets: number): string {
  if (sets === 0) return 'Sin entrenar';
  if (sets <= 3)  return 'Bajo volumen';
  if (sets <= 7)  return 'Moderado';
  if (sets <= 12) return 'Buen volumen';
  return 'Alto volumen';
}
