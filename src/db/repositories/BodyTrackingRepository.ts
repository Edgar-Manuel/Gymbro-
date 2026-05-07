import { db } from '../schema';
import { appwriteDbHelpers } from '../appwriteDb';
import type { BodyMeasurement, ProgressPhoto } from '@/types';

export const BodyTrackingRepository = {
    // Body Measurements
    async getBodyMeasurements(userId: string, limit?: number): Promise<BodyMeasurement[]> {
        const measurements = await db.bodyMeasurements
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('fecha');

        return limit ? measurements.slice(0, limit) : measurements;
    },

    async getLatestBodyMeasurement(userId: string): Promise<BodyMeasurement | undefined> {
        const measurements = await db.bodyMeasurements
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('fecha');

        return measurements[0];
    },

    async addBodyMeasurement(measurement: BodyMeasurement): Promise<string> {
        await db.bodyMeasurements.put({
            ...measurement,
            syncStatus: 'pending_create',
            lastUpdated: Date.now()
        });
        return measurement.id;
    },

    async updateBodyMeasurement(measurement: BodyMeasurement): Promise<void> {
        await db.bodyMeasurements.put({
            ...measurement,
            syncStatus: 'pending_update',
            lastUpdated: Date.now()
        });
    },

    async deleteBodyMeasurement(id: string): Promise<void> {
        if (navigator.onLine) {
            try {
                await appwriteDbHelpers.deleteBodyMeasurement(id);
                await db.bodyMeasurements.delete(id);
                return;
            } catch (err) {
                if ((err as { code?: number }).code === 404) {
                    await db.bodyMeasurements.delete(id);
                    return;
                }
                await db.bodyMeasurements.update(id, { syncStatus: 'pending_delete' });
                return;
            }
        }
        await db.bodyMeasurements.update(id, { syncStatus: 'pending_delete' });
    },

    /**
     * Descarga las mediciones del usuario desde Appwrite y las upserta
     * en Dexie. Respeta registros locales con cambios sin sincronizar.
     */
    async pullBodyMeasurements(userId: string): Promise<number> {
        if (!navigator.onLine) return 0;
        try {
            const remote = await appwriteDbHelpers.getBodyMeasurements(userId);
            let upserted = 0;
            for (const m of remote) {
                const local = await db.bodyMeasurements.get(m.id);
                // No pisar registros con cambios pendientes locales
                if (local && local.syncStatus && local.syncStatus !== 'synced') continue;
                await db.bodyMeasurements.put({
                    ...m,
                    syncStatus: 'synced',
                    lastUpdated: Date.now(),
                });
                upserted++;
            }
            return upserted;
        } catch (err) {
            console.warn('[Repo] pullBodyMeasurements failed:', err);
            return 0;
        }
    },

    // Progress Photos
    async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
        return await db.progressPhotos
            .where('userId')
            .equals(userId)
            .toArray();
    },

    async addProgressPhoto(photo: ProgressPhoto): Promise<string> {
        await db.progressPhotos.put({
            ...photo,
            syncStatus: 'pending_create',
            lastUpdated: Date.now()
        });
        return photo.id;
    },

    async deleteProgressPhoto(id: string): Promise<void> {
        if (navigator.onLine) {
            try {
                await appwriteDbHelpers.deleteProgressPhoto(id);
            } catch (err) {
                if ((err as { code?: number }).code !== 404) {
                    await db.progressPhotos.update(id, { syncStatus: 'pending_delete' });
                    return;
                }
            }
            await db.progressPhotos.delete(id);
        } else {
            await db.progressPhotos.update(id, { syncStatus: 'pending_delete' });
        }
    },

    async getPendingSync() {
        const measurements = await db.bodyMeasurements
            .filter(m => m.syncStatus !== 'synced' && m.syncStatus !== undefined)
            .toArray();

        const photos = await db.progressPhotos
            .filter(p => p.syncStatus !== 'synced' && p.syncStatus !== undefined)
            .toArray();

        return { measurements, photos };
    }
};
