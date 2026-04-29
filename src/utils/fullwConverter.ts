import { exercisesData } from '@/data/exercises';
import type { FullWRoutine, FullWExercise } from '@/data/fullwRoutines';
import type { RutinaSemanal, DiaRutina, EjercicioEnRutina, ExerciseKnowledge, GrupoMuscular } from '@/types';

// Mapa de nombre Full W → id en exercises.ts
const NAME_TO_ID: Record<string, string> = {
  'press de banca con barra':              'press-banca-barra',
  'press de banca con mancuernas':         'press-banca-mancuernas',
  'press inclinado con barra':             'press-inclinado-barra',
  'press inclinado con mancuernas':        'press-banca-mancuernas',
  'press de banca inclinado con barra':    'press-inclinado-barra',
  'aperturas con mancuernas':              'aperturas-mancuernas',
  'aperturas en polea':                    'aperturas-mancuernas',
  'aperturas en polea (cable fly)':        'aperturas-mancuernas',
  'fondos en paralelas':                   'fondos-triceps',
  'fondos en paralelas (tríceps)':         'fondos-triceps',
  'fondos en paralelas (triceps)':         'fondos-triceps',
  'dominadas':                             'dominadas',
  'dominadas o jalón al pecho':            'dominadas',
  'dominadas lastradas':                   'dominadas',
  'dominadas agarre ancho':                'dominadas',
  'remo con barra':                        'remo-barra',
  'remo con barra (pronado)':              'remo-barra',
  'remo con mancuerna':                    'remo-mancuerna-unilateral',
  'remo con mancuerna (unilateral)':       'remo-mancuerna-unilateral',
  'remo en polea baja':                    'remo-bilateral-apoyo',
  'remo en polea baja (agarre neutro)':    'remo-bilateral-apoyo',
  'jalón al pecho':                        'lat-pulldown',
  'jalón al pecho agarre ancho':           'lat-pulldown',
  'jalón neutro al pecho':                 'lat-pulldown',
  'jalón al pecho (agarre ancho)':         'lat-pulldown',
  'press militar con barra':               'press-militar',
  'press de hombros con mancuernas':       'press-militar',
  'elevaciones laterales':                 'elevaciones-laterales',
  'elevaciones laterales en polea':        'elevaciones-laterales',
  'face pull en polea':                    'pajaros-deltoides-posterior',
  'pájaros (deltoides posterior)':         'pajaros-deltoides-posterior',
  'curl de bíceps con barra':              'curl-barra',
  'curl bíceps con barra':                 'curl-barra',
  'curl con barra z':                      'curl-barra',
  'curl de biceps con barra':              'curl-barra',
  'curl inclinado con mancuernas':         'curl-inclinado',
  'curl concentrado':                      'curl-concentrado',
  'curl concentrado scott':                'curl-concentrado',
  'curl de scott':                         'curl-concentrado',
  'curl martillo':                         'curl-martillo',
  'curl en polea':                         'curl-polea',
  'extensiones en polea (tríceps)':        'pushdowns-polea',
  'extensiones tríceps en polea':          'pushdowns-polea',
  'extensiones tríceps polea':             'pushdowns-polea',
  'extensiones en polea':                  'pushdowns-polea',
  'extensiones tríceps sobre la cabeza':   'extensiones-overhead',
  'extensiones overhead':                  'extensiones-overhead',
  'patadas de tríceps':                    'patadas-triceps',
  'sentadilla con barra':                  'sentadilla-barra',
  'sentadilla frontal':                    'sentadilla-barra',
  'sentadilla frontal o goblet':           'sentadilla-barra',
  'sentadilla goblet':                     'sentadilla-barra',
  'prensa de piernas':                     'prensa-pierna',
  'prensa de piernas (pies altos)':        'prensa-pierna',
  'peso muerto convencional':              'peso-muerto-convencional',
  'peso muerto sumo':                      'peso-muerto-convencional',
  'peso muerto rumano':                    'peso-muerto-rumano',
  'curl femoral':                          'curl-femoral',
  'curl femoral tumbado':                  'curl-femoral',
  'curl femoral en máquina':               'curl-femoral',
  'curl femoral (máquina)':                'curl-femoral',
  'hip thrust':                            'hip-thrust',
  'hip thrust con barra':                  'hip-thrust',
  'zancadas con mancuernas':               'zancadas',
  'zancadas':                              'zancadas',
  'elevaciones de gemelos':                'elevaciones-talones',
  'elevaciones de gemelos de pie':         'elevaciones-talones',
  'elevaciones de gemelos sentado':        'elevaciones-talones',
  'elevaciones de gemelos (de pie)':       'elevaciones-talones',
  'elevaciones de gemelos (sentado)':      'elevaciones-talones',
  'elevaciones de talones':                'elevaciones-talones',
  'extensiones de cuádriceps':             'prensa-pierna',
  'hack squat':                            'hack-squat',
  'abdominales':                           'crunch-polea',
  'abdominales colgado':                   'elevaciones-piernas-flexion',
  'abdominales decline':                   'crunch-polea',
  'abdominales (rueda o decline)':         'crunch-polea',
  'plancha':                               'plancha',
  'plancha abdominal':                     'plancha',
  'plancha lateral':                       'plancha',
  'abducción de cadera en máquina':        'hip-thrust',
};

