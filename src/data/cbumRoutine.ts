// Rutina Chris Bumstead (CBum) — 6× Mr. Olympia Classic Physique
// Filosofía: 2 series efectivas al fallo · sobrecarga progresiva ·
// salud articular · conexión mente-músculo · FST-7 al final.
// Split de 8 días (6 entreno + 2 descanso) — repetir indefinidamente.

import type { FullWRoutine, FullWDay, FullWExercise } from './fullwRoutines';

// ─── Tipos públicos ─────────────────────────────────────────────────────────
export type CbumPhase = 'offseason' | 'prep';
export type CbumIntensity = 'principiante' | 'intermedio' | 'avanzado';

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
  offseason: {
    calorias: 6000,
    proteinas: '300g',
    cardio: 'Mínimo (10-15 min LISS post-entreno opcional)',
    fuentes: ['Huevos', 'Carne de res', 'Pavo', 'Pollo', 'Whey isolate'],
  },
  prep: {
    calorias: 3500,
    proteinas: '370g',
    cardio: '40-60 min LISS diario + 2× HIIT/sem',
    fuentes: ['Pollo', 'Pavo', 'Pescado blanco', 'Claras', 'Whey isolate', 'Boniato/arroz medido'],
  },
};

// ─── Plan base (off-season, intensidad avanzada) ────────────────────────────
const BASE_PLAN: FullWDay[] = [
  // Día 1: Cuádriceps y Pantorrillas
  {
    nombre: 'Día 1 — Cuádriceps y Pantorrillas',
    grupos: ['Cuádriceps', 'Pantorrillas'],
    ejercicios: [
      { nombre: 'Extensiones de Pierna',            series: 2, reps: '20',     descanso: '90 s',   notas: 'Pre-agotamiento. Calienta las rodillas antes de sentadilla.', isDropSet: true },
      { nombre: 'Sentadilla con Barra o Smith',     series: 2, reps: '6-10',   descanso: '3 min',  notas: 'Profundidad máxima. Entrena descalzo si puedes — base sólida.' },
      { nombre: 'Prensa de Piernas (Unilateral)',   series: 3, reps: '8-10',   descanso: '2 min',  notas: 'Controla la fase excéntrica 3 segundos.' },
      { nombre: 'Sentadilla Sissy o Búlgara',       series: 3, reps: '12-15',  descanso: '90 s',   notas: 'Tensión constante — no bloquees la rodilla arriba.' },
      { nombre: 'Elevación de Pantorrillas de Pie', series: 3, reps: '10-12',  descanso: '60 s',   notas: 'Rango completo. 1 segundo apretado arriba con rodillas bloqueadas.' },
    ],
  },
  // Día 2: Pecho y Tríceps
  {
    nombre: 'Día 2 — Pecho y Tríceps',
    grupos: ['Pecho', 'Tríceps'],
    ejercicios: [
      { nombre: 'Press Inclinado con Mancuernas',        series: 2, reps: '8-10',  descanso: '2-3 min', notas: 'Banco a 45°. Codos hacia adentro para proteger el hombro.' },
      { nombre: 'Aperturas Inclinadas (Mancuernas/Cable)', series: 2, reps: '8-10', descanso: '90 s',  notas: 'Imagina "empujar hacia afuera" y luego juntar los codos.' },
      { nombre: 'Press en Máquina (Hammer Strength)',    series: 2, reps: '6-10',  descanso: '2 min',   notas: 'Drop set en la última serie hasta el fallo seguro.', isDropSet: true },
      { nombre: 'Pec Deck Flyes',                        series: 3, reps: '15',    descanso: '60 s',   notas: 'Contracción máxima 1s en el centro.' },
      { nombre: 'Skullcrushers (Press Francés)',          series: 2, reps: '8-10',  descanso: '90 s',   notas: 'Banco declinado para tensión constante. Codos cerrados.' },
      { nombre: 'Pushdowns en Polea',                    series: 3, reps: '10-12', descanso: '60 s',   notas: 'Agarre semi-pronado para enfatizar las tres cabezas.' },
    ],
  },
  // Día 3: Espalda y Bíceps
  {
    nombre: 'Día 3 — Espalda y Bíceps',
    grupos: ['Espalda', 'Bíceps'],
    ejercicios: [
      { nombre: 'Jalón al Pecho (agarre supino o neutro)', series: 3, reps: '10-12', descanso: '90 s', notas: 'Estiramiento completo arriba para salud del hombro.' },
      { nombre: 'Remo con Barra (agarre supino)',          series: 2, reps: '8-10',  descanso: '2 min', notas: 'Protracción al bajar, retracción completa al subir.' },
      { nombre: 'Remo en Barra T (apoyado en pecho)',      series: 2, reps: '8-10',  descanso: '2 min', notas: 'Tira con codos lo más alto posible. Protege la lumbar.', isDropSet: true },
      { nombre: 'Pullover con Cable',                      series: 2, reps: '10-12', descanso: '60 s',  notas: 'Finalización para agotar dorsales.' },
      { nombre: 'Curl de Bíceps en Banco Inclinado',       series: 2, reps: '10-12', descanso: '90 s', notas: 'Gran estiramiento. Pausa de 0.5s abajo. No balancees.' },
      { nombre: 'Curl Predicador en Máquina',              series: 2, reps: '10-12', descanso: '60 s',  notas: 'Aislamiento total — controla la bajada.' },
    ],
  },
  // Día 4: Descanso
  { nombre: 'Día 4 — Descanso activo', grupos: [], ejercicios: [] },
  // Día 5: Hombros y Pecho
  {
    nombre: 'Día 5 — Hombros y Pecho',
    grupos: ['Hombros', 'Pecho'],
    ejercicios: [
      { nombre: 'Press de Hombros con Mancuernas',     series: 2, reps: '6-10',  descanso: '2-3 min', notas: 'Escápulas retraídas. Mejor que máquinas para salud articular.' },
      { nombre: 'Press de Hombros en Máquina',         series: 3, reps: '6-10',  descanso: '2 min',   notas: 'Trabajo pesado con seguridad.', isDropSet: true },
      { nombre: 'Elevaciones Laterales con Mancuernas', series: 2, reps: '8-10', descanso: '60 s',    notas: 'Fundamental para la "X" del Classic Physique.', isDropSet: true },
      { nombre: 'Elevaciones Laterales en Máquina',    series: 2, reps: '10-12', descanso: '60 s',    notas: 'Control estricto del movimiento — sin balanceo.' },
      { nombre: 'Pec Deck Inverso',                    series: 2, reps: '10-12', descanso: '0 s',     notas: 'Superserie → pasa directo al Pec Deck sin descanso.', isSuperset: true },
      { nombre: 'Pec Deck',                            series: 2, reps: '10-12', descanso: '60 s',    notas: 'Cierra la superserie. Bombeo de pecho clavicular.' },
    ],
  },
  // Día 6: Isquiotibiales y Espalda
  {
    nombre: 'Día 6 — Isquiotibiales y Espalda',
    grupos: ['Femorales/Glúteos', 'Espalda'],
    ejercicios: [
      { nombre: 'Curl de Pierna Acostado',              series: 4, reps: '10-12', descanso: '90 s',  notas: 'Pies en punta. Almohadilla bajo cadera para más estiramiento.' },
      { nombre: 'Peso Muerto',                          series: 2, reps: '4-8',   descanso: '3 min', notas: 'El mejor para masa general. Correas si falla el agarre.' },
      { nombre: 'Sentadilla en Máquina de Cinturón',   series: 4, reps: '10-12', descanso: '2 min', notas: 'Torso erguido. Bajada muy lenta y controlada.' },
      { nombre: 'Hip Thrust en Máquina',               series: 4, reps: '12-15', descanso: '90 s',  notas: 'Pausa y contracción fuerte 1s arriba.' },
      { nombre: 'Jalón al Pecho (agarre ancho)',        series: 3, reps: '8-10',  descanso: '90 s',  notas: 'Enfoque en amplitud de espalda.' },
    ],
  },
  // Día 7: Brazos
  {
    nombre: 'Día 7 — Brazos (Bíceps + Tríceps)',
    grupos: ['Bíceps', 'Tríceps'],
    ejercicios: [
      { nombre: 'Pushdowns de Tríceps con Cuerda',         series: 2, reps: '8-10',  descanso: '90 s',    notas: 'Separa la cuerda al final del movimiento.', isDropSet: true },
      { nombre: 'Skullcrushers Inclinados con Mancuernas', series: 2, reps: '8-10',  descanso: '90 s',    notas: 'Estiramiento profundo del tríceps largo.' },
      { nombre: 'Curl Predicador con Barra EZ',            series: 3, reps: '8-10',  descanso: '90 s',    notas: 'Controla la bajada 3 segundos.', isDropSet: true },
      { nombre: 'Curl con Mancuernas Alterno',             series: 2, reps: '10-12', descanso: '60 s',    notas: 'Supinación completa al subir.' },
      { nombre: 'Tríceps Cruzado en Polea',                series: 2, reps: '10-15', descanso: '45 s',    notas: 'Trabajo unilateral para simetría.' },
      { nombre: 'Curl en Polea Baja',                      series: 7, reps: '10-12', descanso: '30-45 s', notas: 'FST-7 final. Máximo bombeo — no descanses más de 45s.', isFST7: true },
    ],
  },
  // Día 8: Descanso
  { nombre: 'Día 8 — Descanso total', grupos: [], ejercicios: [] },
];

