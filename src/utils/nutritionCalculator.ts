/**
 * Sistema de cálculo nutricional adaptado por somatotipo
 *
 * Los tres somatotipos principales:
 * - ECTOMORFO: Metabolismo rápido, dificultad para ganar peso, extremidades largas
 * - MESOMORFO: Facilidad para ganar músculo, metabolismo moderado, cuerpo atlético
 * - ENDOMORFO: Metabolismo lento, facilidad para ganar grasa, cuerpo redondeado
 */

import type { Somatotipo, Objetivo, ObjetivoCalorico } from '@/types';

export interface PerfilNutricional {
  descripcion: string;
  caracteristicas: string[];
  fortalezas: string[];
  desafios: string[];
  recomendacionesGenerales: string[];
}

export interface MacroDistribucion {
  proteina: number; // g por kg de peso
  carbohidratos: number; // porcentaje de calorías totales
  grasa: number; // porcentaje de calorías totales
}

export interface PlanNutricionalCalculado {
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasa: number;
  superavitDeficit: number;
  descripcionPlan: string;
}

// Información detallada de cada somatotipo
export const PERFILES_SOMATOTIPO: Record<Somatotipo, PerfilNutricional> = {
  ectomorfo: {
    descripcion: 'Metabolismo rápido con dificultad para ganar peso',
    caracteristicas: [
      'Extremidades largas y delgadas',
      'Hombros estrechos',
      'Metabolismo muy acelerado',
      'Baja grasa corporal natural',
      'Dificultad para ganar masa muscular'
    ],
    fortalezas: [
      'Facilidad para mantenerse delgado',
      'Buena definición muscular una vez ganada',
      'Pueden comer más calorías sin engordar',
      'Recuperación rápida entre entrenamientos'
    ],
    desafios: [
      'Necesitan comer mucho más para ganar peso',
      'Pierden peso rápidamente si dejan de comer',
      'Deben priorizar comidas densas en calorías',
      'Requieren más carbohidratos para energía'
    ],
    recomendacionesGenerales: [
      'Comer cada 2-3 horas, incluso sin hambre',
      'Priorizar alimentos densos calóricamente (frutos secos, aguacate, aceites)',
      'Batidos hipercalóricos entre comidas',
      'No hacer cardio excesivo',
      'Entrenamientos cortos e intensos (45-60 min)',
      'Dormir 8+ horas para recuperación'
    ]
  },
  mesomorfo: {
    descripcion: 'Cuerpo atlético con facilidad para ganar músculo',
    caracteristicas: [
      'Hombros anchos y cintura estrecha',
      'Musculatura natural bien definida',
      'Metabolismo moderado',
      'Responde bien al entrenamiento',
      'Estructura ósea mediana'
    ],
    fortalezas: [
      'Gana músculo con relativa facilidad',
      'Pierde grasa sin demasiado esfuerzo',
      'Buena respuesta al entrenamiento de fuerza',
      'Flexibilidad en la dieta'
    ],
    desafios: [
      'Puede ganar grasa si descuida la dieta',
      'Tendencia a confiarse y ser inconsistente',
      'Necesita mantener disciplina para optimizar',
      'Debe balancear músculo y grasa'
    ],
    recomendacionesGenerales: [
      'Dieta balanceada con macros moderados',
      'Entrenar con intensidad 4-5 veces por semana',
      'Incluir algo de cardio para mantener definición',
      'Ajustar calorías según progreso visual',
      'Variar estímulos de entrenamiento regularmente'
    ]
  },
  endomorfo: {
    descripcion: 'Metabolismo lento con tendencia a acumular grasa',
    caracteristicas: [
      'Estructura ósea grande',
      'Tendencia a acumular grasa abdominal',
      'Metabolismo lento',
      'Extremidades más cortas',
      'Facilidad para ganar peso'
    ],
    fortalezas: [
      'Buena capacidad para ganar fuerza',
      'Recuperación muscular eficiente',
      'Pueden levantar pesos pesados',
      'Buenos en deportes de potencia'
    ],
    desafios: [
      'Dificultad para perder grasa',
      'Deben ser muy estrictos con carbohidratos',
      'Necesitan más cardio que otros tipos',
      'Metabolismo se adapta rápido a déficit'
    ],
    recomendacionesGenerales: [
      'Priorizar proteínas y grasas saludables',
      'Limitar carbohidratos, especialmente simples',
      'Timing de carbohidratos: principalmente post-entreno',
      'Incluir cardio HIIT 3-4 veces por semana',
      'Evitar ayunos prolongados (ralentizan metabolismo)',
      'Comer más fibra para saciedad'
    ]
  }
};

