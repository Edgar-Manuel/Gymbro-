import type { Somatotipo, CardioTipo, CardioEquipo } from '@/types';

export interface CardioProtocol {
  tipo: CardioTipo;
  duracion: number; // minutos
  descripcion: string;
  beneficio: string;
  // HIIT intervals
  trabajoSeg?: number;
  descansoSeg?: number;
  rondas?: number;
}

export interface CardioRecomendacion {
  somatotipo: Somatotipo;
  titulo: string;
  razon: string;
  momento: 'antes' | 'despues';
  protocolos: CardioProtocol[];
}

export const CARDIO_RECOMENDACIONES: Record<Somatotipo, CardioRecomendacion> = {
  ectomorfo: {
    somatotipo: 'ectomorfo',
    titulo: 'Cardio ligero',
    razon: 'Metabolismo rápido — conserva calorías para recuperación muscular.',
    momento: 'despues',
    protocolos: [
      {
        tipo: 'liss',
        duracion: 15,
        descripcion: 'LISS 15 min',
        beneficio: 'Mejora cardiovascular sin quemar músculo',
      },
      {
        tipo: 'moderado',
        duracion: 20,
        descripcion: 'Cardio moderado 20 min',
        beneficio: 'Resistencia aeróbica con mínimo gasto calórico',
      },
    ],
  },
  mesomorfo: {
    somatotipo: 'mesomorfo',
    titulo: 'Cardio equilibrado',
    razon: 'Composición corporal favorable — combina intensidades para maximizar resultados.',
    momento: 'despues',
    protocolos: [
      {
        tipo: 'moderado',
        duracion: 25,
        descripcion: 'Cardio moderado 25 min',
        beneficio: 'Quema grasa manteniendo masa muscular',
      },
      {
        tipo: 'hiit',
        duracion: 20,
        descripcion: 'HIIT 20 min',
        beneficio: 'EPOC elevado — sigue quemando calorías post-entreno',
        trabajoSeg: 40,
        descansoSeg: 20,
        rondas: 10,
      },
    ],
  },
  endomorfo: {
    somatotipo: 'endomorfo',
    titulo: 'Cardio intenso',
    razon: 'Metabolismo más lento — el cardio frecuente acelera la pérdida de grasa.',
    momento: 'antes',
    protocolos: [
      {
        tipo: 'hiit',
        duracion: 20,
        descripcion: 'HIIT 20 min',
        beneficio: 'Máxima quema calórica en poco tiempo',
        trabajoSeg: 30,
        descansoSeg: 15,
        rondas: 16,
      },
      {
        tipo: 'liss',
        duracion: 35,
        descripcion: 'LISS 35 min',
        beneficio: 'Oxidación de grasas en zona aeróbica',
      },
    ],
  },
};

export const CARDIO_EQUIPO_LABELS: Record<CardioEquipo, string> = {
  cinta: 'Cinta',
  bici: 'Bicicleta',
  eliptica: 'Elíptica',
  remo: 'Remo',
  sin_equipo: 'Sin equipo',
};

export const CARDIO_TIPO_LABELS: Record<CardioTipo, string> = {
  hiit: 'HIIT',
  liss: 'LISS',
  moderado: 'Moderado',
};
