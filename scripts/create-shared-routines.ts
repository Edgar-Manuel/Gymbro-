import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'gymbro-db';

async function createSharedRoutinesCollection() {
  console.log('🔗 Creando colección shared_routines...\n');

  try {
    await databases.createCollection(
      DATABASE_ID,
      'shared_routines',
      'SharedRoutines',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('  ✅ Colección creada');

    await databases.createStringAttribute(DATABASE_ID, 'shared_routines', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'shared_routines', 'userName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'shared_routines', 'routineId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'shared_routines', 'slug', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'shared_routines', 'nombre', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'shared_routines', 'datos', 65000, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'shared_routines', 'createdAt', true);
    console.log('  ✅ Atributos creados');

    // Esperar a que los atributos estén disponibles antes de crear índices
    console.log('  ⏳ Esperando disponibilidad de atributos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await databases.createIndex(DATABASE_ID, 'shared_routines', 'slug_idx', 'unique', ['slug']);
    await databases.createIndex(DATABASE_ID, 'shared_routines', 'userId_idx', 'key', ['userId']);
    console.log('  ✅ Índices creados');

    console.log('\n✨ ¡Colección shared_routines lista!');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('  ℹ️  La colección shared_routines ya existe');
    } else {
      console.error('❌ Error:', error.message);
      if (error.response) console.error('Detalles:', error.response);
      process.exit(1);
    }
  }
}

createSharedRoutinesCollection();
