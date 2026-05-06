// Rutina Chris Bumstead (CBum) — 6× Mr. Olympia Classic Physique
// Filosofía: 2 series efectivas al fallo · sobrecarga progresiva ·
// salud articular · conexión mente-músculo · FST-7 al final.
// Split de 8 días (6 entreno + 2 descanso) — repetir indefinidamente.

import type { FullWRoutine } from './fullwRoutines';

export interface CbumPrinciple {
  titulo: string;
  descripcion: string;
}

export const CBUM_PRINCIPLES: CbumPrinciple[] = [
  {
    titulo: 'Intensidad sobre volumen',
    descripcion: '2 series efectivas por ejercicio llevadas al fallo o muy cerca. La técnica no se sacrifica.',
  },
  {
    titulo: 'Sobrecarga progresiva',
    descripcion: 'Cada semana intenta sumar 1 rep más o subir el peso 2.5 kg en las series principales.',
  },
  {
    titulo: 'Salud articular',
    descripcion: 'Mancuernas antes que máquinas rígidas para rango natural. Apoyo en pecho para proteger lumbar.',
  },
  {
    titulo: 'FST-7 al final',
    descripcion: '7 series × 10–12 reps con descansos de 30–45s para máximo bombeo y estiramiento de fascia.',
  },
  {
    titulo: 'Mente-músculo',
    descripcion: 'Sentir la contracción y el estiramiento en cada repetición. No mover peso por moverlo.',
  },
];

export const CBUM_NUTRITION = {
  caloriasOff: 6000,
  caloriasPrep: 3500,
  proteinas: '300g (off) — 370g (prep)',
  fuentes: ['Huevos', 'Carne de res', 'Pavo', 'Pollo', 'Whey isolate'],
};

/**
 * Rutina oficial CBum — 8 días (6 sesiones + 2 días de descanso).
 * Días 4 y 8 con `ejercicios: []` para que el sistema los renderice
 * como descanso sin necesidad de tipo nuevo.
 */
