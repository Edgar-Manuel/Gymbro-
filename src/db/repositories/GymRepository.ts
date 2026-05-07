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
    // Gyms are local-only (no Appwrite collection) — always mark as synced
    await db.gyms.put({ ...gym, syncStatus: 'synced' });
  },

  async updateCoords(gymId: string, lat: number, lng: number): Promise<void> {
    await db.gyms.update(gymId, { lat, lng, syncStatus: 'synced', lastUpdated: Date.now() });
  },

  async delete(gymId: string): Promise<void> {
    await db.gyms.delete(gymId);
  },

  async getPendingSync(): Promise<GymRecord[]> {
    return db.gyms.filter(g => g.syncStatus !== 'synced' && g.syncStatus !== undefined).toArray();
  },

  async fixPendingGyms(): Promise<void> {
    // Repair any gyms stuck in pending_create/pending_update from before this fix
    const pending = await db.gyms.filter(g => g.syncStatus !== 'synced').toArray();
    await Promise.all(pending.map(g => db.gyms.update(g.id, { syncStatus: 'synced' })));
  },
};
