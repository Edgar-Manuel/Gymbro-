import type {
  UserProfile,
  ExerciseKnowledge,
  RutinaSemanal,
  DiaRutina,
  EjercicioEnRutina,
  GrupoMuscular
} from '@/types';
import { GrupoMuscular as GM } from '@/types';

// Configuración de splits según días disponibles
export const SPLITS_CONFIG = {
  3: [
    { nombre: 'Empuje (Pecho, Hombros, Tríceps)', grupos: [GM.PECHO, GM.HOMBROS, GM.TRICEPS] },
    { nombre: 'Tirón (Espalda, Bíceps)', grupos: [GM.ESPALDA, GM.BICEPS] },
    { nombre: 'Pierna Completa', grupos: [GM.PIERNAS, GM.FEMORALES_GLUTEOS, GM.ABDOMINALES] }
  ],
  4: [
    { nombre: 'Pecho y Tríceps', grupos: [GM.PECHO, GM.TRICEPS] },
    { nombre: 'Espalda y Bíceps', grupos: [GM.ESPALDA, GM.BICEPS] },
    { nombre: 'Descanso', grupos: [] },
    { nombre: 'Pierna y Hombros', grupos: [GM.PIERNAS, GM.FEMORALES_GLUTEOS, GM.HOMBROS, GM.ABDOMINALES] }
  ],
  5: [
    { nombre: 'Pecho', grupos: [GM.PECHO] },
    { nombre: 'Espalda', grupos: [GM.ESPALDA] },
    { nombre: 'Pierna', grupos: [GM.PIERNAS, GM.FEMORALES_GLUTEOS] },
    { nombre: 'Hombros y Brazos', grupos: [GM.HOMBROS, GM.BICEPS, GM.TRICEPS] },
    { nombre: 'Pierna (Énfasis Femorales) y Abs', grupos: [GM.FEMORALES_GLUTEOS, GM.ABDOMINALES] }
  ],
  6: [
    { nombre: 'Pecho y Tríceps', grupos: [GM.PECHO, GM.TRICEPS] },
    { nombre: 'Espalda y Bíceps', grupos: [GM.ESPALDA, GM.BICEPS] },
    { nombre: 'Pierna (Cuádriceps)', grupos: [GM.PIERNAS] },
    { nombre: 'Hombros y Abs', grupos: [GM.HOMBROS, GM.ABDOMINALES] },
    { nombre: 'Brazos (Bíceps y Tríceps)', grupos: [GM.BICEPS, GM.TRICEPS] },
    { nombre: 'Pierna (Femorales y Glúteos)', grupos: [GM.FEMORALES_GLUTEOS, GM.PIERNAS] }
  ]
};

// Configuración de volumen según objetivo
export const OBJETIVO_CONFIG = {
  fuerza: {
    series: [3, 5], // rango de series
    reps: [4, 6],   // rango de repeticiones
    descanso: 180,  // segundos
    ejerciciosPorGrupo: 2
  },
  hipertrofia: {
    series: [3, 4],
    reps: [8, 12],
    descanso: 90,
    ejerciciosPorGrupo: 3
  },
  resistencia: {
    series: [2, 3],
    reps: [12, 15],
    descanso: 60,
    ejerciciosPorGrupo: 3
  },
  perdida_grasa: {
    series: [3, 4],
    reps: [10, 15],
    descanso: 45,
    ejerciciosPorGrupo: 3
  }
};

/**
 * Genera una rutina personalizada basada en el perfil del usuario
 */
