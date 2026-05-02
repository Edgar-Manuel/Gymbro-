import { describe, it, expect } from 'vitest';
import type { UserProfile } from '@/types';
import {
  DEFAULT_UNITS,
  getUnits,
  withUnits,
  weightFromBase,
  weightToBase,
  lengthFromBase,
  lengthToBase,
  formatWeight,
  formatLength,
  unitForMetric,
  metricFromBase,
} from './units';

const baseUser: UserProfile = {
  id: 'u1',
  nombre: 'Test',
  nivel: 'intermedio',
  objetivo: 'hipertrofia',
  diasDisponibles: 4,
  equipamiento: ['barra'],
  pesoActual: 80,
  altura: 175,
  edad: 30,
};

describe('getUnits', () => {
  it('default si no hay preferencia', () => {
    expect(getUnits(baseUser)).toEqual(DEFAULT_UNITS);
    expect(getUnits(null)).toEqual(DEFAULT_UNITS);
    expect(getUnits(undefined)).toEqual(DEFAULT_UNITS);
  });
  it('lee preferencia válida', () => {
    const u = withUnits(baseUser, { weight: 'lb', length: 'in' });
    expect(getUnits(u)).toEqual({ weight: 'lb', length: 'in' });
  });
  it('valores inválidos → default', () => {
    const u = { ...baseUser, preferencias: { units: { weight: 'kgx', length: 'cm' } } };
    expect(getUnits(u as UserProfile).weight).toBe('kg');
  });
});

describe('conversiones', () => {
  it('weightFromBase / weightToBase round-trip', () => {
    expect(weightFromBase(80, 'kg')).toBe(80);
    expect(weightFromBase(80, 'lb')).toBeCloseTo(176.37, 1);
    expect(weightToBase(176.37, 'lb')).toBeCloseTo(80, 1);
  });
  it('lengthFromBase / lengthToBase round-trip', () => {
    expect(lengthFromBase(100, 'cm')).toBe(100);
    expect(lengthFromBase(100, 'in')).toBeCloseTo(39.37, 1);
    expect(lengthToBase(39.37, 'in')).toBeCloseTo(100, 1);
  });
});

describe('formatters', () => {
  it('formatWeight kg', () => {
    expect(formatWeight(80, { weight: 'kg', length: 'cm' })).toBe('80.0 kg');
  });
  it('formatWeight lb', () => {
    expect(formatWeight(80, { weight: 'lb', length: 'cm' })).toMatch(/176\.[34] lb/);
  });
  it('formatLength cm', () => {
    expect(formatLength(95, { weight: 'kg', length: 'cm' })).toBe('95.0 cm');
  });
  it('formatLength in', () => {
    expect(formatLength(95, { weight: 'kg', length: 'in' })).toMatch(/37\.[34] in/);
  });
  it('null/undefined → "—"', () => {
    expect(formatWeight(null, DEFAULT_UNITS)).toBe('—');
    expect(formatLength(undefined, DEFAULT_UNITS)).toBe('—');
  });
});

describe('unitForMetric / metricFromBase', () => {
  const lbIn = { weight: 'lb' as const, length: 'in' as const };
  it('peso usa unidad de peso', () => {
    expect(unitForMetric('peso', lbIn)).toBe('lb');
    expect(metricFromBase('peso', 80, lbIn)).toBeCloseTo(176.37, 1);
  });
  it('grasaCorporal siempre %', () => {
    expect(unitForMetric('grasaCorporal', lbIn)).toBe('%');
    expect(metricFromBase('grasaCorporal', 15, lbIn)).toBe(15);
  });
  it('circunferencias usan unidad de longitud', () => {
    expect(unitForMetric('cintura', lbIn)).toBe('in');
    expect(metricFromBase('cintura', 80, lbIn)).toBeCloseTo(31.5, 1);
  });
});
