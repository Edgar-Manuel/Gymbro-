import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'gymbro-db';

async function addMissingAttributes() {
    console.log('🔧 Añadiendo atributos faltantes a las colecciones...\n');

    // ROUTINES - faltan: activa, fechaCreacion, datos
    console.log('📁 Routines:');
    try {
        await databases.createBooleanAttribute(DATABASE_ID, 'routines', 'activa', false);
        console.log('   ✅ activa añadido');
    } catch (e: any) {
        console.log('   ⚠️ activa:', e.message.includes('already exists') ? 'ya existe' : e.message);
    }

    try {
        await databases.createDatetimeAttribute(DATABASE_ID, 'routines', 'fechaCreacion', true);
        console.log('   ✅ fechaCreacion añadido');
    } catch (e: any) {
        console.log('   ⚠️ fechaCreacion:', e.message.includes('already exists') ? 'ya existe' : e.message);
    }

    try {
        await databases.createStringAttribute(DATABASE_ID, 'routines', 'datos', 65535, true);
        console.log('   ✅ datos añadido');
    } catch (e: any) {
        console.log('   ⚠️ datos:', e.message.includes('already exists') ? 'ya existe' : e.message);
    }

    console.log('\n✨ Proceso completado');
    console.log('⚠️ IMPORTANTE: Espera 30 segundos antes de probar - Appwrite necesita tiempo para crear los atributos');
}

addMissingAttributes();
