import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para crear automáticamente toda la estructura de base de datos en Appwrite
 *
 * INSTRUCCIONES:
 * 1. Asegúrate de tener las variables de entorno configuradas en .env
 * 2. Ejecuta: npx tsx scripts/setup-appwrite-db.ts
 * 3. El script creará la base de datos y todas las colecciones automáticamente
 */

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'gymbro-db';

// Helper para esperar que los atributos estén disponibles
async function waitForAttributes(collectionId: string, delay = 2000) {
  console.log(`  ⏳ Esperando a que los atributos estén disponibles...`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de Appwrite Database...\n');

  try {
    // 1. La base de datos ya existe (gymbro-db)
    console.log('📁 Usando base de datos existente: gymbro-db\n');

    // 2. Crear colección Users
    console.log('👤 Creando colección Users...');
    await createUsersCollection();

    // 3. Crear colección Exercises
    console.log('💪 Creando colección Exercises...');
    await createExercisesCollection();

    // 4. Crear colección Routines
    console.log('📋 Creando colección Routines...');
    await createRoutinesCollection();

    // 5. Crear colección Workouts
    console.log('🏋️ Creando colección Workouts...');
    await createWorkoutsCollection();

    // 6. Crear colección Achievements
    console.log('🏆 Creando colección Achievements...');
    await createAchievementsCollection();

    // 7. Crear colección Nutrition
    console.log('🥗 Creando colección Nutrition...');
    await createNutritionCollection();

    // 8. Crear colección Statistics
    console.log('📊 Creando colección Statistics...');
    await createStatisticsCollection();

    // 9. Crear colección BodyMeasurements
    console.log('📏 Creando colección BodyMeasurements...');
    await createBodyMeasurementsCollection();

    // 10. Crear colección ProgressPhotos
    console.log('📸 Creando colección ProgressPhotos...');
    await createProgressPhotosCollection();

    console.log('\n✨ ¡Configuración completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve a Appwrite Console → Auth → Settings');
    console.log('2. Habilita "Email/Password" authentication');
    console.log('3. ¡Listo! Ya puedes usar la app\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response);
    }
    process.exit(1);
  }
}

async function createUsersCollection() {
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      'users',
      'Users',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    // Atributos básicos (solo los esenciales)
    await databases.createStringAttribute(DATABASE_ID, 'users', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'users', 'nombre', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'users', 'email', 255, true);

    // Datos almacenados como JSON para ahorrar atributos
    await databases.createStringAttribute(DATABASE_ID, 'users', 'datosPersonales', 10000, true); // edad, peso, altura
    await databases.createStringAttribute(DATABASE_ID, 'users', 'configuracion', 10000, true); // objetivo, nivel, diasDisponibles, equipamiento
    await databases.createStringAttribute(DATABASE_ID, 'users', 'preferencias', 10000, false); // preferencias y restricciones

    // Indexes
    await databases.createIndex(DATABASE_ID, 'users', 'userId_idx', 'unique', ['userId']);
    await databases.createIndex(DATABASE_ID, 'users', 'email_idx', 'unique', ['email']);

    console.log('  ✅ Users creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Users ya existe');
    else throw error;
  }
}

async function createExercisesCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'exercises',
      'Exercises',
      [
        Permission.read(Role.any()),
        Permission.write(Role.label('admin'))
      ]
    );

    // Atributos principales
    await databases.createStringAttribute(DATABASE_ID, 'exercises', 'nombre', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'exercises', 'grupoMuscular', 100, true);
    await databases.createStringAttribute(DATABASE_ID, 'exercises', 'categoria', 100, true);
    await databases.createStringAttribute(DATABASE_ID, 'exercises', 'tier', 50, true);

    // Todo lo demás en JSON
    await databases.createStringAttribute(DATABASE_ID, 'exercises', 'datos', 65000, true); // descripcion, instrucciones, musculos, etc.

    // Esperar a que los atributos estén disponibles
    await waitForAttributes('exercises');

    await databases.createIndex(DATABASE_ID, 'exercises', 'grupoMuscular_idx', 'key', ['grupoMuscular']);
    await databases.createIndex(DATABASE_ID, 'exercises', 'tier_idx', 'key', ['tier']);
    await databases.createIndex(DATABASE_ID, 'exercises', 'categoria_idx', 'key', ['categoria']);

    console.log('  ✅ Exercises creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Exercises ya existe');
    else throw error;
  }
}