export function generarRutinaPersonalizada(
  user: UserProfile,
  exercises: ExerciseKnowledge[]
): RutinaSemanal {
  const dias = user.diasDisponibles >= 3 && user.diasDisponibles <= 6
    ? user.diasDisponibles
    : 4;

  const split = SPLITS_CONFIG[dias as keyof typeof SPLITS_CONFIG];
  const config = OBJETIVO_CONFIG[user.objetivo];

  const diasRutina: DiaRutina[] = split.map((dia, index) => {
    if (dia.grupos.length === 0) {
      // Día de descanso
      return {
        nombre: dia.nombre,
        grupos: [],
        ejercicios: [],
        duracionEstimada: 0,
        orden: index + 1
      };
    }

    const ejercicios = seleccionarEjerciciosParaDia(
      dia.grupos,
      exercises,
      user,
      config.ejerciciosPorGrupo
    );

    const ejerciciosEnRutina: EjercicioEnRutina[] = ejercicios.map(ex => ({
      ejercicioId: ex.id,
      ejercicio: ex,
      seriesObjetivo: determinarSeries(ex, user.objetivo),
      repsObjetivo: determinarReps(ex, user.objetivo),
      pesoSugerido: undefined, // Se determinará en base al historial
      notas: ex.tecnica.consejosClave[0]
    }));

    const duracionEstimada = calcularDuracionEstimada(ejerciciosEnRutina, config.descanso);

    return {
      nombre: dia.nombre,
      grupos: dia.grupos,
      ejercicios: ejerciciosEnRutina,
      duracionEstimada,
      orden: index + 1
    };
  });

  const rutina: RutinaSemanal = {
    id: `rutina-${Date.now()}`,
    userId: user.id,
    nombre: `Rutina ${dias} Días - ${user.objetivo.charAt(0).toUpperCase() + user.objetivo.slice(1)}`,
    descripcion: `Rutina personalizada para ${user.nivel} enfocada en ${user.objetivo}`,
    dias: diasRutina,
    fechaCreacion: new Date(),
    activa: true
  };

  return rutina;
}

/**
 * Selecciona los mejores ejercicios para un día específico
 */
function seleccionarEjerciciosParaDia(
  gruposMusculares: GrupoMuscular[],
  todosEjercicios: ExerciseKnowledge[],
  user: UserProfile,
  ejerciciosPorGrupo: number
): ExerciseKnowledge[] {
  const ejerciciosSeleccionados: ExerciseKnowledge[] = [];

  gruposMusculares.forEach(grupo => {
    // Filtrar ejercicios disponibles para este grupo
    const disponibles = todosEjercicios.filter(ex => {
      // Debe ser del grupo muscular correcto
      if (ex.grupoMuscular !== grupo) return false;

      // Debe tener equipamiento disponible
      const tieneEquipamiento = ex.equipamiento.some(eq =>
        user.equipamiento.includes(eq)
      );
      if (!tieneEquipamiento) return false;

      // No debe involucrar músculos lesionados
      const involucraLesion = user.lesiones.some(lesion =>
        ex.nombre.toLowerCase().includes(lesion.toLowerCase()) ||
        ex.enfoqueMuscular.some(m => m.toLowerCase().includes(lesion.toLowerCase()))
      );
      if (involucraLesion) return false;

      // Filtrar por nivel
      if (user.nivel === 'principiante' && ex.dificultad === 'avanzado') return false;

      return true;
    });

    // Ordenar por tier (S > A > B > C)
    const ordenados = disponibles.sort((a, b) => {
      const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'F': 4 };
      const diff = tierOrder[a.tier] - tierOrder[b.tier];
      if (diff !== 0) return diff;

      // Si tienen el mismo tier, priorizar compuestos
      if (a.categoria === 'compuesto' && b.categoria === 'aislamiento') return -1;
      if (a.categoria === 'aislamiento' && b.categoria === 'compuesto') return 1;

      return 0;
    });

    // Seleccionar ejercicios para este grupo
    let seleccionados = 0;

    // Necesidades especiales para ciertos grupos
    if (grupo === GM.ESPALDA) {
      // Espalda necesita 1 vertical + 1 horizontal
      const vertical = ordenados.find(e => e.tags?.includes('tiron_vertical'));
      const horizontal = ordenados.find(e => e.tags?.includes('tiron_horizontal'));

      if (vertical) {
        ejerciciosSeleccionados.push(vertical);
        seleccionados++;
      }
      if (horizontal && seleccionados < ejerciciosPorGrupo) {
        ejerciciosSeleccionados.push(horizontal);
        seleccionados++;
      }
    }

    // Completar con los mejores ejercicios restantes
    for (const ejercicio of ordenados) {
      if (seleccionados >= ejerciciosPorGrupo) break;
      if (!ejerciciosSeleccionados.includes(ejercicio)) {
        ejerciciosSeleccionados.push(ejercicio);
        seleccionados++;
      }
    }
  });

  return ejerciciosSeleccionados;
}

/**
 * Determina el número de series según el ejercicio y objetivo
 */
