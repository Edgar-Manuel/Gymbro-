import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'gymbro-db';

// Colecciones que necesitan permisos de usuarios autenticados
const USER_COLLECTIONS = [
    'users',
    'routines',
    'workouts',
    'achievements',
    'nutrition',
    'statistics',
    'bodyMeasurements',
    'progressPhotos'
];

// Colecciones públicas (solo lectura para todos)
const PUBLIC_COLLECTIONS = [
    'exercises'
];

async function fixPermissions() {
    console.log('🔧 Arreglando permisos de colecciones...\n');

    try {
        // Arreglar colecciones de usuarios
        for (const collectionId of USER_COLLECTIONS) {
            try {
                // Primero obtener la colección para saber su nombre
                const collection = await databases.getCollection(DATABASE_ID, collectionId);

                await databases.updateCollection(
                    DATABASE_ID,
                    collectionId,
                    collection.name, // Usar el nombre existente
                    [
                        Permission.read(Role.users()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users())
                    ],
                    false // documentSecurity
                );
                console.log(`✅ ${collectionId}: Permisos actualizados para usuarios autenticados`);
            } catch (error: any) {
                if (error.code === 404) {
                    console.log(`⚠️ ${collectionId}: No existe, saltando...`);
                } else {
                    console.log(`❌ ${collectionId}: Error - ${error.message}`);
                }
            }
        }

        // Arreglar colecciones públicas
        for (const collectionId of PUBLIC_COLLECTIONS) {
            try {
                // Primero obtener la colección para saber su nombre
                const collection = await databases.getCollection(DATABASE_ID, collectionId);

                await databases.updateCollection(
                    DATABASE_ID,
                    collectionId,
                    collection.name, // Usar el nombre existente
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users())
                    ],
                    false
                );
                console.log(`✅ ${collectionId}: Permisos actualizados (lectura pública)`);
            } catch (error: any) {
                if (error.code === 404) {
                    console.log(`⚠️ ${collectionId}: No existe, saltando...`);
                } else {
                    console.log(`❌ ${collectionId}: Error - ${error.message}`);
                }
            }
        }

        console.log('\n🎉 ¡Permisos arreglados! Ahora los usuarios autenticados pueden:');
        console.log('   - Leer, crear, actualizar y eliminar sus documentos');
        console.log('\nPrueba de nuevo la app en https://gym-bro.appwrite.network/');

    } catch (error: any) {
        console.error('❌ Error general:', error.message);
    }
}

fixPermissions();