async function createRoutinesCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'routines',
      'Routines',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'routines', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'routines', 'nombre', 255, true);
    await databases.createBooleanAttribute(DATABASE_ID, 'routines', 'activa', false); // No default value, optional
    await databases.createDatetimeAttribute(DATABASE_ID, 'routines', 'fechaCreacion', true);
    await databases.createStringAttribute(DATABASE_ID, 'routines', 'datos', 65000, true); // objetivo, nivel, dias, duracion

    await waitForAttributes('routines');

    await databases.createIndex(DATABASE_ID, 'routines', 'userId_idx', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, 'routines', 'activa_idx', 'key', ['activa']);

    console.log('  ✅ Routines creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Routines ya existe');
    else throw error;
  }
}

async function createWorkoutsCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'workouts',
      'Workouts',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'workouts', 'userId', 255, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'workouts', 'fecha', true);
    await databases.createBooleanAttribute(DATABASE_ID, 'workouts', 'completado', true);
    await databases.createStringAttribute(DATABASE_ID, 'workouts', 'datos', 65000, true); // rutinaId, diaRutinaId, ejercicios, duracion, notas, etc.

    await waitForAttributes('workouts');

    await databases.createIndex(DATABASE_ID, 'workouts', 'userId_idx', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, 'workouts', 'fecha_idx', 'key', ['fecha']);
    await databases.createIndex(DATABASE_ID, 'workouts', 'completado_idx', 'key', ['completado']);

    console.log('  ✅ Workouts creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Workouts ya existe');
    else throw error;
  }
}

async function createAchievementsCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'achievements',
      'Achievements',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'achievements', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'achievements', 'tipo', 100, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'achievements', 'fecha', true);
    await databases.createStringAttribute(DATABASE_ID, 'achievements', 'datos', 10000, true); // nombre, descripcion, icono, detalles

    await waitForAttributes('achievements');

    await databases.createIndex(DATABASE_ID, 'achievements', 'userId_idx', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, 'achievements', 'tipo_idx', 'key', ['tipo']);
    await databases.createIndex(DATABASE_ID, 'achievements', 'fecha_idx', 'key', ['fecha']);

    console.log('  ✅ Achievements creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Achievements ya existe');
    else throw error;
  }
}

async function createNutritionCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'nutrition',
      'Nutrition',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'nutrition', 'userId', 255, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'nutrition', 'fecha', true);
    await databases.createStringAttribute(DATABASE_ID, 'nutrition', 'datos', 65000, true); // calorias, proteinas, carbohidratos, grasas, comidas, agua

    await waitForAttributes('nutrition');

    await databases.createIndex(DATABASE_ID, 'nutrition', 'userId_fecha_idx', 'unique', ['userId', 'fecha']);

    console.log('  ✅ Nutrition creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Nutrition ya existe');
    else throw error;
  }
}

async function createStatisticsCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'statistics',
      'Statistics',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'statistics', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'statistics', 'datos', 65000, true); // todos los stats

    await waitForAttributes('statistics');

    await databases.createIndex(DATABASE_ID, 'statistics', 'userId_idx', 'unique', ['userId']);

    console.log('  ✅ Statistics creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  Statistics ya existe');
    else throw error;
  }
}

async function createBodyMeasurementsCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'bodyMeasurements',
      'BodyMeasurements',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'bodyMeasurements', 'userId', 255, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'bodyMeasurements', 'fecha', true);
    await databases.createFloatAttribute(DATABASE_ID, 'bodyMeasurements', 'peso', true);
    await databases.createStringAttribute(DATABASE_ID, 'bodyMeasurements', 'datos', 10000, false); // todas las medidas y notas

    await waitForAttributes('bodyMeasurements');

    await databases.createIndex(DATABASE_ID, 'bodyMeasurements', 'userId_idx', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, 'bodyMeasurements', 'fecha_idx', 'key', ['fecha']);

    console.log('  ✅ BodyMeasurements creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  BodyMeasurements ya existe');
    else throw error;
  }
}

async function createProgressPhotosCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      'progressPhotos',
      'ProgressPhotos',
      [
        Permission.read(Role.user('USER_ID')),
        Permission.write(Role.user('USER_ID'))
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'progressPhotos', 'userId', 255, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'progressPhotos', 'fecha', true);
    await databases.createStringAttribute(DATABASE_ID, 'progressPhotos', 'tipo', 50, true);
    await databases.createStringAttribute(DATABASE_ID, 'progressPhotos', 'datos', 10000, true); // fileId, url, peso, notas

    await waitForAttributes('progressPhotos');

    await databases.createIndex(DATABASE_ID, 'progressPhotos', 'userId_idx', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, 'progressPhotos', 'fecha_idx', 'key', ['fecha']);
    await databases.createIndex(DATABASE_ID, 'progressPhotos', 'tipo_idx', 'key', ['tipo']);

    console.log('  ✅ ProgressPhotos creada');
  } catch (error: any) {
    if (error.code === 409) console.log('  ℹ️  ProgressPhotos ya existe');
    else throw error;
  }
}

// Ejecutar el script
setupDatabase();
