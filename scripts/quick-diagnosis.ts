import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.VITE_APPWRITE_ENDPOINT || '';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

console.log('=== DIAGNÓSTICO APPWRITE ===\n');
console.log(`Endpoint: ${endpoint}`);
console.log(`Project ID: ${projectId}`);
console.log(`API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'NO CONFIGURADA'}\n`);

if (!apiKey || apiKey.length < 50) {
    console.log('❌ API Key no válida');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);

async function main() {
    try {
        // 1. Verificar base de datos
        console.log('1. Verificando base de datos...');
        const db = await databases.get('gymbro-db');
        console.log(`   ✅ BD encontrada: ${db.name}\n`);

        // 2. Listar colecciones
        console.log('2. Verificando colecciones...');
        const collections = await databases.listCollections('gymbro-db');
        console.log(`   Encontradas: ${collections.total} colecciones`);

        for (const col of collections.collections) {
            const perms = col.$permissions?.length || 0;
            console.log(`   - ${col.$id}: ${perms} permisos`);
        }

        // 3. Verificar permisos de users
        console.log('\n3. Permisos de colección "users":');
        try {
            const usersCol = await databases.getCollection('gymbro-db', 'users');
            if (usersCol.$permissions?.length) {
                usersCol.$permissions.forEach(p => console.log(`   ${p}`));
            } else {
                console.log('   ⚠️ SIN PERMISOS - Los usuarios no podrán crear cuentas');
            }
        } catch (e: any) {
            console.log(`   ❌ Colección "users" no existe: ${e.message}`);
        }

        // 4. Verificar permisos de statistics
        console.log('\n4. Permisos de colección "statistics":');
        try {
            const statsCol = await databases.getCollection('gymbro-db', 'statistics');
            if (statsCol.$permissions?.length) {
                statsCol.$permissions.forEach(p => console.log(`   ${p}`));
            } else {
                console.log('   ⚠️ SIN PERMISOS');
            }
        } catch (e: any) {
            console.log(`   ❌ Colección no existe: ${e.message}`);
        }

        console.log('\n=== FIN DIAGNÓSTICO ===');

    } catch (error: any) {
        console.log(`\n❌ ERROR: ${error.message}`);
        if (error.code === 404) {
            console.log('   La base de datos "gymbro-db" no existe.');
            console.log('   Ejecuta: npx tsx scripts/setup-appwrite-db.ts');
        }
    }
}

main();
