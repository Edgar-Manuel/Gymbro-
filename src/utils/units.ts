import type { UserProfile } from '@/types';
import { kgToLb, lbToKg, cmToIn, inToCm } from './bodyCalculations';

export type WeightUnit = 'kg' | 'lb';
export type LengthUnit = 'cm' | 'in';

export interface Units {
  weight: WeightUnit;
  length: LengthUnit;
}

export const DEFAULT_UNITS: Units = { weight: 'kg', length: 'cm' };

// ─── Lectura/escritura desde UserProfile ─────────────────────────────────────
export function getUnits(user: UserProfile | null | undefined): Units {
  if (!user) return DEFAULT_UNITS;
  const raw = user.preferencias?.units;
  if (!raw || typeof raw !== 'object') return DEFAULT_UNITS;
  const u = raw as Partial<Units>;
  return {
    weight: u.weight === 'lb' ? 'lb' : 'kg',
    length: u.length === 'in' ? 'in' : 'cm',
  };
}

export function withUnits(user: UserProfile, units: Units): UserProfile {
  return {
    ...user,
    preferencias: {
      ...(user.preferencias ?? {}),
      units,
    },
  };
}

// ─── Conversión desde/hacia las unidades base (kg, cm) ───────────────────────
export function weightFromBase(kg: number, unit: WeightUnit): number {
  return unit === 'lb' ? kgToLb(kg) : kg;
}

export function lengthFromBase(cm: number, unit: LengthUnit): number {
  return unit === 'in' ? cmToIn(cm) : cm;
}

export function weightToBase(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? lbToKg(value) : value;
}

export function lengthToBase(value: number, unit: LengthUnit): number {
  return unit === 'in' ? inToCm(value) : value;
}

// ─── Formatters ──────────────────────────────────────────────────────────────
export function formatWeight(kg: number | undefined | null, units: Units, decimals = 1): string {
  if (kg == null) return '—';
  return `${weightFromBase(kg, units.weight).toFixed(decimals)} ${units.weight}`;
}

export function formatLength(cm: number | undefined | null, units: Units, decimals = 1): string {
  if (cm == null) return '—';
  return `${lengthFromBase(cm, units.length).toFixed(decimals)} ${units.length}`;
}

/** Devuelve la unidad en la que se debería mostrar una métrica concreta. */
export function unitForMetric(metricKey: string, units: Units): string {
  if (metricKey === 'peso') return units.weight;
  if (metricKey === 'grasaCorporal') return '%';
  return units.length;  // todas las circunferencias
}

/** Convierte un valor de la métrica desde base a la unidad activa. */
export function metricFromBase(metricKey: string, baseValue: number, units: Units): number {
  if (metricKey === 'peso') return weightFromBase(baseValue, units.weight);
  if (metricKey === 'grasaCorporal') return baseValue;
  return lengthFromBase(baseValue, units.length);
}
