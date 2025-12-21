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

    async getPendingSync() {
        return await db.statistics
            .filter(s => s.syncStatus !== 'synced' && s.syncStatus !== undefined)
            .toArray();
    }
};
