/**
 * Appwrite Database Schema Configuration
 *
 * Este archivo define la estructura de las colecciones en Appwrite.
 * Para crear las colecciones en Appwrite Console:
 * 1. Ve a Databases → Create Database (nombre: gymbro-db)
 * 2. Crea cada colección con los atributos especificados
 * 3. Configura los permisos según se indica
 */

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'gymbro-db';

export const COLLECTIONS = {
  USERS: 'users',
  EXERCISES: 'exercises',
  ROUTINES: 'routines',
  WORKOUTS: 'workouts',
  ACHIEVEMENTS: 'achievements',
  NUTRITION: 'nutrition',
  STATISTICS: 'statistics',
  BODY_MEASUREMENTS: 'bodyMeasurements',
  PROGRESS_PHOTOS: 'progressPhotos',
} as const;

/**
 * Schema para la colección de usuarios
 * ID: users
 * Permisos: Read/Write por el propio usuario
 */
export const userSchema = {
  collectionId: COLLECTIONS.USERS,
  name: 'Users',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'nombre', type: 'string', size: 255, required: true },
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'edad', type: 'integer', required: true },
    { key: 'peso', type: 'double', required: true },
    { key: 'pesoActual', type: 'double', required: true },
    { key: 'altura', type: 'integer', required: true },
    { key: 'objetivo', type: 'string', size: 100, required: true },
    { key: 'nivel', type: 'string', size: 50, required: true },
    { key: 'diasDisponibles', type: 'integer', required: true },
    { key: 'equipamiento', type: 'string', size: 5000, required: true, array: true },
    { key: 'preferencias', type: 'string', size: 10000, required: false },
    { key: 'restricciones', type: 'string', size: 10000, required: false },
  ],
  indexes: [
    { key: 'userId_idx', type: 'unique', attributes: ['userId'] },
    { key: 'email_idx', type: 'unique', attributes: ['email'] },
  ],
};

/**
 * Schema para la colección de ejercicios
 * ID: exercises
 * Permisos: Read público, Write solo admin
 */
export const exerciseSchema = {
  collectionId: COLLECTIONS.EXERCISES,
  name: 'Exercises',
  permissions: ['read("any")', 'write("role:admin")'],
  attributes: [
    { key: 'nombre', type: 'string', size: 255, required: true },
    { key: 'grupoMuscular', type: 'string', size: 100, required: true },
    { key: 'categoria', type: 'string', size: 100, required: true },
    { key: 'tier', type: 'string', size: 50, required: true },
    { key: 'descripcion', type: 'string', size: 2000, required: true },
    { key: 'instrucciones', type: 'string', size: 5000, required: true, array: true },
    { key: 'equipamiento', type: 'string', size: 1000, required: true, array: true },
    { key: 'dificultad', type: 'string', size: 50, required: true },
    { key: 'musculos', type: 'string', size: 10000, required: true },
    { key: 'advertencias', type: 'string', size: 5000, required: false, array: true },
    { key: 'videoUrl', type: 'string', size: 500, required: false },
    { key: 'tags', type: 'string', size: 2000, required: false, array: true },
  ],
  indexes: [
    { key: 'grupoMuscular_idx', type: 'key', attributes: ['grupoMuscular'] },
    { key: 'tier_idx', type: 'key', attributes: ['tier'] },
    { key: 'categoria_idx', type: 'key', attributes: ['categoria'] },
  ],
};

/**
 * Schema para la colección de rutinas
 * ID: routines
 * Permisos: Read/Write por el propio usuario
 */
export const routineSchema = {
  collectionId: COLLECTIONS.ROUTINES,
  name: 'Routines',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'nombre', type: 'string', size: 255, required: true },
    { key: 'objetivo', type: 'string', size: 100, required: true },
    { key: 'nivel', type: 'string', size: 50, required: true },
    { key: 'diasPorSemana', type: 'integer', required: true },
    { key: 'diasRutina', type: 'string', size: 50000, required: true }, // JSON string
    { key: 'duracionTotal', type: 'integer', required: true },
    { key: 'activa', type: 'boolean', required: true, default: false },
    { key: 'fechaCreacion', type: 'datetime', required: true },
  ],
  indexes: [
    { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    { key: 'activa_idx', type: 'key', attributes: ['activa'] },
  ],
};

/**
 * Schema para la colección de workouts
 * ID: workouts
 * Permisos: Read/Write por el propio usuario
 */
export const workoutSchema = {
  collectionId: COLLECTIONS.WORKOUTS,
  name: 'Workouts',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'rutinaId', type: 'string', size: 255, required: false },
    { key: 'diaRutinaId', type: 'string', size: 255, required: false },
    { key: 'fecha', type: 'datetime', required: true },
    { key: 'ejercicios', type: 'string', size: 50000, required: true }, // JSON string
    { key: 'duracion', type: 'integer', required: true },
    { key: 'notas', type: 'string', size: 2000, required: false },
    { key: 'completado', type: 'boolean', required: true },
    { key: 'volumenTotal', type: 'double', required: false },
    { key: 'caloriaQuemadas', type: 'integer', required: false },
  ],
  indexes: [
    { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    { key: 'fecha_idx', type: 'key', attributes: ['fecha'] },
    { key: 'completado_idx', type: 'key', attributes: ['completado'] },
  ],
};

/**
 * Schema para la colección de logros
 * ID: achievements
 * Permisos: Read/Write por el propio usuario
 */