// Distribución de macros según somatotipo y objetivo
export const MACRO_DISTRIBUCION: Record<Somatotipo, Record<Objetivo, MacroDistribucion>> = {
  ectomorfo: {
    hipertrofia: { proteina: 2.0, carbohidratos: 55, grasa: 25 },
    fuerza: { proteina: 2.2, carbohidratos: 50, grasa: 28 },
    resistencia: { proteina: 1.8, carbohidratos: 60, grasa: 20 },
    perdida_grasa: { proteina: 2.4, carbohidratos: 40, grasa: 30 }
  },
  mesomorfo: {
    hipertrofia: { proteina: 2.2, carbohidratos: 45, grasa: 28 },
    fuerza: { proteina: 2.4, carbohidratos: 40, grasa: 32 },
    resistencia: { proteina: 2.0, carbohidratos: 50, grasa: 25 },
    perdida_grasa: { proteina: 2.5, carbohidratos: 30, grasa: 35 }
  },
  endomorfo: {
    hipertrofia: { proteina: 2.4, carbohidratos: 35, grasa: 32 },
    fuerza: { proteina: 2.5, carbohidratos: 30, grasa: 35 },
    resistencia: { proteina: 2.2, carbohidratos: 40, grasa: 30 },
    perdida_grasa: { proteina: 2.8, carbohidratos: 20, grasa: 40 }
  }
};

// Ajuste calórico según somatotipo y objetivo
export const AJUSTE_CALORICO: Record<Somatotipo, Record<ObjetivoCalorico, {
  porcentaje: number;
  descripcion: string;
}>> = {
  ectomorfo: {
    superavit: { porcentaje: 20, descripcion: 'Superávit agresivo (+20%) - Necesario para ganar' },
    mantenimiento: { porcentaje: 0, descripcion: 'Mantenimiento - Difícil mantener peso' },
    deficit: { porcentaje: -10, descripcion: 'Déficit moderado (-10%) - Cuidado con perder músculo' }
  },
  mesomorfo: {
    superavit: { porcentaje: 15, descripcion: 'Superávit moderado (+15%) - Balance óptimo' },
    mantenimiento: { porcentaje: 0, descripcion: 'Mantenimiento - Fácil de sostener' },
    deficit: { porcentaje: -15, descripcion: 'Déficit moderado (-15%) - Pérdida controlada' }
  },
  endomorfo: {
    superavit: { porcentaje: 10, descripcion: 'Superávit conservador (+10%) - Evitar ganar grasa' },
    mantenimiento: { porcentaje: 0, descripcion: 'Mantenimiento - Vigilar calorías' },
    deficit: { porcentaje: -20, descripcion: 'Déficit agresivo (-20%) - Para perder grasa efectivamente' }
  }
};

/**
 * Calcular BMR usando fórmula Mifflin-St Jeor
 */
export function calcularBMR(
  peso: number,
  altura: number,
  edad: number,
  sexo: 'masculino' | 'femenino' = 'masculino'
): number {
  if (sexo === 'masculino') {
    return 10 * peso + 6.25 * altura - 5 * edad + 5;
  } else {
    return 10 * peso + 6.25 * altura - 5 * edad - 161;
  }
}

/**
 * Calcular TDEE (Total Daily Energy Expenditure)
 */
export function calcularTDEE(
  bmr: number,
  factorActividad: number = 1.55 // Moderadamente activo por defecto
): number {
  return Math.round(bmr * factorActividad);
}

/**
 * Calcular plan nutricional completo
 */
