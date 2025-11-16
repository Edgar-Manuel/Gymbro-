import Dexie, { type Table } from 'dexie';
import type {
  ExerciseKnowledge,
  UserProfile,
  RutinaSemanal,
  WorkoutLog,
  Achievement,
  NutritionTracker,
  UserStatistics
} from '@/types';

export class GymBroDatabase extends Dexie {
  exercises!: Table<ExerciseKnowledge, string>;
  users!: Table<UserProfile, string>;
  rutinas!: Table<RutinaSemanal, string>;
  workouts!: Table<WorkoutLog, string>;
  achievements!: Table<Achievement, string>;
  nutrition!: Table<NutritionTracker, string>;
  statistics!: Table<UserStatistics, string>;

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
  }
}

export const db = new GymBroDatabase();

// Helper functions para queries comunes
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
    // Por ahora, asumimos un solo usuario (el primero)
    const users = await db.users.toArray();
    return users[0];
  },

  async createOrUpdateUser(user: UserProfile) {
    return await db.users.put(user);
  },

  // Rutinas
  async getActiveRoutine(userId: string): Promise<RutinaSemanal | undefined> {
    return await db.rutinas
      .where('userId').equals(userId)
      .and(r => r.activa === true)
      .first();
  },

  async getUserRoutines(userId: string) {
    return await db.rutinas.where('userId').equals(userId).toArray();
  },

  async createRoutine(rutina: RutinaSemanal) {
    // Desactivar otras rutinas activas
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
  },

  // Workouts
  async getWorkoutsByUser(userId: string, limit?: number) {
    let query = db.workouts
      .where('userId').equals(userId)
      .reverse()
      .sortBy('fecha');

    const workouts = await query;
    return limit ? workouts.slice(0, limit) : workouts;
  },

  async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await db.workouts
      .where('userId').equals(userId)
      .and(w => w.fecha >= startDate && w.fecha <= endDate)
      .toArray();
  },

  async logWorkout(workout: WorkoutLog) {
    return await db.workouts.add(workout);
  },

  async updateWorkout(id: string, updates: Partial<WorkoutLog>) {
    return await db.workouts.update(id, updates);
  },

  // Statistics
  async getUserStatistics(userId: string) {
    return await db.statistics.get(userId);
  },

  async updateStatistics(stats: UserStatistics) {
    return await db.statistics.put(stats);
  },

  // Achievements
  async getUserAchievements(userId: string) {
    return await db.achievements
      .where('userId').equals(userId)
      .reverse()
      .sortBy('fecha');
  },

  async addAchievement(achievement: Achievement) {
    return await db.achievements.add(achievement);
  },

  // Nutrition
  async getNutritionByDate(userId: string, fecha: Date) {
    const dateStr = fecha.toISOString().split('T')[0];
    const targetDate = new Date(dateStr);

    return await db.nutrition
      .where('[userId+fecha]')
      .equals([userId, targetDate.getTime()])
      .first();
  },

  async updateNutrition(nutrition: NutritionTracker) {
    return await db.nutrition.put(nutrition);
  },

  // Bulk operations
  async bulkAddExercises(exercises: ExerciseKnowledge[]) {
    return await db.exercises.bulkAdd(exercises);
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
  }
};
