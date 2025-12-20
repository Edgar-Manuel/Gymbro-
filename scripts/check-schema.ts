import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'gymbro-db';

async function checkSchema() {
    console.log('🔍 Verificando esquema de colección users...\n');

    try {
        const attributes = await databases.listAttributes(DATABASE_ID, 'users');

        console.log('Atributos en la colección users:');
        for (const attr of attributes.attributes) {
            const a = attr as any;
            console.log(`  - ${a.key}: ${a.type} (required: ${a.required})`);
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkSchema();
