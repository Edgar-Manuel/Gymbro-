import type { GrupoMuscular, LesionZona } from '@/types';

export const LESION_ZONA_LABELS: Record<LesionZona, string> = {
  hombro_derecho: 'Hombro Derecho',
  hombro_izquierdo: 'Hombro Izquierdo',
  rodilla_derecha: 'Rodilla Derecha',
  rodilla_izquierda: 'Rodilla Izquierda',
  muneca_derecha: 'Muñeca Derecha',
  muneca_izquierda: 'Muñeca Izquierda',
  codo_derecho: 'Codo Derecho',
  codo_izquierdo: 'Codo Izquierdo',
  lumbar: 'Zona Lumbar',
  cervical: 'Zona Cervical',
  tobillo_derecho: 'Tobillo Derecho',
  tobillo_izquierdo: 'Tobillo Izquierdo',
  cadera: 'Cadera',
};

export const INJURY_AFFECTS: Record<LesionZona, GrupoMuscular[]> = {
  hombro_derecho:   ['hombros', 'pecho', 'triceps'],
  hombro_izquierdo: ['hombros', 'pecho', 'triceps'],
  rodilla_derecha:  ['piernas', 'femorales_gluteos'],
  rodilla_izquierda: ['piernas', 'femorales_gluteos'],
  muneca_derecha:   ['biceps', 'triceps', 'antebrazos'],
  muneca_izquierda: ['biceps', 'triceps', 'antebrazos'],
  codo_derecho:     ['biceps', 'triceps', 'antebrazos'],
  codo_izquierdo:   ['biceps', 'triceps', 'antebrazos'],
  lumbar:           ['espalda', 'femorales_gluteos'],
  cervical:         ['hombros', 'espalda'],
  tobillo_derecho:  ['piernas'],
  tobillo_izquierdo: ['piernas'],
  cadera:           ['piernas', 'femorales_gluteos'],
};

export interface RehabExercise {
  nombre: string;
  musculo: string;
  series: number;
  reps: string;
  notas: string;
}

