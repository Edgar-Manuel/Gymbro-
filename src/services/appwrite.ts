import { Client, Account, Databases, Storage } from 'appwrite';

// Configuración del cliente de Appwrite
const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Servicios
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// IDs de la base de datos y colecciones (configurar en Appwrite Console)
export const DATABASE_ID = 'gymbro-db';

export const COLLECTIONS = {
  USERS: 'users',
  ROUTINES: 'routines',
  WORKOUTS: 'workouts',
  BODY_MEASUREMENTS: 'body-measurements',
  PROGRESS_PHOTOS: 'progress-photos',
  ACHIEVEMENTS: 'achievements',
  NUTRITION: 'nutrition',
  STATISTICS: 'statistics'
};

export const STORAGE_BUCKETS = {
  PROGRESS_PHOTOS: 'progress-photos'
};

export { client };
