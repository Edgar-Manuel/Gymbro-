import { dbHelpers } from '@/db';
import type { WorkoutLog, UserStatistics, Achievement } from '@/types';
import { ID } from 'appwrite';

interface AchievementDef {
  nombre: string;
  descripcion: string;
  icono: string;
  tipo: Achievement['tipo'];
  check: (stats: UserStatistics, workout: WorkoutLog) => boolean;
}

const CATALOG: AchievementDef[] = [
  {
    nombre: 'Primera Gota de Sudor',
    descripcion: 'Completaste tu primer entrenamiento. ¡El viaje comienza!',
    icono: '💧',
    tipo: 'consistency',
    check: (s) => (s.totalEntrenamientos ?? s.totalWorkouts ?? 0) === 1,
  },
  {
    nombre: 'Calentando Motores',
    descripcion: '3 días seguidos entrenando sin rendirte.',
    icono: '🔥',
    tipo: 'streak',
    check: (s) => (s.rachaActual ?? s.currentStreak ?? 0) >= 3,
  },
  {
    nombre: 'Semana Perfecta',
    descripcion: '7 días consecutivos de entrenamiento.',
    icono: '⚡',
    tipo: 'streak',
    check: (s) => (s.rachaActual ?? s.currentStreak ?? 0) >= 7,
  },
  {
    nombre: 'Mes Imparable',
    descripcion: '30 días seguidos. Eres una máquina.',
    icono: '🏆',
    tipo: 'streak',
    check: (s) => (s.rachaActual ?? s.currentStreak ?? 0) >= 30,
  },
  {
    nombre: 'Décima Sesión',
    descripcion: '10 entrenamientos completados. Ya es un hábito.',
    icono: '🎯',
    tipo: 'consistency',
    check: (s) => (s.totalEntrenamientos ?? s.totalWorkouts ?? 0) === 10,
  },
  {
    nombre: 'Cincuenta Rounds',
    descripcion: '50 entrenamientos. La constancia es tu superpoder.',
    icono: '💪',
    tipo: 'consistency',
    check: (s) => (s.totalEntrenamientos ?? s.totalWorkouts ?? 0) === 50,
  },
  {
    nombre: 'Centurión',
    descripcion: '100 entrenamientos completados. Leyenda.',
    icono: '👑',
    tipo: 'consistency',
    check: (s) => (s.totalEntrenamientos ?? s.totalWorkouts ?? 0) === 100,
  },
  {
    nombre: 'Tonelada en un Día',
    descripcion: 'Moviste más de 1.000 kg en una sola sesión.',
    icono: '🦍',
    tipo: 'volume',
    check: (_s, w) => {
      const vol = w.ejercicios.reduce((t, e) =>
        t + e.series.reduce((s, r) => s + r.peso * r.repeticiones, 0), 0);
      return vol >= 1000;
    },
  },
  {
    nombre: '5 Toneladas en un Día',
    descripcion: '5.000 kg en una sesión. Fuerza descomunal.',
    icono: '🚛',
    tipo: 'volume',
    check: (_s, w) => {
      const vol = w.ejercicios.reduce((t, e) =>
        t + e.series.reduce((s, r) => s + r.peso * r.repeticiones, 0), 0);
      return vol >= 5000;
    },
  },
];

export interface EarnedAchievement extends AchievementDef {
  id: string;
}

export async function checkAndAwardAchievements(
  userId: string,
  workout: WorkoutLog,
  stats: UserStatistics,
): Promise<EarnedAchievement[]> {
  const earned: EarnedAchievement[] = [];

  for (const def of CATALOG) {
    if (!def.check(stats, workout)) continue;

    const already = await dbHelpers.hasAchievement(userId, def.nombre);
    if (already) continue;

    const achievement: Achievement = {
      id: ID.unique(),
      userId,
      tipo: def.tipo,
      nombre: def.nombre,
      descripcion: def.descripcion,
      icono: def.icono,
      fecha: new Date(),
    };

    await dbHelpers.awardAchievement(achievement);
    earned.push({ ...def, id: achievement.id });
  }

  return earned;
}
