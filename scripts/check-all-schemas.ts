import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const collections = ['users', 'routines', 'workouts', 'statistics', 'achievements', 'nutrition', 'bodyMeasurements', 'progressPhotos', 'exercises'];

async function checkAllSchemas() {
    console.log('=== ESQUEMAS DE TODAS LAS COLECCIONES ===\n');

    for (const col of collections) {
        try {
            const attrs = await databases.listAttributes('gymbro-db', col);
            console.log(`\n📁 ${col.toUpperCase()} (${attrs.total} atributos):`);
            for (const a of attrs.attributes as any[]) {
                const req = a.required ? '✓' : '○';
                console.log(`   ${req} ${a.key}: ${a.type}${a.array ? '[]' : ''}`);
            }
        } catch (e: any) {
            console.log(`\n❌ ${col}: ${e.message}`);
        }
    }
}

checkAllSchemas();