export const CBUM_ROUTINE: FullWRoutine = {
  id: 'cbum-classic',
  nombre: 'CBum — Classic Physique',
  dias: 6,            // días de entrenamiento efectivo
  semanas: 12,        // ciclo recomendado antes de cambiar acentos
  descripcion: 'El método de Chris Bumstead: 2 series efectivas, conexión mente-músculo y longevidad articular.',
  distribucion: 'Cuádriceps · Pecho/Tri · Espalda/Bi · Off · Hombros/Pecho · Posterior/Espalda · Brazos · Off',
  plan: [
    // ── Día 1: Cuádriceps y Pantorrillas ──
    {
      nombre: 'Día 1 — Cuádriceps y Pantorrillas',
      grupos: ['Cuádriceps', 'Pantorrillas'],
      ejercicios: [
        { nombre: 'Extensiones de Pierna',         series: 2, reps: '20',     descanso: '90 s', notas: 'Pre-agotamiento. Drop sets en la última. Calienta rodillas.' },
        { nombre: 'Sentadilla con Barra o Smith',  series: 2, reps: '6-10',   descanso: '3 min', notas: 'Profundidad máxima. Entrena descalzo si puedes — base sólida.' },
        { nombre: 'Prensa de Piernas (Unilateral)',series: 3, reps: '8-10',   descanso: '2 min', notas: 'Controla la fase excéntrica 3 segundos.' },
        { nombre: 'Sentadilla Sissy o Búlgara',    series: 3, reps: '12-15',  descanso: '90 s',  notas: 'Tensión constante — no bloquees la rodilla arriba.' },
        { nombre: 'Elevación de Pantorrillas de Pie', series: 3, reps: '10-12', descanso: '60 s', notas: 'Rango completo. 1 segundo apretado arriba con rodillas bloqueadas.' },
      ],
    },

    // ── Día 2: Pecho y Tríceps ──
    {
      nombre: 'Día 2 — Pecho y Tríceps',
      grupos: ['Pecho', 'Tríceps'],
      ejercicios: [
        { nombre: 'Press Inclinado con Mancuernas', series: 2, reps: '8-10', descanso: '2-3 min', notas: 'Banco a 45°. Codos hacia adentro para proteger el hombro.' },
        { nombre: 'Aperturas Inclinadas con Mancuernas', series: 2, reps: '8-10', descanso: '90 s', notas: 'Imagina "empujar hacia afuera" y luego juntar los codos.' },
        { nombre: 'Press en Máquina (Hammer Strength)', series: 2, reps: '6-10', descanso: '2 min', notas: 'Drop sets en la última serie hasta el fallo seguro.' },
        { nombre: 'Pec Deck',                        series: 3, reps: '15',   descanso: '60 s',   notas: 'Contracción máxima 1s en el centro.' },
        { nombre: 'Skullcrushers (Press Francés)',   series: 2, reps: '8-10', descanso: '90 s',   notas: 'Banco declinado para tensión constante. Codos cerrados.' },
        { nombre: 'Pushdowns en Polea',              series: 3, reps: '10-12',descanso: '60 s',   notas: 'Agarre semi-pronado para enfatizar las tres cabezas.' },
      ],
    },

    // ── Día 3: Espalda y Bíceps ──
    {
      nombre: 'Día 3 — Espalda y Bíceps',
      grupos: ['Espalda', 'Bíceps'],
      ejercicios: [
        { nombre: 'Jalón al Pecho (agarre supino o neutro)', series: 3, reps: '10-12', descanso: '90 s', notas: 'Estiramiento completo arriba para salud del hombro.' },
        { nombre: 'Remo con Barra (agarre supino)',  series: 2, reps: '8-10', descanso: '2 min', notas: 'Protracción al bajar, retracción completa al subir.' },
        { nombre: 'Remo en Barra T (apoyado en pecho)', series: 2, reps: '8-10', descanso: '2 min', notas: 'Drop set final. Tira con codos lo más alto posible. Protege la lumbar.' },
        { nombre: 'Pullover con Cable',              series: 2, reps: '10-12',descanso: '60 s',  notas: 'Finalización para agotar dorsales.' },
        { nombre: 'Curl de Bíceps en Banco Inclinado', series: 2, reps: '10-12', descanso: '90 s', notas: 'Gran estiramiento. Pausa de 0.5s abajo. No balancees.' },
        { nombre: 'Curl Predicador en Máquina',      series: 2, reps: '10-12',descanso: '60 s',  notas: 'Aislamiento total — controla la bajada.' },
      ],
    },

    // ── Día 4: Descanso ──
    {
      nombre: 'Día 4 — Descanso activo',
      grupos: [],
      ejercicios: [],
    },

    // ── Día 5: Hombros y Pecho ──
    {
      nombre: 'Día 5 — Hombros y Pecho',
      grupos: ['Hombros', 'Pecho'],
      ejercicios: [
        { nombre: 'Press de Hombros con Mancuernas', series: 2, reps: '6-10', descanso: '2-3 min', notas: 'Escápulas retraídas. Mejor que máquinas para salud articular.' },
        { nombre: 'Press de Hombros en Máquina',     series: 3, reps: '6-10', descanso: '2 min',   notas: 'Drop sets en la última — trabajo pesado con seguridad.' },
        { nombre: 'Elevaciones Laterales con Mancuernas', series: 2, reps: '8-10', descanso: '60 s', notas: 'Drop sets. Fundamental para la "X" del Classic Physique.' },
        { nombre: 'Elevaciones Laterales en Máquina',series: 2, reps: '10-12',descanso: '60 s',   notas: 'Control estricto del movimiento — sin balanceo.' },
        { nombre: 'Pec Deck Inverso',                series: 2, reps: '10-12',descanso: '45 s',   notas: 'Superserie con Pec Deck. Trabaja deltoide posterior.' },
        { nombre: 'Pec Deck',                        series: 2, reps: '10-12',descanso: '45 s',   notas: 'Cierra la superserie. Bombeo de pecho clavicular.' },
      ],
    },

    // ── Día 6: Isquiotibiales y Espalda ──
    {
      nombre: 'Día 6 — Isquiotibiales y Espalda',
      grupos: ['Femorales/Glúteos', 'Espalda'],
      ejercicios: [
        { nombre: 'Curl de Pierna Acostado',         series: 4, reps: '10-12',descanso: '90 s',   notas: 'Pies en punta. Almohadilla bajo cadera para más estiramiento.' },
        { nombre: 'Peso Muerto',                     series: 2, reps: '4-8',  descanso: '3 min',  notas: 'El mejor para masa general. Correas si falla el agarre.' },
        { nombre: 'Sentadilla en Máquina de Cinturón', series: 4, reps: '10-12', descanso: '2 min', notas: 'Torso erguido. Bajada muy lenta y controlada.' },
        { nombre: 'Hip Thrust en Máquina',           series: 4, reps: '12-15',descanso: '90 s',   notas: 'Pausa y contracción fuerte 1s arriba.' },
        { nombre: 'Jalón al Pecho (agarre ancho)',   series: 3, reps: '8-10', descanso: '90 s',   notas: 'Enfoque en amplitud de espalda.' },
      ],
    },

    // ── Día 7: Brazos ──
    {
      nombre: 'Día 7 — Brazos (Bíceps + Tríceps)',
      grupos: ['Bíceps', 'Tríceps'],
      ejercicios: [
        { nombre: 'Pushdowns de Tríceps con Cuerda', series: 2, reps: '8-10', descanso: '90 s', notas: 'Drop sets. Separa la cuerda al final del movimiento.' },
        { nombre: 'Skullcrushers Inclinados con Mancuernas', series: 2, reps: '8-10', descanso: '90 s', notas: 'Estiramiento profundo del tríceps largo.' },
        { nombre: 'Curl Predicador con Barra EZ',    series: 3, reps: '8-10', descanso: '90 s', notas: 'Drop sets. Controla la bajada 3 segundos.' },
        { nombre: 'Curl con Mancuernas Alterno',     series: 2, reps: '10-12',descanso: '60 s', notas: 'Supinación completa al subir.' },
        { nombre: 'Tríceps Cruzado en Polea',        series: 2, reps: '10-15',descanso: '45 s', notas: 'Trabajo unilateral para simetría.' },
        { nombre: 'Curl en Polea Baja (FST-7)',      series: 7, reps: '10-12',descanso: '30-45 s', notas: 'FST-7 final. Máximo bombeo — no descanses más de 45s.' },
      ],
    },

    // ── Día 8: Descanso ──
    {
      nombre: 'Día 8 — Descanso total',
      grupos: [],
      ejercicios: [],
    },
  ],
};
