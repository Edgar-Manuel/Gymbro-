import { databases, account } from '@/services/appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/config/appwriteSchema';
import { Query, ID } from 'appwrite';
import type {
  UserProfile,
  RutinaSemanal,
  WorkoutLog,
  Achievement,
  NutritionTracker,
  UserStatistics,
  BodyMeasurement,
  ProgressPhoto,
  ExerciseKnowledge,
} from '@/types';

/**
 * Helpers para interactuar con Appwrite Database
 * Este módulo maneja todas las operaciones de base de datos en la nube
 */

// ==================== USUARIOS ====================

export const appwriteDbHelpers = {
  /**
   * Obtener el ID del usuario autenticado actual
   */
  async getCurrentUserId(): Promise<string> {
    try {
      const user = await account.get();
      return user.$id;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil de usuario desde Appwrite
   */
  async getCurrentUser(): Promise<UserProfile | undefined> {
    try {
      const userId = await this.getCurrentUserId();
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      if (response.documents.length === 0) {
        return undefined;
      }

      const doc = response.documents[0];
      return this.mapUserDocumentToProfile(doc);
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      return undefined;
    }
  },

  /**
   * Crear o actualizar perfil de usuario
   */
  async createOrUpdateUser(user: UserProfile): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      // Buscar si ya existe un documento para este usuario
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      const userData = {
        userId,
        nombre: user.nombre,
        email: user.email || '',
        datosPersonales: JSON.stringify({
          edad: user.edad,
          peso: user.peso || user.pesoActual,
          pesoActual: user.pesoActual,
          altura: user.altura,
        }),
        configuracion: JSON.stringify({
          objetivo: user.objetivo,
          nivel: user.nivel,
          diasDisponibles: user.diasDisponibles,
          equipamiento: user.equipamiento,
        }),
        preferencias: JSON.stringify({
          preferencias: user.preferencias || {},
          restricciones: user.restricciones || [],
        }),
      };

      if (existing.documents.length > 0) {
        // Actualizar documento existente
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.USERS,
          existing.documents[0].$id,
          userData
        );
        return existing.documents[0].$id;
      } else {
        // Crear nuevo documento
        const response = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.USERS,
          ID.unique(),
          userData
        );
        return response.$id;
      }
    } catch (error) {
      console.error('Error creando/actualizando usuario:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil de usuario
   */
  async updateUser(user: UserProfile): Promise<string> {
    return await this.createOrUpdateUser(user);
  },

  // ==================== RUTINAS ====================

  /**
   * Obtener rutina activa del usuario
   */
  async getActiveRoutine(userId?: string): Promise<RutinaSemanal | undefined> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ROUTINES,
        [
          Query.equal('userId', currentUserId),
          Query.equal('activa', true),
          Query.limit(1),
        ]
      );

      if (response.documents.length === 0) {
        return undefined;
      }

      return this.mapRoutineDocumentToRutina(response.documents[0]);
    } catch (error) {
      console.error('Error obteniendo rutina activa:', error);
      return undefined;
    }
  },

  /**
   * Obtener todas las rutinas del usuario
   */
  async getUserRoutines(userId?: string): Promise<RutinaSemanal[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ROUTINES,
        [Query.equal('userId', currentUserId), Query.orderDesc('fechaCreacion')]
      );

      return response.documents.map(this.mapRoutineDocumentToRutina);
    } catch (error) {
      console.error('Error obteniendo rutinas del usuario:', error);
      return [];
    }
  },

  /**
   * Crear nueva rutina
   */
  async createRoutine(rutina: RutinaSemanal): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      // Si la rutina es activa, desactivar otras rutinas
      if (rutina.activa) {
        const activeRoutines = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.ROUTINES,
          [Query.equal('userId', userId), Query.equal('activa', true)]
        );

        for (const doc of activeRoutines.documents) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.ROUTINES,
            doc.$id,
            { activa: false }
          );
        }
      }

      const rutinaData = {
        userId,
        nombre: rutina.nombre,
        activa: rutina.activa,
        fechaCreacion: new Date().toISOString(),
        datos: JSON.stringify({
          objetivo: rutina.objetivo,
          nivel: rutina.nivel,
          diasPorSemana: rutina.diasPorSemana,
          diasRutina: rutina.diasRutina || rutina.dias,
          duracionTotal: rutina.duracionTotal,
        }),
      };

      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ROUTINES,
        ID.unique(),
        rutinaData
      );

      return response.$id;
    } catch (error) {
      console.error('Error creando rutina:', error);
      throw error;
    }
  },

  // ==================== WORKOUTS ====================

  /**
   * Obtener workouts del usuario
   */
  async getWorkoutsByUser(userId?: string, limit?: number): Promise<WorkoutLog[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const queries = [
        Query.equal('userId', currentUserId),
        Query.orderDesc('fecha'),
      ];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.WORKOUTS,
        queries
      );

      return response.documents.map(this.mapWorkoutDocumentToLog);
    } catch (error) {
      console.error('Error obteniendo workouts:', error);
      return [];
    }
  },

  /**
   * Obtener workouts por rango de fechas
   */
  async getWorkoutsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutLog[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.WORKOUTS,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('fecha', startDate.toISOString()),
          Query.lessThanEqual('fecha', endDate.toISOString()),
          Query.orderDesc('fecha'),
        ]
      );

      return response.documents.map(this.mapWorkoutDocumentToLog);
    } catch (error) {
      console.error('Error obteniendo workouts por fecha:', error);
      return [];
    }
  },

  /**
   * Registrar nuevo workout
   */
  async logWorkout(workout: WorkoutLog): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      const workoutData = {
        userId,
        fecha: workout.fecha.toISOString(),
        completado: workout.completado,
        datos: JSON.stringify({
          rutinaId: workout.rutinaId || '',
          diaRutinaId: workout.diaRutinaId || '',
          ejercicios: workout.ejercicios,
          duracion: workout.duracion || workout.duracionReal,
          notas: workout.notas || '',
          volumenTotal: workout.volumenTotal || 0,
          caloriaQuemadas: workout.caloriaQuemadas || 0,
        }),
      };

      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.WORKOUTS,
        ID.unique(),
        workoutData
      );

      // Actualizar estadísticas
      await this.updateStatisticsAfterWorkout(workout);

      return response.$id;
    } catch (error) {
      console.error('Error registrando workout:', error);
      throw error;
    }
  },

  /**
   * Actualizar workout existente
   */
  async updateWorkout(id: string, updates: Partial<WorkoutLog>): Promise<string> {
    try {
      const updateData: Record<string, any> = {};

      if (updates.ejercicios) {
        updateData.ejercicios = JSON.stringify(updates.ejercicios);
      }
      if (updates.duracion !== undefined) {
        updateData.duracion = updates.duracion;
      }
      if (updates.notas !== undefined) {
        updateData.notas = updates.notas;
      }
      if (updates.completado !== undefined) {
        updateData.completado = updates.completado;
      }
      if (updates.volumenTotal !== undefined) {
        updateData.volumenTotal = updates.volumenTotal;
      }
      if (updates.caloriaQuemadas !== undefined) {
        updateData.caloriaQuemadas = updates.caloriaQuemadas;
      }

      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.WORKOUTS,
        id,
        updateData
      );

      return id;
    } catch (error) {
      console.error('Error actualizando workout:', error);
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStatistics(userId?: string): Promise<UserStatistics | undefined> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.STATISTICS,
        [Query.equal('userId', currentUserId), Query.limit(1)]
      );

      if (response.documents.length === 0) {
        // Crear estadísticas iniciales
        return await this.createInitialStatistics(currentUserId);
      }

      return this.mapStatisticsDocumentToStats(response.documents[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return undefined;
    }
  },

  /**
   * Crear estadísticas iniciales para un usuario
   */
  async createInitialStatistics(userId: string): Promise<UserStatistics> {
    const initialStats: UserStatistics = {
      userId,
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalVolume: 0,
      totalCalories: 0,
      totalMinutes: 0,
      favoriteExercises: {},
      muscleGroupStats: {},
    };

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.STATISTICS,
        ID.unique(),
        {
          userId,
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalVolume: 0,
          totalCalories: 0,
          totalMinutes: 0,
          favoriteExercises: JSON.stringify({}),
          muscleGroupStats: JSON.stringify({}),
        }
      );
    } catch (error) {
      console.error('Error creando estadísticas iniciales:', error);
    }

    return initialStats;
  },

  /**
   * Actualizar estadísticas
   */
  async updateStatistics(stats: UserStatistics): Promise<string> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.STATISTICS,
        [Query.equal('userId', stats.userId), Query.limit(1)]
      );

      const statsData = {
        userId: stats.userId,
        datos: JSON.stringify({
          totalWorkouts: stats.totalWorkouts,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          totalVolume: stats.totalVolume,
          totalCalories: stats.totalCalories,
          totalMinutes: stats.totalMinutes,
          favoriteExercises: stats.favoriteExercises || {},
          muscleGroupStats: stats.muscleGroupStats || {},
          lastWorkoutDate: stats.lastWorkoutDate?.toISOString(),
        }),
      };

      if (response.documents.length > 0) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.STATISTICS,
          response.documents[0].$id,
          statsData
        );
        return response.documents[0].$id;
      } else {
        const newDoc = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.STATISTICS,
          ID.unique(),
          statsData
        );
        return newDoc.$id;
      }
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      throw error;
    }
  },

  /**
   * Actualizar estadísticas después de un workout
   */
  async updateStatisticsAfterWorkout(workout: WorkoutLog): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const stats = (await this.getUserStatistics(userId)) || (await this.createInitialStatistics(userId));

      stats.totalWorkouts = (stats.totalWorkouts || 0) + 1;
      stats.totalMinutes = (stats.totalMinutes || 0) + (workout.duracion || workout.duracionReal || 0);
      stats.totalVolume = (stats.totalVolume || 0) + (workout.volumenTotal || 0);
      stats.totalCalories = (stats.totalCalories || 0) + (workout.caloriaQuemadas || 0);
      stats.lastWorkoutDate = workout.fecha;

      await this.updateStatistics(stats);
    } catch (error) {
      console.error('Error actualizando estadísticas después de workout:', error);
    }
  },

  // ==================== LOGROS ====================

  /**
   * Obtener logros del usuario
   */
  async getUserAchievements(userId?: string): Promise<Achievement[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        [Query.equal('userId', currentUserId), Query.orderDesc('fecha')]
      );

      return response.documents.map(this.mapAchievementDocumentToAchievement);
    } catch (error) {
      console.error('Error obteniendo logros:', error);
      return [];
    }
  },

  /**
   * Agregar nuevo logro
   */
  async addAchievement(achievement: Achievement): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      const achievementData = {
        userId,
        tipo: achievement.tipo,
        fecha: achievement.fecha.toISOString(),
        datos: JSON.stringify({
          nombre: achievement.nombre,
          descripcion: achievement.descripcion,
          icono: achievement.icono,
          detalles: achievement.detalles || '',
        }),
      };

      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        ID.unique(),
        achievementData
      );

      return response.$id;
    } catch (error) {
      console.error('Error agregando logro:', error);
      throw error;
    }
  },

  // ==================== NUTRICIÓN ====================

  /**
   * Obtener nutrición por fecha
   */
  async getNutritionByDate(userId: string, fecha: Date): Promise<NutritionTracker | undefined> {
    try {
      const dateStr = fecha.toISOString().split('T')[0];
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.NUTRITION,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('fecha', `${dateStr}T00:00:00.000Z`),
          Query.lessThanEqual('fecha', `${dateStr}T23:59:59.999Z`),
          Query.limit(1),
        ]
      );

      if (response.documents.length === 0) {
        return undefined;
      }

      return this.mapNutritionDocumentToTracker(response.documents[0]);
    } catch (error) {
      console.error('Error obteniendo nutrición por fecha:', error);
      return undefined;
    }
  },

  /**
   * Actualizar nutrición
   */
  async updateNutrition(nutrition: NutritionTracker): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();
      const dateStr = nutrition.fecha.toISOString().split('T')[0];

      // Buscar si ya existe un registro para esta fecha
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.NUTRITION,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('fecha', `${dateStr}T00:00:00.000Z`),
          Query.lessThanEqual('fecha', `${dateStr}T23:59:59.999Z`),
          Query.limit(1),
        ]
      );

      const nutritionData = {
        userId,
        fecha: nutrition.fecha.toISOString(),
        datos: JSON.stringify({
          calorias: nutrition.calorias,
          proteinas: nutrition.proteinas,
          carbohidratos: nutrition.carbohidratos,
          grasas: nutrition.grasas,
          comidas: nutrition.comidas,
          agua: nutrition.agua || 0,
        }),
      };

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.NUTRITION,
          existing.documents[0].$id,
          nutritionData
        );
        return existing.documents[0].$id;
      } else {
        const response = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.NUTRITION,
          ID.unique(),
          nutritionData
        );
        return response.$id;
      }
    } catch (error) {
      console.error('Error actualizando nutrición:', error);
      throw error;
    }
  },

  // ==================== MEDICIONES CORPORALES ====================

  /**
   * Obtener mediciones corporales
   */
  async getBodyMeasurements(userId?: string, limit?: number): Promise<BodyMeasurement[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const queries = [Query.equal('userId', currentUserId), Query.orderDesc('fecha')];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.BODY_MEASUREMENTS,
        queries
      );

      return response.documents.map(this.mapBodyMeasurementDocumentToMeasurement);
    } catch (error) {
      console.error('Error obteniendo mediciones corporales:', error);
      return [];
    }
  },

  /**
   * Obtener última medición corporal
   */
  async getLatestBodyMeasurement(userId?: string): Promise<BodyMeasurement | undefined> {
    const measurements = await this.getBodyMeasurements(userId, 1);
    return measurements[0];
  },

  /**
   * Agregar medición corporal
   */
  async addBodyMeasurement(measurement: BodyMeasurement): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      const measurementData = {
        userId,
        fecha: measurement.fecha.toISOString(),
        peso: measurement.peso,
        datos: JSON.stringify({
          cintura: measurement.cintura,
          cadera: measurement.cadera,
          pecho: measurement.pecho,
          brazoDerecho: measurement.brazoDerecho,
          brazoIzquierdo: measurement.brazoIzquierdo,
          musloDerecho: measurement.musloDerecho,
          musloIzquierdo: measurement.musloIzquierdo,
          pantorrillaDerecha: measurement.pantorrillaDerecha,
          pantorrillaIzquierda: measurement.pantorrillaIzquierda,
          grasaCorporal: measurement.grasaCorporal,
          masaMuscular: measurement.masaMuscular,
          notas: measurement.notas || '',
        }),
      };

      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.BODY_MEASUREMENTS,
        ID.unique(),
        measurementData
      );

      return response.$id;
    } catch (error) {
      console.error('Error agregando medición corporal:', error);
      throw error;
    }
  },

  /**
   * Obtener mediciones por rango de fechas
   */
  async getBodyMeasurementsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BodyMeasurement[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.BODY_MEASUREMENTS,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('fecha', startDate.toISOString()),
          Query.lessThanEqual('fecha', endDate.toISOString()),
          Query.orderDesc('fecha'),
        ]
      );

      return response.documents.map(this.mapBodyMeasurementDocumentToMeasurement);
    } catch (error) {
      console.error('Error obteniendo mediciones por fecha:', error);
      return [];
    }
  },

  // ==================== FOTOS DE PROGRESO ====================

  /**
   * Obtener fotos de progreso
   */
  async getProgressPhotos(userId?: string, tipo?: string): Promise<ProgressPhoto[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      const queries = [Query.equal('userId', currentUserId), Query.orderDesc('fecha')];

      if (tipo) {
        queries.push(Query.equal('tipo', tipo));
      }

      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.PROGRESS_PHOTOS,
        queries
      );

      return response.documents.map(this.mapProgressPhotoDocumentToPhoto);
    } catch (error) {
      console.error('Error obteniendo fotos de progreso:', error);
      return [];
    }
  },

  /**
   * Agregar foto de progreso
   */
  async addProgressPhoto(photo: ProgressPhoto): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      const photoData = {
        userId,
        fecha: photo.fecha.toISOString(),
        tipo: photo.tipo,
        datos: JSON.stringify({
          fileId: photo.fileId,
          url: photo.url,
          peso: photo.peso,
          notas: photo.notas || '',
        }),
      };

      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.PROGRESS_PHOTOS,
        ID.unique(),
        photoData
      );

      return response.$id;
    } catch (error) {
      console.error('Error agregando foto de progreso:', error);
      throw error;
    }
  },

  /**
   * Eliminar foto de progreso
   */
  async deleteProgressPhoto(id: string): Promise<void> {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PROGRESS_PHOTOS, id);
    } catch (error) {
      console.error('Error eliminando foto de progreso:', error);
      throw error;
    }
  },

  /**
   * Obtener últimas fotos por tipo
   */
  async getLatestPhotosByType(userId?: string): Promise<Record<string, ProgressPhoto>> {
    const photos = await this.getProgressPhotos(userId);
    const photosByType: Record<string, ProgressPhoto> = {};

    for (const photo of photos) {
      if (!photosByType[photo.tipo]) {
        photosByType[photo.tipo] = photo;
      }
    }

    return photosByType;
  },

  // ==================== EJERCICIOS ====================

  /**
   * Obtener ejercicio por ID (desde IndexedDB ya que exercises es público)
   */
  async getExerciseById(id: string): Promise<ExerciseKnowledge | undefined> {
    // Los ejercicios se mantienen en IndexedDB por ahora
    // ya que son datos públicos que no cambian
    const { dbHelpers } = await import('./index');
    return dbHelpers.getExerciseById(id);
  },

  async getExercisesByMuscleGroup(grupoMuscular: string): Promise<ExerciseKnowledge[]> {
    const { dbHelpers } = await import('./index');
    return dbHelpers.getExercisesByMuscleGroup(grupoMuscular);
  },

  async getAllExercises(): Promise<ExerciseKnowledge[]> {
    const { dbHelpers } = await import('./index');
    return dbHelpers.getAllExercises();
  },

  async searchExercises(query: string): Promise<ExerciseKnowledge[]> {
    const { dbHelpers } = await import('./index');
    return dbHelpers.searchExercises(query);
  },

  // ==================== MAPPERS ====================

  /**
   * Mapear documento de Appwrite a UserProfile
   */
  mapUserDocumentToProfile(doc: any): UserProfile {
    const datosPersonales = doc.datosPersonales ? JSON.parse(doc.datosPersonales) : {};
    const configuracion = doc.configuracion ? JSON.parse(doc.configuracion) : {};
    const preferenciasData = doc.preferencias ? JSON.parse(doc.preferencias) : {};

    return {
      id: doc.userId,
      nombre: doc.nombre,
      email: doc.email,
      edad: datosPersonales.edad,
      peso: datosPersonales.peso,
      pesoActual: datosPersonales.pesoActual,
      altura: datosPersonales.altura,
      objetivo: configuracion.objetivo,
      nivel: configuracion.nivel,
      diasDisponibles: configuracion.diasDisponibles,
      equipamiento: configuracion.equipamiento,
      preferencias: preferenciasData.preferencias || {},
      restricciones: preferenciasData.restricciones || [],
    };
  },

  /**
   * Mapear documento de Appwrite a RutinaSemanal
   */
  mapRoutineDocumentToRutina(doc: any): RutinaSemanal {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      id: doc.$id,
      userId: doc.userId,
      nombre: doc.nombre,
      objetivo: datos.objetivo,
      nivel: datos.nivel,
      diasPorSemana: datos.diasPorSemana,
      diasRutina: datos.diasRutina || [],
      dias: datos.diasRutina || [], // Alias
      duracionTotal: datos.duracionTotal,
      activa: doc.activa,
      fechaCreacion: new Date(doc.fechaCreacion),
    };
  },

  /**
   * Mapear documento de Appwrite a WorkoutLog
   */
  mapWorkoutDocumentToLog(doc: any): WorkoutLog {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      id: doc.$id,
      userId: doc.userId,
      rutinaId: datos.rutinaId,
      diaRutinaId: datos.diaRutinaId,
      fecha: new Date(doc.fecha),
      ejercicios: datos.ejercicios || [],
      duracion: datos.duracion,
      duracionReal: datos.duracion, // Alias
      notas: datos.notas,
      completado: doc.completado,
      volumenTotal: datos.volumenTotal,
      caloriaQuemadas: datos.caloriaQuemadas,
    };
  },

  /**
   * Mapear documento de Appwrite a UserStatistics
   */
  mapStatisticsDocumentToStats(doc: any): UserStatistics {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      userId: doc.userId,
      totalWorkouts: datos.totalWorkouts || 0,
      currentStreak: datos.currentStreak || 0,
      longestStreak: datos.longestStreak || 0,
      totalVolume: datos.totalVolume || 0,
      totalCalories: datos.totalCalories || 0,
      totalMinutes: datos.totalMinutes || 0,
      favoriteExercises: datos.favoriteExercises || {},
      muscleGroupStats: datos.muscleGroupStats || {},
      lastWorkoutDate: datos.lastWorkoutDate ? new Date(datos.lastWorkoutDate) : undefined,
    };
  },

  /**
   * Mapear documento de Appwrite a Achievement
   */
  mapAchievementDocumentToAchievement(doc: any): Achievement {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      id: doc.$id,
      userId: doc.userId,
      tipo: doc.tipo,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      icono: datos.icono,
      fecha: new Date(doc.fecha),
      detalles: datos.detalles,
    };
  },

  /**
   * Mapear documento de Appwrite a NutritionTracker
   */
  mapNutritionDocumentToTracker(doc: any): NutritionTracker {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      userId: doc.userId,
      fecha: new Date(doc.fecha),
      calorias: datos.calorias || 0,
      proteinas: datos.proteinas || 0,
      carbohidratos: datos.carbohidratos || 0,
      grasas: datos.grasas || 0,
      comidas: datos.comidas || [],
      agua: datos.agua || 0,
    };
  },

  /**
   * Mapear documento de Appwrite a BodyMeasurement
   */
  mapBodyMeasurementDocumentToMeasurement(doc: any): BodyMeasurement {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      id: doc.$id,
      userId: doc.userId,
      fecha: new Date(doc.fecha),
      peso: doc.peso,
      cintura: datos.cintura,
      cadera: datos.cadera,
      pecho: datos.pecho,
      brazoDerecho: datos.brazoDerecho,
      brazoIzquierdo: datos.brazoIzquierdo,
      musloDerecho: datos.musloDerecho,
      musloIzquierdo: datos.musloIzquierdo,
      pantorrillaDerecha: datos.pantorrillaDerecha,
      pantorrillaIzquierda: datos.pantorrillaIzquierda,
      grasaCorporal: datos.grasaCorporal,
      masaMuscular: datos.masaMuscular,
      notas: datos.notas,
      medidas: datos, // Incluir también en formato nested para compatibilidad
    };
  },

  /**
   * Mapear documento de Appwrite a ProgressPhoto
   */
  mapProgressPhotoDocumentToPhoto(doc: any): ProgressPhoto {
    const datos = doc.datos ? JSON.parse(doc.datos) : {};

    return {
      id: doc.$id,
      userId: doc.userId,
      fecha: new Date(doc.fecha),
      tipo: doc.tipo,
      fileId: datos.fileId,
      url: datos.url,
      peso: datos.peso,
      notas: datos.notas,
    };
  },
};