function determinarSeries(ejercicio: ExerciseKnowledge, objetivo: string): number {
  const config = OBJETIVO_CONFIG[objetivo as keyof typeof OBJETIVO_CONFIG];
  const [min, max] = config.series;

  // Ejercicios tier S y compuestos: más series
  if (ejercicio.tier === 'S' || ejercicio.categoria === 'compuesto') {
    return max;
  }

  // Ejercicios de aislamiento: menos series
  return min;
}

/**
 * Determina el rango de repeticiones según el ejercicio y objetivo
 */
function determinarReps(_ejercicio: ExerciseKnowledge, objetivo: string): [number, number] {
  const config = OBJETIVO_CONFIG[objetivo as keyof typeof OBJETIVO_CONFIG];
  return config.reps as [number, number];
}

/**
 * Calcula la duración estimada del entrenamiento
 */
function calcularDuracionEstimada(ejercicios: EjercicioEnRutina[], descansoPromedio: number): number {
  let duracion = 0;

  ejercicios.forEach(ej => {
    // Tiempo por serie (aprox 30-45 segundos de ejecución)
    const tiempoPorSerie = 40; // segundos
    const series = ej.seriesObjetivo;

    // Tiempo de ejecución + tiempo de descanso
    duracion += (tiempoPorSerie * series) + (descansoPromedio * (series - 1));
  });

  // Agregar tiempo de calentamiento y transiciones (10 minutos)
  duracion += 600;

  // Convertir a minutos y redondear
  return Math.round(duracion / 60);
}

/**
 * Valida si una rutina es válida para el usuario
 */
export function validarRutina(rutina: RutinaSemanal, user: UserProfile): { valid: boolean; errores: string[] } {
  const errores: string[] = [];

  // Verificar que hay al menos un día con ejercicios
  const diasConEjercicios = rutina.dias.filter(d => d.ejercicios.length > 0);
  if (diasConEjercicios.length === 0) {
    errores.push('La rutina debe tener al menos un día con ejercicios');
  }

  // Verificar que no exceda el tiempo disponible
  rutina.dias.forEach(dia => {
    if (dia.duracionEstimada > user.tiempoSesion + 15) { // +15 min de margen
      errores.push(`El día "${dia.nombre}" excede el tiempo disponible (${dia.duracionEstimada} min)`);
    }
  });

  // Verificar balance de grupos musculares
  const frecuenciaPorGrupo: Record<string, number> = {};
  rutina.dias.forEach(dia => {
    dia.grupos.forEach(grupo => {
      frecuenciaPorGrupo[grupo] = (frecuenciaPorGrupo[grupo] || 0) + 1;
    });
  });

  // Advertir si algún grupo se entrena muy poco
  const gruposPrincipales = [GM.PECHO, GM.ESPALDA, GM.PIERNAS];
  gruposPrincipales.forEach(grupo => {
    if ((frecuenciaPorGrupo[grupo] || 0) < 1) {
      errores.push(`Advertencia: El grupo muscular "${grupo}" no está incluido en la rutina`);
    }
  });

  return {
    valid: errores.length === 0,
    errores
  };
}

/**
 * Obtiene un resumen de la rutina para mostrar al usuario
 */
export function obtenerResumenRutina(rutina: RutinaSemanal): {
  totalDias: number;
  totalEjercicios: number;
  duracionPromedio: number;
  gruposMusculares: string[];
  ejerciciosTierS: number;
} {
  const diasActivos = rutina.dias.filter(d => d.ejercicios.length > 0);
  const todosEjercicios = diasActivos.flatMap(d => d.ejercicios);

  const gruposUnicos = new Set<string>();
  rutina.dias.forEach(dia => {
    dia.grupos.forEach(g => gruposUnicos.add(g));
  });

  const ejerciciosTierS = todosEjercicios.filter(e => e.ejercicio?.tier === 'S').length;

  const duracionPromedio = diasActivos.length > 0
    ? Math.round(diasActivos.reduce((sum, d) => sum + d.duracionEstimada, 0) / diasActivos.length)
    : 0;

  return {
    totalDias: diasActivos.length,
    totalEjercicios: todosEjercicios.length,
    duracionPromedio,
    gruposMusculares: Array.from(gruposUnicos),
    ejerciciosTierS
  };
}
