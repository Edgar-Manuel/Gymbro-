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

    // Recalcula estadísticas directamente desde los workouts locales.
    // Se usa cuando stats === undefined o totalEntrenamientos === 0 pero hay workouts.
    async recalcularEstadisticas(userId: string): Promise<UserStatistics> {
        const todos = await db.workouts.where('userId').equals(userId).toArray();
        const completados = todos.filter(w => w.completado !== false);

        const totalEntrenamientos = completados.length;

        // Volumen total y volumen este mes
        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        let volumenTotal = 0;
        let volumenEsteMes = 0;
        for (const w of completados) {
            const vol = w.ejercicios.reduce((t, e) =>
                t + e.series.reduce((s, serie) => s + (serie.peso * serie.repeticiones), 0), 0);
            volumenTotal += vol;
            if (new Date(w.fecha) >= primerDiaMes) volumenEsteMes += vol;
        }

        // Racha actual: días consecutivos hacia atrás desde hoy
        const diasConEntreno = new Set(completados.map(w => {
            const d = new Date(w.fecha);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        }));
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        let rachaActual = 0;
        for (let i = 0; i < 365; i++) {
            const dia = new Date(hoy); dia.setDate(hoy.getDate() - i);
            if (diasConEntreno.has(dia.getTime())) {
                rachaActual++;
            } else if (i > 0) {
                break; // brecha: fin de racha
            }
            // i===0 y no entrenó hoy: sigue buscando ayer
        }

        const stats: UserStatistics = {
            userId,
            totalEntrenamientos,
            rachaActual,
            rachaMasLarga: rachaActual,
            volumenTotalMovido: volumenTotal,
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

