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
    ProgressPhoto,
    Lesion,
    CardioSession,
} from '@/types';
import type { WithSync } from './types';

export class GymBroDatabase extends Dexie {
    exercises!: Table<WithSync<ExerciseKnowledge>, string>;
    users!: Table<WithSync<UserProfile>, string>;
    rutinas!: Table<WithSync<RutinaSemanal>, string>;
    workouts!: Table<WithSync<WorkoutLog>, string>;
    achievements!: Table<WithSync<Achievement>, string>;
    nutrition!: Table<WithSync<NutritionTracker>, string>;
    statistics!: Table<WithSync<UserStatistics>, string>;
    bodyMeasurements!: Table<WithSync<BodyMeasurement>, string>;
    progressPhotos!: Table<WithSync<ProgressPhoto>, string>;
    lesiones!: Table<WithSync<Lesion>, string>;
    cardioSessions!: Table<WithSync<CardioSession>, string>;

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

        // Versión 3: Sync Status
        this.version(3).stores({
            exercises: 'id, grupoMuscular, categoria, tier, dificultad, *equipamiento, *tags, syncStatus',
            users: 'id, nombre, syncStatus',
            rutinas: 'id, userId, activa, syncStatus',
            workouts: 'id, userId, fecha, diaRutinaId, completado, syncStatus',
            achievements: 'id, userId, tipo, fecha, syncStatus',
            nutrition: '[userId+fecha], userId, fecha, syncStatus',
            statistics: 'userId, syncStatus',
            bodyMeasurements: 'id, userId, fecha, syncStatus',
            progressPhotos: 'id, userId, fecha, tipo, syncStatus'
        });

        // Versión 4: Injury Management
        this.version(4).stores({
            exercises: 'id, grupoMuscular, categoria, tier, dificultad, *equipamiento, *tags, syncStatus',
            users: 'id, nombre, syncStatus',
            rutinas: 'id, userId, activa, syncStatus',
            workouts: 'id, userId, fecha, diaRutinaId, completado, syncStatus',
            achievements: 'id, userId, tipo, fecha, syncStatus',
            nutrition: '[userId+fecha], userId, fecha, syncStatus',
            statistics: 'userId, syncStatus',
            bodyMeasurements: 'id, userId, fecha, syncStatus',
            progressPhotos: 'id, userId, fecha, tipo, syncStatus',
            lesiones: 'id, userId, zona, activa, syncStatus',
        });

        // Versión 5: Cardio Sessions
        this.version(5).stores({
            exercises: 'id, grupoMuscular, categoria, tier, dificultad, *equipamiento, *tags, syncStatus',
            users: 'id, nombre, syncStatus',
            rutinas: 'id, userId, activa, syncStatus',
            workouts: 'id, userId, fecha, diaRutinaId, completado, syncStatus',
            achievements: 'id, userId, tipo, fecha, syncStatus',
            nutrition: '[userId+fecha], userId, fecha, syncStatus',
            statistics: 'userId, syncStatus',
            bodyMeasurements: 'id, userId, fecha, syncStatus',
            progressPhotos: 'id, userId, fecha, tipo, syncStatus',
            lesiones: 'id, userId, zona, activa, syncStatus',
            cardioSessions: 'id, userId, fecha, workoutId, completado, syncStatus',
        });
    }
}

export const db = new GymBroDatabase();
