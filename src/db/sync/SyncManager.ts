import { UserRepository } from '../repositories/UserRepository';
import { RoutineRepository } from '../repositories/RoutineRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { StatisticsRepository } from '../repositories/StatisticsRepository';
import { BodyTrackingRepository } from '../repositories/BodyTrackingRepository';
import { AchievementRepository } from '../repositories/AchievementRepository';
import { appwriteDbHelpers } from '../appwriteDb';
import { db } from '../schema';

export const SyncManager = {
    async syncAll() {
        if (!navigator.onLine) return;

        console.log('[Sync] Starting background sync...');

        // ── Users ─────────────────────────────────────────────────────────────
        const pendingUsers = await UserRepository.getPendingSync();
        for (const user of pendingUsers) {
            try {
                await appwriteDbHelpers.createOrUpdateUser(user);
                await db.users.update(user.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] user error', e); }
        }

        // ── Routines ──────────────────────────────────────────────────────────
        const pendingRoutines = await RoutineRepository.getPendingSync();
        for (const routine of pendingRoutines) {
            try {
                if (routine.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.createRoutine(routine);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                } else if (routine.syncStatus === 'pending_update') {
                    await appwriteDbHelpers.updateRoutine(routine);
                }
                await db.rutinas.update(routine.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] routine error', e); }
        }

        // ── Workouts ──────────────────────────────────────────────────────────
        const pendingWorkouts = await WorkoutRepository.getPendingSync();
        for (const workout of pendingWorkouts) {
            try {
                if (workout.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.logWorkout(workout);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                } else if (workout.syncStatus === 'pending_update') {
                    await appwriteDbHelpers.updateWorkout(workout.id, workout);
                }
                await db.workouts.update(workout.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] workout error', e); }
        }

        // ── Statistics ────────────────────────────────────────────────────────
        const pendingStats = await StatisticsRepository.getPendingSync();
        for (const stat of pendingStats) {
            try {
                await appwriteDbHelpers.updateStatistics(stat);
                await db.statistics.update(stat.userId, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] stats error', e); }
        }

        // ── Body Measurements ─────────────────────────────────────────────────
        const { measurements: pendingMeasurements } = await BodyTrackingRepository.getPendingSync();
        for (const m of pendingMeasurements) {
            try {
                if (m.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.addBodyMeasurement(m);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                }
                await db.bodyMeasurements.update(m.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] measurement error', e); }
        }

        // ── Progress Photos ───────────────────────────────────────────────────
        const { photos: pendingPhotos } = await BodyTrackingRepository.getPendingSync();
        for (const photo of pendingPhotos) {
            try {
                if (photo.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.addProgressPhoto(photo);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                }
                await db.progressPhotos.update(photo.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] photo error', e); }
        }

        // ── Achievements ──────────────────────────────────────────────────────
        const pendingAchievements = await db.achievements
            .filter(a => a.syncStatus !== 'synced' && a.syncStatus !== undefined)
            .toArray();
        for (const ach of pendingAchievements) {
            try {
                try {
                    await appwriteDbHelpers.addAchievement(ach);
                } catch (err) {
                    if ((err as { code?: number }).code !== 409) throw err;
                }
                await db.achievements.update(ach.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] achievement error', e); }
        }

        console.log('[Sync] Complete');
    },

    getPendingCount: async () => {
        const u = await db.users.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const r = await db.rutinas.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const w = await db.workouts.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const s = await db.statistics.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const m = await db.bodyMeasurements.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const p = await db.progressPhotos.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const a = await db.achievements.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        return u + r + w + s + m + p + a;
    }
};
