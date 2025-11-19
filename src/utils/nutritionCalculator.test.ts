import { describe, it, expect } from 'vitest'
import {
  calcularBMR,
  calcularTDEE,
  calcularPlanNutricional,
  getTimingRecomendado,
  getSuplementosRecomendados,
  PERFILES_SOMATOTIPO,
  MACRO_DISTRIBUCION,
  AJUSTE_CALORICO,
} from './nutritionCalculator'

describe('nutritionCalculator', () => {
  describe('calcularBMR', () => {
    it('calcula BMR correctamente para hombre', () => {
      // Fórmula: 10 * peso + 6.25 * altura - 5 * edad + 5
      const bmr = calcularBMR(70, 175, 25, 'masculino')
      // 10 * 70 + 6.25 * 175 - 5 * 25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
      expect(bmr).toBe(1673.75)
    })

    it('calcula BMR correctamente para mujer', () => {
      // Fórmula: 10 * peso + 6.25 * altura - 5 * edad - 161
      const bmr = calcularBMR(60, 165, 30, 'femenino')
      // 10 * 60 + 6.25 * 165 - 5 * 30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(bmr).toBe(1320.25)
    })

    it('usa masculino como default', () => {
      const bmrDefault = calcularBMR(70, 175, 25)
      const bmrMasculino = calcularBMR(70, 175, 25, 'masculino')
      expect(bmrDefault).toBe(bmrMasculino)
    })
  })

  describe('calcularTDEE', () => {
    it('calcula TDEE con factor por defecto (1.55)', () => {
      const bmr = 1700
      const tdee = calcularTDEE(bmr)
      expect(tdee).toBe(Math.round(1700 * 1.55))
    })

    it('calcula TDEE con factor personalizado', () => {
      const bmr = 1700
      const tdee = calcularTDEE(bmr, 1.725)
      expect(tdee).toBe(Math.round(1700 * 1.725))
    })

    it('redondea el resultado', () => {
      const bmr = 1673.75
      const tdee = calcularTDEE(bmr, 1.55)
      expect(Number.isInteger(tdee)).toBe(true)
    })
  })

  describe('calcularPlanNutricional', () => {
    it('calcula plan para ectomorfo en superávit', () => {
      const plan = calcularPlanNutricional(
        70, 175, 25, 'masculino',
        'ectomorfo', 'hipertrofia', 'superavit', 1.55
      )

      expect(plan.calorias).toBeGreaterThan(0)
      expect(plan.proteina).toBeGreaterThan(0)
      expect(plan.carbohidratos).toBeGreaterThan(0)
      expect(plan.grasa).toBeGreaterThan(0)
      expect(plan.superavitDeficit).toBeGreaterThan(0) // Superávit = positivo
      expect(plan.descripcionPlan).toContain('20%') // Ectomorfo tiene +20%
    })

    it('calcula plan para endomorfo en déficit', () => {
      const plan = calcularPlanNutricional(
        85, 170, 35, 'masculino',
        'endomorfo', 'perdida_grasa', 'deficit', 1.55
      )

      expect(plan.calorias).toBeGreaterThan(0)
      expect(plan.superavitDeficit).toBeLessThan(0) // Déficit = negativo
      expect(plan.descripcionPlan).toContain('-20%') // Endomorfo tiene -20%
    })

    it('calcula proteína basada en peso corporal', () => {
      const plan = calcularPlanNutricional(
        70, 175, 25, 'masculino',
        'mesomorfo', 'hipertrofia', 'superavit', 1.55
      )

      // Mesomorfo hipertrofia: 2.2g/kg
      const proteinaEsperada = Math.round(70 * 2.2)
      expect(plan.proteina).toBe(proteinaEsperada)
    })

    it('retorna valores consistentes para mantenimiento', () => {
      const plan = calcularPlanNutricional(
        70, 175, 25, 'masculino',
        'mesomorfo', 'hipertrofia', 'mantenimiento', 1.55
      )

      expect(plan.superavitDeficit).toBe(0)
    })
  })

  describe('getTimingRecomendado', () => {
    it('retorna 6 comidas para ectomorfo', () => {
      const timing = getTimingRecomendado('ectomorfo')
      expect(timing.numComidas).toBe(6)
      expect(timing.horarios).toHaveLength(6)
    })

    it('retorna 5 comidas para mesomorfo', () => {
      const timing = getTimingRecomendado('mesomorfo')
      expect(timing.numComidas).toBe(5)
      expect(timing.horarios).toHaveLength(5)
    })

    it('retorna 4 comidas para endomorfo', () => {
      const timing = getTimingRecomendado('endomorfo')
      expect(timing.numComidas).toBe(4)
      expect(timing.horarios).toHaveLength(4)
    })

    it('incluye descripción para cada somatotipo', () => {
      const tipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const
      tipos.forEach((tipo) => {
        const timing = getTimingRecomendado(tipo)
        expect(timing.descripcion).toBeTruthy()
        expect(timing.descripcion.length).toBeGreaterThan(10)
      })
    })
  })

  describe('getSuplementosRecomendados', () => {
    it('incluye suplementos básicos para todos', () => {
      const tipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const
      tipos.forEach((tipo) => {
        const suplementos = getSuplementosRecomendados(tipo, 'hipertrofia')
        expect(suplementos).toContain('Proteína Whey/Isolate')
        expect(suplementos).toContain('Creatina Monohidrato 5g/día')
      })
    })

    it('incluye Gainer para ectomorfo', () => {
      const suplementos = getSuplementosRecomendados('ectomorfo', 'hipertrofia')
      const tieneGainer = suplementos.some(s => s.toLowerCase().includes('gainer'))
      expect(tieneGainer).toBe(true)
    })

    it('incluye L-Carnitina para endomorfo', () => {
      const suplementos = getSuplementosRecomendados('endomorfo', 'perdida_grasa')
      const tieneCarnitina = suplementos.some(s => s.toLowerCase().includes('carnitina'))
      expect(tieneCarnitina).toBe(true)
    })
  })

  describe('PERFILES_SOMATOTIPO', () => {
    it('tiene datos completos para cada somatotipo', () => {
      const tipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const

      tipos.forEach((tipo) => {
        const perfil = PERFILES_SOMATOTIPO[tipo]
        expect(perfil.descripcion).toBeTruthy()
        expect(perfil.caracteristicas).toBeInstanceOf(Array)
        expect(perfil.caracteristicas.length).toBeGreaterThan(0)
        expect(perfil.fortalezas).toBeInstanceOf(Array)
        expect(perfil.fortalezas.length).toBeGreaterThan(0)
        expect(perfil.desafios).toBeInstanceOf(Array)
        expect(perfil.desafios.length).toBeGreaterThan(0)
        expect(perfil.recomendacionesGenerales).toBeInstanceOf(Array)
        expect(perfil.recomendacionesGenerales.length).toBeGreaterThan(0)
      })
    })
  })

  describe('MACRO_DISTRIBUCION', () => {
    it('tiene distribución de macros para cada combinación', () => {
      const somatotipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const
      const objetivos = ['hipertrofia', 'fuerza', 'resistencia', 'perdida_grasa'] as const

      somatotipos.forEach((somatotipo) => {
        objetivos.forEach((objetivo) => {
          const macros = MACRO_DISTRIBUCION[somatotipo][objetivo]
          expect(macros.proteina).toBeGreaterThan(0)
          expect(macros.carbohidratos).toBeGreaterThan(0)
          expect(macros.grasa).toBeGreaterThan(0)
        })
      })
    })

    it('suma de porcentajes de carbs y grasa debe ser ~100% menos proteína', () => {
      const macros = MACRO_DISTRIBUCION.mesomorfo.hipertrofia
      // La suma de carbs + grasa debería ser cercana al resto después de proteína
      expect(macros.carbohidratos + macros.grasa).toBeGreaterThan(60)
      expect(macros.carbohidratos + macros.grasa).toBeLessThan(100)
    })
  })

  describe('AJUSTE_CALORICO', () => {
    it('superávit es positivo para todos los somatotipos', () => {
      const tipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const
      tipos.forEach((tipo) => {
        expect(AJUSTE_CALORICO[tipo].superavit.porcentaje).toBeGreaterThan(0)
      })
    })

    it('déficit es negativo para todos los somatotipos', () => {
      const tipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const
      tipos.forEach((tipo) => {
        expect(AJUSTE_CALORICO[tipo].deficit.porcentaje).toBeLessThan(0)
      })
    })

    it('mantenimiento es 0 para todos', () => {
      const tipos = ['ectomorfo', 'mesomorfo', 'endomorfo'] as const
      tipos.forEach((tipo) => {
        expect(AJUSTE_CALORICO[tipo].mantenimiento.porcentaje).toBe(0)
      })
    })

    it('ectomorfo tiene mayor superávit que mesomorfo', () => {
      expect(AJUSTE_CALORICO.ectomorfo.superavit.porcentaje)
        .toBeGreaterThan(AJUSTE_CALORICO.mesomorfo.superavit.porcentaje)
    })

    it('endomorfo tiene menor superávit que mesomorfo', () => {
      expect(AJUSTE_CALORICO.endomorfo.superavit.porcentaje)
        .toBeLessThan(AJUSTE_CALORICO.mesomorfo.superavit.porcentaje)
    })
  })
})