export function calcularPlanNutricional(
  peso: number,
  altura: number,
  edad: number,
  sexo: 'masculino' | 'femenino' = 'masculino',
  somatotipo: Somatotipo = 'mesomorfo',
  objetivo: Objetivo = 'hipertrofia',
  objetivoCalorico: ObjetivoCalorico = 'superavit',
  factorActividad: number = 1.55
): PlanNutricionalCalculado {
  // 1. Calcular BMR y TDEE
  const bmr = calcularBMR(peso, altura, edad, sexo);
  const tdee = calcularTDEE(bmr, factorActividad);

  // 2. Obtener ajuste calórico según somatotipo
  const ajuste = AJUSTE_CALORICO[somatotipo][objetivoCalorico];
  const superavitDeficit = Math.round(tdee * (ajuste.porcentaje / 100));
  const caloriasTotales = tdee + superavitDeficit;

  // 3. Obtener distribución de macros
  const macros = MACRO_DISTRIBUCION[somatotipo][objetivo];

  // 4. Calcular macros en gramos
  const proteina = Math.round(peso * macros.proteina);
  const proteinaCalorias = proteina * 4;

  const caloriasRestantes = caloriasTotales - proteinaCalorias;
  const carbohidratosCalorias = Math.round(caloriasRestantes * (macros.carbohidratos / (macros.carbohidratos + macros.grasa)));
  const grasaCalorias = caloriasRestantes - carbohidratosCalorias;

  const carbohidratos = Math.round(carbohidratosCalorias / 4);
  const grasa = Math.round(grasaCalorias / 9);

  return {
    calorias: caloriasTotales,
    proteina,
    carbohidratos,
    grasa,
    superavitDeficit,
    descripcionPlan: ajuste.descripcion
  };
}

/**
 * Obtener recomendaciones de timing de comidas según somatotipo
 */
export function getTimingRecomendado(somatotipo: Somatotipo): {
  numComidas: number;
  descripcion: string;
  horarios: string[];
} {
  switch (somatotipo) {
    case 'ectomorfo':
      return {
        numComidas: 6,
        descripcion: 'Comer cada 2-3 horas para mantener aporte calórico constante',
        horarios: ['8:00 AM', '10:30 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM']
      };
    case 'mesomorfo':
      return {
        numComidas: 5,
        descripcion: 'Distribuir macros de forma equilibrada durante el día',
        horarios: ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM', '8:00 PM']
      };
    case 'endomorfo':
      return {
        numComidas: 4,
        descripcion: 'Menos comidas, más espaciadas. Carbohidratos concentrados post-entreno',
        horarios: ['9:00 AM', '1:00 PM', '5:00 PM', '8:00 PM']
      };
  }
}

/**
 * Obtener suplementos recomendados según somatotipo y objetivo
 */
export function getSuplementosRecomendados(
  somatotipo: Somatotipo,
  _objetivo: Objetivo
): string[] {
  const basicos = ['Proteína Whey/Isolate', 'Creatina Monohidrato 5g/día'];

  const especificos: Record<Somatotipo, string[]> = {
    ectomorfo: [
      'Gainer (si no alcanzas calorías con comida)',
      'Maltodextrina post-entreno',
      'ZMA para recuperación nocturna'
    ],
    mesomorfo: [
      'BCAAs (opcional)',
      'Beta-Alanina para resistencia',
      'Cafeína pre-entreno'
    ],
    endomorfo: [
      'L-Carnitina para oxidación de grasas',
      'Té verde / Extracto',
      'Omega-3 para metabolismo',
      'Fibra soluble para saciedad'
    ]
  };

  return [...basicos, ...especificos[somatotipo]];
}

/**
 * Obtener factor de actividad recomendado
 */
export function getFactoresActividad(): { valor: number; descripcion: string }[] {
  return [
    { valor: 1.2, descripcion: 'Sedentario (poco o nada de ejercicio)' },
    { valor: 1.375, descripcion: 'Ligero (ejercicio 1-3 días/semana)' },
    { valor: 1.55, descripcion: 'Moderado (ejercicio 3-5 días/semana)' },
    { valor: 1.725, descripcion: 'Activo (ejercicio 6-7 días/semana)' },
    { valor: 1.9, descripcion: 'Muy activo (ejercicio intenso diario o trabajo físico)' }
  ];
}
