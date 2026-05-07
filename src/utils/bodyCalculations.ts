import type { BodyMeasurement } from '@/types';

// ─── Rangos válidos (para validación de inputs) ──────────────────────────────
export const RANGES = {
  peso: { min: 20, max: 500 },          // kg
  grasaCorporal: { min: 0, max: 70 },   // %
  medida: { min: 0, max: 300 },         // cm — cualquier circunferencia
  altura: { min: 50, max: 250 },        // cm
} as const;

// ─── IMC ─────────────────────────────────────────────────────────────────────
export function calculateBMI(pesoKg: number, alturaCm: number): number | null {
  if (!pesoKg || !alturaCm || alturaCm <= 0) return null;
  const m = alturaCm / 100;
  return pesoKg / (m * m);
}

export type BMICategory = {
  label: string;
  range: string;
  color: 'red' | 'orange' | 'green' | 'yellow' | 'blue';
};

export function getBMICategory(bmi: number | null): BMICategory | null {
  if (bmi == null || isNaN(bmi)) return null;
  if (bmi < 18.5) return { label: 'Bajo peso', range: '< 18.5', color: 'blue' };
  if (bmi < 25) return { label: 'Normal', range: '18.5 – 24.9', color: 'green' };
  if (bmi < 30) return { label: 'Sobrepeso', range: '25 – 29.9', color: 'yellow' };
  if (bmi < 35) return { label: 'Obesidad I', range: '30 – 34.9', color: 'orange' };
  return { label: 'Obesidad II+', range: '≥ 35', color: 'red' };
}

// ─── Composición corporal ────────────────────────────────────────────────────
/** Masa magra (kg) = peso × (1 − grasa%/100) */
export function calculateLeanMass(pesoKg: number, grasaPct?: number): number | null {
  if (!pesoKg || grasaPct == null) return null;
  return pesoKg * (1 - grasaPct / 100);
}

/** Masa grasa (kg) */
export function calculateFatMass(pesoKg: number, grasaPct?: number): number | null {
  if (!pesoKg || grasaPct == null) return null;
  return pesoKg * (grasaPct / 100);
}

// ─── Ratios de salud ─────────────────────────────────────────────────────────
export function calculateWaistHipRatio(cinturaCm?: number, caderaCm?: number): number | null {
  if (!cinturaCm || !caderaCm) return null;
  return cinturaCm / caderaCm;
}

export type RiskCategory = {
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
};

/** WHO cutoffs: hombres >0.90 / mujeres >0.85 = riesgo */
export function getWaistHipRiskCategory(
  ratio: number | null,
  sexo?: 'masculino' | 'femenino'
): RiskCategory | null {
  if (ratio == null) return null;
  const lim = sexo === 'femenino' ? 0.85 : 0.90;
  if (ratio < lim - 0.05) return { label: 'Bajo riesgo', color: 'green' };
  if (ratio < lim) return { label: 'Normal', color: 'yellow' };
  if (ratio < lim + 0.05) return { label: 'Riesgo moderado', color: 'orange' };
  return { label: 'Riesgo alto', color: 'red' };
}

export function calculateWaistHeightRatio(cinturaCm?: number, alturaCm?: number): number | null {
  if (!cinturaCm || !alturaCm) return null;
  return cinturaCm / alturaCm;
}

/** Heurística común: <0.4 bajo, 0.4–0.5 normal, 0.5–0.6 sobrepeso, >0.6 obesidad */
export function getWaistHeightRiskCategory(ratio: number | null): RiskCategory | null {
  if (ratio == null) return null;
  if (ratio < 0.4) return { label: 'Bajo peso', color: 'yellow' };
  if (ratio < 0.5) return { label: 'Saludable', color: 'green' };
  if (ratio < 0.6) return { label: 'Sobrepeso', color: 'orange' };
  return { label: 'Obesidad', color: 'red' };
}

// ─── Deltas ──────────────────────────────────────────────────────────────────
export type Delta = {
  abs: number;        // diferencia con signo (current − previous)
  pct: number;        // % de cambio respecto al anterior, con signo
  direction: 'up' | 'down' | 'flat';
};

export function calculateDelta(current?: number, previous?: number): Delta | null {
  if (current == null || previous == null) return null;
  const abs = current - previous;
  const pct = previous !== 0 ? (abs / previous) * 100 : 0;
  const direction: Delta['direction'] =
    Math.abs(abs) < 0.01 ? 'flat' : abs > 0 ? 'up' : 'down';
  return { abs, pct, direction };
}

// ─── Tendencia temporal ──────────────────────────────────────────────────────
type FieldKey =
  | 'peso' | 'grasaCorporal' | 'pecho' | 'cintura' | 'cadera'
  | 'brazoDerecho' | 'brazoIzquierdo' | 'musloDerecho' | 'musloIzquierdo'
  | 'pantorrillaDerecha' | 'pantorrillaIzquierda';

/** Lee un campo de una BodyMeasurement, soportando flat o anidado en `medidas`. */
export function readField(m: BodyMeasurement, field: FieldKey): number | undefined {
  if (field === 'peso' || field === 'grasaCorporal') return m[field];
  return (m as any)[field] ?? m.medidas?.[field as keyof NonNullable<BodyMeasurement['medidas']>];
}

/**
 * Devuelve el delta del campo entre la medición más reciente y la primera
 * dentro de los últimos `days` días. Null si no hay suficientes datos.
 *
 * `measurements` se asume ordenado de más reciente a más antiguo.
 */
export function calculateTrend(
  measurements: BodyMeasurement[],
  field: FieldKey,
  days: number,
  now: Date = new Date()
): Delta | null {
  if (measurements.length < 2) return null;
  const latest = measurements[0];
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;

  // Encuentra la medición más antigua aún dentro del rango
  let baseline: BodyMeasurement | undefined;
  for (const m of measurements) {
    if (new Date(m.fecha).getTime() >= cutoff) baseline = m;
    else break;
  }
  if (!baseline || baseline.id === latest.id) return null;

  return calculateDelta(readField(latest, field), readField(baseline, field));
}

// ─── Media móvil (para línea de tendencia en charts) ─────────────────────────
export function movingAverage(values: (number | null | undefined)[], window: number): (number | null)[] {
  return values.map((_, i) => {
    const slice = values
      .slice(Math.max(0, i - window + 1), i + 1)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (slice.length === 0) return null;
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
}

// ─── Conversión de unidades ──────────────────────────────────────────────────
export const KG_TO_LB = 2.20462;
export const CM_TO_IN = 0.393701;

export function kgToLb(kg: number): number { return kg * KG_TO_LB; }
export function lbToKg(lb: number): number { return lb / KG_TO_LB; }
export function cmToIn(cm: number): number { return cm * CM_TO_IN; }
export function inToCm(inches: number): number { return inches / CM_TO_IN; }
