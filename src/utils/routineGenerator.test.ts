import { describe, it, expect } from 'vitest'
import {
  SPLITS_CONFIG,
  OBJETIVO_CONFIG,
  generarRutinaPersonalizada,
  validarRutina,
  obtenerResumenRutina,
} from './routineGenerator'
import type { UserProfile, ExerciseKnowledge } from '@/types'
import { GrupoMuscular } from '@/types'

// Mock de usuario para tests
const mockUser: UserProfile = {
  id: 'test-user-1',
  nombre: 'Test User',
  email: 'test@test.com',
  edad: 25,
  peso: 70,
  altura: 175,
  objetivo: 'hipertrofia',
  nivel: 'intermedio',
  diasDisponibles: 4,
  tiempoSesion: 60,
  equipamiento: ['barra', 'mancuerna', 'polea', 'maquina'],
  lesiones: [],
  pesoActual: 70,
}

// Helper para crear mock de ejercicio
const createMockExercise = (overrides: Partial<ExerciseKnowledge> & Pick<ExerciseKnowledge, 'id' | 'nombre' | 'grupoMuscular' | 'categoria' | 'tier' | 'equipamiento' | 'dificultad' | 'enfoqueMuscular' | 'tecnica'>): ExerciseKnowledge => ({
  imagenes: { posicionInicial: '', ejecucion: [], errores: [] },
  variantes: [],
  descansoSugerido: 90,
  ...overrides,
})

// Mock de ejercicios para tests
const mockExercises: ExerciseKnowledge[] = [
  createMockExercise({
    id: 'press-banca',
    nombre: 'Press Banca',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'S',
    equipamiento: ['barra', 'maquina'],
    dificultad: 'intermedio',
    enfoqueMuscular: ['pecho', 'triceps', 'hombros'],
    tecnica: {
      posicionInicial: 'Tumbado en banco',
      ejecucion: ['Bajar la barra', 'Subir la barra'],
      erroresComunes: ['Rebote en pecho'],
      consejosClave: ['Mantener escápulas retraídas'],
    },
  }),
  createMockExercise({
    id: 'aperturas',
    nombre: 'Aperturas con Mancuernas',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'aislamiento',
    tier: 'A',
    equipamiento: ['mancuerna', 'maquina'],
    dificultad: 'principiante',
    enfoqueMuscular: ['pecho'],
    tecnica: {
      posicionInicial: 'Tumbado en banco',
      ejecucion: ['Abrir brazos', 'Cerrar brazos'],
      erroresComunes: ['Codos muy extendidos'],
      consejosClave: ['Ligera flexión de codos'],
    },
  }),
  createMockExercise({
    id: 'dominadas',
    nombre: 'Dominadas',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    equipamiento: ['barra'],
    dificultad: 'intermedio',
    enfoqueMuscular: ['espalda', 'biceps'],
    tags: ['tiron_vertical'],
    tecnica: {
      posicionInicial: 'Colgado de barra',
      ejecucion: ['Tirar hacia arriba', 'Bajar controlado'],
      erroresComunes: ['Kipping'],
      consejosClave: ['Activar dorsales'],
    },
  }),
  createMockExercise({
    id: 'remo-barra',
    nombre: 'Remo con Barra',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    equipamiento: ['barra'],
    dificultad: 'intermedio',
    enfoqueMuscular: ['espalda', 'biceps'],
    tags: ['tiron_horizontal'],
    tecnica: {
      posicionInicial: 'Inclinado con barra',
      ejecucion: ['Tirar hacia abdomen', 'Bajar controlado'],
      erroresComunes: ['Espalda curvada'],
      consejosClave: ['Mantener espalda recta'],
    },
  }),
  createMockExercise({
    id: 'sentadilla',
    nombre: 'Sentadilla',
    grupoMuscular: GrupoMuscular.PIERNAS,
    categoria: 'compuesto',
    tier: 'S',
    equipamiento: ['barra'],
    dificultad: 'intermedio',
    enfoqueMuscular: ['cuadriceps', 'gluteos'],
    tecnica: {
      posicionInicial: 'De pie con barra',
      ejecucion: ['Bajar flexionando', 'Subir empujando'],
      erroresComunes: ['Rodillas hacia dentro'],
      consejosClave: ['Rodillas hacia fuera'],
    },
  }),
  createMockExercise({
    id: 'curl-biceps',
    nombre: 'Curl Bíceps',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    equipamiento: ['mancuerna'],
    dificultad: 'principiante',
    enfoqueMuscular: ['biceps'],
    tecnica: {
      posicionInicial: 'De pie',
      ejecucion: ['Flexionar codos'],
      erroresComunes: ['Balanceo'],
      consejosClave: ['Codos fijos'],
    },
  }),
  createMockExercise({
    id: 'extension-triceps',
    nombre: 'Extensión Tríceps',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    equipamiento: ['polea'],
    dificultad: 'principiante',
    enfoqueMuscular: ['triceps'],
    tecnica: {
      posicionInicial: 'De pie',
      ejecucion: ['Extender codos'],
      erroresComunes: ['Mover hombros'],
      consejosClave: ['Codos fijos'],
    },
  }),
  createMockExercise({
    id: 'press-militar',
    nombre: 'Press Militar',
    grupoMuscular: GrupoMuscular.HOMBROS,
    categoria: 'compuesto',
    tier: 'S',
    equipamiento: ['barra'],
    dificultad: 'intermedio',
    enfoqueMuscular: ['hombros', 'triceps'],
    tecnica: {
      posicionInicial: 'De pie con barra',
      ejecucion: ['Empujar hacia arriba'],
      erroresComunes: ['Arquear espalda'],
      consejosClave: ['Core activado'],
    },
  }),
]

