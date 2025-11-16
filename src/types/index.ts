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

  // Configuración personalizada por usuario
  descansoPersonalizado?: number; // override del descanso sugerido
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
  altura: number; // cm
  edad: number;
  sexo: 'masculino' | 'femenino';

  // Objetivos nutricionales
  objetivoCalorico: ObjetivoCalorico;
  factorActividad: number; // 1.2 - 1.9

  // Configuración
  horaPreferida?: string; // "08:00"
  notificacionesActivas: boolean;
  modoBeast: boolean; // Modo ultra-minimal

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

  // Advanced techniques
  superset?: string; // ID del ejercicio con el que hace superset
  tecnicaAvanzada?: 'dropset' | 'rest-pause' | 'myo-reps' | null;

  // Warmup
  seriesCalentamiento?: WarmupSet[];
}

export interface WarmupSet {
  peso: number;
  reps: number;
  porcentaje: number; // % del peso de trabajo
}

export interface DiaRutina {
  nombre: string;
  grupos: GrupoMuscular[];
  ejercicios: EjercicioEnRutina[];
  duracionEstimada: number; // minutos
  orden: number; // día 1, 2, 3, etc
  warmupChecklist?: string[]; // checklist de calentamiento
}

export interface RutinaSemanal {
  id: string;
  userId: string;
  nombre: string;
  descripcion: string;
  dias: DiaRutina[];
  fechaCreacion: Date;
  activa: boolean;
  isTemplate?: boolean; // Si es un template guardado
}

// Workout Logging
export interface SerieLog {
  numero: number;
  repeticiones: number;
  peso: number; // kg
  RIR: number; // Reps In Reserve (0-4)
  tiempoDescanso: number; // segundos
  completada: boolean;
  notas?: string; // Notas rápidas por serie
  fallo?: boolean; // Si llegó a fallo real
  tecnicaAvanzada?: 'dropset' | 'rest-pause' | null;
}

export interface ExerciseLog {
  ejercicioId: string;
  ejercicio?: ExerciseKnowledge; // populated
  series: SerieLog[];
  seriesCalentamiento?: SerieLog[]; // Sets de warmup
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
  warmupCompletado?: boolean;
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

// Personal Records (PRs)
export type PRType = 'peso_maximo' | 'volumen_total' | 'reps_maximas' | 'one_rep_max';

export interface PersonalRecord {
  id: string;
  userId: string;
  ejercicioId: string;
  ejercicioNombre: string;
  tipo: PRType;
  valor: number; // kg, reps, o volumen
  reps?: number; // para contexto del peso máximo
  fecha: Date;
  anterior?: {
    valor: number;
    fecha: Date;
  };
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
  tipo: 'weight' | 'streak' | 'volume' | 'consistency' | 'pr' | 'custom';
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

// Progress Photos
export interface ProgressPhoto {
  id: string;
  userId: string;
  fecha: Date;
  imageData: string; // base64 o URL
  peso: number;
  notas?: string;
  tipo: 'frente' | 'lado' | 'espalda' | 'otro';
}

// Plate Calculator
export interface PlateConfig {
  peso: number;
  color: string;
  cantidad: number;
}

// Voice Command
export interface VoiceCommand {
  comando: string;
  accion: 'completar_serie' | 'siguiente_ejercicio' | 'iniciar_timer' | 'pausar_timer';
  parametros?: {
    peso?: number;
    reps?: number;
    rir?: number;
  };
}

// 1RM Calculation
export interface OneRepMaxData {
  peso: number;
  reps: number;
  oneRepMax: number; // calculado
  porcentajes: {
    porcentaje: number;
    peso: number;
  }[];
}

// Volume Landmarks
export interface VolumeLandmark {
  id: string;
  userId: string;
  tipo: 'total' | 'mensual' | 'semanal' | 'por_ejercicio';
  umbral: number; // kg (ej: 10000 = 10 toneladas)
  alcanzado: boolean;
  fecha?: Date;
  mensaje: string;
}

// Exercise History Entry (para historial detallado)
export interface ExerciseHistoryEntry {
  fecha: Date;
  series: SerieLog[];
  pesoMaximo: number;
  volumenTotal: number;
  repsPromedio: number;
  workoutId: string;
}
