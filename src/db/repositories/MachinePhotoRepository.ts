import { db } from '../schema';
import type { MachinePhoto } from '@/types';

export const MachinePhotoRepository = {
  async getMachinePhotos(userId: string, ejercicioId?: string, gymId?: string): Promise<MachinePhoto[]> {
    let collection = db.machinePhotos.where('userId').equals(userId);
    let results = await collection.toArray();
    if (ejercicioId) results = results.filter(p => p.ejercicioId === ejercicioId);
    if (gymId) results = results.filter(p => p.gymId === gymId);
    return results
      .filter(p => p.syncStatus !== 'pending_delete')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  async getMachinePhotosByGym(userId: string, gymId: string): Promise<MachinePhoto[]> {
    const results = await db.machinePhotos
      .where('userId').equals(userId)
      .toArray();
    return results
      .filter(p => p.gymId === gymId && p.syncStatus !== 'pending_delete')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  async getActiveMachinePhoto(userId: string, ejercicioId: string, gymId: string): Promise<MachinePhoto | undefined> {
    const all = await db.machinePhotos
      .where('userId').equals(userId)
      .toArray();
    const filtered = all
      .filter(p => p.ejercicioId === ejercicioId && p.gymId === gymId && p.syncStatus !== 'pending_delete')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return filtered.find(p => p.esActiva) ?? filtered[0];
  },

  async getAllGyms(userId: string): Promise<{ gymId: string; gymNombre: string; lat?: number; lng?: number; count: number }[]> {
    const all = await db.machinePhotos
      .where('userId').equals(userId)
      .toArray();
    const gymMap = new Map<string, { gymId: string; gymNombre: string; lat?: number; lng?: number; count: number }>();
    for (const p of all.filter(p => p.syncStatus !== 'pending_delete')) {
      if (!gymMap.has(p.gymId)) {
        gymMap.set(p.gymId, { gymId: p.gymId, gymNombre: p.gymNombre, lat: p.gymLat, lng: p.gymLng, count: 0 });
      }
      gymMap.get(p.gymId)!.count++;
    }
    return Array.from(gymMap.values()).sort((a, b) => b.count - a.count);
  },

  async addMachinePhoto(photo: MachinePhoto): Promise<string> {
    // Deactivate other active photos for same ejercicio+gym
    const existing = await db.machinePhotos
      .where('userId').equals(photo.userId)
      .toArray();
    for (const p of existing.filter(p => p.ejercicioId === photo.ejercicioId && p.gymId === photo.gymId && p.esActiva)) {
      await db.machinePhotos.update(p.id, { esActiva: false });
    }
    await db.machinePhotos.put({
      ...photo,
      esActiva: true,
      syncStatus: 'pending_create',
      lastUpdated: Date.now(),
    });
    return photo.id;
  },

  async updateMachinePhoto(id: string, changes: Partial<MachinePhoto>): Promise<void> {
    await db.machinePhotos.update(id, { ...changes, syncStatus: 'pending_update', lastUpdated: Date.now() });
  },

  async deleteMachinePhoto(id: string): Promise<void> {
    await db.machinePhotos.update(id, { syncStatus: 'pending_delete', lastUpdated: Date.now() });
  },

  async setPhotoActiva(id: string, ejercicioId: string, gymId: string, userId: string): Promise<void> {
    const all = await db.machinePhotos.where('userId').equals(userId).toArray();
    for (const p of all.filter(p => p.ejercicioId === ejercicioId && p.gymId === gymId && p.esActiva && p.id !== id)) {
      await db.machinePhotos.update(p.id, { esActiva: false, syncStatus: 'pending_update' });
    }
    await db.machinePhotos.update(id, { esActiva: true, syncStatus: 'pending_update' });
  },

  async getPendingSync(): Promise<MachinePhoto[]> {
    return db.machinePhotos
      .filter(p => p.syncStatus !== undefined && p.syncStatus !== 'synced')
      .toArray();
  },
};
