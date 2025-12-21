import { Client, Account, Databases, Storage } from 'appwrite';

// Configuración del cliente de Appwrite
const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'placeholder-id';

client
  .setEndpoint(endpoint)
  .setProject(projectId);

if (!import.meta.env.VITE_APPWRITE_PROJECT_ID) {
  console.warn('⚠️ Appwrite Project ID not found in environment variables. Using placeholder.');
}

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
