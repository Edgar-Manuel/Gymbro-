import { db, dbHelpers } from '@/db';
import { GymRepository } from '@/db/repositories/GymRepository';
import { exercisesData } from '@/data/exercises';
import type { UserProfile, UserStatistics } from '@/types';

// Flag para evitar inicialización múltiple (React StrictMode ejecuta efectos 2 veces)
let isInitializing = false;
let isInitialized = false;

export async function initializeDatabase() {
  // Evitar ejecución múltiple
  if (isInitializing || isInitialized) {
    return true;
  }
  isInitializing = true;

  try {
    // Verificar si ya hay datos
    const existingExercises = await db.exercises.count();

    if (existingExercises === 0) {
      console.log('Poblando base de datos con ejercicios...');
      await dbHelpers.bulkAddExercises(exercisesData);
      console.log(`✅ ${exercisesData.length} ejercicios agregados`);
    } else if (existingExercises !== exercisesData.length) {
      // Si el número de ejercicios no coincide, actualizar la base de datos
      console.log(`⚠️ La base de datos tiene ${existingExercises} ejercicios pero debería tener ${exercisesData.length}`);
      console.log('Sincronizando base de datos...');

      // Limpiar y volver a cargar todos los ejercicios
      await db.exercises.clear();
      await dbHelpers.bulkAddExercises(exercisesData);
      console.log(`✅ Base de datos sincronizada: ${exercisesData.length} ejercicios cargados`);
    } else {
      console.log(`✅ Base de datos ya contiene ${existingExercises} ejercicios`);
    }

    // Verificar usuario
    const currentUser = await dbHelpers.getCurrentUser();
    if (!currentUser) {
      console.log('Creando usuario por defecto...');
      const defaultUser: UserProfile = {
        id: 'user-1',
        nombre: 'Usuario GymBro',
        nivel: 'principiante',
        objetivo: 'hipertrofia',
        diasDisponibles: 4,
        equipamiento: ['barra', 'mancuerna', 'maquina', 'polea'],
        lesiones: [],
        tiempoSesion: 60,
        pesoActual: 70,
        altura: 175,
        edad: 25,
        sexo: 'masculino',
        objetivoCalorico: 'superavit',
        factorActividad: 1.5,
        notificacionesActivas: true,
        fechaInicio: new Date(),
        pesoInicial: 70,
        rachaActual: 0
      };
      await dbHelpers.createOrUpdateUser(defaultUser);

      // Crear estadísticas iniciales
      const initialStats: UserStatistics = {
        userId: 'user-1',
        totalEntrenamientos: 0,
        rachaActual: 0,
        rachaMasLarga: 0,
        volumenTotalMovido: 0,
        volumenEsteMes: 0,
        progresoGeneral: 0
      };
      await dbHelpers.updateStatistics(initialStats);

      console.log('✅ Usuario por defecto creado');
    }

    // Fix any gyms stuck in pending sync (local-only table, no Appwrite collection)
    await GymRepository.fixPendingGyms();

    isInitialized = true;
    isInitializing = false;
    return true;
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    isInitializing = false;
    return false;
  }
}

export async function resetDatabase() {
  try {
    // Resetear flags para permitir reinicialización
    isInitialized = false;
    isInitializing = false;

    await dbHelpers.clearAllData();
    await initializeDatabase();
    console.log('✅ Base de datos reiniciada');
    return true;
  } catch (error) {
    console.error('Error reiniciando base de datos:', error);
    return false;
  }
}
