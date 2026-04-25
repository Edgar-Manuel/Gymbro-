import { db } from './schema';
import { UserRepository } from './repositories/UserRepository';
import { RoutineRepository } from './repositories/RoutineRepository';
import { WorkoutRepository } from './repositories/WorkoutRepository';
import { StatisticsRepository } from './repositories/StatisticsRepository';
import { ExerciseRepository } from './repositories/ExerciseRepository';
import { BodyTrackingRepository } from './repositories/BodyTrackingRepository';
import { AchievementRepository } from './repositories/AchievementRepository';
import { InjuryRepository } from './repositories/InjuryRepository';
import { CardioRepository } from './repositories/CardioRepository';
import { SyncManager } from './sync/SyncManager';
export { setStorageMode, getStorageMode } from './config';

// Export database instance
export { db, GymBroDatabase } from './schema';

// Export repositories
export const dbHelpers = {
  ...UserRepository,
  ...RoutineRepository,
  ...WorkoutRepository,
  ...StatisticsRepository,
  ...ExerciseRepository,
  ...BodyTrackingRepository,
  ...AchievementRepository,
  ...InjuryRepository,
  ...CardioRepository,

  // Utilities
  clearAllData: async () => {
    await db.exercises.clear();
    await db.users.clear();
    await db.rutinas.clear();
    await db.workouts.clear();
    await db.achievements.clear();
    await db.nutrition.clear();
    await db.statistics.clear();
    await db.bodyMeasurements.clear();
    await db.progressPhotos.clear();
    await db.lesiones.clear();
    await db.cardioSessions.clear();
  },

  // Sync
  sync: SyncManager.syncAll,
  getPendingSyncCount: SyncManager.getPendingCount
};

// Auto-sync on online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Online detected, syncing...');
    SyncManager.syncAll();
    // Register background sync tag for service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if ('sync' in reg) {
          (reg as any).sync.register('gymbro-sync').catch(() => {});
        }
      });
    }
  });

  // Listen for background sync triggered by service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'BACKGROUND_SYNC') {
        console.log('[Sync] SW background sync triggered');
        SyncManager.syncAll();
      }
    });
  }
}