export const REHAB_EXERCISES: Record<LesionZona, RehabExercise[]> = {
  hombro_derecho: [
    { nombre: 'Rotación Externa con Goma', musculo: 'Manguito rotador', series: 3, reps: '15-20', notas: 'Codo pegado al costado. Movimiento lento y controlado. Detente si hay dolor.' },
    { nombre: 'Face Pull con Polea', musculo: 'Deltoides posterior', series: 3, reps: '15-20', notas: 'Peso muy ligero. Enfócate en la contracción y en abrir los codos hacia atrás.' },
    { nombre: 'Rotación Interna con Goma', musculo: 'Subescapular', series: 3, reps: '15', notas: 'Completa el trabajo del manguito. Movimiento suave.' },
  ],
  hombro_izquierdo: [
    { nombre: 'Rotación Externa con Goma', musculo: 'Manguito rotador', series: 3, reps: '15-20', notas: 'Codo pegado al costado. Movimiento lento y controlado. Detente si hay dolor.' },
    { nombre: 'Face Pull con Polea', musculo: 'Deltoides posterior', series: 3, reps: '15-20', notas: 'Peso muy ligero. Enfócate en la contracción y en abrir los codos hacia atrás.' },
    { nombre: 'Rotación Interna con Goma', musculo: 'Subescapular', series: 3, reps: '15', notas: 'Completa el trabajo del manguito. Movimiento suave.' },
  ],
  rodilla_derecha: [
    { nombre: 'Extensión de Cuádriceps (rango parcial)', musculo: 'Cuádriceps', series: 3, reps: '15-20', notas: '0–60° únicamente. Detente si hay dolor. Muy efectivo para rehabilitación.' },
    { nombre: 'Isométrico de Cuádriceps', musculo: 'Cuádriceps', series: 3, reps: '10×10 seg', notas: 'Contrae el cuádriceps sin mover la rodilla. Sin carga articular.' },
    { nombre: 'Elevaciones de pierna recta', musculo: 'Cuádriceps / cadera', series: 3, reps: '15', notas: 'Tumbado, pierna estirada. Activa cuádriceps sin impacto en la rodilla.' },
  ],
  rodilla_izquierda: [
    { nombre: 'Extensión de Cuádriceps (rango parcial)', musculo: 'Cuádriceps', series: 3, reps: '15-20', notas: '0–60° únicamente. Detente si hay dolor. Muy efectivo para rehabilitación.' },
    { nombre: 'Isométrico de Cuádriceps', musculo: 'Cuádriceps', series: 3, reps: '10×10 seg', notas: 'Contrae el cuádriceps sin mover la rodilla. Sin carga articular.' },
    { nombre: 'Elevaciones de pierna recta', musculo: 'Cuádriceps / cadera', series: 3, reps: '15', notas: 'Tumbado, pierna estirada. Activa cuádriceps sin impacto en la rodilla.' },
  ],
  muneca_derecha: [
    { nombre: 'Flexiones de Muñeca con Barra Ligera', musculo: 'Flexores muñeca', series: 3, reps: '20', notas: 'Rango completo solo si no hay dolor. Peso mínimo, movimiento controlado.' },
    { nombre: 'Extensiones de Muñeca', musculo: 'Extensores muñeca', series: 3, reps: '20', notas: 'Movimiento lento y controlado. Complementa las flexiones.' },
    { nombre: 'Supinación/Pronación con Mancuerna', musculo: 'Antebrazo', series: 2, reps: '15', notas: 'Mancuerna muy ligera o sin peso. Mejora la movilidad.' },
  ],
  muneca_izquierda: [
    { nombre: 'Flexiones de Muñeca con Barra Ligera', musculo: 'Flexores muñeca', series: 3, reps: '20', notas: 'Rango completo solo si no hay dolor. Peso mínimo, movimiento controlado.' },
    { nombre: 'Extensiones de Muñeca', musculo: 'Extensores muñeca', series: 3, reps: '20', notas: 'Movimiento lento y controlado. Complementa las flexiones.' },
    { nombre: 'Supinación/Pronación con Mancuerna', musculo: 'Antebrazo', series: 2, reps: '15', notas: 'Mancuerna muy ligera o sin peso. Mejora la movilidad.' },
  ],
  codo_derecho: [
    { nombre: 'Curl Martillo Ligero', musculo: 'Braquial / bíceps', series: 3, reps: '15-20', notas: 'Sin supinación forzada. Peso ligero, movimiento limpio.' },
    { nombre: 'Extensión de Tríceps en Polea (soga)', musculo: 'Tríceps', series: 3, reps: '15-20', notas: 'Rango completo solo sin dolor. Carga mínima.' },
    { nombre: 'Estiramiento pasivo de antebrazo', musculo: 'Tendón epicóndilo', series: 3, reps: '30 seg', notas: 'Extiende el brazo y dobla la muñeca con la otra mano. Sin forzar.' },
  ],
  codo_izquierdo: [
    { nombre: 'Curl Martillo Ligero', musculo: 'Braquial / bíceps', series: 3, reps: '15-20', notas: 'Sin supinación forzada. Peso ligero, movimiento limpio.' },
    { nombre: 'Extensión de Tríceps en Polea (soga)', musculo: 'Tríceps', series: 3, reps: '15-20', notas: 'Rango completo solo sin dolor. Carga mínima.' },
    { nombre: 'Estiramiento pasivo de antebrazo', musculo: 'Tendón epicóndilo', series: 3, reps: '30 seg', notas: 'Extiende el brazo y dobla la muñeca con la otra mano. Sin forzar.' },
  ],
  lumbar: [
    { nombre: 'Bird-Dog', musculo: 'Core / multífidos', series: 3, reps: '10 c/lado', notas: 'Columna neutra. No arquees la espalda. Brazo y pierna contrarios al mismo tiempo.' },
    { nombre: 'Dead Bug', musculo: 'Core profundo / transverso', series: 3, reps: '8 c/lado', notas: 'Zona lumbar pegada al suelo en todo momento. Movimiento lento y controlado.' },
    { nombre: 'Puente de Glúteos', musculo: 'Glúteo / lumbar', series: 3, reps: '15-20', notas: 'Sin hiperextensión en la cima. Activa glúteos, no la lumbar.' },
  ],
  cervical: [
    { nombre: 'Isométrico Cervical (4 direcciones)', musculo: 'Músculos cervicales', series: 3, reps: '5×10 seg', notas: 'Empuja la mano con la cabeza sin movimiento visible. Muy suave al principio.' },
    { nombre: 'Retracción Cervical (doble mentón)', musculo: 'Flexores cervicales profundos', series: 3, reps: '15', notas: 'Mueve la cabeza hacia atrás sin inclinarla. Suave y controlado.' },
    { nombre: 'Movilidad Torácica con Foam Roller', musculo: 'Columna torácica', series: 2, reps: '60 seg', notas: 'Foam roller perpendicular a la columna, a la altura de las escápulas. No en lumbar.' },
  ],
  tobillo_derecho: [
    { nombre: 'Elevación de Pantorrilla Sentado', musculo: 'Sóleo', series: 3, reps: '20', notas: 'Rango controlado, sin rebote. Fortalece sin estrés sobre el tobillo.' },
    { nombre: 'Alfabeto con el pie', musculo: 'Tobillo (movilidad)', series: 2, reps: 'A–Z', notas: 'Dibuja el abecedario en el aire con el pie. Mejora la propiocepción.' },
    { nombre: 'Eversión/Inversión con goma', musculo: 'Peroneos / tibial', series: 3, reps: '15', notas: 'Goma de resistencia mínima. Sin dolor. Fundamental para estabilidad lateral.' },
  ],
  tobillo_izquierdo: [
    { nombre: 'Elevación de Pantorrilla Sentado', musculo: 'Sóleo', series: 3, reps: '20', notas: 'Rango controlado, sin rebote. Fortalece sin estrés sobre el tobillo.' },
    { nombre: 'Alfabeto con el pie', musculo: 'Tobillo (movilidad)', series: 2, reps: 'A–Z', notas: 'Dibuja el abecedario en el aire con el pie. Mejora la propiocepción.' },
    { nombre: 'Eversión/Inversión con goma', musculo: 'Peroneos / tibial', series: 3, reps: '15', notas: 'Goma de resistencia mínima. Sin dolor. Fundamental para estabilidad lateral.' },
  ],
  cadera: [
    { nombre: 'Abducción de Cadera con Goma', musculo: 'Glúteo medio', series: 3, reps: '15-20', notas: 'Goma sobre las rodillas. Movimiento controlado hacia fuera. Sin balanceo.' },
    { nombre: 'Puente de Glúteos Isométrico', musculo: 'Glúteo mayor', series: 3, reps: '10×10 seg', notas: 'Mantén la posición arriba sin dolor en cadera. Activa glúteo, no lumbar.' },
    { nombre: 'Círculos de cadera en cuadrupedia', musculo: 'Cápsula articular / glúteo', series: 2, reps: '10 c/lado', notas: 'Círculos lentos controlados. Mejora el rango articular sin impacto.' },
  ],
};