// ─── Transformaciones de fase ───────────────────────────────────────────────
/**
 * Aplica los ajustes de fase Off-Season (default) o Prep al plan.
 *
 * - Off-Season: el plan tal cual (foco en masa).
 * - Prep: añade un FST-7 extra al final de pecho y espalda, sube reps en
 *   aislamientos (más volumen metabólico para definir), reduce descansos.
 */
function applyPhase(plan: FullWDay[], phase: CbumPhase): FullWDay[] {
  if (phase === 'offseason') return plan.map(d => ({ ...d, ejercicios: d.ejercicios.map(e => ({ ...e })) }));

  // PREP: clonar y modificar
  const cloned = plan.map(d => ({ ...d, ejercicios: d.ejercicios.map(e => ({ ...e })) }));

  // Día 2: añadir FST-7 final de pec deck para definición torácica
  cloned[1].variante = 'Fase Prep — FST-7 final de pecho añadido';
  cloned[1].ejercicios.push({
    nombre: 'Pec Deck',
    series: 7, reps: '10-12', descanso: '30-45 s',
    notas: 'FST-7 extra de prep — bombeo estriaciones de pecho.',
    isFST7: true,
  });

  // Día 3: añadir FST-7 de pullover para densidad de espalda baja en Prep
  cloned[2].variante = 'Fase Prep — FST-7 final de dorsales añadido';
  cloned[2].ejercicios.push({
    nombre: 'Pullover con Cable',
    series: 7, reps: '10-12', descanso: '30-45 s',
    notas: 'FST-7 extra de prep — separación entre dorsal y serrato.',
    isFST7: true,
  });

  // Día 5: subir reps en elevaciones (volumen metabólico para hombros más detallados)
  const day5 = cloned[4];
  day5.variante = 'Fase Prep — reps subidas en hombros laterales para detalle';
  for (const ej of day5.ejercicios) {
    if (ej.nombre.includes('Elevaciones')) {
      ej.reps = '12-15';
      ej.descanso = '45 s';
    }
  }

  // Día 6: añadir FST-7 final de curl femoral
  cloned[5].variante = 'Fase Prep — FST-7 final de femorales añadido';
  cloned[5].ejercicios.push({
    nombre: 'Curl Femoral',
    series: 7, reps: '10-12', descanso: '30-45 s',
    notas: 'FST-7 extra — separación de bíceps femoral en prep.',
    isFST7: true,
  });

  // Día 7: ya tiene FST-7 de bíceps. Añadir FST-7 de tríceps para máximo detalle
  cloned[6].variante = 'Fase Prep — FST-7 doble (bi y tri)';
  cloned[6].ejercicios.splice(5, 0, {
    nombre: 'Pushdowns en Polea',
    series: 7, reps: '10-12', descanso: '30-45 s',
    notas: 'FST-7 de tríceps antes del FST-7 de bíceps.',
    isFST7: true,
  });

  return cloned;
}