describe('routineGenerator', () => {
  describe('SPLITS_CONFIG', () => {
    it('tiene configuración para 3, 4, 5 y 6 días', () => {
      expect(SPLITS_CONFIG[3]).toBeDefined()
      expect(SPLITS_CONFIG[4]).toBeDefined()
      expect(SPLITS_CONFIG[5]).toBeDefined()
      expect(SPLITS_CONFIG[6]).toBeDefined()
    })

    it('el split de 3 días tiene 3 elementos', () => {
      expect(SPLITS_CONFIG[3]).toHaveLength(3)
    })

    it('el split de 4 días tiene 4 elementos', () => {
      expect(SPLITS_CONFIG[4]).toHaveLength(4)
    })

    it('cada día tiene nombre y grupos musculares', () => {
      SPLITS_CONFIG[3].forEach((dia) => {
        expect(dia.nombre).toBeTruthy()
        expect(dia.grupos).toBeInstanceOf(Array)
      })
    })
  })

  describe('OBJETIVO_CONFIG', () => {
    it('tiene configuración para todos los objetivos', () => {
      expect(OBJETIVO_CONFIG.fuerza).toBeDefined()
      expect(OBJETIVO_CONFIG.hipertrofia).toBeDefined()
      expect(OBJETIVO_CONFIG.resistencia).toBeDefined()
      expect(OBJETIVO_CONFIG.perdida_grasa).toBeDefined()
    })

    it('fuerza tiene menos reps que hipertrofia', () => {
      expect(OBJETIVO_CONFIG.fuerza.reps[1]).toBeLessThan(
        OBJETIVO_CONFIG.hipertrofia.reps[0]
      )
    })

    it('fuerza tiene más descanso que hipertrofia', () => {
      expect(OBJETIVO_CONFIG.fuerza.descanso).toBeGreaterThan(
        OBJETIVO_CONFIG.hipertrofia.descanso
      )
    })

    it('resistencia tiene menos series que fuerza', () => {
      expect(OBJETIVO_CONFIG.resistencia.series[1]).toBeLessThanOrEqual(
        OBJETIVO_CONFIG.fuerza.series[1]
      )
    })
  })

  describe('generarRutinaPersonalizada', () => {
    it('genera una rutina con el número correcto de días', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      expect(rutina.dias).toHaveLength(4) // mockUser tiene 4 días
    })

    it('genera una rutina con ID único', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      expect(rutina.id).toMatch(/^rutina-\d+$/)
    })

    it('asigna el userId correcto', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      expect(rutina.userId).toBe(mockUser.id)
    })

    it('crea la rutina como activa', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      expect(rutina.activa).toBe(true)
    })

    it('incluye fecha de creación', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      expect(rutina.fechaCreacion).toBeInstanceOf(Date)
    })

    it('genera nombre descriptivo', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      expect(rutina.nombre).toContain('4 Días')
      expect(rutina.nombre).toContain('Hipertrofia')
    })

    it('usa 4 días por defecto si días disponibles es inválido', () => {
      const userInvalido = { ...mockUser, diasDisponibles: 7 }
      const rutina = generarRutinaPersonalizada(userInvalido, mockExercises)
      expect(rutina.dias).toHaveLength(4)
    })

    it('cada día tiene ejercicios con series y reps objetivo', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      rutina.dias.forEach((dia) => {
        if (dia.ejercicios.length > 0) {
          dia.ejercicios.forEach((ej) => {
            expect(ej.seriesObjetivo).toBeGreaterThan(0)
            expect(ej.repsObjetivo).toBeInstanceOf(Array)
            expect(ej.repsObjetivo).toHaveLength(2)
          })
        }
      })
    })

    it('calcula duración estimada para cada día', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      rutina.dias.forEach((dia) => {
        expect(typeof dia.duracionEstimada).toBe('number')
        expect(dia.duracionEstimada).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('validarRutina', () => {
    it('retorna válido para rutina correcta', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      const resultado = validarRutina(rutina, mockUser)
      expect(resultado.valid).toBe(true)
      expect(resultado.errores).toHaveLength(0)
    })

    it('detecta rutina sin ejercicios', () => {
      const rutinaVacia: import('@/types').RutinaSemanal = {
        id: 'test',
        userId: 'user',
        nombre: 'Vacía',
        descripcion: '',
        dias: [],
        fechaCreacion: new Date(),
        activa: true,
      }
      const resultado = validarRutina(rutinaVacia, mockUser)
      expect(resultado.valid).toBe(false)
      expect(resultado.errores.length).toBeGreaterThan(0)
    })

    it('detecta días que exceden tiempo disponible', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      // Forzar duración muy larga
      rutina.dias[0].duracionEstimada = 200
      const userCortoTiempo = { ...mockUser, tiempoSesion: 30 }
      const resultado = validarRutina(rutina, userCortoTiempo)
      expect(resultado.errores.some((e) => e.includes('excede'))).toBe(true)
    })
  })

  describe('obtenerResumenRutina', () => {
    it('cuenta total de días activos', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      const resumen = obtenerResumenRutina(rutina)
      expect(resumen.totalDias).toBeGreaterThan(0)
      expect(resumen.totalDias).toBeLessThanOrEqual(rutina.dias.length)
    })

    it('cuenta total de ejercicios', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      const resumen = obtenerResumenRutina(rutina)
      expect(resumen.totalEjercicios).toBeGreaterThan(0)
    })

    it('calcula duración promedio', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      const resumen = obtenerResumenRutina(rutina)
      expect(resumen.duracionPromedio).toBeGreaterThan(0)
    })

    it('lista grupos musculares únicos', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      const resumen = obtenerResumenRutina(rutina)
      expect(resumen.gruposMusculares).toBeInstanceOf(Array)
      // No debe haber duplicados
      const unicos = new Set(resumen.gruposMusculares)
      expect(unicos.size).toBe(resumen.gruposMusculares.length)
    })

    it('cuenta ejercicios tier S', () => {
      const rutina = generarRutinaPersonalizada(mockUser, mockExercises)
      const resumen = obtenerResumenRutina(rutina)
      expect(typeof resumen.ejerciciosTierS).toBe('number')
    })

    it('retorna 0 duración promedio para rutina sin días activos', () => {
      const rutinaVacia: import('@/types').RutinaSemanal = {
        id: 'test',
        userId: 'user',
        nombre: 'Vacía',
        descripcion: '',
        dias: [],
        fechaCreacion: new Date(),
        activa: true,
      }
      const resumen = obtenerResumenRutina(rutinaVacia)
      expect(resumen.duracionPromedio).toBe(0)
      expect(resumen.totalDias).toBe(0)
      expect(resumen.totalEjercicios).toBe(0)
    })
  })
})
