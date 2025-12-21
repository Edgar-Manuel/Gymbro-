import { UserRepository } from '../repositories/UserRepository';
import { RoutineRepository } from '../repositories/RoutineRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { StatisticsRepository } from '../repositories/StatisticsRepository';
import { appwriteDbHelpers } from '../appwriteDb';
import { db } from '../schema';

export const SyncManager = {
    async syncAll() {
        if (!navigator.onLine) return;

        console.log('Starting background sync...');

        // Users
        const pendingUsers = await UserRepository.getPendingSync();
        for (const user of pendingUsers) {
            try {
                await appwriteDbHelpers.createOrUpdateUser(user);
                await db.users.update(user.id, { syncStatus: 'synced' });
            } catch (e) { console.error('Sync error user', e); }
        }

        // Routines
        const pendingRoutines = await RoutineRepository.getPendingSync();
        for (const routine of pendingRoutines) {
            try {
                // If it's a create
                if (routine.syncStatus === 'pending_create') {
                    // Check if it exists first? appwriteDbHelpers.createRoutine uses createDocument
                    // If ID exists, it throws. If so, we might want to update?
                    // For now, try create.
                    try {
                        await appwriteDbHelpers.createRoutine(routine);
                    } catch (err: any) {
                        // If error is "Document already exists", maybe we should ignore or update?
                        if (err.code === 409) {
                            // Already exists, mark as synced
                        } else {
                            throw err;
                        }
                    }
                }
                // Note: Routine update is not fully implemented in appwriteDbHelpers yet (only create), 
                // but we can add it later.

                await db.rutinas.update(routine.id, { syncStatus: 'synced' });
            } catch (e) { console.error('Sync error routine', e); }
        }

        // Workouts
        const pendingWorkouts = await WorkoutRepository.getPendingSync();
        for (const workout of pendingWorkouts) {
            try {
                if (workout.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.logWorkout(workout);
                    } catch (err: any) {
                        if (err.code === 409) {
                            // Exists
                        } else {
                            throw err;
                        }
                    }
                } else if (workout.syncStatus === 'pending_update') {
                    await appwriteDbHelpers.updateWorkout(workout.id, workout);
                }
                await db.workouts.update(workout.id, { syncStatus: 'synced' });
            } catch (e) { console.error('Sync error workout', e); }
        }

        // Stats
        const pendingStats = await StatisticsRepository.getPendingSync();
        for (const stat of pendingStats) {
            try {
                await appwriteDbHelpers.updateStatistics(stat);
                await db.statistics.update(stat.userId, { syncStatus: 'synced' });
            } catch (e) { console.error('Sync error stats', e); }
        }

        console.log('Sync complete');
    },

    getPendingCount: async () => {
        const u = await db.users.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const r = await db.rutinas.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const w = await db.workouts.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const s = await db.statistics.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        return u + r + w + s;
    }
};
