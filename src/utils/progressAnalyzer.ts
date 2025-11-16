import type {
  WorkoutLog,
  ExerciseLog,
  ProgressAnalysis,
  RecomendacionProgresion,
  ExerciseKnowledge,
  ProgressDataPoint
} from '@/types';
import { format, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Calcula la próxima carga recomendada basada en RIR y progresión
 */
export function calcularProximaCarga(
  historialEjercicios: ExerciseLog[],
  ejercicio: ExerciseKnowledge
): {
  accion: RecomendacionProgresion;
  nuevoPeso?: number;
  objetivoReps?: number;
  mensaje: string;
} {
  if (historialEjercicios.length === 0) {
    return {
      accion: 'mantener',
      mensaje: 'Primera vez realizando este ejercicio. Establece una base.'
    };
  }

  const ultimaSesion = historialEjercicios[historialEjercicios.length - 1];

  // Calcular RIR promedio de la última sesión
  const rirPromedio = ultimaSesion.series.reduce((sum, s) => sum + s.RIR, 0) / ultimaSesion.series.length;

  // Calcular peso promedio y reps promedio
  const pesoPromedio = ultimaSesion.series.reduce((sum, s) => sum + s.peso, 0) / ultimaSesion.series.length;
  const repsPromedio = Math.round(ultimaSesion.series.reduce((sum, s) => sum + s.repeticiones, 0) / ultimaSesion.series.length);

  // Determinar incremento según tipo de ejercicio
  const incremento = ejercicio.categoria === 'compuesto' ? 2.5 : 1.25;

  // RIR 0-1: Muy cerca del fallo, subir peso
  if (rirPromedio <= 1.5) {
    return {
      accion: 'subir_peso',
      nuevoPeso: pesoPromedio + incremento,
      mensaje: `¡Excelente! Sube a ${(pesoPromedio + incremento).toFixed(2)}kg la próxima vez`
    };
  }

  // RIR > 3: Demasiado fácil, subir peso agresivamente
  if (rirPromedio > 3) {
    return {
      accion: 'subir_peso',
      nuevoPeso: pesoPromedio + (incremento * 2),
      mensaje: `El peso es demasiado ligero. Sube más agresivamente a ${(pesoPromedio + incremento * 2).toFixed(2)}kg`
    };
  }

  // RIR 2-3: Rango ideal, intentar subir reps
  if (repsPromedio < 12) { // Asumiendo rango de hipertrofia
    return {
      accion: 'subir_reps',
      objetivoReps: repsPromedio + 1,
      mensaje: `Buen RIR. Intenta llegar a ${repsPromedio + 1} reps manteniendo el peso`
    };
  }

  // Si ya está en reps altas con buen RIR, subir peso
  return {
    accion: 'subir_peso',
    nuevoPeso: pesoPromedio + incremento,
    mensaje: `Has progresado bien. Sube a ${(pesoPromedio + incremento).toFixed(2)}kg y vuelve a reps más bajas`
  };
}

/**
 * Analiza el progreso de un ejercicio específico
 */
export function analizarProgresoEjercicio(
  ejercicioId: string,
  todosWorkouts: WorkoutLog[],
  ejercicio: ExerciseKnowledge
): ProgressAnalysis {
  // Filtrar solo los logs de este ejercicio
  const logsEjercicio: ExerciseLog[] = [];

  todosWorkouts.forEach(workout => {
    const log = workout.ejercicios.find(e => e.ejercicioId === ejercicioId);
    if (log) {
      logsEjercicio.push(log);
    }
  });

  // Calcular volumen por semana
  const ahora = new Date();
  const hace1Semana = subWeeks(ahora, 1);

  const volumenSemanaActual = calcularVolumenEnRango(logsEjercicio, hace1Semana, ahora);
  const volumenSemanaAnterior = calcularVolumenEnRango(logsEjercicio, subWeeks(hace1Semana, 1), hace1Semana);

  const cambioVolumen = volumenSemanaAnterior > 0
    ? ((volumenSemanaActual - volumenSemanaAnterior) / volumenSemanaAnterior) * 100
    : 0;

  // Calcular peso máximo
  const pesoMaximoActual = logsEjercicio.length > 0
    ? Math.max(...logsEjercicio[logsEjercicio.length - 1].series.map(s => s.peso))
    : 0;

  const logsHace4Semanas = logsEjercicio.filter(() => {
    // Necesitaríamos la fecha del workout para esto
    // Por ahora usamos los primeros logs
    return true;
  });

  const pesoMaximoHace4Semanas = logsHace4Semanas.length > 0 && logsHace4Semanas[0]
    ? Math.max(...logsHace4Semanas[0].series.map(s => s.peso))
    : pesoMaximoActual;

  const cambioPeso = pesoMaximoHace4Semanas > 0
    ? pesoMaximoActual - pesoMaximoHace4Semanas
    : 0;

  // Obtener recomendación
  const { accion, nuevoPeso, objetivoReps } = calcularProximaCarga(logsEjercicio, ejercicio);

  const proximoObjetivo = nuevoPeso
    ? `${ejercicio.nombre}: ${nuevoPeso}kg`
    : objetivoReps
      ? `${ejercicio.nombre}: ${objetivoReps} reps`
      : 'Mantén el peso y reps actual';

  return {
    ejercicioId,
    nombre: ejercicio.nombre,
    volumenTotal: {
      semanaActual: volumenSemanaActual,
      semanaAnterior: volumenSemanaAnterior,
      cambio: cambioVolumen
    },
    pesoMaximo: {
      actual: pesoMaximoActual,
      hace4Semanas: pesoMaximoHace4Semanas,
      cambio: cambioPeso
    },
    recomendacion: accion,
    proximoObjetivo
  };
}

/**
 * Calcula el volumen total (kg × reps) en un rango de fechas
 */
function calcularVolumenEnRango(logs: ExerciseLog[], _desde: Date, _hasta: Date): number {
  // Por ahora calculamos todo el volumen
  // En producción filtraríamos por fechas del workout
  return logs.reduce((total, log) => {
    return total + log.series.reduce((sum, serie) => {
      return sum + (serie.peso * serie.repeticiones);
    }, 0);
  }, 0);
}

/**
 * Genera datos para gráficos de progreso
 */
export function generarDatosGrafico(
  ejercicioId: string,
  todosWorkouts: WorkoutLog[]
): ProgressDataPoint[] {
  const datos: ProgressDataPoint[] = [];
  const workoutsConEjercicio = todosWorkouts.filter(w =>
    w.ejercicios.some(e => e.ejercicioId === ejercicioId)
  );

  workoutsConEjercicio.forEach(workout => {
    const ejercicioLog = workout.ejercicios.find(e => e.ejercicioId === ejercicioId);
    if (!ejercicioLog) return;

    const pesoMaximo = Math.max(...ejercicioLog.series.map(s => s.peso));
    const volumenTotal = ejercicioLog.series.reduce((sum, s) => sum + (s.peso * s.repeticiones), 0);
    const repsPromedio = ejercicioLog.series.reduce((sum, s) => sum + s.repeticiones, 0) / ejercicioLog.series.length;

    datos.push({
      semana: format(workout.fecha, 'dd MMM', { locale: es }),
      fecha: workout.fecha,
      pesoMaximo,
      volumenTotal,
      repeticionesPromedio: Math.round(repsPromedio)
    });
  });

  return datos;
}

/**
 * Detecta si se necesita un deload (descanso activo)
 */
export function detectarNecesidadDeload(
  todosWorkouts: WorkoutLog[],
  semanas: number = 4
): { necesitaDeload: boolean; razon: string } {
  if (todosWorkouts.length < semanas) {
    return {
      necesitaDeload: false,
      razon: 'No hay suficiente historial'
    };
  }

  const ultimosWorkouts = todosWorkouts.slice(-semanas);

  // Calcular sensación general promedio
  const sensacionPromedio = ultimosWorkouts.reduce((sum, w) => sum + w.sensacionGeneral, 0) / ultimosWorkouts.length;

  // Si la sensación general ha bajado consistentemente
  if (sensacionPromedio < 2.5) {
    return {
      necesitaDeload: true,
      razon: 'Sensación general baja. Considera una semana de deload con 60% del peso habitual.'
    };
  }

  // Detectar caída en rendimiento
  // (esto requeriría análisis más complejo del volumen y peso)

  return {
    necesitaDeload: false,
    razon: 'Progresión normal'
  };
}

/**
 * Calcula estadísticas generales de progreso
 */
export function calcularEstadisticasGenerales(todosWorkouts: WorkoutLog[]): {
  volumenTotalMovido: number;
  volumenPromedioPorSesion: number;
  ejercicioMasRealizado: string | null;
  mejorRacha: number;
} {
  const volumenTotal = todosWorkouts.reduce((total, workout) => {
    return total + workout.ejercicios.reduce((sum, ej) => {
      return sum + ej.series.reduce((s, serie) => s + (serie.peso * serie.repeticiones), 0);
    }, 0);
  }, 0);

  const volumenPromedio = todosWorkouts.length > 0
    ? volumenTotal / todosWorkouts.length
    : 0;

  // Contar frecuencia de ejercicios
  const frecuenciaEjercicios = new Map<string, number>();
  todosWorkouts.forEach(workout => {
    workout.ejercicios.forEach(ej => {
      const count = frecuenciaEjercicios.get(ej.ejercicioId) || 0;
      frecuenciaEjercicios.set(ej.ejercicioId, count + 1);
    });
  });

  let ejercicioMasRealizado: string | null = null;
  let maxFrecuencia = 0;
  frecuenciaEjercicios.forEach((count, ejercicioId) => {
    if (count > maxFrecuencia) {
      maxFrecuencia = count;
      ejercicioMasRealizado = ejercicioId;
    }
  });

  // Calcular mejor racha (días consecutivos)
  // Por ahora retornamos un valor placeholder
  const mejorRacha = todosWorkouts.length;

  return {
    volumenTotalMovido: volumenTotal,
    volumenPromedioPorSesion: volumenPromedio,
    ejercicioMasRealizado,
    mejorRacha
  };
}

/**
 * Sugiere peso inicial para un ejercicio nuevo
 */
export function sugerirPesoInicial(
  ejercicio: ExerciseKnowledge,
  nivel: 'principiante' | 'intermedio' | 'avanzado',
  pesoCorpora: number
): number {
  // Porcentajes aproximados del peso corporal
  const porcentajes = {
    principiante: {
      compuesto: 0.5,
      aislamiento: 0.2
    },
    intermedio: {
      compuesto: 0.75,
      aislamiento: 0.3
    },
    avanzado: {
      compuesto: 1.0,
      aislamiento: 0.4
    }
  };

  const porcentaje = porcentajes[nivel][ejercicio.categoria];
  const pesoBase = pesoCorpora * porcentaje;

  // Redondear a incrementos de 2.5kg
  return Math.round(pesoBase / 2.5) * 2.5;
}
