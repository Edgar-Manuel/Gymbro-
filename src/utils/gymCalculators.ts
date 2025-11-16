import type {
  PlateConfig,
  OneRepMaxData,
  PersonalRecord,
  PRType,
  SerieLog
} from '@/types';

/**
 * PLATE CALCULATOR
 * Calcula qué discos necesitas para una barra cargada
 */

// Configuración estándar de discos (kg)
export const STANDARD_PLATES = [
  { peso: 25, color: '#DC2626', cantidad: 4 },  // Rojo - 25kg
  { peso: 20, color: '#3B82F6', cantidad: 4 },  // Azul - 20kg
  { peso: 15, color: '#FBBF24', cantidad: 4 },  // Amarillo - 15kg
  { peso: 10, color: '#10B981', cantidad: 4 },  // Verde - 10kg
  { peso: 5, color: '#FFFFFF', cantidad: 4 },   // Blanco - 5kg
  { peso: 2.5, color: '#DC2626', cantidad: 4 }, // Rojo pequeño - 2.5kg
  { peso: 1.25, color: '#94A3B8', cantidad: 4 } // Gris - 1.25kg
];

const BARRA_OLIMPICA = 20; // kg

export interface PlateCalculation {
  pesoTotal: number;
  pesoACargar: number;
  pesoBarraSola: number;
  discosPorLado: PlateConfig[];
  posible: boolean;
  error?: string;
}

/**
 * Calcula qué discos necesitas en cada lado de la barra
 */
export function calcularDiscos(
  pesoObjetivo: number,
  pesoBarra: number = BARRA_OLIMPICA,
  discosDisponibles: PlateConfig[] = STANDARD_PLATES
): PlateCalculation {
  // Peso que necesitamos cargar (sin contar la barra)
  const pesoACargar = pesoObjetivo - pesoBarra;

  if (pesoACargar < 0) {
    return {
      pesoTotal: pesoBarra,
      pesoACargar: 0,
      pesoBarraSola: pesoBarra,
      discosPorLado: [],
      posible: false,
      error: `El peso objetivo (${pesoObjetivo}kg) es menor que el peso de la barra (${pesoBarra}kg)`
    };
  }

  if (pesoACargar === 0) {
    return {
      pesoTotal: pesoBarra,
      pesoACargar: 0,
      pesoBarraSola: pesoBarra,
      discosPorLado: [],
      posible: true
    };
  }

  // Peso por lado (debe ser simétrico)
  const pesoPorLado = pesoACargar / 2;

  // Si no es divisible por 2, no es posible
  if (pesoPorLado !== Math.floor(pesoPorLado * 100) / 100) {
    return {
      pesoTotal: pesoBarra,
      pesoACargar: 0,
      pesoBarraSola: pesoBarra,
      discosPorLado: [],
      posible: false,
      error: `El peso a cargar (${pesoACargar}kg) debe ser divisible por 2`
    };
  }

  // Algoritmo greedy: usar los discos más pesados primero
  const discosOrdenados = [...discosDisponibles].sort((a, b) => b.peso - a.peso);
  const discosPorLado: PlateConfig[] = [];
  let pesoRestante = pesoPorLado;

  for (const disco of discosOrdenados) {
    if (pesoRestante <= 0) break;

    // Cuántos de este disco podemos usar
    const cantidadNecesaria = Math.floor(pesoRestante / disco.peso);
    const cantidadDisponible = Math.floor(disco.cantidad / 2); // Dividir por 2 porque necesitamos para ambos lados
    const cantidadAUsar = Math.min(cantidadNecesaria, cantidadDisponible);

    if (cantidadAUsar > 0) {
      discosPorLado.push({
        peso: disco.peso,
        color: disco.color,
        cantidad: cantidadAUsar
      });
      pesoRestante -= cantidadAUsar * disco.peso;
      pesoRestante = Math.round(pesoRestante * 100) / 100; // Evitar errores de punto flotante
    }
  }

  // Verificar si logramos el peso exacto
  const pesoLogrado = discosPorLado.reduce((sum, d) => sum + (d.peso * d.cantidad), 0);
  const pesoTotalLogrado = pesoBarra + (pesoLogrado * 2);

  if (pesoRestante > 0.01) { // Tolerancia de 0.01kg
    return {
      pesoTotal: pesoTotalLogrado,
      pesoACargar: pesoLogrado * 2,
      pesoBarraSola: pesoBarra,
      discosPorLado,
      posible: false,
      error: `No se puede lograr exactamente ${pesoObjetivo}kg. Más cercano: ${pesoTotalLogrado}kg (faltan ${pesoRestante * 2}kg)`
    };
  }

  return {
    pesoTotal: pesoTotalLogrado,
    pesoACargar: pesoLogrado * 2,
    pesoBarraSola: pesoBarra,
    discosPorLado,
    posible: true
  };
}

/**
 * ONE REP MAX (1RM) CALCULATOR
 * Usa la fórmula de Epley: 1RM = peso × (1 + reps/30)
 * Otras fórmulas disponibles: Brzycki, Lander, Lombardi
 */

