import { db } from '../schema';
import type { GymRecord } from '@/types';

export const GymRepository = {
  async getAll(userId: string): Promise<GymRecord[]> {
    return db.gyms.where('userId').equals(userId).toArray();
  },

  async get(gymId: string): Promise<GymRecord | undefined> {
    return db.gyms.get(gymId);
  },

  async upsert(gym: GymRecord): Promise<void> {
    await db.gyms.put(gym);
  },

  async updateCoords(gymId: string, lat: number, lng: number): Promise<void> {
    await db.gyms.update(gymId, { lat, lng, syncStatus: 'pending_update', lastUpdated: Date.now() });
  },

  async delete(gymId: string): Promise<void> {
    await db.gyms.delete(gymId);
  },

  async getPendingSync(): Promise<GymRecord[]> {
    return db.gyms.filter(g => g.syncStatus !== 'synced' && g.syncStatus !== undefined).toArray();
  },
};