/**
 * Escala el volumen de la rutina según el nivel del usuario.
 *
 * - Principiante: 50% de las series (mín 1) y elimina los drop sets de las notas.
 * - Intermedio: 75% de las series (redondeo hacia arriba).
 * - Avanzado: tal cual (default — la rutina ya es para nivel pro).
 *
 * Los FST-7 se mantienen siempre en 7 series — son el corazón de la técnica.
 */
function applyIntensity(plan: FullWDay[], intensity: CbumIntensity): FullWDay[] {
  if (intensity === 'avanzado') return plan;

  const factor = intensity === 'principiante' ? 0.5 : 0.75;
  return plan.map(d => ({
    ...d,
    ejercicios: d.ejercicios.map(e => {
      if (e.isFST7) return e;  // FST-7 siempre 7 series
      const newSeries = Math.max(1, Math.round(e.series * factor));
      // En principiante, limpiar menciones de drop sets
      const nuevasNotas = intensity === 'principiante' && e.notas
        ? e.notas.replace(/\bdrop sets?\b/gi, '').replace(/\.\s*\./g, '.').trim()
        : e.notas;
      return { ...e, series: newSeries, notas: nuevasNotas };
    }),
  }));
}

/**
 * Construye la rutina CBum según fase + intensidad solicitadas.
 */
export function buildCbumRoutine(phase: CbumPhase, intensity: CbumIntensity): FullWRoutine {
  let plan = BASE_PLAN.map(d => ({ ...d, ejercicios: d.ejercicios.map(e => ({ ...e })) }));
  plan = applyPhase(plan, phase);
  plan = applyIntensity(plan, intensity);

  const phaseLabel = phase === 'offseason' ? 'Off-Season' : 'Prep';
  const intLabel = intensity === 'principiante' ? 'Principiante' : intensity === 'intermedio' ? 'Intermedio' : 'Avanzado';

  return {
    id: `cbum-${phase}-${intensity}`,
    nombre: `CBum — ${phaseLabel} (${intLabel})`,
    dias: 6,
    semanas: 12,
    descripcion: phase === 'offseason'
      ? 'Off-season: foco en hipertrofia y masa. 2 series efectivas, mente-músculo.'
      : 'Prep Olympia: definición + retención muscular. Más FST-7 y volumen metabólico.',
    distribucion: 'Cuádriceps · Pecho/Tri · Espalda/Bi · Off · Hombros/Pecho · Posterior/Espalda · Brazos · Off',
    plan,
  };
}

// Backward compat: la rutina default sigue siendo Off-Season + Avanzado
export const CBUM_ROUTINE: FullWRoutine = buildCbumRoutine('offseason', 'avanzado');

// Re-export por si alguien quiere consumir el tipo
export type { FullWExercise };
