import { UserRepository } from '../repositories/UserRepository';
import { RoutineRepository } from '../repositories/RoutineRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { StatisticsRepository } from '../repositories/StatisticsRepository';
import { BodyTrackingRepository } from '../repositories/BodyTrackingRepository';
import { InjuryRepository } from '../repositories/InjuryRepository';
import { CardioRepository } from '../repositories/CardioRepository';
import { MachinePhotoRepository } from '../repositories/MachinePhotoRepository';
import { appwriteDbHelpers } from '../appwriteDb';
import { databases } from '@/services/appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/config/appwriteSchema';
import { db } from '../schema';

export interface SyncResult {
    /** Documentos enviados a Appwrite con éxito (incluye los que ya existían en remoto). */
    synced: number;
    /** Documentos cuyo upload o delete falló. */
    errors: number;
    /** Mensajes de error legibles para mostrar al usuario. */
    errorMessages: string[];
    /** True si la sync se canceló por estar offline. */
    skippedOffline?: boolean;
}

export const SyncManager = {
    async syncAll(): Promise<SyncResult> {
        if (!navigator.onLine) {
            return { synced: 0, errors: 0, errorMessages: [], skippedOffline: true };
        }

        console.log('[Sync] Starting background sync...');

        let synced = 0;
        let errors = 0;
        const errorMessages: string[] = [];
        const logErr = (label: string, e: unknown) => {
            console.error(`[Sync] ${label}`, e);
            errors++;
            const msg = e instanceof Error ? e.message : String(e);
            errorMessages.push(`${label}: ${msg}`);
        };

        // ── Users ─────────────────────────────────────────────────────────────
        const pendingUsers = await UserRepository.getPendingSync();
        for (const user of pendingUsers) {
            try {
                await appwriteDbHelpers.createOrUpdateUser(user);
                await db.users.update(user.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { logErr('user', e); }
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
                    try {
                        await appwriteDbHelpers.updateRoutine(routine);
                    } catch (err) {
                        if ((err as { code?: number }).code === 404) {
                            await appwriteDbHelpers.createRoutine(routine);
                        } else throw err;
                    }
                }
                await db.rutinas.update(routine.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { logErr('routine', e); }
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
                    try {
                        await appwriteDbHelpers.updateWorkout(workout.id, workout);
                    } catch (err) {
                        if ((err as { code?: number }).code === 404) {
                            await appwriteDbHelpers.logWorkout(workout);
                        } else throw err;
                    }
                }
                await db.workouts.update(workout.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { logErr('workout', e); }
        }

        // ── Statistics ────────────────────────────────────────────────────────
        const pendingStats = await StatisticsRepository.getPendingSync();
        for (const stat of pendingStats) {
            try {
                await appwriteDbHelpers.updateStatistics(stat);
                await db.statistics.update(stat.userId, { syncStatus: 'synced' });
                synced++;
            } catch (e) { logErr('stats', e); }
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
                    await db.bodyMeasurements.update(m.id, { syncStatus: 'synced' });
                    synced++;
                } else if (m.syncStatus === 'pending_update') {
                    try {
                        await appwriteDbHelpers.updateBodyMeasurement(m);
                    } catch (err) {
                        if ((err as { code?: number }).code === 404) {
                            await appwriteDbHelpers.addBodyMeasurement(m);
                        } else throw err;
                    }
                    await db.bodyMeasurements.update(m.id, { syncStatus: 'synced' });
                    synced++;
                } else if (m.syncStatus === 'pending_delete') {
                    try {
                        await appwriteDbHelpers.deleteBodyMeasurement(m.id);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 404) throw err;
                    }
                    await db.bodyMeasurements.delete(m.id);
                    synced++;
                }
            } catch (e) { logErr('measurement', e); }
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
            } catch (e) { logErr('photo', e); }
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
            } catch (e) { logErr('achievement', e); }
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
                    try {
                        await appwriteDbHelpers.updateLesion(lesion);
                    } catch (err) {
                        if ((err as { code?: number }).code === 404) {
                            await appwriteDbHelpers.addLesion(lesion);
                        } else throw err;
                    }
                }
                await db.lesiones.update(lesion.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { logErr('lesion', e); }
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
                    try {
                        await appwriteDbHelpers.updateCardioSession(session);
                    } catch (err) {
                        if ((err as { code?: number }).code === 404) {
                            await appwriteDbHelpers.addCardioSession(session);
                        } else throw err;
                    }
                }
                await db.cardioSessions.update(session.id, { syncStatus: 'synced' });
                synced++;
            } catch (e) { logErr('cardio', e); }
        }

        // ── Machine Photos ────────────────────────────────────────────────────
        const pendingMachinePhotos = await MachinePhotoRepository.getPendingSync();
        for (const photo of pendingMachinePhotos) {
            try {
                if (photo.syncStatus === 'pending_create') {
                    try {
                        await appwriteDbHelpers.addMachinePhoto(photo);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 409) throw err;
                    }
                } else if (photo.syncStatus === 'pending_update') {
                    try {
                        await appwriteDbHelpers.updateMachinePhoto(photo.id, photo);
                    } catch (err) {
                        if ((err as { code?: number }).code === 404) {
                            await appwriteDbHelpers.addMachinePhoto(photo);
                        } else throw err;
                    }
                } else if (photo.syncStatus === 'pending_delete') {
                    try {
                        await appwriteDbHelpers.deleteMachinePhoto(photo.id);
                    } catch (err) {
                        if ((err as { code?: number }).code !== 404) throw err;
                    }
                    await db.machinePhotos.delete(photo.id);
                    continue;
                }
                await db.machinePhotos.update(photo.id, { syncStatus: 'synced' });
            } catch (e) { console.error('[Sync] machine photo error', e); }
        }

        // ── Pending Deletes ───────────────────────────────────────────────────
        const deleteLesiones = await db.lesiones.filter(l => l.syncStatus === 'pending_delete').toArray();
        for (const l of deleteLesiones) {
            try {
                try {
                    await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.LESIONES, l.id);
                } catch (err) {
                    if ((err as { code?: number }).code !== 404) throw err;
                }
                await db.lesiones.delete(l.id);
                synced++;
            } catch (e) { logErr('delete lesion', e); }
        }

        const deleteCardio = await db.cardioSessions.filter(s => s.syncStatus === 'pending_delete').toArray();
        for (const s of deleteCardio) {
            try {
                try {
                    await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CARDIO, s.id);
                } catch (err) {
                    if ((err as { code?: number }).code !== 404) throw err;
                }
                await db.cardioSessions.delete(s.id);
                synced++;
            } catch (e) { logErr('delete cardio', e); }
        }

        const deletePhotos = await db.progressPhotos.filter(p => p.syncStatus === 'pending_delete').toArray();
        for (const p of deletePhotos) {
            try {
                try {
                    await appwriteDbHelpers.deleteProgressPhoto(p.id);
                } catch (err) {
                    if ((err as { code?: number }).code !== 404) throw err;
                }
                await db.progressPhotos.delete(p.id);
                synced++;
            } catch (e) { logErr('delete photo', e); }
        }

        console.log(`[Sync] Complete: ${synced} synced, ${errors} errors`);
        return { synced, errors, errorMessages };
    },

    getPendingCount: async () => {
        const isPending = (x: { syncStatus?: string }) =>
            x.syncStatus !== undefined && x.syncStatus !== 'synced';
        const u = await db.users.filter(isPending).count();
        const r = await db.rutinas.filter(isPending).count();
        const w = await db.workouts.filter(isPending).count();
        const s = await db.statistics.filter(isPending).count();
        const m = await db.bodyMeasurements.filter(isPending).count();
        const p = await db.progressPhotos.filter(isPending).count();
        const a = await db.achievements.filter(isPending).count();
        const l = await db.lesiones.filter(isPending).count();
        const c = await db.cardioSessions.filter(isPending).count();
        const mp = await db.machinePhotos.filter(p => p.syncStatus !== 'synced' && p.syncStatus !== undefined).count();
        return u + r + w + s + m + p + a + l + c + mp;
    }
};
