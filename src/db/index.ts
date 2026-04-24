import { db } from './schema';
import { UserRepository } from './repositories/UserRepository';
import { RoutineRepository } from './repositories/RoutineRepository';
import { WorkoutRepository } from './repositories/WorkoutRepository';
import { StatisticsRepository } from './repositories/StatisticsRepository';
import { ExerciseRepository } from './repositories/ExerciseRepository';
import { BodyTrackingRepository } from './repositories/BodyTrackingRepository';
import { AchievementRepository } from './repositories/AchievementRepository';
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
  },

  // Sync
  sync: SyncManager.syncAll,
  getPendingSyncCount: SyncManager.getPendingCount
};

// Auto-sync on online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Online detected, syncing...');
    SyncManager.syncAll();
  });
}
