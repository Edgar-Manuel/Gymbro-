// Grupo Muscular
export const GrupoMuscular = {
  PECHO: 'pecho',
  ESPALDA: 'espalda',
  PIERNAS: 'piernas',
  HOMBROS: 'hombros',
  BICEPS: 'biceps',
  TRICEPS: 'triceps',
  ANTEBRAZOS: 'antebrazos',
  ABDOMINALES: 'abdominales',
  FEMORALES_GLUTEOS: 'femorales_gluteos'
} as const;

export type GrupoMuscular = typeof GrupoMuscular[keyof typeof GrupoMuscular];

export type Tier = 'S' | 'A' | 'B' | 'C' | 'F';
export type Categoria = 'compuesto' | 'aislamiento';
export type Nivel = 'principiante' | 'intermedio' | 'avanzado';
export type Objetivo = 'fuerza' | 'hipertrofia' | 'resistencia' | 'perdida_grasa';
export type ObjetivoCalorico = 'superavit' | 'mantenimiento' | 'deficit';
export type Equipamiento = 'barra' | 'mancuerna' | 'polea' | 'peso_corporal' | 'maquina';

// Exercise Knowledge Base
export interface ExerciseTecnica {
  posicionInicial: string;
  ejecucion: string[];
  erroresComunes: string[];
  consejosClave: string[];
}

export interface ExerciseVariante {
  nombre: string;
  cuando: string;
  tier: Tier;
}

export interface ExerciseImagenes {
  posicionInicial: string;
  ejecucion: string[];
  errores: string[];
}

export interface ExerciseKnowledge {
  id: string;
  nombre: string;
  grupoMuscular: GrupoMuscular;
  categoria: Categoria;
  tier: Tier;

  tecnica: ExerciseTecnica;

  equipamiento: Equipamiento[];
  dificultad: Nivel;
  enfoqueMuscular: string[];

  imagenes: ExerciseImagenes;

  variantes: ExerciseVariante[];
  descansoSugerido: number; // segundos
  tags?: string[]; // ej: ["tiron_vertical", "tiron_horizontal"]
}

// User Profile
export interface UserProfile {
  id: string;
  nombre: string;
  nivel: Nivel;
  objetivo: Objetivo;
  diasDisponibles: number;
  equipamiento: Equipamiento[];
  lesiones: string[];
  tiempoSesion: number; // minutos

  // Datos físicos
  pesoActual: number; // kg
  peso?: number; // Alias para pesoActual
  altura: number; // cm
  edad: number;
  sexo: 'masculino' | 'femenino';

  // Objetivos nutricionales
  objetivoCalorico: ObjetivoCalorico;
  factorActividad: number; // 1.2 - 1.9

  // Configuración
  horaPreferida?: string; // "08:00"
  notificacionesActivas: boolean;

  // Progreso
  fechaInicio: Date;
  pesoInicial: number;
  rachaActual: number; // días consecutivos
}

// Workout Planning
export interface EjercicioEnRutina {
  ejercicioId: string;
  ejercicio?: ExerciseKnowledge; // populated
  seriesObjetivo: number;
  repsObjetivo: number | [number, number]; // número fijo o rango [min, max]
  pesoSugerido?: number;
  notas?: string;
}

export interface DiaRutina {
  id?: string;
  nombre: string;
  grupos: GrupoMuscular[];
  gruposMusculares?: GrupoMuscular[]; // Alias para grupos
  ejercicios: EjercicioEnRutina[];
  duracionEstimada: number; // minutos
  orden: number; // día 1, 2, 3, etc
}

export interface RutinaSemanal {
  id: string;
  userId: string;
  nombre: string;
  descripcion: string;
  dias: DiaRutina[];
  fechaCreacion: Date;
  activa: boolean;
}

// Workout Logging
export interface SerieLog {
  numero: number;
  repeticiones: number;
  peso: number; // kg
  RIR: number; // Reps In Reserve (0-3)
  tiempoDescanso: number; // segundos
  completada: boolean;
}

export interface ExerciseLog {
  ejercicioId: string;
  ejercicio?: ExerciseKnowledge; // populated
  series: SerieLog[];
  tecnicaCorrecta: boolean;
  sensacionMuscular: 1 | 2 | 3 | 4 | 5;
  notas?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  fecha: Date;
  diaRutinaId?: string;
  diaRutina: string; // nombre del día, ej: "Pecho y Tríceps"
  ejercicios: ExerciseLog[];
  duracionReal: number; // minutos
  sensacionGeneral: 1 | 2 | 3 | 4 | 5;
  notas?: string;
  completado: boolean;
}

// Progress Analysis
export interface VolumeData {
  semanaActual: number;
  semanaAnterior: number;
  cambio: number; // %
}

export interface PesoMaximoData {
  actual: number;
  hace4Semanas: number;
  cambio: number;
}

export type RecomendacionProgresion = 'subir_peso' | 'subir_reps' | 'mantener' | 'deload';

export interface ProgressAnalysis {
  ejercicioId: string;
  nombre: string;

  volumenTotal: VolumeData;
  pesoMaximo: PesoMaximoData;

  recomendacion: RecomendacionProgresion;
  proximoObjetivo: string;
}

// Nutrition Tracking
export interface Macros {
  proteina: number; // gramos
  carbohidratos: number;
  grasas: number;
}

export interface Meal {
  id: string;
  nombre: string;
  tipo: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  calorias: number;
  macros: Macros;
  hora: Date;
}

export interface NutritionTracker {
  userId: string;
  fecha: Date;
  caloriasDiarias: number;
  macrosObjetivo: Macros;
  comidasRegistradas: Meal[];
}

export interface NutritionNeeds {
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasas: number;
}

// Progress Charts
export interface ProgressDataPoint {
  semana: string;
  fecha: Date;
  pesoMaximo: number;
  volumenTotal: number;
  repeticionesPromedio: number;
}

// Achievements
export interface Achievement {
  id: string;
  userId: string;
  tipo: 'weight' | 'streak' | 'volume' | 'consistency' | 'custom';
  titulo: string;
  descripcion: string;
  icono: string;
  fecha: Date;
  valor?: number;
}

// Statistics
export interface UserStatistics {
  userId: string;
  totalEntrenamientos: number;
  rachaActual: number;
  rachaMasLarga: number;
  volumenTotalMovido: number; // kg total en toda la historia
  volumenEsteMes: number;
  ejercicioFavorito?: string;
  grupoMuscularMasEntrenado?: GrupoMuscular;
  progresoGeneral: number; // % de mejora desde inicio
}

// Body Measurements & Tracking
export interface BodyMeasurement {
  id: string;
  userId: string;
  fecha: Date;
  peso: number; // kg
  grasaCorporal?: number; // %
  medidas: {
    pecho?: number; // cm
    cintura?: number;
    cadera?: number;
    brazoDerecho?: number;
    brazoIzquierdo?: number;
    musloDerecho?: number;
    musloIzquierdo?: number;
    pantorrillaDerecha?: number;
    pantorrillaIzquierda?: number;
  };
  notas?: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  fecha: Date;
  tipo: 'frente' | 'espalda' | 'lado_derecho' | 'lado_izquierdo';
  url: string; // base64 o blob URL
  peso?: number; // peso en el momento de la foto
  notas?: string;
}
