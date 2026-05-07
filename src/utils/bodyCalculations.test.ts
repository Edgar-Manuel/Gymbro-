import { describe, it, expect } from 'vitest';
import type { BodyMeasurement } from '@/types';
import {
  calculateBMI,
  getBMICategory,
  calculateLeanMass,
  calculateFatMass,
  calculateWaistHipRatio,
  getWaistHipRiskCategory,
  calculateWaistHeightRatio,
  getWaistHeightRiskCategory,
  calculateDelta,
  calculateTrend,
  movingAverage,
  kgToLb,
  lbToKg,
  cmToIn,
  inToCm,
  readField,
} from './bodyCalculations';

describe('calculateBMI', () => {
  it('calcula IMC normal', () => {
    expect(calculateBMI(70, 175)).toBeCloseTo(22.86, 2);
  });
  it('null si falta dato', () => {
    expect(calculateBMI(0, 175)).toBeNull();
    expect(calculateBMI(70, 0)).toBeNull();
  });
});

describe('getBMICategory', () => {
  it('categoriza correctamente', () => {
    expect(getBMICategory(17)?.label).toBe('Bajo peso');
    expect(getBMICategory(22)?.label).toBe('Normal');
    expect(getBMICategory(27)?.label).toBe('Sobrepeso');
    expect(getBMICategory(32)?.label).toBe('Obesidad I');
    expect(getBMICategory(40)?.label).toBe('Obesidad II+');
  });
  it('null si bmi inválido', () => {
    expect(getBMICategory(null)).toBeNull();
    expect(getBMICategory(NaN)).toBeNull();
  });
});

describe('composición corporal', () => {
  it('masa magra 80kg al 20% grasa = 64kg', () => {
    expect(calculateLeanMass(80, 20)).toBe(64);
  });
  it('masa grasa 80kg al 20% grasa = 16kg', () => {
    expect(calculateFatMass(80, 20)).toBe(16);
  });
  it('null si no hay grasa%', () => {
    expect(calculateLeanMass(80, undefined)).toBeNull();
    expect(calculateFatMass(80, undefined)).toBeNull();
  });
});

describe('ratios de salud', () => {
  it('cintura/cadera', () => {
    expect(calculateWaistHipRatio(80, 100)).toBe(0.8);
    expect(calculateWaistHipRatio(undefined, 100)).toBeNull();
  });
  it('riesgo cintura/cadera hombre', () => {
    expect(getWaistHipRiskCategory(0.80, 'masculino')?.color).toBe('green');
    expect(getWaistHipRiskCategory(0.88, 'masculino')?.color).toBe('yellow');
    expect(getWaistHipRiskCategory(0.92, 'masculino')?.color).toBe('orange');
    expect(getWaistHipRiskCategory(1.0, 'masculino')?.color).toBe('red');
  });
  it('riesgo cintura/cadera mujer (umbrales más bajos)', () => {
    expect(getWaistHipRiskCategory(0.78, 'femenino')?.color).toBe('green');
    expect(getWaistHipRiskCategory(0.95, 'femenino')?.color).toBe('red');
  });
  it('cintura/altura', () => {
    expect(calculateWaistHeightRatio(80, 175)).toBeCloseTo(0.457, 2);
  });
  it('riesgo cintura/altura', () => {
    expect(getWaistHeightRiskCategory(0.35)?.color).toBe('yellow');
    expect(getWaistHeightRiskCategory(0.45)?.color).toBe('green');
    expect(getWaistHeightRiskCategory(0.55)?.color).toBe('orange');
    expect(getWaistHeightRiskCategory(0.65)?.color).toBe('red');
  });
});

describe('calculateDelta', () => {
  it('aumento', () => {
    const d = calculateDelta(75, 70);
    expect(d?.abs).toBe(5);
    expect(d?.pct).toBeCloseTo(7.14, 1);
    expect(d?.direction).toBe('up');
  });
  it('descenso', () => {
    const d = calculateDelta(70, 75);
    expect(d?.abs).toBe(-5);
    expect(d?.direction).toBe('down');
  });
  it('flat', () => {
    expect(calculateDelta(70, 70)?.direction).toBe('flat');
    expect(calculateDelta(70, 70.005)?.direction).toBe('flat');
  });
  it('null si falta dato', () => {
    expect(calculateDelta(undefined, 70)).toBeNull();
    expect(calculateDelta(70, undefined)).toBeNull();
  });
});

describe('readField', () => {
  it('lee campo plano', () => {
    const m = { peso: 80, cintura: 90 } as BodyMeasurement;
    expect(readField(m, 'peso')).toBe(80);
    expect(readField(m, 'cintura')).toBe(90);
  });
  it('fallback a medidas anidado (datos legacy)', () => {
    const m = { peso: 80, medidas: { cintura: 88 } } as BodyMeasurement;
    expect(readField(m, 'cintura')).toBe(88);
  });
  it('flat tiene prioridad sobre anidado', () => {
    const m = { peso: 80, cintura: 90, medidas: { cintura: 88 } } as BodyMeasurement;
    expect(readField(m, 'cintura')).toBe(90);
  });
});

describe('calculateTrend', () => {
  const now = new Date('2026-04-30T12:00:00Z');
  const day = 24 * 60 * 60 * 1000;

  const mk = (offsetDays: number, peso: number, id = `m-${offsetDays}`): BodyMeasurement => ({
    id,
    userId: 'u1',
    fecha: new Date(now.getTime() - offsetDays * day),
    peso,
  } as BodyMeasurement);

  it('null si menos de 2 mediciones', () => {
    expect(calculateTrend([mk(0, 70)], 'peso', 30, now)).toBeNull();
  });

  it('delta entre la más antigua dentro del rango y la última', () => {
    // measurements ordenadas: más reciente primero
    const ms = [mk(0, 75), mk(5, 73), mk(20, 72), mk(40, 70)];
    const trend = calculateTrend(ms, 'peso', 30, now);
    // baseline = mk(20, 72) (más antigua aún en rango); current = mk(0, 75)
    expect(trend?.abs).toBe(3);
    expect(trend?.direction).toBe('up');
  });

  it('null si la única medición distinta está fuera del rango', () => {
    const ms = [mk(0, 75), mk(40, 70)];
    expect(calculateTrend(ms, 'peso', 30, now)).toBeNull();
  });
});

describe('movingAverage', () => {
  it('ventana 3 sobre serie pequeña', () => {
    const ma = movingAverage([1, 2, 3, 4, 5], 3);
    expect(ma).toEqual([1, 1.5, 2, 3, 4]);
  });
  it('ignora null/undefined', () => {
    const ma = movingAverage([1, null, 3, undefined, 5], 3);
    // i=0: [1] → 1
    // i=1: [1, null] → 1
    // i=2: [1, null, 3] → 2
    // i=3: [null, 3, undefined] → 3
    // i=4: [3, undefined, 5] → 4
    expect(ma).toEqual([1, 1, 2, 3, 4]);
  });
});

describe('conversión de unidades', () => {
  it('kg ↔ lb', () => {
    expect(kgToLb(70)).toBeCloseTo(154.32, 1);
    expect(lbToKg(154.32)).toBeCloseTo(70, 1);
  });
  it('cm ↔ in', () => {
    expect(cmToIn(100)).toBeCloseTo(39.37, 1);
    expect(inToCm(39.37)).toBeCloseTo(100, 1);
  });
});
