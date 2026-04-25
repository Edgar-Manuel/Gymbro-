import { db } from '../schema';
import type { Lesion } from '@/types';
import type { WithSync } from '../types';

export const InjuryRepository = {
  async getActiveInjuries(userId: string): Promise<WithSync<Lesion>[]> {
    return db.lesiones
      .where('userId').equals(userId)
      .filter(l => l.activa === true)
      .toArray();
  },

  async getAllInjuries(userId: string): Promise<WithSync<Lesion>[]> {
    const all = await db.lesiones.where('userId').equals(userId).toArray();
    return all.sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
  },

  async addInjury(lesion: Lesion): Promise<string> {
    await db.lesiones.add({
      ...lesion,
      syncStatus: 'pending_create',
      lastUpdated: Date.now(),
    } as WithSync<Lesion>);
    return lesion.id;
  },

  async updateInjuryPain(id: string, dolorActual: number): Promise<void> {
    await db.lesiones.update(id, {
      dolorActual,
      syncStatus: 'pending_update' as const,
      lastUpdated: Date.now(),
    });
  },

  async markInjuryRecovered(id: string): Promise<void> {
    await db.lesiones.update(id, {
      activa: false,
      fechaFin: new Date(),
      syncStatus: 'pending_update' as const,
      lastUpdated: Date.now(),
    });
  },

  async deleteInjury(id: string): Promise<void> {
    await db.lesiones.delete(id);
  },

  async getPendingSync(): Promise<WithSync<Lesion>[]> {
    return db.lesiones
      .filter(l => l.syncStatus !== 'synced' && l.syncStatus !== undefined)
      .toArray();
  },
};
