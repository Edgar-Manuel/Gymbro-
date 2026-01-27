import { Client, Users } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const users = new Users(client);

async function listUsers() {
    console.log('=== USUARIOS EN APPWRITE ===\n');

    try {
        const result = await users.list();
        console.log(`Total usuarios: ${result.total}\n`);

        for (const user of result.users) {
            console.log(`📧 ${user.email}`);
            console.log(`   Nombre: ${user.name}`);
            console.log(`   ID: ${user.$id}`);
            console.log(`   Email verificado: ${user.emailVerification ? 'Sí' : 'No'}`);
            console.log(`   Estado: ${user.status ? 'Activo' : 'Inactivo'}`);
            console.log('');
        }

        if (result.total === 0) {
            console.log('No hay usuarios registrados aún.');
            console.log('El registro desde la app no funcionó.');
        }
    } catch (error: any) {
        console.log(`Error: ${error.message}`);
    }
}

listUsers();
