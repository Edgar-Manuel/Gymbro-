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

// IDs de la base de datos y colecciones — fuente única en appwriteSchema.ts.
// Las constantes que vivían aquí estaban en kebab-case (`body-measurements`,
// `progress-photos`) y entraban en conflicto con las reales en camelCase
// (`bodyMeasurements`, `progressPhotos`) usadas por SyncManager y
// appwriteDb. Reexportadas para evitar duplicación silenciosa.
export { APPWRITE_DATABASE_ID as DATABASE_ID, COLLECTIONS } from '@/config/appwriteSchema';

export const STORAGE_BUCKETS = {
  PROGRESS_PHOTOS: 'progress-photos',
};

export { client };
