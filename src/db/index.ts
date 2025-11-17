import Dexie, { type Table } from 'dexie';
import type {
  ExerciseKnowledge,
  UserProfile,
  RutinaSemanal,
  WorkoutLog,
  Achievement,
  NutritionTracker,
  UserStatistics,
  BodyMeasurement,
  ProgressPhoto
} from '@/types';

export class GymBroDatabase extends Dexie {
  exercises!: Table<ExerciseKnowledge, string>;
  users!: Table<UserProfile, string>;
  rutinas!: Table<RutinaSemanal, string>;
  workouts!: Table<WorkoutLog, string>;
  achievements!: Table<Achievement, string>;
  nutrition!: Table<NutritionTracker, string>;
  statistics!: Table<UserStatistics, string>;
  bodyMeasurements!: Table<BodyMeasurement, string>;
  progressPhotos!: Table<ProgressPhoto, string>;

  constructor() {
    super('GymBroDatabase');

    this.version(1).stores({
      exercises: 'id, grupoMuscular, categoria, tier, dificultad, *equipamiento, *tags',
      users: 'id, nombre',
      rutinas: 'id, userId, activa',
      workouts: 'id, userId, fecha, diaRutinaId, completado',
      achievements: 'id, userId, tipo, fecha',
      nutrition: '[userId+fecha], userId, fecha',
      statistics: 'userId'
    });

    // Nueva versión con body tracking
    this.version(2).stores({
      exercises: 'id, grupoMuscular, categoria, tier, dificultad, *equipamiento, *tags',
      users: 'id, nombre',
      rutinas: 'id, userId, activa',
      workouts: 'id, userId, fecha, diaRutinaId, completado',
      achievements: 'id, userId, tipo, fecha',
      nutrition: '[userId+fecha], userId, fecha',
      statistics: 'userId',
      bodyMeasurements: 'id, userId, fecha',
      progressPhotos: 'id, userId, fecha, tipo'
    });
  }
}

export const db = new GymBroDatabase();

// Importar helpers de Appwrite
import { appwriteDbHelpers } from './appwriteDb';

/**
 * Modo de almacenamiento: 'cloud' usa Appwrite, 'local' usa IndexedDB
 * Por defecto usa 'cloud' si hay usuario autenticado, sino 'local'
 */
let storageMode: 'cloud' | 'local' = 'cloud';

export function setStorageMode(mode: 'cloud' | 'local') {
  storageMode = mode;
}

export function getStorageMode() {
  return storageMode;
}

/**
 * Helper functions que usan Appwrite como almacenamiento principal
 * y caen a IndexedDB como fallback o modo offline
 */
