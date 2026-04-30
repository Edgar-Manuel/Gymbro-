import type {
  WorkoutLog,
  ExerciseLog,
  ProgressAnalysis,
  RecomendacionProgresion,
  ExerciseKnowledge,
  ProgressDataPoint
} from '@/types';
import { format, subWeeks, differenceInCalendarDays, startOfWeek, differenceInWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Helpers ───────────────────────────────────────────────

/** Epley formula: 1RM = peso × (1 + reps / 30) */
export function calcular1RM(peso: number, reps: number): number {
  if (reps <= 0 || peso <= 0) return 0;
  if (reps === 1) return peso;
  return peso * (1 + reps / 30);
}

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

// ─── BUG FIX B: Volume per week using WorkoutLog dates ─────

/**
 * Calcula el volumen total (kg × reps) de un ejercicio filtrado por rango de fechas
 * usando la fecha del WorkoutLog (no del ExerciseLog, que no tiene fecha propia).
 */
function calcularVolumenPorSemana(
  ejercicioId: string,
  workouts: WorkoutLog[],
  desde: Date,
  hasta: Date
): number {
  return workouts
    .filter(w => {
      const f = new Date(w.fecha);
      return f >= desde && f < hasta;
    })
    .reduce((total, w) => {
      const log = w.ejercicios.find(e => e.ejercicioId === ejercicioId);
      if (!log) return total;
      return total + log.series.reduce((s, serie) => s + serie.peso * serie.repeticiones, 0);
    }, 0);
}

// ─── BUG FIX C: Real "4 weeks ago" weight ──────────────────

function obtenerPesoMaximoEnRango(
  ejercicioId: string,
  workouts: WorkoutLog[],
  desde: Date,
  hasta: Date
): number | null {
  let maxPeso: number | null = null;

  for (const w of workouts) {
    const f = new Date(w.fecha);
    if (f < desde || f >= hasta) continue;
    const log = w.ejercicios.find(e => e.ejercicioId === ejercicioId);
    if (!log) continue;
    for (const s of log.series) {
      if (maxPeso === null || s.peso > maxPeso) maxPeso = s.peso;
    }
  }
  return maxPeso;
}

/**
 * Analiza el progreso de un ejercicio específico
 */
export function analizarProgresoEjercicio(
  ejercicioId: string,
  todosWorkouts: WorkoutLog[],
  ejercicio: ExerciseKnowledge
): ProgressAnalysis {
  // Filtrar solo los logs de este ejercicio (para recomendación)
  const logsEjercicio: ExerciseLog[] = [];
  const workoutsConEjercicio: WorkoutLog[] = [];

  todosWorkouts.forEach(workout => {
    const log = workout.ejercicios.find(e => e.ejercicioId === ejercicioId);
    if (log) {
      logsEjercicio.push(log);
      workoutsConEjercicio.push(workout);
    }
  });

  // ─── BUG FIX B: Volume using workout dates ───
  const ahora = new Date();
  const hace1Semana = subWeeks(ahora, 1);
  const hace2Semanas = subWeeks(ahora, 2);

  const volumenSemanaActual = calcularVolumenPorSemana(ejercicioId, todosWorkouts, hace1Semana, ahora);
  const volumenSemanaAnterior = calcularVolumenPorSemana(ejercicioId, todosWorkouts, hace2Semanas, hace1Semana);

  const cambioVolumen = volumenSemanaAnterior > 0
    ? ((volumenSemanaActual - volumenSemanaAnterior) / volumenSemanaAnterior) * 100
    : 0;

  // Peso máximo actual (última sesión)
  const pesoMaximoActual = logsEjercicio.length > 0
    ? Math.max(...logsEjercicio[logsEjercicio.length - 1].series.map(s => s.peso))
    : 0;

  // ─── BUG FIX C: Real "4 weeks ago" peso ───
  const hace5Semanas = subWeeks(ahora, 5);
  const hace3Semanas = subWeeks(ahora, 3);

  let pesoMaximoHace4Semanas = obtenerPesoMaximoEnRango(ejercicioId, todosWorkouts, hace5Semanas, hace3Semanas);

  // Fallback: oldest available before 3 weeks
  if (pesoMaximoHace4Semanas === null) {
    const sorted = workoutsConEjercicio
      .filter(w => new Date(w.fecha) < hace3Semanas)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    if (sorted.length > 0) {
      const log = sorted[0].ejercicios.find(e => e.ejercicioId === ejercicioId);
      pesoMaximoHace4Semanas = log ? Math.max(...log.series.map(s => s.peso)) : pesoMaximoActual;
    } else {
      pesoMaximoHace4Semanas = pesoMaximoActual;
    }
  }

  const cambioPeso = pesoMaximoHace4Semanas > 0
    ? pesoMaximoActual - pesoMaximoHace4Semanas
    : 0;

  // 1RM estimation (Epley)
  const ultima = logsEjercicio.length > 0 ? logsEjercicio[logsEjercicio.length - 1] : null;
  const best1RMActual = ultima
    ? Math.max(...ultima.series.map(s => calcular1RM(s.peso, s.repeticiones)))
    : 0;

  const primera = logsEjercicio.length > 0 ? logsEjercicio[0] : null;
  const best1RMAntiguo = primera
    ? Math.max(...primera.series.map(s => calcular1RM(s.peso, s.repeticiones)))
    : 0;

  const cambio1RM = best1RMAntiguo > 0
    ? ((best1RMActual - best1RMAntiguo) / best1RMAntiguo) * 100
    : 0;

  // Session & frequency
  const sesionesTotales = workoutsConEjercicio.length;
  let frecuenciaSemanal = 0;
  if (workoutsConEjercicio.length >= 2) {
    const fechas = workoutsConEjercicio.map(w => new Date(w.fecha).getTime()).sort((a, b) => a - b);
    const spanWeeks = Math.max(1, differenceInWeeks(new Date(fechas[fechas.length - 1]), new Date(fechas[0])) + 1);
    frecuenciaSemanal = parseFloat((sesionesTotales / spanWeeks).toFixed(1));
  } else if (workoutsConEjercicio.length === 1) {
    frecuenciaSemanal = 1;
  }

  // Intensidad promedio (% of 1RM)
  let intensidadPromedio: number | undefined;
  if (ultima && best1RMActual > 0) {
    const avgPeso = ultima.series.reduce((s, serie) => s + serie.peso, 0) / ultima.series.length;
    intensidadPromedio = parseFloat(((avgPeso / best1RMActual) * 100).toFixed(1));
  }

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
    proximoObjetivo,
    estimacion1RM: {
      actual: parseFloat(best1RMActual.toFixed(1)),
      hace4Semanas: parseFloat(best1RMAntiguo.toFixed(1)),
      cambio: parseFloat(cambio1RM.toFixed(1))
    },
    sesionesTotales,
    frecuenciaSemanal,
    intensidadPromedio
  };
}

