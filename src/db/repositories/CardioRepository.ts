import { db } from '../schema';
import type { CardioSession } from '@/types';
import type { WithSync } from '../types';

export const CardioRepository = {
  async getByUser(userId: string): Promise<WithSync<CardioSession>[]> {
    const all = await db.cardioSessions.where('userId').equals(userId).toArray();
    return all.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  async getByWorkout(workoutId: string): Promise<WithSync<CardioSession>[]> {
    return db.cardioSessions.where('workoutId').equals(workoutId).toArray();
  },

  async getRecent(userId: string, limit = 10): Promise<WithSync<CardioSession>[]> {
    const all = await db.cardioSessions
      .where('userId').equals(userId)
      .toArray();
    return all
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, limit);
  },

  async addCardioSession(session: CardioSession): Promise<string> {
    await db.cardioSessions.add({ ...session, syncStatus: 'pending_create' });
    return session.id;
  },

  async completeCardioSession(id: string, duracionReal: number): Promise<void> {
    await db.cardioSessions.update(id, {
      completado: true,
      duracionReal,
      syncStatus: 'pending_update',
    });
  },

  async deleteCardioSession(id: string): Promise<void> {
    await db.cardioSessions.delete(id);
  },

  async getPendingSync(): Promise<WithSync<CardioSession>[]> {
    return db.cardioSessions
      .filter(s => s.syncStatus === 'pending_create' || s.syncStatus === 'pending_update')
      .toArray();
  },
};
