import type { ExerciseKnowledge } from '@/types';
import { GrupoMuscular } from '@/types';

export const exercisesData: ExerciseKnowledge[] = [
  // PECHO - Tier S
  {
    id: 'press-banca-barra',
    nombre: 'Press de Banca con Barra',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['pectoral mayor', 'tríceps', 'deltoides anterior'],
    tecnica: {
      posicionInicial: 'Acostado en banco plano, pies firmes en el suelo, escápulas retraídas, agarre ligeramente más ancho que los hombros',
      ejecucion: [
        'Desciende la barra de forma controlada hasta el pecho medio-bajo',
        'Mantén los codos a 45-60 grados del cuerpo',
        'Empuja explosivamente manteniendo las escápulas retraídas',
        'No bloquees completamente los codos en la parte superior'
      ],
      erroresComunes: [
        'Levantar los glúteos del banco',
        'Rebotar la barra en el pecho',
        'Codos demasiado abiertos (90 grados)',
        'Perder la retracción escapular'
      ],
      consejosClave: [
        'Piensa en "doblar la barra" para activar mejor el pecho',
        'Mantén tensión constante en el pectoral',
        'Respira: inspira al bajar, exhala al subir'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/bench-press-start.jpg',
      ejecucion: ['/exercises/bench-press-mid.jpg', '/exercises/bench-press-end.jpg'],
      errores: ['/exercises/bench-press-error1.jpg']
    },
    variantes: [
      { nombre: 'Press Banca con Mancuernas', cuando: 'Mayor rango de movimiento', tier: 'S' },
      { nombre: 'Press Inclinado', cuando: 'Énfasis en pectoral superior', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['empuje', 'principal']
  },
  {
    id: 'press-banca-mancuernas',
    nombre: 'Press de Banca con Mancuernas',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['pectoral mayor', 'estabilizadores'],
    tecnica: {
      posicionInicial: 'Acostado en banco, mancuernas a la altura del pecho, palmas hacia adelante',
      ejecucion: [
        'Empuja las mancuernas hacia arriba siguiendo una ligera curva',
        'Las mancuernas deben casi tocarse arriba pero sin chocar',
        'Desciende controladamente hasta sentir estiramiento',
        'Mantén los codos a 45 grados'
      ],
      erroresComunes: [
        'Chocar las mancuernas arriba',
        'Descender demasiado profundo sin control',
        'Perder la estabilidad'
      ],
      consejosClave: [
        'Mayor rango de movimiento que con barra',
        'Excelente para corregir desbalances',
        'Requiere más estabilización'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/db-bench-start.jpg',
      ejecucion: ['/exercises/db-bench-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Press Inclinado con Mancuernas', cuando: 'Pectoral superior', tier: 'S' }
    ],
    descansoSugerido: 180,
    tags: ['empuje', 'principal']
  },

  // PECHO - Tier A
  {
    id: 'press-inclinado',
    nombre: 'Press Inclinado con Barra',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['pectoral superior', 'deltoides anterior'],
    tecnica: {
      posicionInicial: 'Banco inclinado a 30-45 grados, mismo setup que press plano',
      ejecucion: [
        'Desciende hacia la clavícula/pecho superior',
        'Empuja en línea recta hacia arriba',
        'Mantén escápulas retraídas'
      ],
      erroresComunes: [
        'Inclinación muy pronunciada (>45°) convierte en press hombros',
        'Arquearse demasiado'
      ],
      consejosClave: [
        '30 grados es óptimo para pectoral superior',
        'Usar menos peso que en press plano'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/incline-bench-start.jpg',
      ejecucion: ['/exercises/incline-bench-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 150,
    tags: ['empuje', 'pectoral_superior']
  },

  // ESPALDA - Tier S
  {
    id: 'dominadas',
    nombre: 'Dominadas (Pull-ups)',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['dorsal ancho', 'bíceps', 'trapecio'],
    tecnica: {
      posicionInicial: 'Agarre pronado (palmas hacia afuera), manos al ancho de hombros o ligeramente más',
      ejecucion: [
        'Inicia el movimiento deprimiendo las escápulas',
        'Piensa en llevar los codos hacia las caderas',
        'Sube hasta que el mentón pase la barra',
        'Desciende controladamente hasta extensión completa'
      ],
      erroresComunes: [
        'Usar impulso (kipping)',
        'No bajar completamente',
        'Encoger hombros hacia las orejas'
      ],
      consejosClave: [
        'El mejor ejercicio para desarrollar espalda ancha',
        'Si no puedes hacer una, usa bandas de resistencia',
        'Variación en agarre trabaja diferentes ángulos'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/pullup-start.jpg',
      ejecucion: ['/exercises/pullup-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Chin-ups (supino)', cuando: 'Mayor énfasis en bíceps', tier: 'S' },
      { nombre: 'Pulldowns', cuando: 'Si no puedes hacer dominadas', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['tiron_vertical', 'principal']
  },
  {
    id: 'remo-barra',
    nombre: 'Remo con Barra',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'avanzado',
    equipamiento: ['barra'],
    enfoqueMuscular: ['dorsal ancho', 'trapecio medio', 'romboides'],
    tecnica: {
      posicionInicial: 'Bisagra de cadera, torso casi paralelo al suelo, rodillas ligeramente flexionadas',
      ejecucion: [
        'Tira de la barra hacia el ombligo/pecho bajo',
        'Mantén los codos cerca del cuerpo',
        'Aprieta escápulas en la contracción',
        'Baja controladamente'
      ],
      erroresComunes: [
        'Levantar demasiado el torso (trampa)',
        'Tirar con los brazos en vez de la espalda',
        'Redondear la espalda baja'
      ],
      consejosClave: [
        'Fundamental para grosor de espalda',
        'Mantén el core muy tenso',
        'Agarre supino enfatiza más el bíceps y dorsal bajo'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/barbell-row-start.jpg',
      ejecucion: ['/exercises/barbell-row-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Remo con Mancuernas a 1 brazo', cuando: 'Corregir asimetrías', tier: 'S' },
      { nombre: 'Remo en Máquina', cuando: 'Menor estrés en la espalda baja', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['tiron_horizontal', 'principal']
  },

  // PIERNAS - Tier S
  {
    id: 'sentadilla-barra',
    nombre: 'Sentadilla con Barra (Back Squat)',
    grupoMuscular: GrupoMuscular.PIERNAS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['cuádriceps', 'glúteos', 'femorales'],
    tecnica: {
      posicionInicial: 'Barra en trapecios superiores, pies al ancho de hombros, puntas ligeramente hacia afuera',
      ejecucion: [
        'Desciende empujando las caderas atrás y flexionando rodillas',
        'Mantén el pecho arriba y espalda neutra',
        'Baja hasta que las caderas estén al nivel de las rodillas (paralelo)',
        'Empuja a través de los talones para subir'
      ],
      erroresComunes: [
        'Rodillas colapsando hacia adentro',
        'Talones levantándose del suelo',
        'Redondear la espalda baja',
        'No llegar a profundidad'
      ],
      consejosClave: [
        'El rey de los ejercicios de pierna',
        'Respira profundo y mantén el core tenso',
        'La profundidad es más importante que el peso'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/squat-start.jpg',
      ejecucion: ['/exercises/squat-mid.jpg', '/exercises/squat-bottom.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Front Squat', cuando: 'Más énfasis en cuádriceps', tier: 'A' },
      { nombre: 'Goblet Squat', cuando: 'Aprender técnica', tier: 'B' }
    ],
    descansoSugerido: 240,
    tags: ['principal', 'empuje_pierna']
  },
  {
    id: 'peso-muerto',
    nombre: 'Peso Muerto Convencional',
    grupoMuscular: GrupoMuscular.FEMORALES_GLUTEOS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'avanzado',
    equipamiento: ['barra'],
    enfoqueMuscular: ['femorales', 'glúteos', 'espalda baja', 'trapecio'],
    tecnica: {
      posicionInicial: 'Pies debajo de la barra, agarre al ancho de hombros, cadera arriba de rodillas',
      ejecucion: [
        'Tensa todo el cuerpo, especialmente el core',
        'Empuja el suelo con los pies',
        'Mantén la barra pegada al cuerpo',
        'Extiende caderas y rodillas simultáneamente',
        'Lockout completo arriba'
      ],
      erroresComunes: [
        'Redondear la espalda',
        'Separar la barra del cuerpo',
        'Iniciar con las caderas muy bajas',
        'Hiperextender la espalda arriba'
      ],
      consejosClave: [
        'El ejercicio que más músculo total activa',
        'Prioriza siempre la técnica sobre el peso',
        'Usa straps solo cuando el agarre falle antes que los músculos objetivo'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/deadlift-start.jpg',
      ejecucion: ['/exercises/deadlift-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Peso Muerto Rumano', cuando: 'Aislar femorales', tier: 'S' },
      { nombre: 'Trap Bar Deadlift', cuando: 'Menos estrés en espalda baja', tier: 'A' }
    ],
    descansoSugerido: 240,
    tags: ['principal', 'bisagra_cadera']
  },

  // HOMBROS - Tier S
  {
    id: 'press-militar',
    nombre: 'Press Militar con Barra',
    grupoMuscular: GrupoMuscular.HOMBROS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['deltoides anterior', 'deltoides lateral', 'tríceps'],
    tecnica: {
      posicionInicial: 'De pie, barra a la altura de clavículas, agarre al ancho de hombros',
      ejecucion: [
        'Empuja la barra en línea recta hacia arriba',
        'Mete ligeramente la cabeza atrás cuando la barra pasa',
        'Lockout completo arriba con bíceps junto a orejas',
        'Baja controladamente a clavículas'
      ],
      erroresComunes: [
        'Arquear demasiado la espalda',
        'Empujar la barra hacia adelante',
        'No llevar la barra completamente arriba'
      ],
      consejosClave: [
        'El mejor ejercicio para hombros fuertes',
        'Mantén el core muy tenso',
        'Variante sentado reduce trampa pero también carga'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/ohp-start.jpg',
      ejecucion: ['/exercises/ohp-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Press Arnold', cuando: 'Mayor rango de movimiento', tier: 'A' },
      { nombre: 'Press con Mancuernas', cuando: 'Corregir desbalances', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['empuje_vertical', 'principal']
  },

  // BÍCEPS - Tier A
  {
    id: 'curl-barra',
    nombre: 'Curl de Bíceps con Barra',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['barra'],
    enfoqueMuscular: ['bíceps braquial', 'braquial anterior'],
    tecnica: {
      posicionInicial: 'De pie, barra con agarre supino al ancho de hombros, codos pegados al torso',
      ejecucion: [
        'Flexiona los codos llevando la barra hacia los hombros',
        'Mantén los codos fijos en su posición',
        'Contracción máxima arriba',
        'Baja controladamente'
      ],
      erroresComunes: [
        'Balancear el cuerpo (usar impulso)',
        'Mover los codos hacia adelante',
        'No bajar completamente'
      ],
      consejosClave: [
        'La clave es la tensión constante',
        'Mejor con barra EZ si hay molestias en muñecas',
        'No es necesario peso excesivo'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/barbell-curl-start.jpg',
      ejecucion: ['/exercises/barbell-curl-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Curl con Mancuernas', cuando: 'Trabajo unilateral', tier: 'A' },
      { nombre: 'Curl Martillo', cuando: 'Enfatizar braquial', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos']
  },

  // TRÍCEPS - Tier A
  {
    id: 'fondos-paralelas',
    nombre: 'Fondos en Paralelas',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['tríceps', 'pectoral inferior'],
    tecnica: {
      posicionInicial: 'Brazos extendidos en barras paralelas, cuerpo suspendido',
      ejecucion: [
        'Desciende flexionando codos hasta 90 grados',
        'Mantén el cuerpo lo más vertical posible para enfatizar tríceps',
        'Empuja hasta extensión completa',
        'No bloquees los codos con violencia'
      ],
      erroresComunes: [
        'Inclinarse demasiado hacia adelante (enfatiza pecho)',
        'Descender demasiado (estrés en hombros)',
        'Encoger los hombros'
      ],
      consejosClave: [
        'Uno de los mejores para masa de tríceps',
        'Si es muy fácil, agrega peso',
        'Si es muy difícil, usa máquina asistida'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/dips-start.jpg',
      ejecucion: ['/exercises/dips-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Dips en Banco', cuando: 'Menos intensidad', tier: 'B' }
    ],
    descansoSugerido: 120,
    tags: ['empuje', 'principal_triceps']
  },

  // Ejercicios adicionales Tier A/B
  {
    id: 'lat-pulldown',
    nombre: 'Jalón al Pecho (Lat Pulldown)',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['polea', 'maquina'],
    enfoqueMuscular: ['dorsal ancho'],
    tecnica: {
      posicionInicial: 'Sentado en máquina, agarre pronado ligeramente más ancho que hombros',
      ejecucion: [
        'Deprime escápulas y tira hacia el pecho superior',
        'Piensa en llevar los codos hacia abajo y atrás',
        'Ligera inclinación del torso',
        'Contracción completa abajo'
      ],
      erroresComunes: [
        'Tirar detrás del cuello (peligroso)',
        'Usar demasiado impulso',
        'No retraer escápulas'
      ],
      consejosClave: [
        'Excelente alternativa a dominadas',
        'Permite más control del peso'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/lat-pulldown-start.jpg',
      ejecucion: ['/exercises/lat-pulldown-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 120,
    tags: ['tiron_vertical']
  },
  {
    id: 'prensa-pierna',
    nombre: 'Prensa de Piernas',
    grupoMuscular: GrupoMuscular.PIERNAS,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['maquina'],
    enfoqueMuscular: ['cuádriceps', 'glúteos'],
    tecnica: {
      posicionInicial: 'Espalda baja pegada al respaldo, pies al ancho de hombros en plataforma',
      ejecucion: [
        'Baja controladamente hasta 90 grados de flexión',
        'Empuja a través de todo el pie',
        'No bloquees completamente las rodillas arriba',
        'No despegues la espalda baja del respaldo'
      ],
      erroresComunes: [
        'Bajar demasiado (pelvis se despega)',
        'Rodillas colapsando hacia adentro',
        'Bloquear rodillas con violencia'
      ],
      consejosClave: [
        'Permite cargar mucho peso de forma segura',
        'Pies más arriba enfatiza glúteos/femorales',
        'Pies más abajo enfatiza cuádriceps'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/leg-press-start.jpg',
      ejecucion: ['/exercises/leg-press-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 180,
    tags: ['empuje_pierna']
  },
  {
    id: 'elevaciones-laterales',
    nombre: 'Elevaciones Laterales con Mancuernas',
    grupoMuscular: GrupoMuscular.HOMBROS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['deltoides lateral'],
    tecnica: {
      posicionInicial: 'De pie, mancuernas a los lados, ligera flexión de codos',
      ejecucion: [
        'Eleva los brazos hacia los lados hasta la altura de hombros',
        'Mantén ligera flexión en codos',
        'Piensa en "verter agua" al subir',
        'Baja controladamente'
      ],
      erroresComunes: [
        'Usar demasiado peso (usar impulso)',
        'Elevar por encima de los hombros',
        'Encoger los hombros'
      ],
      consejosClave: [
        'Clave para anchura de hombros',
        'Menos peso, más control',
        'Conecta mente-músculo'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/lateral-raise-start.jpg',
      ejecucion: ['/exercises/lateral-raise-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Elevaciones en Polea', cuando: 'Tensión constante', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_hombro']
  },
  {
    id: 'curl-femoral',
    nombre: 'Curl Femoral en Máquina',
    grupoMuscular: GrupoMuscular.FEMORALES_GLUTEOS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['maquina'],
    enfoqueMuscular: ['femorales'],
    tecnica: {
      posicionInicial: 'Acostado boca abajo, rodillas alineadas con el eje de la máquina',
      ejecucion: [
        'Flexiona las rodillas llevando talones hacia glúteos',
        'Contracción máxima arriba',
        'Baja controladamente sin dejar caer el peso',
        'No arquees la espalda baja'
      ],
      erroresComunes: [
        'Levantar las caderas',
        'Usar impulso',
        'Rango de movimiento parcial'
      ],
      consejosClave: [
        'Esencial para equilibrio muscular de piernas',
        'Previene lesiones de rodilla',
        'Pausa arriba para mayor activación'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/leg-curl-start.jpg',
      ejecucion: ['/exercises/leg-curl-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento_pierna']
  }
];
