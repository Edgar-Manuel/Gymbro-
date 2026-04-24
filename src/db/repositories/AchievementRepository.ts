import { db } from '../schema';
import type { Achievement } from '@/types';

export const AchievementRepository = {
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return db.achievements.where('userId').equals(userId).reverse().sortBy('fecha');
  },

  async hasAchievement(userId: string, nombre: string): Promise<boolean> {
    const count = await db.achievements
      .where('userId').equals(userId)
      .filter(a => (a.nombre ?? a.titulo) === nombre)
      .count();
    return count > 0;
  },

  async awardAchievement(achievement: Achievement): Promise<string> {
    await db.achievements.add({ ...achievement, syncStatus: 'pending' } as any);
    return achievement.id;
  },
};