export const achievementSchema = {
  collectionId: COLLECTIONS.ACHIEVEMENTS,
  name: 'Achievements',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'tipo', type: 'string', size: 100, required: true },
    { key: 'nombre', type: 'string', size: 255, required: true },
    { key: 'descripcion', type: 'string', size: 1000, required: true },
    { key: 'icono', type: 'string', size: 100, required: true },
    { key: 'fecha', type: 'datetime', required: true },
    { key: 'detalles', type: 'string', size: 5000, required: false },
  ],
  indexes: [
    { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    { key: 'tipo_idx', type: 'key', attributes: ['tipo'] },
    { key: 'fecha_idx', type: 'key', attributes: ['fecha'] },
  ],
};

/**
 * Schema para la colección de nutrición
 * ID: nutrition
 * Permisos: Read/Write por el propio usuario
 */
export const nutritionSchema = {
  collectionId: COLLECTIONS.NUTRITION,
  name: 'Nutrition',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'fecha', type: 'datetime', required: true },
    { key: 'calorias', type: 'integer', required: true },
    { key: 'proteinas', type: 'double', required: true },
    { key: 'carbohidratos', type: 'double', required: true },
    { key: 'grasas', type: 'double', required: true },
    { key: 'comidas', type: 'string', size: 50000, required: true }, // JSON string
    { key: 'agua', type: 'integer', required: false, default: 0 },
  ],
  indexes: [
    { key: 'userId_fecha_idx', type: 'unique', attributes: ['userId', 'fecha'] },
  ],
};

/**
 * Schema para la colección de estadísticas
 * ID: statistics
 * Permisos: Read/Write por el propio usuario
 */
export const statisticsSchema = {
  collectionId: COLLECTIONS.STATISTICS,
  name: 'Statistics',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'totalWorkouts', type: 'integer', required: true, default: 0 },
    { key: 'currentStreak', type: 'integer', required: true, default: 0 },
    { key: 'longestStreak', type: 'integer', required: true, default: 0 },
    { key: 'totalVolume', type: 'double', required: true, default: 0 },
    { key: 'totalCalories', type: 'integer', required: true, default: 0 },
    { key: 'totalMinutes', type: 'integer', required: true, default: 0 },
    { key: 'favoriteExercises', type: 'string', size: 10000, required: false }, // JSON string
    { key: 'muscleGroupStats', type: 'string', size: 10000, required: false }, // JSON string
    { key: 'lastWorkoutDate', type: 'datetime', required: false },
  ],
  indexes: [
    { key: 'userId_idx', type: 'unique', attributes: ['userId'] },
  ],
};

/**
 * Schema para la colección de mediciones corporales
 * ID: bodyMeasurements
 * Permisos: Read/Write por el propio usuario
 */
export const bodyMeasurementSchema = {
  collectionId: COLLECTIONS.BODY_MEASUREMENTS,
  name: 'BodyMeasurements',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'fecha', type: 'datetime', required: true },
    { key: 'peso', type: 'double', required: true },
    { key: 'cintura', type: 'double', required: false },
    { key: 'cadera', type: 'double', required: false },
    { key: 'pecho', type: 'double', required: false },
    { key: 'brazoDerecho', type: 'double', required: false },
    { key: 'brazoIzquierdo', type: 'double', required: false },
    { key: 'musloDerecho', type: 'double', required: false },
    { key: 'musloIzquierdo', type: 'double', required: false },
    { key: 'pantorrillaDerecha', type: 'double', required: false },
    { key: 'pantorrillaIzquierda', type: 'double', required: false },
    { key: 'grasaCorporal', type: 'double', required: false },
    { key: 'masaMuscular', type: 'double', required: false },
    { key: 'notas', type: 'string', size: 2000, required: false },
  ],
  indexes: [
    { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    { key: 'fecha_idx', type: 'key', attributes: ['fecha'] },
  ],
};

/**
 * Schema para la colección de fotos de progreso
 * ID: progressPhotos
 * Permisos: Read/Write por el propio usuario
 */
export const progressPhotoSchema = {
  collectionId: COLLECTIONS.PROGRESS_PHOTOS,
  name: 'ProgressPhotos',
  permissions: ['read("user:{userId}")', 'write("user:{userId}")'],
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'fecha', type: 'datetime', required: true },
    { key: 'tipo', type: 'string', size: 50, required: true }, // frontal, lateral, trasera
    { key: 'fileId', type: 'string', size: 255, required: true }, // ID del archivo en Storage
    { key: 'url', type: 'string', size: 1000, required: true },
    { key: 'peso', type: 'double', required: false },
    { key: 'notas', type: 'string', size: 2000, required: false },
  ],
  indexes: [
    { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    { key: 'fecha_idx', type: 'key', attributes: ['fecha'] },
    { key: 'tipo_idx', type: 'key', attributes: ['tipo'] },
  ],
};

/**
 * Instrucciones para crear las colecciones en Appwrite Console
 */
export const SETUP_INSTRUCTIONS = `
INSTRUCCIONES PARA CONFIGURAR APPWRITE DATABASE:

1. Ve a tu proyecto en Appwrite Console
2. Ve a Databases → Create Database
   - Database ID: gymbro-db
   - Name: GymBro Database

3. Para cada colección, usa los siguientes IDs y configuraciones:
   - users (Users)
   - exercises (Exercises)
   - routines (Routines)
   - workouts (Workouts)
   - achievements (Achievements)
   - nutrition (Nutrition)
   - statistics (Statistics)
   - bodyMeasurements (BodyMeasurements)
   - progressPhotos (ProgressPhotos)

4. Configura los permisos en Settings de cada colección:
   - Para colecciones de usuario: read("user:{userId}"), write("user:{userId}")
   - Para exercises: read("any"), write("role:admin")

5. Agrega VITE_APPWRITE_DATABASE_ID=gymbro-db a tus variables de entorno

NOTA: Los atributos tipo JSON se almacenan como string y se parsean en la aplicación.
`;
