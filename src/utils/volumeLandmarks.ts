import type { VolumeLandmark, WorkoutLog } from '@/types';

// Landmarks predefinidos de volumen total
export const VOLUME_LANDMARKS = [
  { umbral: 10000, mensaje: '¡Primeras 10 toneladas movidas!' },
  { umbral: 25000, mensaje: '¡25 toneladas! ¡Vas en serio!' },
  { umbral: 50000, mensaje: '¡50 toneladas! ¡Increíble progreso!' },
  { umbral: 100000, mensaje: '¡100 toneladas! ¡Eres una bestia!' },
  { umbral: 250000, mensaje: '¡250 toneladas! ¡Leyenda en construcción!' },
  { umbral: 500000, mensaje: '¡500 toneladas! ¡Imparable!' },
  { umbral: 1000000, mensaje: '¡1 MILLÓN DE KG! ¡LEYENDA ABSOLUTA!' }
];

// Landmarks semanales
export const WEEKLY_LANDMARKS = [
  { umbral: 5000, mensaje: '¡5 toneladas esta semana!' },
  { umbral: 10000, mensaje: '¡10 toneladas esta semana! ¡Brutal!' },
  { umbral: 15000, mensaje: '¡15 toneladas esta semana! ¡Imparable!' },
  { umbral: 20000, mensaje: '¡20 toneladas esta semana! ¡Beast Mode!' }
];

// Landmarks mensuales
export const MONTHLY_LANDMARKS = [
  { umbral: 20000, mensaje: '¡20 toneladas este mes!' },
  { umbral: 40000, mensaje: '¡40 toneladas este mes! ¡Increíble!' },
  { umbral: 60000, mensaje: '¡60 toneladas este mes! ¡Leyenda!' },
  { umbral: 80000, mensaje: '¡80 toneladas este mes! ¡Imparable!' },
  { umbral: 100000, mensaje: '¡100 toneladas este mes! ¡BEAST ABSOLUTO!' }
];

/**
 * Calcula el volumen total de un workout
 */
export function calcularVolumenWorkout(workout: WorkoutLog): number {
  return workout.ejercicios.reduce((total, ejercicio) => {
    const volumenEjercicio = ejercicio.series.reduce((sum, serie) => {
      return sum + (serie.peso * serie.repeticiones);
    }, 0);
    return total + volumenEjercicio;
  }, 0);
}

/**
 * Verifica si se alcanzó un nuevo landmark de volumen total
 */
export function verificarLandmarkTotal(
  volumenTotalAcumulado: number,
  landmarksActuales: VolumeLandmark[]
): VolumeLandmark | null {
  // Encontrar el próximo landmark no alcanzado
  const landmarksAlcanzados = landmarksActuales.filter(l => l.tipo === 'total' && l.alcanzado);
  const ultimoUmbralAlcanzado = landmarksAlcanzados.length > 0
    ? Math.max(...landmarksAlcanzados.map(l => l.umbral))
    : 0;

  // Buscar el siguiente landmark en la lista
  const siguienteLandmark = VOLUME_LANDMARKS.find(
    l => l.umbral > ultimoUmbralAlcanzado && volumenTotalAcumulado >= l.umbral
  );

  if (siguienteLandmark) {
    return {
      id: `landmark-total-${siguienteLandmark.umbral}-${Date.now()}`,
      userId: '',
      tipo: 'total',
      umbral: siguienteLandmark.umbral,
      alcanzado: true,
      fecha: new Date(),
      mensaje: siguienteLandmark.mensaje
    };
  }

  return null;
}

/**
 * Verifica landmarks semanales
 */
export function verificarLandmarkSemanal(
  volumenSemanal: number,
  landmarksSemanalesActuales: VolumeLandmark[]
): VolumeLandmark | null {
  const landmarksAlcanzados = landmarksSemanalesActuales.filter(
    l => l.tipo === 'semanal' && l.alcanzado
  );
  const ultimoUmbralAlcanzado = landmarksAlcanzados.length > 0
    ? Math.max(...landmarksAlcanzados.map(l => l.umbral))
    : 0;

  const siguienteLandmark = WEEKLY_LANDMARKS.find(
    l => l.umbral > ultimoUmbralAlcanzado && volumenSemanal >= l.umbral
  );

  if (siguienteLandmark) {
    return {
      id: `landmark-semanal-${siguienteLandmark.umbral}-${Date.now()}`,
      userId: '',
      tipo: 'semanal',
      umbral: siguienteLandmark.umbral,
      alcanzado: true,
      fecha: new Date(),
      mensaje: siguienteLandmark.mensaje
    };
  }

  return null;
}

/**
 * Verifica landmarks mensuales
 */
export function verificarLandmarkMensual(
  volumenMensual: number,
  landmarksMensualesActuales: VolumeLandmark[]
): VolumeLandmark | null {
  const landmarksAlcanzados = landmarksMensualesActuales.filter(
    l => l.tipo === 'mensual' && l.alcanzado
  );
  const ultimoUmbralAlcanzado = landmarksAlcanzados.length > 0
    ? Math.max(...landmarksAlcanzados.map(l => l.umbral))
    : 0;

  const siguienteLandmark = MONTHLY_LANDMARKS.find(
    l => l.umbral > ultimoUmbralAlcanzado && volumenMensual >= l.umbral
  );

  if (siguienteLandmark) {
    return {
      id: `landmark-mensual-${siguienteLandmark.umbral}-${Date.now()}`,
      userId: '',
      tipo: 'mensual',
      umbral: siguienteLandmark.umbral,
      alcanzado: true,
      fecha: new Date(),
      mensaje: siguienteLandmark.mensaje
    };
  }

  return null;
}

/**
 * Inicializa los landmarks pendientes para un usuario
 */
export function inicializarLandmarksPendientes(userId: string): VolumeLandmark[] {
  const landmarks: VolumeLandmark[] = [];

  // Agregar todos los landmarks de volumen total como pendientes
  VOLUME_LANDMARKS.forEach(l => {
    landmarks.push({
      id: `landmark-total-${l.umbral}`,
      userId,
      tipo: 'total',
      umbral: l.umbral,
      alcanzado: false,
      mensaje: l.mensaje
    });
  });

  return landmarks;
}
