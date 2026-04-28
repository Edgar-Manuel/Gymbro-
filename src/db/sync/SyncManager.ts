import { UserRepository } from '../repositories/UserRepository';
import { RoutineRepository } from '../repositories/RoutineRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { StatisticsRepository } from '../repositories/StatisticsRepository';
import { BodyTrackingRepository } from '../repositories/BodyTrackingRepository';
import { InjuryRepository } from '../repositories/InjuryRepository';
import { CardioRepository } from '../repositories/CardioRepository';
import { appwriteDbHelpers } from '../appwriteDb';
import { db } from '../schema';

export const SyncManager = {
    async syncAll(): Promise<{ synced: number; failed: number; lastError?: string }> {
        if (!navigator.onLine) return { synced: 0, failed: 0 };

        console.log('[Sync] Starting background sync...');
        let synced = 0;
        let failed = 0;
        let lastError: string | undefined;

        // ── Users ─────────────────────────────────────────────────────────────
        const pendingUsers = await UserRepository.getPendingSync();
        for (const user of pendingUsers) {
            try {
                await appwriteDbHelpers.createOrUpdateUser(user);
                await db.users.update(user.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { console.error('[Sync] user error', e); failed++; }
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
                synced++;
            } catch (e) { console.error('[Sync] routine error', e); failed++; }
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
                synced++;
            } catch (e) {
                console.error('[Sync] workout error', e);
                const appErr = e as { code?: number; message?: string; type?: string };
                lastError = appErr.code
                    ? `Appwrite ${appErr.code}: ${appErr.message ?? appErr.type ?? 'Error desconocido'}`
                    : String(e);
                failed++;
            }
        }

        // ── Statistics ────────────────────────────────────────────────────────
        const pendingStats = await StatisticsRepository.getPendingSync();
        for (const stat of pendingStats) {
            try {
                await appwriteDbHelpers.updateStatistics(stat);
                await db.statistics.update(stat.userId, { syncStatus: 'synced' });
                synced++;
            } catch (e) { console.error('[Sync] stats error', e); failed++; }
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
                synced++;
            } catch (e) { console.error('[Sync] measurement error', e); failed++; }
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
                synced++;
            } catch (e) { console.error('[Sync] photo error', e); failed++; }
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
                synced++;
            } catch (e) { console.error('[Sync] achievement error', e); failed++; }
        }

        // ── Lesiones ──────────────────────────────────────────────────────────
        const pendingLesiones = await InjuryRepository.getPendingSync();
        for (const lesion of pendingLesiones) {
            try {
                if (lesion.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.addLesion(lesion);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                } else if (lesion.syncStatus === 'pending_update') {
                    await appwriteDbHelpers.updateLesion(lesion);
                }
                await db.lesiones.update(lesion.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { console.error('[Sync] lesion error', e); failed++; }
        }

        // ── Cardio Sessions ───────────────────────────────────────────────────
        const pendingCardio = await CardioRepository.getPendingSync();
        for (const session of pendingCardio) {
            try {
                if (session.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.addCardioSession(session);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                } else if (session.syncStatus === 'pending_update') {
                    await appwriteDbHelpers.updateCardioSession(session);
                }
                await db.cardioSessions.update(session.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { console.error('[Sync] cardio error', e); failed++; }
        }

        console.log(`[Sync] Complete — synced: ${synced}, failed: ${failed}${lastError ? ` | ${lastError}` : ''}`);
        return { synced, failed, lastError };
    },

    getPendingCount: async () => {
        const u = await db.users.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const r = await db.rutinas.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const w = await db.workouts.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const s = await db.statistics.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const m = await db.bodyMeasurements.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const p = await db.progressPhotos.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const a = await db.achievements.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const l = await db.lesiones.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        const c = await db.cardioSessions.filter(x => x.syncStatus !== undefined && x.syncStatus !== 'synced').count();
        return u + r + w + s + m + p + a + l + c;
    }
};