export type FormulaOneRM = 'epley' | 'brzycki' | 'lander' | 'lombardi';

/**
 * Calcula el 1RM usando diferentes fórmulas
 */
export function calcularOneRepMax(
  peso: number,
  reps: number,
  formula: FormulaOneRM = 'epley'
): number {
  if (reps === 1) {
    return peso;
  }

  if (reps > 12) {
    // Para reps > 12, las fórmulas son menos precisas
    // Usar promedio de fórmulas
    const epley = peso * (1 + reps / 30);
    const brzycki = peso * (36 / (37 - reps));
    return (epley + brzycki) / 2;
  }

  switch (formula) {
    case 'epley':
      return peso * (1 + reps / 30);
    case 'brzycki':
      return peso * (36 / (37 - reps));
    case 'lander':
      return (100 * peso) / (101.3 - 2.67123 * reps);
    case 'lombardi':
      return peso * Math.pow(reps, 0.1);
    default:
      return peso * (1 + reps / 30);
  }
}

/**
 * Genera tabla de porcentajes del 1RM
 */
export function generarTablaPorcentajes(oneRM: number): OneRepMaxData['porcentajes'] {
  const porcentajes = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
  return porcentajes.map(pct => ({
    porcentaje: pct,
    peso: Math.round((oneRM * pct / 100) * 4) / 4 // Redondear a 0.25kg
  }));
}

/**
 * Calcula 1RM completo con tabla de porcentajes
 */
export function calcularOneRepMaxCompleto(
  peso: number,
  reps: number,
  formula: FormulaOneRM = 'epley'
): OneRepMaxData {
  const oneRepMax = calcularOneRepMax(peso, reps, formula);
  const porcentajes = generarTablaPorcentajes(oneRepMax);

  return {
    peso,
    reps,
    oneRepMax: Math.round(oneRepMax * 4) / 4, // Redondear a 0.25kg
    porcentajes
  };
}

/**
 * PERSONAL RECORDS (PR) TRACKING
 */

/**
 * Detecta si una serie nueva es un PR
 */
