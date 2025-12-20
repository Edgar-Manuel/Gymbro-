import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'gymbro-db';

const COLLECTIONS = [
    'users',
    'exercises',
    'routines',
    'workouts',
    'achievements',
    'nutrition',
    'statistics',
    'bodyMeasurements',
    'progressPhotos'
];

async function checkPermissions() {
    console.log('🔍 Verificando permisos de colecciones en Appwrite...\n');
    console.log(`Endpoint: ${process.env.VITE_APPWRITE_ENDPOINT}`);
    console.log(`Project ID: ${process.env.VITE_APPWRITE_PROJECT_ID}`);

    const apiKey = process.env.APPWRITE_API_KEY;
    if (!apiKey || apiKey === 'your_server_api_key' || apiKey.length < 50) {
        console.error('❌ ERROR: Necesitas configurar APPWRITE_API_KEY en tu archivo .env');
        console.log(`   Valor actual: ${apiKey ? apiKey.substring(0, 20) + '...' : 'vacío'}`);
        console.log('\nPasos:');
        console.log('1. Ve a Appwrite Console > Overview > API Keys');
        console.log('2. Crea una API Key con permisos de databases.*');
        console.log('3. Añádela a tu .env como APPWRITE_API_KEY=tu_key_aqui');
        process.exit(1);
    }
    console.log(`API Key: ${apiKey.substring(0, 20)}... ✅`);

    try {
        // Verificar que la base de datos existe
        const db = await databases.get(DATABASE_ID);
        console.log(`✅ Base de datos encontrada: ${db.name} (${db.$id})\n`);

        // Verificar cada colección
        for (const collectionId of COLLECTIONS) {
            try {
                const collection = await databases.getCollection(DATABASE_ID, collectionId);
                console.log(`\n📁 ${collection.name} (${collectionId})`);
                console.log(`   Documentos habilitados: ${collection.documentSecurity ? 'Sí' : 'No'}`);
                console.log(`   Permisos actuales:`);

                if (collection.$permissions && collection.$permissions.length > 0) {
                    collection.$permissions.forEach((perm: string) => {
                        console.log(`     - ${perm}`);
                    });
                } else {
                    console.log(`     ⚠️ SIN PERMISOS CONFIGURADOS`);
                }
            } catch (error: any) {
                if (error.code === 404) {
                    console.log(`❌ ${collectionId}: No existe`);
                } else {
                    console.log(`❌ ${collectionId}: Error - ${error.message}`);
                }
            }
        }

        console.log('\n\n📋 RESUMEN:');
        console.log('Para que la app funcione, cada colección necesita estos permisos:');
        console.log('  - read("users")   → Usuarios autenticados pueden leer');
        console.log('  - create("users") → Usuarios autenticados pueden crear');
        console.log('  - update("users") → Usuarios autenticados pueden actualizar');
        console.log('  - delete("users") → Usuarios autenticados pueden eliminar');
        console.log('\nO para pruebas rápidas:');
        console.log('  - read("any"), create("any"), update("any"), delete("any")');

    } catch (error: any) {
        if (error.code === 404) {
            console.error(`❌ Base de datos '${DATABASE_ID}' no encontrada`);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

checkPermissions();
