import type { ExerciseKnowledge } from '@/types';
import { GrupoMuscular } from '@/types';

export const exercisesData: ExerciseKnowledge[] = [
  // ============================================
  // PECHO - Tier S
  // ============================================
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
      posicionInicial: 'Acostado en banco plano. PRIMERO: retracción escapular (hombros hacia atrás y abajo), luego pies firmes en el suelo. Agarre ligeramente más ancho que los hombros. Arco lumbar natural como resultado de escápulas retraídas.',
      ejecucion: [
        'Desciende la barra en trayectoria DIAGONAL hacia los pezones/pecho medio-bajo (NO vertical)',
        'Mantén FORMA DE FLECHA: codos a 45° del torso, NUNCA 90° (protege manguito rotador)',
        'Toca el pecho suavemente sin rebotar',
        'Empuja explosivamente manteniendo escápulas retraídas todo el tiempo',
        'Muñecas rectas en línea con antebrazos (NO dobladas hacia atrás)'
      ],
      erroresComunes: [
        'CRÍTICO: Codos a 90° del torso - Daña hombros y manguito rotador',
        'Perder la retracción escapular durante el movimiento',
        'Rebotar la barra violentamente en el pecho',
        'Bajar la barra verticalmente en lugar de diagonal',
        'Levantar los glúteos del banco',
        'Muñecas dobladas hacia atrás (riesgo de lesión)'
      ],
      consejosClave: [
        'RETRACCIÓN ESCAPULAR es NO NEGOCIABLE: hombros atrás y abajo ANTES de empezar',
        'Visualiza "doblar la barra" para activar mejor el pecho',
        'Trayectoria diagonal hacia pezones, no línea recta vertical',
        'Contacto suave con pecho, mantén control en todo momento'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/bench-press-start.jpg',
      ejecucion: ['/exercises/bench-press-mid.jpg', '/exercises/bench-press-end.jpg'],
      errores: ['/exercises/bench-press-error-elbows.jpg']
    },
    variantes: [
      { nombre: 'Press Banca con Mancuernas', cuando: 'Mayor rango de movimiento y trabajo unilateral', tier: 'S' },
      { nombre: 'Press Inclinado 15-30°', cuando: 'Énfasis en pectoral superior (crítico para desarrollo completo)', tier: 'A' },
      { nombre: 'Press con agarre cerrado', cuando: 'Mayor énfasis en tríceps', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['empuje', 'principal', 'requiere_retraccion_escapular']
  },
  {
    id: 'press-banca-mancuernas',
    nombre: 'Press de Banca con Mancuernas',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['pectoral mayor', 'estabilizadores', 'tríceps'],
    tecnica: {
      posicionInicial: 'Acostado en banco, retracción escapular PRIMERO. Mancuernas a altura del pecho, palmas hacia adelante. Arco natural por escápulas retraídas.',
      ejecucion: [
        'Empuja las mancuernas hacia arriba en trayectoria ligeramente convergente',
        'Las mancuernas casi se tocan arriba pero SIN chocar',
        'Desciende controladamente hasta sentir estiramiento máximo del pectoral',
        'Mantén codos en forma de flecha (45°), NO 90°',
        'Mayor rango de movimiento que con barra: baja más profundo'
      ],
      erroresComunes: [
        'Chocar las mancuernas arriba violentamente',
        'Descender demasiado profundo perdiendo control y tensión',
        'Perder retracción escapular',
        'Codos muy abiertos (90°)'
      ],
      consejosClave: [
        'Rango de movimiento superior a barra (las mancuernas pasan del nivel del torso)',
        'Excelente para corregir desbalances izquierda-derecha',
        'Requiere más músculos estabilizadores que barra',
        'Mantén retracción escapular constante'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/db-bench-start.jpg',
      ejecucion: ['/exercises/db-bench-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Press Inclinado con Mancuernas', cuando: 'Pectoral superior con rango completo', tier: 'S' },
      { nombre: 'Press con agarre neutro', cuando: 'Menos estrés en hombros', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['empuje', 'principal', 'requiere_retraccion_escapular']
  },

  // PECHO - Tier A
  {
    id: 'press-inclinado-barra',
    nombre: 'Press Inclinado con Barra',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['pectoral superior', 'deltoides anterior', 'tríceps'],
    tecnica: {
      posicionInicial: 'Banco inclinado a 15-30° (30° es óptimo según ADN). Mismo setup que press plano: retracción escapular PRIMERO, pies firmes, arco natural.',
      ejecucion: [
        'Desciende hacia clavícula/pecho superior en diagonal',
        'Forma de flecha: codos 45° del torso',
        'Empuja en línea recta hacia arriba',
        'Mantén escápulas retraídas durante TODO el movimiento',
        'Contacto suave con parte superior del pecho'
      ],
      erroresComunes: [
        'Inclinación muy pronunciada (>45°) convierte en press de hombros',
        'Arquear demasiado la espalda baja (compensación)',
        'Perder retracción escapular',
        'Codos a 90° (daña hombros)'
      ],
      consejosClave: [
        'CRÍTICO para pectoral superior - desarrollo completo requiere este ejercicio',
        '15-30° es el rango óptimo, más es press de hombros',
        'Usar 10-20% menos peso que press plano es normal',
        'Mantén forma de flecha y retracción escapular'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/incline-bench-start.jpg',
      ejecucion: ['/exercises/incline-bench-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Press Inclinado con Mancuernas', cuando: 'Mayor rango de movimiento', tier: 'S' },
      { nombre: 'Press a 15°', cuando: 'Menos énfasis en hombros', tier: 'A' }
    ],
    descansoSugerido: 150,
    tags: ['empuje', 'pectoral_superior', 'requiere_retraccion_escapular']
  },
  {
    id: 'aperturas-mancuernas',
    nombre: 'Aperturas con Mancuernas (Flyes)',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['pectoral mayor (estiramiento)'],
    tecnica: {
      posicionInicial: 'Acostado en banco, retracción escapular. Brazos extendidos arriba con ligera flexión de codos (como abrazar un árbol).',
      ejecucion: [
        'Baja las mancuernas en arco amplio hasta sentir estiramiento MÁXIMO del pectoral',
        'Bajar ligeramente DETRÁS del nivel de hombros (estiramiento completo)',
        'Mantén codos SEMIFLEXIONADOS (NO rectos) para proteger articulaciones',
        'Sube apretando el pecho fuertemente',
        'NO choques las mancuernas arriba - detente justo antes'
      ],
      erroresComunes: [
        'Bajar con codos completamente rectos (estrés articular)',
        'No bajar suficiente - rango parcial pierde efectividad',
        'Chocar mancuernas arriba con violencia',
        'Usar demasiado peso y convertir en press'
      ],
      consejosClave: [
        'El objetivo es ESTIRAMIENTO máximo del pectoral',
        'Codos semiflexionados todo el tiempo (ángulo constante)',
        'Aprieta fuertemente arriba sin chocar mancuernas',
        'Mejor con peso moderado y control perfecto que peso alto'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/flyes-start.jpg',
      ejecucion: ['/exercises/flyes-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Aperturas en máquina', cuando: 'Tensión constante superior (si disponible)', tier: 'A' },
      { nombre: 'Cable flyes', cuando: 'Tensión constante en todo el rango', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento', 'estiramiento_pectoral']
  },
  {
    id: 'fondos-pecho',
    nombre: 'Fondos para Pecho (inclinado adelante)',
    grupoMuscular: GrupoMuscular.PECHO,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['pectoral inferior', 'tríceps'],
    tecnica: {
      posicionInicial: 'Brazos extendidos en paralelas, cuerpo suspendido. INCLINARSE HACIA ADELANTE para enfatizar pecho.',
      ejecucion: [
        'Inclina el torso hacia adelante (30-45°) - esto es clave para pecho',
        'Desciende hasta sentir estiramiento en pecho (aproximadamente 90° de codos)',
        'Codos ligeramente hacia afuera (más que en versión tríceps)',
        'Empuja hasta extensión completa',
        'Mantén inclinación hacia adelante todo el tiempo'
      ],
      erroresComunes: [
        'Mantenerse vertical - esto trabaja tríceps, NO pecho',
        'Descender demasiado (estrés excesivo en hombros)',
        'No inclinarse suficiente hacia adelante'
      ],
      consejosClave: [
        'La inclinación hacia adelante es lo que activa pecho inferior',
        'Vertical = tríceps, Inclinado = pecho',
        'Excelente para pectoral inferior',
        'Si es muy difícil: usar máquina asistida. Si muy fácil: agregar peso'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/chest-dips-start.jpg',
      ejecucion: ['/exercises/chest-dips-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Fondos verticales', cuando: 'Énfasis en tríceps en lugar de pecho', tier: 'S' }
    ],
    descansoSugerido: 120,
    tags: ['empuje', 'pectoral_inferior', 'peso_corporal']
  },

  // ============================================
  // ESPALDA - Tier S
  // ============================================
  {
    id: 'dominadas',
    nombre: 'Dominadas (Pull-ups) - Agarre Prono',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['dorsal ancho', 'trapecio', 'bíceps'],
    tecnica: {
      posicionInicial: 'Agarre PRONO (palmas hacia afuera) al ancho de hombros o ligeramente más. Cuerpo colgado en línea recta, core tenso. NO cruces piernas innecesariamente.',
      ejecucion: [
        'PRIMERO: Retracción escapular activa (deprimir escápulas - "meter hombros en bolsillos")',
        'CLAVE: Piensa en TIRAR CON LOS CODOS hacia las costillas, NO con los brazos',
        'Visualiza "bajar la barra hacia ti" en lugar de "subir tu cuerpo"',
        'Codos en DIAGONAL hacia costillas (forma de flecha), NO completamente abiertos',
        'Sube hasta que PECHO pase la barra (barbilla es insuficiente)',
        'Baja controladamente hasta extensión completa (brazos rectos)'
      ],
      erroresComunes: [
        'CRÍTICO: Abrir demasiado los codos (90°) - estrés en hombros',
        'NO iniciar con retracción escapular - pierdes activación de dorsales',
        'Usar impulso/kipping en lugar de fuerza controlada',
        'Rango parcial - no bajar hasta extensión completa',
        'Encoger hombros hacia las orejas (lo opuesto a retracción)',
        'Cruzar piernas innecesariamente'
      ],
      consejosClave: [
        'EL MEJOR ejercicio para desarrollar espalda ancha (dorsal)',
        'RETRACCIÓN ESCAPULAR es fundamental: imagina meter hombros en bolsillos traseros',
        'Tirar con CODOS hacia dorsales, no con brazos/manos',
        'Para duplicar dominadas: NO al fallo, prioriza VOLUMEN TOTAL (ej: 5×4 reps > 3×8,5,3)',
        'Frecuencia: 2x/semana, 48h descanso mínimo, hacer al INICIO de rutina cuando fresco'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/pullup-start.jpg',
      ejecucion: ['/exercises/pullup-mid.jpg', '/exercises/pullup-top.jpg'],
      errores: ['/exercises/pullup-error-kipping.jpg']
    },
    variantes: [
      { nombre: 'Dominadas Chin-up (agarre supino)', cuando: 'Mayor énfasis en bíceps, úsalas en día de brazos para aumentar frecuencia', tier: 'S' },
      { nombre: 'Dominadas agarre neutro', cuando: 'Protección de hombros, mejor concentración', tier: 'S' },
      { nombre: 'Dominadas negativas', cuando: 'Principiantes: bajar en 3-5 segundos', tier: 'A' },
      { nombre: 'Dominadas australianas', cuando: 'Principiantes: barra baja con pies en suelo', tier: 'B' },
      { nombre: 'Jalón al pecho', cuando: 'Si no puedes hacer dominadas aún', tier: 'A' }
    ],
    descansoSugerido: 120,
    tags: ['tiron_vertical', 'principal', 'requiere_retraccion_escapular', 'rey_espalda']
  },
  {
    id: 'chin-ups',
    nombre: 'Dominadas Chin-up (Agarre Supino)',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['dorsal ancho', 'bíceps (énfasis mayor)', 'trapecio'],
    tecnica: {
      posicionInicial: 'Agarre SUPINO (palmas hacia ti) al ancho de hombros. Core tenso, cuerpo en línea recta.',
      ejecucion: [
        'Retracción escapular activa PRIMERO',
        'Tirar con codos hacia dorsales (mismo principio que pull-ups)',
        'El agarre supino activa más el bíceps que prono',
        'Sube hasta pecho sobre barra',
        'Control en fase excéntrica (bajada de 2-4 segundos)'
      ],
      erroresComunes: [
        'Mismos errores que dominadas clásicas',
        'Confiar solo en bíceps - dorsales deben iniciar el movimiento'
      ],
      consejosClave: [
        'Mayor activación de bíceps que dominadas pronadas',
        'ÚSALAS como complemento en día de brazos para aumentar frecuencia de dominadas',
        'Mantén CALIDAD y técnica, mismos principios que pull-ups clásicas',
        'Respeta descansos de 48h entre sesiones de dominadas'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/chinup-start.jpg',
      ejecucion: ['/exercises/chinup-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Dominadas pronadas', cuando: 'Máximo énfasis en dorsales', tier: 'S' }
    ],
    descansoSugerido: 120,
    tags: ['tiron_vertical', 'principal', 'enfasis_biceps', 'requiere_retraccion_escapular']
  },
  {
    id: 'remo-barra',
    nombre: 'Remo con Barra (Bent-Over Row)',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'avanzado',
    equipamiento: ['barra'],
    enfoqueMuscular: ['dorsal ancho', 'trapecio medio', 'romboides', 'espalda media'],
    tecnica: {
      posicionInicial: 'Bisagra de cadera con torso inclinado CASI PARALELO al suelo (NO postura "trucha" con espalda recta vertical). Rodillas semiflexionadas, core MUY tenso. Agarre a altura de hombros.',
      ejecucion: [
        'Tirar barra hacia ABDOMEN/OMBLIGO (NO hacia hombros ni pecho)',
        'FORMA DE FLECHA: codos a 45° del torso, pegados al cuerpo',
        'Tirar con CODOS, pensando en "estirar la barra hacia dorsales"',
        'Apretar escápulas fuertemente en la contracción (retracción máxima)',
        'Baja controladamente con fase excéntrica lenta (2-4 segundos)',
        'Torso estable - NO balanceo'
      ],
      erroresComunes: [
        'CRÍTICO: Espalda completamente recta/vertical (modo "trucha") - pierde efectividad',
        'Llevar barra hacia hombros en lugar de abdomen',
        'Codos muy abiertos (90°) en lugar de forma de flecha',
        'Balancear el torso para ayudar (trampa)',
        'Tirar con brazos en lugar de con dorsales/escápulas',
        'Redondear la espalda baja (peligro de lesión)'
      ],
      consejosClave: [
        'Torso CASI PARALELO al suelo para máxima activación',
        'Barra hacia ABDOMEN, codos en FORMA DE FLECHA (45°)',
        'Agarre a altura de hombros (ligeramente más ancho que hombros)',
        'Core MUY tenso para proteger espalda baja',
        'Fundamental para GROSOR y DENSIDAD de espalda'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/barbell-row-start.jpg',
      ejecucion: ['/exercises/barbell-row-mid.jpg'],
      errores: ['/exercises/barbell-row-error-upright.jpg']
    },
    variantes: [
      { nombre: 'Remo con agarre supino', cuando: 'Más activación de bíceps y dorsal bajo', tier: 'S' },
      { nombre: 'Remo unilateral con mancuerna', cuando: 'Corregir asimetrías, favorito casa/gym', tier: 'S' },
      { nombre: 'Remo Gironda agarre cerrado', cuando: 'Densidad espalda media y alta', tier: 'A' },
      { nombre: 'Remo en máquina con apoyo', cuando: 'Máxima concentración, menos fatiga antebrazos', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['tiron_horizontal', 'principal', 'grosor_espalda']
  },
  {
    id: 'remo-mancuerna-unilateral',
    nombre: 'Remo Unilateral con Mancuerna',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['dorsal ancho', 'trapecio medio', 'romboides'],
    tecnica: {
      posicionInicial: 'Rodilla y mano de apoyo en banco. Torso paralelo al suelo. Mancuerna en mano libre, brazo extendido.',
      ejecucion: [
        'CLAVE: Tirar con CODO pegado al torso (forma de flecha)',
        'Llevar mancuerna hasta la cadera/cintura',
        'CONCENTRARSE en fase negativa: bajada LENTA (2-4 segundos)',
        'Llevar peso hasta ESTIRAMIENTO COMPLETO abajo',
        'Mantén torso estable, sin rotación'
      ],
      erroresComunes: [
        'Rotar el torso para ayudar (trampa)',
        'No bajar hasta estiramiento completo',
        'Tirar hacia hombro en lugar de hacia cadera',
        'Codo muy abierto del torso'
      ],
      consejosClave: [
        'Ejercicio FAVORITO para casa y gym (según ADN)',
        'Codo PEGADO al torso durante todo el movimiento',
        'Bajada LENTA concentrándose en fase negativa',
        'Peso completo hasta estiramiento máximo',
        'Excelente para corregir desbalances lado a lado'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/db-row-start.jpg',
      ejecucion: ['/exercises/db-row-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Remo bilateral con mancuernas', cuando: 'Ambos brazos simultáneamente', tier: 'A' },
      { nombre: 'Remo en banco inclinado', cuando: 'Mayor estabilidad', tier: 'A' }
    ],
    descansoSugerido: 120,
    tags: ['tiron_horizontal', 'favorito_adn', 'unilateral']
  },
  {
    id: 'remo-gironda',
    nombre: 'Remo Gironda con Agarre Cerrado',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['espalda media', 'espalda alta', 'densidad'],
    tecnica: {
      posicionInicial: 'Similar a remo con barra pero con agarre CERRADO (manos más juntas). Torso inclinado.',
      ejecucion: [
        'Llevar barra hacia pecho medio-alto (más arriba que remo tradicional)',
        'Brazos ligeramente separados del torso formando flecha',
        'Enfoque en densidad de espalda media y alta',
        'Apretar escápulas fuertemente'
      ],
      erroresComunes: [
        'Usar demasiado peso y perder forma',
        'Balanceo excesivo del torso'
      ],
      consejosClave: [
        'Ideal para lograr DENSIDAD en espalda media y alta',
        'Agarre cerrado cambia el ángulo de trabajo',
        'Mantén postura estable'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/gironda-row-start.jpg',
      ejecucion: ['/exercises/gironda-row-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 120,
    tags: ['tiron_horizontal', 'densidad_espalda', 'agarre_cerrado']
  },

  // ESPALDA - Tier A
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
      posicionInicial: 'Sentado en máquina. Agarre PRONO ligeramente más ancho que hombros (o usar barra agarre neutro para mejor concentración y cuidado del hombro).',
      ejecucion: [
        'Piensa en ESTIRAR LA BARRA con los codos hacia dorsales (NO con brazos)',
        'Retracción escapular activa',
        'Llevar barra a parte superior O inferior del pecho (variar sensaciones)',
        'Ligera inclinación del torso hacia atrás es aceptable',
        'Contracción completa abajo, estiramiento completo arriba'
      ],
      erroresComunes: [
        'NUNCA tirar detrás del cuello (peligroso para hombros)',
        'Usar demasiado impulso/balanceo',
        'NO retraer escápulas - pierdes activación',
        'Tirar solo con brazos en lugar de dorsales'
      ],
      consejosClave: [
        'Uno de los MEJORES para dorsal ancho',
        'Barra agarre NEUTRO: mejor concentración y protección de hombros',
        'En CASA: la variante son DOMINADAS (visualiza bajar barra más que subir cuerpo)',
        'Si no tienes barra dominadas en casa: Pullover con mancuerna (no es igual pero similar)',
        'Excelente alternativa si aún no puedes hacer dominadas'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/lat-pulldown-start.jpg',
      ejecucion: ['/exercises/lat-pulldown-mid.jpg'],
      errores: ['/exercises/lat-pulldown-error-behind-neck.jpg']
    },
    variantes: [
      { nombre: 'Jalón con agarre neutro', cuando: 'Mejor concentración, protección hombros', tier: 'A' },
      { nombre: 'Dominadas', cuando: 'Versión avanzada con peso corporal', tier: 'S' },
      { nombre: 'Pullover con mancuerna', cuando: 'Casa sin barra dominadas', tier: 'B' }
    ],
    descansoSugerido: 120,
    tags: ['tiron_vertical', 'accesible_principiantes']
  },
  {
    id: 'remo-bilateral-apoyo',
    nombre: 'Remo Bilateral con Apoyo en Pecho',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['maquina'],
    enfoqueMuscular: ['espalda media', 'espalda alta', 'densidad'],
    tecnica: {
      posicionInicial: 'Pecho apoyado en respaldo de máquina. Brazos extendidos hacia adelante.',
      ejecucion: [
        'Brazos ligeramente separados del torso (forma de flecha)',
        'Tirón PARALELO al suelo',
        'Máxima concentración (el apoyo elimina compensaciones)',
        'Reduce fatiga en antebrazos'
      ],
      erroresComunes: [
        'No aprovechar el apoyo - seguir balanceando',
        'Brazos muy abiertos'
      ],
      consejosClave: [
        'Ideal para DENSIDAD espalda media y alta',
        'Máquina con apoyo permite MÁXIMA concentración',
        'Reduce fatiga de antebrazos gracias al ángulo paralelo',
        'En casa: mancuernas apoyadas en banco inclinado'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/chest-supported-row-start.jpg',
      ejecucion: ['/exercises/chest-supported-row-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Remo con mancuernas en banco inclinado', cuando: 'Versión casera', tier: 'A' }
    ],
    descansoSugerido: 120,
    tags: ['tiron_horizontal', 'densidad_espalda', 'con_apoyo']
  },
  {
    id: 'pullover-mancuerna',
    nombre: 'Pullover con Mancuerna',
    grupoMuscular: GrupoMuscular.ESPALDA,
    categoria: 'aislamiento',
    tier: 'B',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['dorsal ancho (estiramiento)', 'pectoral'],
    tecnica: {
      posicionInicial: 'Acostado perpendicular en banco (solo hombros apoyados) o longitudinal. Mancuerna sostenida con ambas manos sobre el pecho.',
      ejecucion: [
        'Bajar mancuerna en arco hacia atrás de la cabeza',
        'Sentir estiramiento en dorsales',
        'Subir contrayendo dorsales',
        'Brazos semiflexionados (constante)'
      ],
      erroresComunes: [
        'Doblar demasiado los codos (pierde efectividad)',
        'No bajar suficiente (falta estiramiento)'
      ],
      consejosClave: [
        'Alternativa CASERA a jalón al pecho si no tienes barra de dominadas',
        'NO es equivalente pero es lo más SIMILAR disponible',
        'Enfoque en estiramiento de dorsales',
        'Trabajo complementario, no principal'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/pullover-start.jpg',
      ejecucion: ['/exercises/pullover-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento', 'estiramiento_dorsal', 'alternativa_casa']
  },

  // ============================================
  // PIERNAS - Tier S
  // ============================================
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
      posicionInicial: 'Barra en trapecios superiores. Pies al ancho de hombros, puntas ligeramente hacia afuera (alineación natural con rodillas).',
      ejecucion: [
        'Desciende empujando caderas atrás y flexionando rodillas',
        'Mantén pecho arriba y espalda neutra (NO redondear)',
        'PROFUNDIDAD MÁXIMA que permita técnica correcta (idealmente caderas bajo rodillas)',
        'Rodillas alineadas con pies (NO colapsar hacia adentro)',
        'Empuja a través de todo el pie para subir'
      ],
      erroresComunes: [
        'Rodillas colapsando hacia adentro (valgo - peligro de lesión)',
        'Talones levantándose del suelo',
        'Redondear la espalda baja',
        'No llegar a profundidad adecuada (rango parcial)'
      ],
      consejosClave: [
        'El REY de los ejercicios de pierna',
        'PROFUNDIDAD es más importante que peso',
        'Respira profundo, mantén core MUY tenso',
        'Profundidad máxima trabaja cuádriceps Y glúteos completamente'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/squat-start.jpg',
      ejecucion: ['/exercises/squat-mid.jpg', '/exercises/squat-bottom.jpg'],
      errores: ['/exercises/squat-error-knee-valgus.jpg']
    },
    variantes: [
      { nombre: 'Front Squat', cuando: 'Más énfasis en cuádriceps, menos carga en espalda baja', tier: 'A' },
      { nombre: 'Goblet Squat', cuando: 'Aprender técnica, principiantes', tier: 'B' },
      { nombre: 'Sentadilla con mancuernas', cuando: 'Casa - más repeticiones por menor carga', tier: 'B' }
    ],
    descansoSugerido: 240,
    tags: ['principal', 'empuje_pierna', 'rey_pierna']
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
      posicionInicial: 'Glúteos FIRMEMENTE apretados contra asiento. Pies al centro de plataforma a altura de hombros. Inclinación leve de pies hacia fuera (alineación con rodillas).',
      ejecucion: [
        'Bajar controladamente hasta PROFUNDIDAD MÁXIMA que permita técnica',
        'Espalda baja NUNCA debe levantarse del respaldo (señal de profundidad excesiva)',
        'Empujar a través de todo el pie',
        'NO bloquear rodillas violentamente arriba',
        'Rodillas alineadas con pies (sin colapso)'
      ],
      erroresComunes: [
        'CRÍTICO: Pelvis/espalda baja se despega del respaldo (profundidad excesiva, riesgo)',
        'Rodillas colapsando hacia adentro',
        'Bloquear rodillas con violencia arriba',
        'Pies muy abajo - excesiva carga en rodillas'
      ],
      consejosClave: [
        'Permite cargar MUCHO peso de forma segura',
        'Pies más ARRIBA en plataforma: énfasis glúteos/femorales',
        'Pies más ABAJO: énfasis cuádriceps',
        'Profundidad hasta 90° flexión O máxima sin que pelvis se despegue',
        'Alternativa segura a sentadilla para principiantes'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/leg-press-start.jpg',
      ejecucion: ['/exercises/leg-press-mid.jpg'],
      errores: ['/exercises/leg-press-error-butt-lift.jpg']
    },
    variantes: [
      { nombre: 'Hack Squat Machine', cuando: 'Similar a prensa, más vertical', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['empuje_pierna', 'accesible_principiantes', 'seguro']
  },
  {
    id: 'hack-squat',
    nombre: 'Hack Squat Machine',
    grupoMuscular: GrupoMuscular.PIERNAS,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['maquina'],
    enfoqueMuscular: ['cuádriceps', 'glúteos'],
    tecnica: {
      posicionInicial: 'Similar a prensa: glúteos apretados contra respaldo, pies centrados en plataforma.',
      ejecucion: [
        'Mismos principios que prensa de piernas',
        'PROFUNDIDAD MÁXIMA para cuádriceps y glúteos',
        'Espalda baja NUNCA se levanta del respaldo',
        'Rodillas alineadas con pies'
      ],
      erroresComunes: [
        'Mismos que prensa de piernas',
        'Pelvis despegándose'
      ],
      consejosClave: [
        'Similar a prensa pero ángulo más vertical',
        'Excelente para cuádriceps',
        'Mismas reglas de seguridad que prensa'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/hack-squat-start.jpg',
      ejecucion: ['/exercises/hack-squat-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 180,
    tags: ['empuje_pierna', 'cuadriceps']
  },

  // FEMORALES Y GLÚTEOS - Tier S
  {
    id: 'peso-muerto-convencional',
    nombre: 'Peso Muerto Convencional',
    grupoMuscular: GrupoMuscular.FEMORALES_GLUTEOS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'avanzado',
    equipamiento: ['barra'],
    enfoqueMuscular: ['femorales', 'glúteos', 'espalda baja', 'trapecio'],
    tecnica: {
      posicionInicial: 'Pies debajo de la barra, agarre al ancho de hombros. Cadera arriba de rodillas. Espalda neutra.',
      ejecucion: [
        'Tensa TODO el cuerpo, especialmente CORE',
        'Empuja el suelo con los pies (mentalidad "leg press al suelo")',
        'Mantén barra PEGADA al cuerpo (roza piernas)',
        'Extiende caderas y rodillas simultáneamente',
        'Lockout completo arriba (NO hiperextender espalda)'
      ],
      erroresComunes: [
        'CRÍTICO: Redondear la espalda (riesgo alto de lesión)',
        'Separar la barra del cuerpo (pérdida de mecánica)',
        'Iniciar con caderas muy bajas (no es sentadilla)',
        'Hiperextender espalda arriba (innecesario)'
      ],
      consejosClave: [
        'El ejercicio que más músculo TOTAL activa',
        'TÉCNICA sobre peso SIEMPRE - prioridad absoluta',
        'Usa straps solo cuando agarre falla antes que músculos objetivo',
        'Core extremadamente tenso para proteger columna'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/deadlift-start.jpg',
      ejecucion: ['/exercises/deadlift-mid.jpg', '/exercises/deadlift-top.jpg'],
      errores: ['/exercises/deadlift-error-rounded-back.jpg']
    },
    variantes: [
      { nombre: 'Peso Muerto Rumano', cuando: 'Aislar femorales con énfasis en estiramiento', tier: 'S' },
      { nombre: 'Trap Bar Deadlift', cuando: 'Menos estrés en espalda baja', tier: 'A' }
    ],
    descansoSugerido: 240,
    tags: ['principal', 'bisagra_cadera', 'mas_musculos_activados']
  },
  {
    id: 'peso-muerto-rumano',
    nombre: 'Peso Muerto Rumano (RDL)',
    grupoMuscular: GrupoMuscular.FEMORALES_GLUTEOS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['barra'],
    enfoqueMuscular: ['femorales (énfasis)', 'glúteos', 'espalda baja'],
    tecnica: {
      posicionInicial: 'De pie con barra, rodillas LIGERAMENTE flexionadas (la flexión depende de comodidad individual).',
      ejecucion: [
        'Barra CERCA de piernas durante TODO el movimiento (debe rozar)',
        'Bajar hasta sentir ESTIRAMIENTO en femorales (aprox. debajo de rodillas)',
        'Bisagra de cadera: caderas hacia atrás',
        'Al subir: caderas hacia ADELANTE, NO es movimiento de espalda',
        'Mantén espalda neutra (NO redondear)'
      ],
      erroresComunes: [
        'Separar barra del cuerpo',
        'Doblar demasiado las rodillas (se convierte en peso muerto convencional)',
        'No bajar hasta sentir estiramiento',
        'Usar espalda para subir en lugar de caderas'
      ],
      consejosClave: [
        'ÉNFASIS en estiramiento de femorales',
        'Barra pegada a piernas - roza constantemente',
        'Rodillas semiflexionadas según comodidad',
        'Movimiento de CADERAS hacia adelante, no espalda',
        'Excelente para desarrollo de femorales'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/rdl-start.jpg',
      ejecucion: ['/exercises/rdl-mid.jpg', '/exercises/rdl-stretch.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'RDL con mancuernas', cuando: 'Casa o principiantes', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['bisagra_cadera', 'estiramiento_femorales', 'principal']
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
      posicionInicial: 'Acostado boca abajo. Rodillas alineadas con eje de la máquina. Almohadilla en parte baja de pantorrillas.',
      ejecucion: [
        'Flexiona rodillas llevando talones hacia glúteos',
        'Contracción MÁXIMA arriba (apretar fuerte)',
        'Baja controladamente SIN dejar caer el peso',
        'NO arquees la espalda baja para ayudar'
      ],
      erroresComunes: [
        'Levantar las caderas del banco (compensación)',
        'Usar impulso para subir',
        'Rango de movimiento parcial',
        'Arquear espalda baja'
      ],
      consejosClave: [
        'Esencial para EQUILIBRIO muscular de piernas',
        'Previene lesiones de rodilla',
        'PAUSA arriba (1-2 seg) para mayor activación',
        'Complementa peso muerto rumano'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/leg-curl-start.jpg',
      ejecucion: ['/exercises/leg-curl-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Curl Nórdico', cuando: 'Versión avanzada con peso corporal (muy difícil)', tier: 'S' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_pierna', 'femorales']
  },
  {
    id: 'zancadas',
    nombre: 'Zancadas / Split Squats',
    grupoMuscular: GrupoMuscular.PIERNAS,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna', 'barra'],
    enfoqueMuscular: ['cuádriceps', 'glúteos', 'estabilizadores'],
    tecnica: {
      posicionInicial: 'Posición de zancada: pie adelante, pie atrás. Torso erguido.',
      ejecucion: [
        'Bajar hasta que rodilla trasera casi toque el suelo',
        'Rodilla delantera alineada con pie (NO sobrepasa dedos excesivamente)',
        'Empujar con pierna delantera para subir',
        'Mantener torso erguido'
      ],
      erroresComunes: [
        'Rodilla delantera colapsando hacia adentro',
        'Torso inclinándose demasiado hacia adelante',
        'Rango parcial'
      ],
      consejosClave: [
        'Enfoque en cuádriceps Y glúteos',
        'Excelente trabajo unilateral',
        'Mejora equilibrio y estabilidad',
        'Puede hacerse caminando (walking lunges) o estático (split squat)'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/lunge-start.jpg',
      ejecucion: ['/exercises/lunge-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Bulgarian Split Squat', cuando: 'Pie trasero elevado - mayor dificultad', tier: 'A' },
      { nombre: 'Walking Lunges', cuando: 'Zancadas caminando', tier: 'A' }
    ],
    descansoSugerido: 120,
    tags: ['empuje_pierna', 'unilateral', 'equilibrio']
  },
  {
    id: 'hip-thrust',
    nombre: 'Hip Thrust',
    grupoMuscular: GrupoMuscular.FEMORALES_GLUTEOS,
    categoria: 'compuesto',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['barra', 'mancuerna'],
    enfoqueMuscular: ['glúteos (énfasis máximo)', 'femorales'],
    tecnica: {
      posicionInicial: 'Espalda alta apoyada en banco. Barra sobre cadera (usa pad/almohadilla). Pies plantados en suelo, rodillas flexionadas.',
      ejecucion: [
        'Empujar caderas hacia arriba hasta extensión completa',
        'Apretar glúteos FUERTEMENTE arriba (contracción máxima)',
        'Barbilla hacia pecho (evita hiperextensión de cuello)',
        'Bajar controladamente'
      ],
      erroresComunes: [
        'No llegar a extensión completa de cadera',
        'Hiperextender espalda baja en lugar de usar glúteos',
        'No apretar glúteos arriba'
      ],
      consejosClave: [
        'EL MEJOR ejercicio para desarrollo de glúteos',
        'Contracción máxima arriba es clave',
        'Usa almohadilla/pad en barra para comodidad',
        'En casa: mancuerna/mochila cargada funciona'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/hip-thrust-start.jpg',
      ejecucion: ['/exercises/hip-thrust-top.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Hip thrust con mancuerna', cuando: 'Casa o principiantes', tier: 'A' },
      { nombre: 'Glute bridge', cuando: 'Versión en suelo (menos rango)', tier: 'B' }
    ],
    descansoSugerido: 120,
    tags: ['extension_cadera', 'gluteos_principal']
  },
  {
    id: 'elevaciones-talones',
    nombre: 'Elevaciones de Talones (Calf Raises)',
    grupoMuscular: GrupoMuscular.PIERNAS,
    categoria: 'aislamiento',
    tier: 'B',
    dificultad: 'principiante',
    equipamiento: ['maquina', 'mancuerna'],
    enfoqueMuscular: ['pantorrillas (gastrocnemio, sóleo)'],
    tecnica: {
      posicionInicial: 'De pie (gastrocnemio) o sentado (sóleo). Bola del pie en plataforma, talón en el aire.',
      ejecucion: [
        'Subir hasta máxima contracción (punta de pies)',
        'Bajar hasta ESTIRAMIENTO COMPLETO (talón bajo plataforma)',
        'Rango completo es esencial',
        'Pausa arriba y abajo'
      ],
      erroresComunes: [
        'Rango parcial (muy común)',
        'Usar demasiado peso y perder rango',
        'No pausar en contracción'
      ],
      consejosClave: [
        'RANGO COMPLETO es absolutamente crítico',
        'De pie: gastrocnemio (gemelo grande)',
        'Sentado: sóleo (gemelo profundo)',
        'Pantorrillas responden a volumen alto'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/calf-raise-start.jpg',
      ejecucion: ['/exercises/calf-raise-top.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Calf raises sentado', cuando: 'Énfasis en sóleo', tier: 'B' },
      { nombre: 'Calf raises de pie', cuando: 'Énfasis en gastrocnemio', tier: 'B' }
    ],
    descansoSugerido: 60,
    tags: ['aislamiento_pierna', 'pantorrillas']
  },

  // ============================================
  // HOMBROS - Tier S
  // ============================================
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
      posicionInicial: 'De pie, barra a altura de clavículas. Agarre al ancho de hombros. Core tenso.',
      ejecucion: [
        'Empuja barra en línea recta hacia arriba',
        'Mete cabeza LIGERAMENTE atrás cuando barra pasa la cara',
        'Lockout completo arriba con bíceps junto a orejas',
        'Baja controladamente a clavículas',
        'Core MUY tenso para evitar arqueo excesivo'
      ],
      erroresComunes: [
        'Arquear demasiado la espalda baja (compensación peligrosa)',
        'Empujar barra hacia adelante en lugar de vertical',
        'No llevar barra completamente arriba',
        'Perder tensión del core'
      ],
      consejosClave: [
        'El MEJOR ejercicio para hombros fuertes',
        'ADVERTENCIA: Deltoides anterior ya recibe mucho trabajo en press de pecho',
        'NO sobreentrenar hombro haciendo demasiado press militar si entrenas pecho frecuentemente',
        'Core extremadamente tenso previene lesión lumbar',
        'Variante sentado reduce trampa pero también reduce carga total'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/ohp-start.jpg',
      ejecucion: ['/exercises/ohp-mid.jpg', '/exercises/ohp-top.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Press con Mancuernas', cuando: 'Corregir desbalances, mayor rango', tier: 'A' },
      { nombre: 'Press Arnold', cuando: 'Mayor rango de movimiento con rotación', tier: 'A' },
      { nombre: 'Press sentado', cuando: 'Menos trampa, menor carga total', tier: 'A' }
    ],
    descansoSugerido: 180,
    tags: ['empuje_vertical', 'principal', 'precaucion_sobreentrenamiento']
  },

  // HOMBROS - Tier A
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
      posicionInicial: 'De pie, mancuernas a los lados. Ligera flexión de codos (constante). PREFERIR EJECUCIÓN UNILATERAL (un brazo) para mantener tensión constante.',
      ejecucion: [
        'UNILATERAL: Inclinarse ligeramente y apoyarse en pared/estructura para estabilidad',
        'Elevar brazo hacia el lado hasta altura de hombro',
        'Mantén ligera flexión en codo (ángulo constante)',
        'Piensa en "verter agua de un vaso"',
        'Baja controladamente - fase excéntrica lenta'
      ],
      erroresComunes: [
        'Usar demasiado peso (fuerza uso de impulso)',
        'Elevar por ENCIMA de hombros (activa trapecio, no deltoides)',
        'Encoger los hombros hacia orejas',
        'Balancear el cuerpo'
      ],
      consejosClave: [
        'PREFERIR unilateral: inclinarse y apoyarse mantiene tensión constante',
        'MÁQUINAS proporcionan tensión constante superior a mancuernas',
        'Menos peso, MÁS control - clave para anchura de hombros',
        'Conexión mente-músculo es crítica',
        'DROPSETS muy efectivos: fallar con peso alto, continuar inmediatamente con peso más ligero'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/lateral-raise-start.jpg',
      ejecucion: ['/exercises/lateral-raise-mid.jpg'],
      errores: ['/exercises/lateral-raise-error-shrug.jpg']
    },
    variantes: [
      { nombre: 'Elevaciones laterales unilaterales', cuando: 'Mayor tensión constante (RECOMENDADO)', tier: 'A' },
      { nombre: 'Elevaciones en Polea', cuando: 'Tensión constante mecánica', tier: 'A' },
      { nombre: 'Elevaciones en Máquina', cuando: 'Tensión constante superior (IDEAL)', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_hombro', 'deltoides_lateral', 'anchura_hombros']
  },
  {
    id: 'pajaros-deltoides-posterior',
    nombre: 'Pájaros / Face Pulls (Deltoides Posterior)',
    grupoMuscular: GrupoMuscular.HOMBROS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['mancuerna', 'polea', 'maquina'],
    enfoqueMuscular: ['deltoides posterior', 'trapecio medio'],
    tecnica: {
      posicionInicial: 'Usar respaldo para ESTABILIZAR torso y RELAJAR trapecio. Brazos extendidos hacia adelante, ligeramente inclinados (NO 90°).',
      ejecucion: [
        'Elevar brazos hacia atrás/arriba (movimiento de "pájaro")',
        'Apretar escápulas en contracción',
        'Brazos ligeramente inclinados, NO perpendiculares al torso',
        'Enfoque en deltoides posterior'
      ],
      erroresComunes: [
        'Usar trapecio en lugar de deltoides posterior',
        'Brazos a 90° (ángulo muy alto)',
        'No usar respaldo (pierde estabilidad)'
      ],
      consejosClave: [
        'Respaldo estabiliza torso y RELAJA trapecio',
        'Máquina de aperturas inversas proporciona tensión constante',
        'Deltoides posterior a menudo sub-desarrollado - ejercicio importante',
        'Evita balanceo usando apoyo'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/rear-delt-fly-start.jpg',
      ejecucion: ['/exercises/rear-delt-fly-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Face pulls en polea', cuando: 'Alternativa con cuerda', tier: 'A' },
      { nombre: 'Reverse pec deck', cuando: 'Máquina con tensión constante (IDEAL)', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_hombro', 'deltoides_posterior', 'equilibrio_hombro']
  },

  // ============================================
  // BÍCEPS - Tier A
  // ============================================
  {
    id: 'curl-barra',
    nombre: 'Curl de Bíceps con Barra',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['barra'],
    enfoqueMuscular: ['bíceps braquial (ambas cabezas)', 'braquial anterior'],
    tecnica: {
      posicionInicial: 'De pie, barra con agarre supino al ancho de hombros. Codos PEGADOS al torso. Usar APOYO (pared, banco) para eliminar balanceo si es posible.',
      ejecucion: [
        'Flexiona codos llevando barra hacia hombros',
        'ARCO HACIA ADELANTE: alejar peso ligeramente para mantener tensión constante',
        'Mantén codos FIJOS pegados al torso (NO mover hacia adelante)',
        'Contracción máxima arriba',
        'Baja controladamente con antebrazos RECTOS (no flexionar hacia dentro)'
      ],
      erroresComunes: [
        'CRÍTICO: Balancear el cuerpo para ayudar (usar impulso)',
        'Mover codos hacia adelante durante curl',
        'Levantar peso verticalmente sin arco (pierde tensión)',
        'No bajar completamente (rango parcial)',
        'Flexionar antebrazos hacia dentro'
      ],
      consejosClave: [
        'ESTABILIZACIÓN es clave: usar bancos, paredes, soportes para eliminar balanceos',
        'ARCO hacia adelante mantiene tensión constante en bíceps',
        'BARRA RECTA: máxima carga, más estrés en muñecas',
        'BARRA Z: más cómoda para muñecas, menos peso máximo posible',
        'Si hay molestias en muñecas: usar barra Z obligatoriamente'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/barbell-curl-start.jpg',
      ejecucion: ['/exercises/barbell-curl-mid.jpg'],
      errores: ['/exercises/barbell-curl-error-swing.jpg']
    },
    variantes: [
      { nombre: 'Curl con barra Z', cuando: 'Molestias en muñecas (RECOMENDADO si hay dolor)', tier: 'A' },
      { nombre: 'Curl con Mancuernas', cuando: 'Trabajo unilateral, mayor rango', tier: 'A' },
      { nombre: 'Curl Martillo', cuando: 'Enfatizar braquial (agarre neutro)', tier: 'A' },
      { nombre: 'Curl en polea', cuando: 'Tensión constante superior (PREFERIDO según ADN)', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'biceps']
  },
  {
    id: 'curl-inclinado',
    nombre: 'Curl Inclinado con Mancuernas',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['bíceps cabeza LARGA (énfasis)'],
    tecnica: {
      posicionInicial: 'Recostado en banco inclinado (45°). Brazos colgando hacia atrás del torso (esta posición trabaja cabeza larga).',
      ejecucion: [
        'Curl con brazos ligeramente hacia atrás (posición estira cabeza larga)',
        'Mantener codos relativamente fijos',
        'Concentración en estiramiento y contracción',
        'Postura estable gracias al banco'
      ],
      erroresComunes: [
        'Llevar codos hacia adelante (pierde énfasis en cabeza larga)',
        'Usar demasiado peso y perder forma'
      ],
      consejosClave: [
        'CABEZA LARGA de bíceps se trabaja con brazo DETRÁS del torso',
        'Excelente estiramiento del bíceps',
        'Banco proporciona estabilización automática',
        'Peso moderado, control perfecto'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/incline-curl-start.jpg',
      ejecucion: ['/exercises/incline-curl-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'biceps_cabeza_larga']
  },
  {
    id: 'curl-concentrado',
    nombre: 'Curl Concentrado',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['bíceps cabeza CORTA (énfasis)'],
    tecnica: {
      posicionInicial: 'Sentado, codo apoyado en parte interna del muslo. Brazo DELANTE del torso (esta posición trabaja cabeza corta).',
      ejecucion: [
        'Curl con brazo delante del torso',
        'Codo apoyado (estabilización total)',
        'Concentración máxima en contracción',
        'Movimiento controlado'
      ],
      erroresComunes: [
        'Usar impulso con torso',
        'No completar rango de movimiento'
      ],
      consejosClave: [
        'CABEZA CORTA de bíceps se trabaja con brazo DELANTE del torso',
        'Máxima concentración (por eso el nombre)',
        'Apoyo elimina toda compensación',
        'Excelente para pico del bíceps'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/concentration-curl-start.jpg',
      ejecucion: ['/exercises/concentration-curl-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'biceps_cabeza_corta', 'pico_biceps']
  },
  {
    id: 'curl-martillo',
    nombre: 'Curl de Martillo',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['braquial', 'bíceps', 'antebrazo'],
    tecnica: {
      posicionInicial: 'De pie, mancuernas con agarre NEUTRO (palmas enfrentadas). Usar apoyo si es posible.',
      ejecucion: [
        'Curl con agarre neutro (como martillo)',
        'ARCO hacia adelante para mantener tensión',
        'Codos pegados al torso',
        'Control de muñecas (mantener neutro)'
      ],
      erroresComunes: [
        'Rotar muñecas durante el movimiento',
        'Balancear cuerpo',
        'Mover codos hacia adelante'
      ],
      consejosClave: [
        'Agarre NEUTRO enfatiza BRAQUIAL (músculo bajo bíceps)',
        'Braquial empuja bíceps hacia arriba (apariencia de brazos más grandes)',
        'También trabaja antebrazos más que curl supino',
        'Generalmente se puede usar más peso que curl tradicional'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/hammer-curl-start.jpg',
      ejecucion: ['/exercises/hammer-curl-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Curl martillo cruzado', cuando: 'Llevar mancuerna hacia hombro opuesto', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'braquial', 'grosor_brazo']
  },
  {
    id: 'curl-polea',
    nombre: 'Curl en Polea Baja',
    grupoMuscular: GrupoMuscular.BICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['polea'],
    enfoqueMuscular: ['bíceps braquial'],
    tecnica: {
      posicionInicial: 'De pie frente a polea baja. Barra o cuerda en manos, agarre supino.',
      ejecucion: [
        'Curl manteniendo codos fijos',
        'TENSIÓN CONSTANTE gracias a la polea',
        'No hay "punto muerto" como con mancuernas',
        'Control total del movimiento'
      ],
      erroresComunes: [
        'Usar demasiado peso y balancear',
        'Mover codos'
      ],
      consejosClave: [
        'TENSIÓN CONSTANTE es la ventaja principal sobre mancuernas',
        'Preferir poleas sobre mancuernas cuando sea posible (según ADN)',
        'No hay pérdida de tensión en ningún punto del movimiento',
        'Excelente para conexión mente-músculo'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/cable-curl-start.jpg',
      ejecucion: ['/exercises/cable-curl-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'biceps', 'tension_constante']
  },

  // ============================================
  // TRÍCEPS - Tier S/A
  // ============================================
  {
    id: 'fondos-triceps',
    nombre: 'Fondos en Paralelas (énfasis Tríceps)',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'compuesto',
    tier: 'S',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['tríceps (todas las cabezas)', 'pectoral inferior'],
    tecnica: {
      posicionInicial: 'Brazos extendidos en barras paralelas. Cuerpo suspendido. Mantener cuerpo lo más VERTICAL posible para enfatizar tríceps (inclinado = pecho).',
      ejecucion: [
        'Mantén cuerpo VERTICAL (NO inclinarse adelante - eso es para pecho)',
        'Desciende hasta 90° de flexión de codos',
        'Empuja hasta extensión completa',
        'NO bloquees codos con violencia',
        'NO encojas hombros'
      ],
      erroresComunes: [
        'Inclinarse hacia adelante (cambia énfasis a pecho)',
        'Descender demasiado (estrés excesivo en hombros)',
        'Encoger hombros hacia orejas',
        'Bloquear codos violentamente'
      ],
      consejosClave: [
        'UNO de los MEJORES para masa de tríceps',
        'VERTICAL = tríceps, INCLINADO = pecho (crucial entender diferencia)',
        'Si es muy fácil: agregar peso con cinturón',
        'Si es muy difícil: usar máquina asistida',
        'Excelente ejercicio compuesto para tríceps'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/dips-triceps-start.jpg',
      ejecucion: ['/exercises/dips-triceps-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Dips en Banco', cuando: 'Menos intensidad, pies en suelo', tier: 'B' },
      { nombre: 'Dips asistidos', cuando: 'Principiantes que no pueden con peso corporal', tier: 'B' }
    ],
    descansoSugerido: 120,
    tags: ['empuje', 'principal_triceps', 'compuesto']
  },
  {
    id: 'pushdowns-polea',
    nombre: 'Push-downs en Polea Alta',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['polea'],
    enfoqueMuscular: ['tríceps cabeza lateral', 'tríceps cabeza media'],
    tecnica: {
      posicionInicial: 'De pie frente a polea alta. Cuerpo estable, brazos pegados al torso. Barra o cuerda en manos.',
      ejecucion: [
        'Empujar hacia abajo hasta extensión completa',
        'Muñecas RECTAS (no doblar)',
        'Cuerpo estable - mínimo movimiento',
        'Inclinación ligera hacia adelante es aceptable para cargas pesadas',
        'NO involucrar cabeza larga (mantenerse relativamente recto)'
      ],
      erroresComunes: [
        'Usar todo el cuerpo para empujar (trampa)',
        'Mover codos hacia adelante/atrás',
        'Rango parcial (no extender completamente)',
        'Muñecas dobladas'
      ],
      consejosClave: [
        'Trabaja cabeza LATERAL y MEDIA del tríceps',
        'NO trabaja cabeza larga (necesitas extensiones overhead para eso)',
        'CUERDA: más cómoda para muñecas, permite separación al final, menos peso',
        'BARRA: más estabilidad, mayor carga posible, mejor para fuerza',
        'Mantén brazos pegados al torso, solo antebrazo se mueve'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/pushdown-start.jpg',
      ejecucion: ['/exercises/pushdown-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Push-downs con cuerda', cuando: 'Comodidad muñecas, separación final (CÓMODO)', tier: 'A' },
      { nombre: 'Push-downs con barra', cuando: 'Mayor carga, más fuerza (PESADO)', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'triceps_lateral_media']
  },
  {
    id: 'extensiones-overhead',
    nombre: 'Extensiones Overhead (Sobre Cabeza)',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['polea', 'mancuerna'],
    enfoqueMuscular: ['tríceps cabeza LARGA (énfasis)'],
    tecnica: {
      posicionInicial: 'Polea a altura media-baja, paso hacia adelante. Codos en forma de V (NO completamente juntos). Inclinación del torso hacia adelante para dar espacio.',
      ejecucion: [
        'Extender brazos completamente sobre/detrás de la cabeza',
        'Codos en FORMA DE V (no completamente juntos)',
        'Inclinarse hacia adelante para permitir rango completo',
        'Solo el ANTEBRAZO se mueve, codos fijos en posición',
        'RANGO COMPLETO para estirar cabeza larga'
      ],
      erroresComunes: [
        'Mover codos durante el movimiento',
        'No alcanzar rango completo (falta estiramiento)',
        'Usar demasiado peso y perder forma',
        'Codos muy separados o muy juntos'
      ],
      consejosClave: [
        'CABEZA LARGA del tríceps solo se trabaja con brazos SOBRE LA CABEZA',
        'Codos en forma de V para espacio y comodidad',
        'Inclinación hacia adelante es necesaria para rango completo',
        'RANGO COMPLETO es crítico para máximo estiramiento de cabeza larga',
        'Esencial para desarrollo completo del tríceps (push-downs no trabajan cabeza larga)'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/overhead-extension-start.jpg',
      ejecucion: ['/exercises/overhead-extension-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Extensiones con mancuerna', cuando: 'Casa o sin polea', tier: 'A' },
      { nombre: 'French press', cuando: 'Acostado con barra', tier: 'A' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'triceps_cabeza_larga', 'overhead']
  },
  {
    id: 'extensiones-unilaterales',
    nombre: 'Extensiones Unilaterales',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'principiante',
    equipamiento: ['polea', 'mancuerna'],
    enfoqueMuscular: ['tríceps (todas las cabezas)'],
    tecnica: {
      posicionInicial: 'Un brazo a la vez. Torso estable.',
      ejecucion: [
        'Torso estable, mínimo movimiento de hombros',
        'Solo el ANTEBRAZO se mueve',
        'Codo hacia atrás en forma de V para máximo estiramiento',
        'Extensión completa'
      ],
      erroresComunes: [
        'Mover hombro/torso para ayudar',
        'No mantener codo fijo'
      ],
      consejosClave: [
        'Excelente para corregir desbalances',
        'Permite mayor concentración en un solo brazo',
        'Codo hacia atrás maximiza estiramiento'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/single-arm-extension-start.jpg',
      ejecucion: ['/exercises/single-arm-extension-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento_brazos', 'triceps', 'unilateral']
  },
  {
    id: 'patadas-triceps',
    nombre: 'Patadas de Tríceps (Kick-backs)',
    grupoMuscular: GrupoMuscular.TRICEPS,
    categoria: 'aislamiento',
    tier: 'B',
    dificultad: 'principiante',
    equipamiento: ['mancuerna'],
    enfoqueMuscular: ['tríceps cabeza larga'],
    tecnica: {
      posicionInicial: 'Inclinado hacia adelante, codo pegado al torso y hacia atrás. Antebrazo colgando.',
      ejecucion: [
        'Extender antebrazo hacia atrás completamente',
        'Codo fijo en posición alta',
        'Contracción máxima en extensión',
        'Control en todo el movimiento'
      ],
      erroresComunes: [
        'Mover el codo',
        'Usar demasiado peso',
        'No extender completamente'
      ],
      consejosClave: [
        'Trabaja cabeza larga del tríceps',
        'Peso ligero, control perfecto',
        'Codo debe estar ALTO y hacia atrás',
        'Excelente ejercicio de finalización'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/kickback-start.jpg',
      ejecucion: ['/exercises/kickback-mid.jpg'],
      errores: []
    },
    variantes: [],
    descansoSugerido: 60,
    tags: ['aislamiento_brazos', 'triceps_cabeza_larga', 'finalizador']
  },

  // ============================================
  // CORE Y ABDOMINALES - Tier A/B
  // ============================================
  {
    id: 'crunch-polea',
    nombre: 'Crunch en Polea (Cable Crunch)',
    grupoMuscular: GrupoMuscular.ABDOMINALES,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['polea'],
    enfoqueMuscular: ['recto abdominal'],
    tecnica: {
      posicionInicial: 'Arrodillado frente a polea alta, cuerda en manos cerca de la cabeza.',
      ejecucion: [
        'CLAVE: FLEXIÓN LUMBAR - curvar espalda desde costillas hasta caderas',
        'NO solo bajar torso - debe haber flexión de columna',
        'Llevar costillas hacia cadera (acortar distancia)',
        'Contracción intensa, pausa arriba',
        'Control en fase excéntrica'
      ],
      erroresComunes: [
        'CRÍTICO: Solo doblar caderas sin flexión lumbar (no trabaja abdominales para hipertrofia)',
        'Usar solo brazos para jalar',
        'Rango parcial'
      ],
      consejosClave: [
        'Para HIPERTROFIA abdominal se necesita FLEXIÓN LUMBAR (curvar espalda)',
        'No solo elevar tronco - curvar columna activamente',
        'Permite SOBRECARGA PROGRESIVA (agregar peso)',
        '4-6 series semanales de 8-12 reps cerca del fallo',
        'Mejor que crunches de suelo para desarrollo muscular'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/cable-crunch-start.jpg',
      ejecucion: ['/exercises/cable-crunch-mid.jpg'],
      errores: ['/exercises/cable-crunch-error-no-flex.jpg']
    },
    variantes: [],
    descansoSugerido: 90,
    tags: ['aislamiento', 'abdominales', 'flexion_lumbar', 'hipertrofia_abs']
  },
  {
    id: 'elevaciones-piernas-flexion',
    nombre: 'Elevaciones de Piernas con Flexión Lumbar',
    grupoMuscular: GrupoMuscular.ABDOMINALES,
    categoria: 'aislamiento',
    tier: 'A',
    dificultad: 'intermedio',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['recto abdominal (porción inferior)'],
    tecnica: {
      posicionInicial: 'Colgado de barra o en máquina de elevación de piernas.',
      ejecucion: [
        'Elevar piernas COMBINADO con flexión lumbar',
        'NO solo subir piernas - curvar pelvis hacia costillas',
        'La pelvis debe rotar (flexión lumbar)',
        'Si solo subes piernas sin flexión: trabaja hip flexors, NO abdominales para hipertrofia'
      ],
      erroresComunes: [
        'CRÍTICO: Solo elevar piernas sin flexión lumbar (trabaja hip flexors, no abs)',
        'Usar impulso',
        'Rango parcial'
      ],
      consejosClave: [
        'FLEXIÓN LUMBAR es obligatoria para hipertrofia abdominal',
        'Elevar piernas + rotar pelvis hacia costillas',
        'Sentadillas, dominadas y fondos ya trabajan core como estabilizador',
        'No necesitas rutina extensa separada si haces compuestos correctamente',
        'Visibilidad: Requiere <12% grasa corporal. Entrenamiento construye, dieta revela'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/leg-raise-start.jpg',
      ejecucion: ['/exercises/leg-raise-mid.jpg'],
      errores: []
    },
    variantes: [
      { nombre: 'Knee raises', cuando: 'Versión más fácil con rodillas dobladas', tier: 'B' }
    ],
    descansoSugerido: 90,
    tags: ['aislamiento', 'abdominales', 'flexion_lumbar', 'abs_inferiores']
  },
  {
    id: 'plancha',
    nombre: 'Plancha (Plank)',
    grupoMuscular: GrupoMuscular.ABDOMINALES,
    categoria: 'aislamiento',
    tier: 'B',
    dificultad: 'principiante',
    equipamiento: ['peso_corporal'],
    enfoqueMuscular: ['core completo (estabilización)'],
    tecnica: {
      posicionInicial: 'Posición de flexión sobre antebrazos. Cuerpo en línea recta.',
      ejecucion: [
        'Mantener cuerpo completamente recto',
        'Core tenso, glúteos apretados',
        'NO dejar caer caderas',
        'Respiración controlada',
        'Mantener posición (isométrico)'
      ],
      erroresComunes: [
        'Caderas muy altas o muy bajas',
        'Aguantar respiración',
        'Perder alineación'
      ],
      consejosClave: [
        'Excelente para estabilidad de core',
        'NO construye hipertrofia como crunch en polea',
        'Útil para fuerza de core y prevención de lesiones',
        'Progresión: aumentar tiempo o agregar peso en espalda'
      ]
    },
    imagenes: {
      posicionInicial: '/exercises/plank.jpg',
      ejecucion: [],
      errores: []
    },
    variantes: [
      { nombre: 'Plancha lateral', cuando: 'Trabajo de oblicuos', tier: 'B' },
      { nombre: 'Plancha con peso', cuando: 'Progresión avanzada', tier: 'A' }
    ],
    descansoSugerido: 60,
    tags: ['core', 'estabilizacion', 'isometrico']
  }
];