export function detectarPR(
  ejercicioId: string,
  ejercicioNombre: string,
  userId: string,
  serie: SerieLog,
  prAnterior?: PersonalRecord
): PersonalRecord | null {
  // Calcular métricas de la serie actual
  const pesoMaximo = serie.peso;
  const oneRM = calcularOneRepMax(serie.peso, serie.repeticiones);

  // Determinar si es PR
  let esPR = false;
  let tipoPR: PRType | null = null;
  let valorPR = 0;

  if (!prAnterior) {
    // Primera vez haciendo este ejercicio = PR automático
    esPR = true;
    tipoPR = 'peso_maximo';
    valorPR = pesoMaximo;
  } else {
    // Verificar diferentes tipos de PR
    if (pesoMaximo > prAnterior.valor && prAnterior.tipo === 'peso_maximo') {
      esPR = true;
      tipoPR = 'peso_maximo';
      valorPR = pesoMaximo;
    } else if (oneRM > (prAnterior.valor || 0) && prAnterior.tipo === 'one_rep_max') {
      esPR = true;
      tipoPR = 'one_rep_max';
      valorPR = oneRM;
    } else if (serie.peso === prAnterior.valor && serie.repeticiones > (prAnterior.reps || 0)) {
      // Mismo peso pero más reps = PR
      esPR = true;
      tipoPR = 'reps_maximas';
      valorPR = serie.repeticiones;
    }
  }

  if (!esPR || !tipoPR) {
    return null;
  }

  // Crear nuevo PR
  const nuevoPR: PersonalRecord = {
    id: `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ejercicioId,
    ejercicioNombre,
    tipo: tipoPR,
    valor: valorPR,
    reps: serie.repeticiones,
    fecha: new Date(),
    anterior: prAnterior ? {
      valor: prAnterior.valor,
      fecha: prAnterior.fecha
    } : undefined
  };

  return nuevoPR;
}

/**
 * Detecta múltiples PRs de un workout completo
 */
export function detectarPRsDeWorkout(
  userId: string,
  ejercicioId: string,
  ejercicioNombre: string,
  series: SerieLog[],
  prsAnteriores: PersonalRecord[]
): PersonalRecord[] {
  const nuevoPRs: PersonalRecord[] = [];

  // PR de peso máximo
  const pesoMaximo = Math.max(...series.map(s => s.peso));
  const serieConPesoMaximo = series.find(s => s.peso === pesoMaximo);
  const prPesoAnterior = prsAnteriores.find(pr => pr.tipo === 'peso_maximo');

  if (serieConPesoMaximo && (!prPesoAnterior || pesoMaximo > prPesoAnterior.valor)) {
    nuevoPRs.push({
      id: `pr-${Date.now()}-peso`,
      userId,
      ejercicioId,
      ejercicioNombre,
      tipo: 'peso_maximo',
      valor: pesoMaximo,
      reps: serieConPesoMaximo.repeticiones,
      fecha: new Date(),
      anterior: prPesoAnterior ? {
        valor: prPesoAnterior.valor,
        fecha: prPesoAnterior.fecha
      } : undefined
    });
  }

  // PR de volumen total
  const volumenTotal = series.reduce((sum, s) => sum + (s.peso * s.repeticiones), 0);
  const prVolumenAnterior = prsAnteriores.find(pr => pr.tipo === 'volumen_total');

  if (!prVolumenAnterior || volumenTotal > prVolumenAnterior.valor) {
    nuevoPRs.push({
      id: `pr-${Date.now()}-volumen`,
      userId,
      ejercicioId,
      ejercicioNombre,
      tipo: 'volumen_total',
      valor: volumenTotal,
      fecha: new Date(),
      anterior: prVolumenAnterior ? {
        valor: prVolumenAnterior.valor,
        fecha: prVolumenAnterior.fecha
      } : undefined
    });
  }

  // PR de 1RM estimado
  const mejorOneRM = Math.max(
    ...series.map(s => calcularOneRepMax(s.peso, s.repeticiones))
  );
  const prOneRMAnterior = prsAnteriores.find(pr => pr.tipo === 'one_rep_max');

  if (!prOneRMAnterior || mejorOneRM > prOneRMAnterior.valor) {
    const serieParaOneRM = series
      .map(s => ({ ...s, oneRM: calcularOneRepMax(s.peso, s.repeticiones) }))
      .sort((a, b) => b.oneRM - a.oneRM)[0];

    nuevoPRs.push({
      id: `pr-${Date.now()}-1rm`,
      userId,
      ejercicioId,
      ejercicioNombre,
      tipo: 'one_rep_max',
      valor: mejorOneRM,
      reps: serieParaOneRM.repeticiones,
      fecha: new Date(),
      anterior: prOneRMAnterior ? {
        valor: prOneRMAnterior.valor,
        fecha: prOneRMAnterior.fecha
      } : undefined
    });
  }

  return nuevoPRs;
}

/**
 * Formatea un PR para mostrar al usuario
 */
export function formatearPR(pr: PersonalRecord): string {
  const mejora = pr.anterior
    ? ` (+${(pr.valor - pr.anterior.valor).toFixed(1)})`
    : ' ¡NUEVO!';

  switch (pr.tipo) {
    case 'peso_maximo':
      return `💪 ${pr.ejercicioNombre}: ${pr.valor}kg × ${pr.reps} reps${mejora}`;
    case 'volumen_total':
      return `📊 ${pr.ejercicioNombre}: ${pr.valor}kg volumen total${mejora}`;
    case 'one_rep_max':
      return `🏆 ${pr.ejercicioNombre}: ${pr.valor}kg 1RM estimado${mejora}`;
    case 'reps_maximas':
      return `🔥 ${pr.ejercicioNombre}: ${pr.valor} reps con peso anterior${mejora}`;
    default:
      return `✨ ${pr.ejercicioNombre}: Nuevo PR${mejora}`;
  }
}

/**
 * WARMUP SETS GENERATOR
 * Genera sets de calentamiento progresivos
 */

export interface WarmupSetGenerated {
  peso: number;
  reps: number;
  porcentaje: number;
  descripcion: string;
}

/**
 * Genera sets de calentamiento basados en el peso de trabajo
 */
export function generarSetsCalentamiento(
  pesoTrabajo: number,
  _repsObjetivo: number
): WarmupSetGenerated[] {
  const sets: WarmupSetGenerated[] = [];

  // Solo necesitamos calentamiento si el peso de trabajo es > 40kg
  if (pesoTrabajo <= 40) {
    return [{
      peso: 20, // Barra vacía
      reps: 10,
      porcentaje: 0,
      descripcion: 'Barra vacía - Técnica y activación'
    }];
  }

  // Set 1: 40% - Barra vacía o muy ligera
  if (pesoTrabajo > 50) {
    sets.push({
      peso: 20,
      reps: 8,
      porcentaje: Math.round((20 / pesoTrabajo) * 100),
      descripcion: 'Barra vacía - Activación neural'
    });
  }

  // Set 2: 50% del peso de trabajo
  sets.push({
    peso: Math.round(pesoTrabajo * 0.5 * 4) / 4, // Redondear a 0.25kg
    reps: 6,
    porcentaje: 50,
    descripcion: '50% - Movimiento fluido'
  });

  // Set 3: 70% del peso de trabajo
  if (pesoTrabajo > 60) {
    sets.push({
      peso: Math.round(pesoTrabajo * 0.7 * 4) / 4,
      reps: 4,
      porcentaje: 70,
      descripcion: '70% - Pre-activación'
    });
  }

  // Set 4: 85% del peso de trabajo (solo para pesos muy pesados)
  if (pesoTrabajo > 100) {
    sets.push({
      peso: Math.round(pesoTrabajo * 0.85 * 4) / 4,
      reps: 2,
      porcentaje: 85,
      descripcion: '85% - Activación CNS'
    });
  }

  return sets;
}