/**
 * Genera datos para gráficos de progreso
 */
export function generarDatosGrafico(
  ejercicioId: string,
  todosWorkouts: WorkoutLog[],
  desde?: Date,
  hasta?: Date
): ProgressDataPoint[] {
  const datos: ProgressDataPoint[] = [];
  let workoutsConEjercicio = todosWorkouts.filter(w =>
    w.ejercicios.some(e => e.ejercicioId === ejercicioId)
  );

  // Apply date filter
  if (desde) {
    workoutsConEjercicio = workoutsConEjercicio.filter(w => new Date(w.fecha) >= desde);
  }
  if (hasta) {
    workoutsConEjercicio = workoutsConEjercicio.filter(w => new Date(w.fecha) <= hasta);
  }

  workoutsConEjercicio.forEach(workout => {
    const ejercicioLog = workout.ejercicios.find(e => e.ejercicioId === ejercicioId);
    if (!ejercicioLog) return;

    const pesoMaximo = Math.max(...ejercicioLog.series.map(s => s.peso));
    const volumenTotal = ejercicioLog.series.reduce((sum, s) => sum + (s.peso * s.repeticiones), 0);
    const repsPromedio = ejercicioLog.series.reduce((sum, s) => sum + s.repeticiones, 0) / ejercicioLog.series.length;
    const best1RM = Math.max(...ejercicioLog.series.map(s => calcular1RM(s.peso, s.repeticiones)));

    datos.push({
      semana: format(workout.fecha, 'dd MMM', { locale: es }),
      fecha: workout.fecha,
      pesoMaximo,
      volumenTotal,
      repeticionesPromedio: Math.round(repsPromedio),
      estimated1RM: parseFloat(best1RM.toFixed(1)),
      numSeries: ejercicioLog.series.length
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
  const sensacionPromedio = ultimosWorkouts.reduce((sum, w) => sum + (w.sensacionGeneral ?? 3), 0) / ultimosWorkouts.length;

  // Si la sensación general ha bajado consistentemente
  if (sensacionPromedio < 2.5) {
    return {
      necesitaDeload: true,
      razon: 'Sensación general baja en tus últimas sesiones. Considera una semana de deload con 60% del peso habitual.'
    };
  }

  return {
    necesitaDeload: false,
    razon: 'Progresión normal'
  };
}

// ─── BUG FIX A: Real streak calculation ────────────────────

function calcularRachas(workouts: WorkoutLog[]): { mejorRacha: number; rachaActual: number } {
  if (workouts.length === 0) return { mejorRacha: 0, rachaActual: 0 };

  // Unique training days sorted ASC
  const diasUnicos = Array.from(
    new Set(workouts.map(w => {
      const d = new Date(w.fecha);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))
  ).sort();

  const fechas = diasUnicos.map(d => new Date(d));

  let mejorRacha = 1;
  let rachaTemp = 1;

  for (let i = 1; i < fechas.length; i++) {
    const gap = differenceInCalendarDays(fechas[i], fechas[i - 1]);
    if (gap <= 1) {
      rachaTemp++;
      if (rachaTemp > mejorRacha) mejorRacha = rachaTemp;
    } else {
      rachaTemp = 1;
    }
  }

  // Racha actual: check if last training was yesterday or today
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const ultimaFecha = fechas[fechas.length - 1];
  ultimaFecha.setHours(0, 0, 0, 0);
  const diasDesdeUltimo = differenceInCalendarDays(hoy, ultimaFecha);

  let rachaActual = 0;
  if (diasDesdeUltimo <= 1) {
    rachaActual = 1;
    for (let i = fechas.length - 2; i >= 0; i--) {
      const gap = differenceInCalendarDays(fechas[i + 1], fechas[i]);
      if (gap <= 1) {
        rachaActual++;
      } else {
        break;
      }
    }
  }

  return { mejorRacha, rachaActual };
}

/**
 * Calcula estadísticas generales de progreso
 */
export function calcularEstadisticasGenerales(todosWorkouts: WorkoutLog[]): {
  volumenTotalMovido: number;
  volumenPromedioPorSesion: number;
  ejercicioMasRealizado: string | null;
  mejorRacha: number;
  rachaActual: number;
  consistenciaSemanas: number; // % 0-100
  tiempoTotalMinutos: number;
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

  // BUG FIX A: Real streak
  const { mejorRacha, rachaActual } = calcularRachas(todosWorkouts);

  // Consistency: % of last 8 weeks with at least 1 workout
  const ahora = new Date();
  let semanasConEntrenamiento = 0;
  for (let i = 0; i < 8; i++) {
    const inicioSemana = startOfWeek(subWeeks(ahora, i), { weekStartsOn: 1 });
    const finSemana = startOfWeek(subWeeks(ahora, i - 1), { weekStartsOn: 1 });
    const tiene = todosWorkouts.some(w => {
      const f = new Date(w.fecha);
      return f >= inicioSemana && f < finSemana;
    });
    if (tiene) semanasConEntrenamiento++;
  }
  const consistenciaSemanas = Math.round((semanasConEntrenamiento / 8) * 100);

  // Tiempo total
  const tiempoTotalMinutos = todosWorkouts.reduce((sum, w) => {
    return sum + (w.duracionReal ?? w.duracion ?? 0);
  }, 0);

  return {
    volumenTotalMovido: volumenTotal,
    volumenPromedioPorSesion: volumenPromedio,
    ejercicioMasRealizado,
    mejorRacha,
    rachaActual,
    consistenciaSemanas,
    tiempoTotalMinutos
  };
}

/**
 * Calcula sets por grupo muscular en las últimas N semanas
 */
export function calcularSetsPorGrupoMuscular(
  workouts: WorkoutLog[],
  exercises: ExerciseKnowledge[],
  semanas: number = 4
): Map<string, number> {
  const desde = subWeeks(new Date(), semanas);
  const recientes = workouts.filter(w => new Date(w.fecha) >= desde);
  const mapa = new Map<string, number>();

  const exerciseMap = new Map(exercises.map(e => [e.id, e]));

  recientes.forEach(w => {
    w.ejercicios.forEach(ej => {
      const info = exerciseMap.get(ej.ejercicioId);
      if (info) {
        const grupo = info.grupoMuscular;
        mapa.set(grupo, (mapa.get(grupo) || 0) + ej.series.length);
      }
    });
  });

  return mapa;
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
