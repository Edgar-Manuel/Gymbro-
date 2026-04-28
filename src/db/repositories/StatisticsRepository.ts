import { db } from '../schema';
import { appwriteDbHelpers } from '../appwriteDb';
import type { UserStatistics } from '@/types';
import { getStorageMode } from '../config';

export const StatisticsRepository = {
    async getUserStatistics(userId: string) {
        if (navigator.onLine && getStorageMode() === 'cloud') {
            try {
                const stats = await appwriteDbHelpers.getUserStatistics(userId);
                if (stats) {
                    const cloudWorkouts = stats.totalWorkouts ?? stats.totalEntrenamientos ?? 0;
                    if (cloudWorkouts === 0) {
                        const localStats = await db.statistics.get(userId);
                        const localWorkouts = localStats?.totalEntrenamientos ?? localStats?.totalWorkouts ?? 0;
                        if (localWorkouts > 0) {
                            console.log('[Stats] Cloud has 0 workouts but local has', localWorkouts, '— using local data');
                            return localStats;
                        }
                    }
                    await db.statistics.put({ ...stats, syncStatus: 'synced', lastUpdated: Date.now() });
                    return stats;
                }
            } catch (error) {
                console.warn('Error fetching stats from cloud:', error);
            }
        }
        return await db.statistics.get(userId);
    },

    async updateStatistics(stats: UserStatistics) {
        const timestamp = Date.now();
        if (navigator.onLine) {
            try {
                await appwriteDbHelpers.updateStatistics(stats);
                await db.statistics.put({ ...stats, syncStatus: 'synced', lastUpdated: timestamp });
                return stats.userId;
            } catch (error) {
                console.error('Error updating stats in cloud:', error);
                await db.statistics.put({ ...stats, syncStatus: 'pending_update', lastUpdated: timestamp });
                return stats.userId;
            }
        } else {
            await db.statistics.put({ ...stats, syncStatus: 'pending_update', lastUpdated: timestamp });
            return stats.userId;
        }
    },

    async recalcularEstadisticas(userId: string) {
        const todos = await db.workouts.where('userId').equals(userId).toArray();
        const completados = todos.filter(w => w.completado !== false);
        const totalEntrenamientos = completados.length;

        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        let volumenTotal = 0;
        let volumenEsteMes = 0;
        for (const w of completados) {
            const vol = (w.ejercicios ?? []).reduce((t: number, e: any) =>
                t + (e.series ?? []).reduce((s: number, serie: any) =>
                    s + ((serie.peso ?? 0) * (serie.repeticiones ?? 0)), 0), 0);
            volumenTotal += vol;
            if (new Date(w.fecha) >= primerDiaMes) volumenEsteMes += vol;
        }

        const diasConEntreno = new Set(completados.map((w: any) => {
            const d = new Date(w.fecha); d.setHours(0, 0, 0, 0); return d.getTime();
        }));
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        let rachaActual = 0;
        for (let i = 0; i < 365; i++) {
            const dia = new Date(hoy); dia.setDate(hoy.getDate() - i);
            if (diasConEntreno.has(dia.getTime())) { rachaActual++; }
            else if (i > 0) break;
        }

        const stats = {
            userId,
            totalEntrenamientos,
            totalWorkouts: totalEntrenamientos,
            rachaActual,
            currentStreak: rachaActual,
            rachaMasLarga: rachaActual,
            longestStreak: rachaActual,
            volumenTotalMovido: volumenTotal,
            totalVolume: volumenTotal,
            volumenEsteMes,
        };

        await db.statistics.put({ ...stats, syncStatus: 'pending_update', lastUpdated: Date.now() });
        console.log('[Stats] Recalculadas desde workouts locales:', stats);
        return stats;
    },

    async getPendingSync() {
        return await db.statistics
            .filter(s => s.syncStatus !== 'synced' && s.syncStatus !== undefined)
            .toArray();
    }
};