/** Convierte "6-8" → [6,8]  |  "Al fallo" → [10,20]  |  "12" → 12 */
function parseReps(reps: string): number | [number, number] {
  const clean = reps.toLowerCase().trim();
  if (clean === 'al fallo') return [10, 20];
  const seg = clean.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (seg) return [parseInt(seg[1]), parseInt(seg[2])];
  const single = clean.match(/^(\d+)/);
  if (single) return parseInt(single[1]);
  return [8, 12];
}

function lookupExercise(nombre: string): ExerciseKnowledge | undefined {
  const key = nombre.toLowerCase().trim();
  const id = NAME_TO_ID[key];
  if (id) return exercisesData.find(e => e.id === id);
  // Fallback: buscar por nombre parcial
  return exercisesData.find(e => e.nombre.toLowerCase().includes(key.split(' ').slice(0, 2).join(' ')));
}

function makeStubExercise(nombre: string, idx: number): ExerciseKnowledge {
  return {
    id: `fullw-stub-${idx}`,
    nombre,
    grupoMuscular: 'pecho' as GrupoMuscular,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: [],
    enfoqueMuscular: [],
    tecnica: {
      posicionInicial: '',
      ejecucion: [],
      erroresComunes: [],
      consejosClave: [],
    },
    imagenes: { posicionInicial: '', ejecucion: [], errores: [] },
    variantes: [],
    descansoSugerido: 120,
  };
}

export function fullWToRutinaSemanal(
  rutina: FullWRoutine,
  userId: string
): RutinaSemanal {
  let stubIdx = 0;
  const dias: DiaRutina[] = rutina.plan.map((dia, orden) => {
    const ejercicios: EjercicioEnRutina[] = dia.ejercicios.map((ej: FullWExercise) => {
      const found = lookupExercise(ej.nombre);
      const ejercicio = found ?? makeStubExercise(ej.nombre, stubIdx++);
      return {
        ejercicioId: ejercicio.id,
        ejercicio,
        seriesObjetivo: ej.series,
        repsObjetivo: parseReps(ej.reps),
        notas: ej.notas,
      };
    });

    return {
      id: `fullw-dia-${orden + 1}`,
      nombre: dia.nombre,
      grupos: [] as GrupoMuscular[],
      ejercicios,
      duracionEstimada: Math.round(ejercicios.length * 8 + 10),
      orden: orden + 1,
    };
  });

  return {
    id: `${rutina.id}-${Date.now()}`,
    userId,
    nombre: rutina.nombre,
    descripcion: rutina.descripcion,
    dias,
    fechaCreacion: new Date(),
    activa: true,
  };
}