export const dbHelpers = {
  // Exercises
  async getExerciseById(id: string) {
    return await db.exercises.get(id);
  },

  async getExercisesByMuscleGroup(grupoMuscular: string) {
    return await db.exercises.where('grupoMuscular').equals(grupoMuscular).toArray();
  },

  async getExercisesByTier(tier: string) {
    return await db.exercises.where('tier').equals(tier).toArray();
  },

  async getAllExercises() {
    return await db.exercises.toArray();
  },

  async searchExercises(query: string) {
    const allExercises = await db.exercises.toArray();
    return allExercises.filter(ex =>
      ex.nombre.toLowerCase().includes(query.toLowerCase())
    );
  },

  // User
  async getCurrentUser(): Promise<UserProfile | undefined> {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getCurrentUser();
      } catch (error) {
        console.error('Error obteniendo usuario de Appwrite, usando IndexedDB:', error);
        // Fallback a IndexedDB
        const users = await db.users.toArray();
        return users[0];
      }
    } else {
      // Modo local
      const users = await db.users.toArray();
      return users[0];
    }
  },

  async createOrUpdateUser(user: UserProfile) {
    if (storageMode === 'cloud') {
      try {
        await appwriteDbHelpers.createOrUpdateUser(user);
        // También guardar en IndexedDB como cache
        await db.users.put(user);
        return user.id;
      } catch (error) {
        console.error('Error guardando usuario en Appwrite, usando IndexedDB:', error);
        return await db.users.put(user);
      }
    } else {
      return await db.users.put(user);
    }
  },

  async updateUser(user: UserProfile) {
    return await this.createOrUpdateUser(user);
  },

  // Rutinas
  async getActiveRoutine(userId: string): Promise<RutinaSemanal | undefined> {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getActiveRoutine(userId);
      } catch (error) {
        console.error('Error obteniendo rutina activa de Appwrite, usando IndexedDB:', error);
        return await db.rutinas
          .where('userId').equals(userId)
          .and(r => r.activa === true)
          .first();
      }
    } else {
      return await db.rutinas
        .where('userId').equals(userId)
        .and(r => r.activa === true)
        .first();
    }
  },

  async getUserRoutines(userId: string) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getUserRoutines(userId);
      } catch (error) {
        console.error('Error obteniendo rutinas de Appwrite, usando IndexedDB:', error);
        return await db.rutinas.where('userId').equals(userId).toArray();
      }
    } else {
      return await db.rutinas.where('userId').equals(userId).toArray();
    }
  },

  async createRoutine(rutina: RutinaSemanal) {
    if (storageMode === 'cloud') {
      try {
        const id = await appwriteDbHelpers.createRoutine(rutina);
        // También guardar en IndexedDB como cache
        await db.rutinas.add({ ...rutina, id });
        return id;
      } catch (error) {
        console.error('Error creando rutina en Appwrite, usando IndexedDB:', error);
        // Fallback a IndexedDB
        if (rutina.activa) {
          const activeRoutines = await db.rutinas
            .where('userId').equals(rutina.userId)
            .and(r => r.activa === true)
            .toArray();

          for (const r of activeRoutines) {
            await db.rutinas.update(r.id, { activa: false });
          }
        }
        return await db.rutinas.add(rutina);
      }
    } else {
      // Modo local
      if (rutina.activa) {
        const activeRoutines = await db.rutinas
          .where('userId').equals(rutina.userId)
          .and(r => r.activa === true)
          .toArray();

        for (const r of activeRoutines) {
          await db.rutinas.update(r.id, { activa: false });
        }
      }
      return await db.rutinas.add(rutina);
    }
  },

  // Workouts
  async getWorkoutsByUser(userId: string, limit?: number) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getWorkoutsByUser(userId, limit);
      } catch (error) {
        console.error('Error obteniendo workouts de Appwrite, usando IndexedDB:', error);
        let query = db.workouts
          .where('userId').equals(userId)
          .reverse()
          .sortBy('fecha');

        const workouts = await query;
        return limit ? workouts.slice(0, limit) : workouts;
      }
    } else {
      let query = db.workouts
        .where('userId').equals(userId)
        .reverse()
        .sortBy('fecha');

      const workouts = await query;
      return limit ? workouts.slice(0, limit) : workouts;
    }
  },

  async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getWorkoutsByDateRange(userId, startDate, endDate);
      } catch (error) {
        console.error('Error obteniendo workouts por fecha de Appwrite, usando IndexedDB:', error);
        return await db.workouts
          .where('userId').equals(userId)
          .and(w => w.fecha >= startDate && w.fecha <= endDate)
          .toArray();
      }
    } else {
      return await db.workouts
        .where('userId').equals(userId)
        .and(w => w.fecha >= startDate && w.fecha <= endDate)
        .toArray();
    }
  },

  async logWorkout(workout: WorkoutLog) {
    if (storageMode === 'cloud') {
      try {
        const id = await appwriteDbHelpers.logWorkout(workout);
        // También guardar en IndexedDB como cache
        await db.workouts.add({ ...workout, id });
        return id;
      } catch (error) {
        console.error('Error guardando workout en Appwrite, usando IndexedDB:', error);
        return await db.workouts.add(workout);
      }
    } else {
      return await db.workouts.add(workout);
    }
  },

  async updateWorkout(id: string, updates: Partial<WorkoutLog>) {
    if (storageMode === 'cloud') {
      try {
        await appwriteDbHelpers.updateWorkout(id, updates);
        // También actualizar en IndexedDB
        await db.workouts.update(id, updates);
        return id;
      } catch (error) {
        console.error('Error actualizando workout en Appwrite, usando IndexedDB:', error);
        return await db.workouts.update(id, updates);
      }
    } else {
      return await db.workouts.update(id, updates);
    }
  },

  // Statistics
  async getUserStatistics(userId: string) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getUserStatistics(userId);
      } catch (error) {
        console.error('Error obteniendo estadísticas de Appwrite, usando IndexedDB:', error);
        return await db.statistics.get(userId);
      }
    } else {
      return await db.statistics.get(userId);
    }
  },

  async updateStatistics(stats: UserStatistics) {
    if (storageMode === 'cloud') {
      try {
        await appwriteDbHelpers.updateStatistics(stats);
        // También actualizar en IndexedDB
        await db.statistics.put(stats);
        return stats.userId;
      } catch (error) {
        console.error('Error actualizando estadísticas en Appwrite, usando IndexedDB:', error);
        return await db.statistics.put(stats);
      }
    } else {
      return await db.statistics.put(stats);
    }
  },

  // Achievements
  async getUserAchievements(userId: string) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getUserAchievements(userId);
      } catch (error) {
        console.error('Error obteniendo logros de Appwrite, usando IndexedDB:', error);
        return await db.achievements
          .where('userId').equals(userId)
          .reverse()
          .sortBy('fecha');
      }
    } else {
      return await db.achievements
        .where('userId').equals(userId)
        .reverse()
        .sortBy('fecha');
    }
  },

  async addAchievement(achievement: Achievement) {
    if (storageMode === 'cloud') {
      try {
        const id = await appwriteDbHelpers.addAchievement(achievement);
        // También guardar en IndexedDB
        await db.achievements.add({ ...achievement, id });
        return id;
      } catch (error) {
        console.error('Error agregando logro en Appwrite, usando IndexedDB:', error);
        return await db.achievements.add(achievement);
      }
    } else {
      return await db.achievements.add(achievement);
    }
  },

  // Nutrition
  async getNutritionByDate(userId: string, fecha: Date) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getNutritionByDate(userId, fecha);
      } catch (error) {
        console.error('Error obteniendo nutrición de Appwrite, usando IndexedDB:', error);
        const dateStr = fecha.toISOString().split('T')[0];
        const targetDate = new Date(dateStr);

        return await db.nutrition
          .where('[userId+fecha]')
          .equals([userId, targetDate.getTime()])
          .first();
      }
    } else {
      const dateStr = fecha.toISOString().split('T')[0];
      const targetDate = new Date(dateStr);

      return await db.nutrition
        .where('[userId+fecha]')
        .equals([userId, targetDate.getTime()])
        .first();
    }
  },

  async updateNutrition(nutrition: NutritionTracker) {
    if (storageMode === 'cloud') {
      try {
        await appwriteDbHelpers.updateNutrition(nutrition);
        // También actualizar en IndexedDB
        await db.nutrition.put(nutrition);
        return `${nutrition.userId}_${nutrition.fecha.getTime()}`;
      } catch (error) {
        console.error('Error actualizando nutrición en Appwrite, usando IndexedDB:', error);
        return await db.nutrition.put(nutrition);
      }
    } else {
      return await db.nutrition.put(nutrition);
    }
  },

  // Bulk operations
  async bulkAddExercises(exercises: ExerciseKnowledge[]) {
    return await db.exercises.bulkAdd(exercises);
  },

  // Body Measurements
  async getBodyMeasurements(userId: string, limit?: number) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getBodyMeasurements(userId, limit);
      } catch (error) {
        console.error('Error obteniendo mediciones de Appwrite, usando IndexedDB:', error);
        let query = db.bodyMeasurements
          .where('userId').equals(userId)
          .reverse()
          .sortBy('fecha');

        const measurements = await query;
        return limit ? measurements.slice(0, limit) : measurements;
      }
    } else {
      let query = db.bodyMeasurements
        .where('userId').equals(userId)
        .reverse()
        .sortBy('fecha');

      const measurements = await query;
      return limit ? measurements.slice(0, limit) : measurements;
    }
  },

  async getLatestBodyMeasurement(userId: string) {
    const measurements = await this.getBodyMeasurements(userId, 1);
    return measurements[0];
  },

  async addBodyMeasurement(measurement: BodyMeasurement) {
    if (storageMode === 'cloud') {
      try {
        const id = await appwriteDbHelpers.addBodyMeasurement(measurement);
        // También guardar en IndexedDB
        await db.bodyMeasurements.add({ ...measurement, id });
        return id;
      } catch (error) {
        console.error('Error agregando medición en Appwrite, usando IndexedDB:', error);
        return await db.bodyMeasurements.add(measurement);
      }
    } else {
      return await db.bodyMeasurements.add(measurement);
    }
  },

  async getBodyMeasurementsByDateRange(userId: string, startDate: Date, endDate: Date) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getBodyMeasurementsByDateRange(userId, startDate, endDate);
      } catch (error) {
        console.error('Error obteniendo mediciones por fecha de Appwrite, usando IndexedDB:', error);
        return await db.bodyMeasurements
          .where('userId').equals(userId)
          .and(m => m.fecha >= startDate && m.fecha <= endDate)
          .toArray();
      }
    } else {
      return await db.bodyMeasurements
        .where('userId').equals(userId)
        .and(m => m.fecha >= startDate && m.fecha <= endDate)
        .toArray();
    }
  },

  // Progress Photos
  async getProgressPhotos(userId: string, tipo?: string) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getProgressPhotos(userId, tipo);
      } catch (error) {
        console.error('Error obteniendo fotos de Appwrite, usando IndexedDB:', error);
        let query = db.progressPhotos.where('userId').equals(userId);

        if (tipo) {
          query = query.and(p => p.tipo === tipo);
        }

        return await query.reverse().sortBy('fecha');
      }
    } else {
      let query = db.progressPhotos.where('userId').equals(userId);

      if (tipo) {
        query = query.and(p => p.tipo === tipo);
      }

      return await query.reverse().sortBy('fecha');
    }
  },

  async addProgressPhoto(photo: ProgressPhoto) {
    if (storageMode === 'cloud') {
      try {
        const id = await appwriteDbHelpers.addProgressPhoto(photo);
        // También guardar en IndexedDB
        await db.progressPhotos.add({ ...photo, id });
        return id;
      } catch (error) {
        console.error('Error agregando foto en Appwrite, usando IndexedDB:', error);
        return await db.progressPhotos.add(photo);
      }
    } else {
      return await db.progressPhotos.add(photo);
    }
  },

  async deleteProgressPhoto(id: string) {
    if (storageMode === 'cloud') {
      try {
        await appwriteDbHelpers.deleteProgressPhoto(id);
        // También eliminar de IndexedDB
        await db.progressPhotos.delete(id);
      } catch (error) {
        console.error('Error eliminando foto en Appwrite, usando IndexedDB:', error);
        await db.progressPhotos.delete(id);
      }
    } else {
      return await db.progressPhotos.delete(id);
    }
  },

  async getLatestPhotosByType(userId: string) {
    if (storageMode === 'cloud') {
      try {
        return await appwriteDbHelpers.getLatestPhotosByType(userId);
      } catch (error) {
        console.error('Error obteniendo fotos por tipo de Appwrite, usando IndexedDB:', error);
        const photos = await db.progressPhotos
          .where('userId').equals(userId)
          .reverse()
          .sortBy('fecha');

        // Obtener la más reciente de cada tipo
        const photosByType: Record<string, ProgressPhoto> = {};
        for (const photo of photos) {
          if (!photosByType[photo.tipo]) {
            photosByType[photo.tipo] = photo;
          }
        }

        return photosByType;
      }
    } else {
      const photos = await db.progressPhotos
        .where('userId').equals(userId)
        .reverse()
        .sortBy('fecha');

      // Obtener la más reciente de cada tipo
      const photosByType: Record<string, ProgressPhoto> = {};
      for (const photo of photos) {
        if (!photosByType[photo.tipo]) {
          photosByType[photo.tipo] = photo;
        }
      }

      return photosByType;
    }
  },

  // Clear data (útil para desarrollo)
  async clearAllData() {
    await db.exercises.clear();
    await db.users.clear();
    await db.rutinas.clear();
    await db.workouts.clear();
    await db.achievements.clear();
    await db.nutrition.clear();
    await db.statistics.clear();
    await db.bodyMeasurements.clear();
    await db.progressPhotos.clear();
  }
};
