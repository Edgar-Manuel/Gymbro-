/**
 * Mapeo de videos de BlueGym Animation con ejercicios
 * Videos educativos del canal oficial
 */

export interface ExerciseVideo {
  id: string;
  title: string;
  youtubeId: string; // ID del video de YouTube
  url: string;
  category: string;
  relatedExercises: string[]; // IDs de ejercicios relacionados
}

// Extraer ID de YouTube desde URL (soporta youtube.com y youtu.be)
const getYouTubeId = (url: string): string => {
  // Primero intenta el formato youtube.com/watch?v=
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];

  // Luego intenta el formato youtu.be/
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];

  return '';
};

export const exerciseVideos: ExerciseVideo[] = [
  {
    id: 'rutina-mancuernas-completa',
    title: 'TODO solo con mancuernas (Rutina completa + explicación)',
    youtubeId: getYouTubeId('https://youtu.be/kIaSk_4znvk'),
    url: 'https://youtu.be/kIaSk_4znvk',
    category: 'general',
    relatedExercises: ['press-banca-mancuernas', 'press-inclinado-mancuernas', 'press-militar-mancuernas', 'remo-mancuerna', 'curl-mancuernas', 'elevaciones-laterales-mancuernas', 'sentadilla-mancuernas'],
  },
  {
    id: 'press-banca-perfecto',
    title: 'Cómo hacer el press de banca perfecto: técnica, postura y agarre',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=TAH8RxOS0VI'),
    url: 'https://www.youtube.com/watch?v=TAH8RxOS0VI',
    category: 'pecho',
    relatedExercises: ['press-banca-barra', 'press-banca-inclinado-barra'],
  },
  {
    id: 'press-banca-100kg',
    title: 'Cómo alcanzar los 100 kg en press de banca',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=1hgA5OBVwcQ'),
    url: 'https://www.youtube.com/watch?v=1hgA5OBVwcQ',
    category: 'pecho',
    relatedExercises: ['press-banca-barra'],
  },
  {
    id: 'rutina-pecho-mancuernas',
    title: 'Rutina de Pecho Efectiva con Solo 4 Ejercicios y Mancuernas',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=4VuCF75s6jE'),
    url: 'https://www.youtube.com/watch?v=4VuCF75s6jE',
    category: 'pecho',
    relatedExercises: ['press-banca-mancuernas', 'aperturas-mancuernas', 'press-inclinado-mancuernas'],
  },
  {
    id: 'proteger-manguito-rotador',
    title: 'Cómo proteger tu hombro y manguito rotador en días de pecho',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=AhuhoGgZ9I4'),
    url: 'https://www.youtube.com/watch?v=AhuhoGgZ9I4',
    category: 'pecho',
    relatedExercises: ['press-banca-barra', 'press-militar-barra', 'fondos-paralelas'],
  },
  {
    id: 'duplicar-dominadas',
    title: 'Cómo duplicar tus dominadas: el método eficiente',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=GScM1sXnbjI'),
    url: 'https://www.youtube.com/watch?v=GScM1sXnbjI',
    category: 'espalda',
    relatedExercises: ['dominadas-pronas', 'dominadas-supinas'],
  },
  {
    id: 'ejercicios-espalda-fuerte',
    title: 'Los Mejores Ejercicios para una Espalda Fuerte',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=CO5qxkz-KkY'),
    url: 'https://www.youtube.com/watch?v=CO5qxkz-KkY',
    category: 'espalda',
    relatedExercises: ['dominadas-pronas', 'remo-barra', 'remo-mancuerna'],
  },
  {
    id: 'jalon-pecho-dorsales',
    title: 'Cómo hacer el jalón al pecho correctamente para dorsales',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=yWxms_0WDPg'),
    url: 'https://www.youtube.com/watch?v=yWxms_0WDPg',
    category: 'espalda',
    relatedExercises: ['jalon-pecho-agarre-amplio', 'jalon-pecho-agarre-cerrado'],
  },
  {
    id: 'dominadas-principiantes',
    title: 'Cómo empezar a hacer dominadas en casa: guía para principiantes',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=npyLB-7o19o'),
    url: 'https://www.youtube.com/watch?v=npyLB-7o19o',
    category: 'espalda',
    relatedExercises: ['dominadas-pronas', 'dominadas-supinas'],
  },
  {
    id: 'entrenar-biceps',
    title: 'Cómo entrenar bíceps eficazmente: cabeza larga, corta y braquial',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=-QnKDiHhSro'),
    url: 'https://www.youtube.com/watch?v=-QnKDiHhSro',
    category: 'brazos',
    relatedExercises: ['curl-barra-z', 'curl-mancuernas', 'curl-martillo', 'curl-predicador'],
  },
  {
    id: 'curl-biceps-diferencias',
    title: 'Curl de Bíceps: Diferencias entre Barra Recta, Barra Z y Mancuernas',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=M67E8xSxrsA'),
    url: 'https://www.youtube.com/watch?v=M67E8xSxrsA',
    category: 'brazos',
    relatedExercises: ['curl-barra-z', 'curl-mancuernas'],
  },
  {
    id: 'triceps-polea',
    title: 'Cómo entrenar los tríceps en polea: Extensiones hacia arriba y abajo',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=xfS2-dkcC1k'),
    url: 'https://www.youtube.com/watch?v=xfS2-dkcC1k',
    category: 'brazos',
    relatedExercises: ['extension-triceps-polea', 'extension-triceps-cuerda'],
  },
  {
    id: 'entrenar-antebrazos',
    title: 'Cómo entrenar tus antebrazos: teoría y práctica',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=npCJatMfYKg'),
    url: 'https://www.youtube.com/watch?v=npCJatMfYKg',
    category: 'brazos',
    relatedExercises: ['curl-muneca-barra'],
  },
  {
    id: 'fortalecer-hombros',
    title: '3 Ejercicios Clave con Mancuernas para Fortalecer Hombros',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=4JY1-jVNRqc'),
    url: 'https://www.youtube.com/watch?v=4JY1-jVNRqc',
    category: 'hombros',
    relatedExercises: ['press-militar-mancuernas', 'elevaciones-laterales-mancuernas', 'elevaciones-frontales-mancuernas'],
  },
  {
    id: 'rutina-piernas-hipertrofia',
    title: 'Rutina Completa de Piernas para Hipertrofia',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=IIBeY0IyyCU'),
    url: 'https://www.youtube.com/watch?v=IIBeY0IyyCU',
    category: 'piernas',
    relatedExercises: ['sentadilla-barra', 'press-piernas', 'curl-femoral', 'extension-cuadriceps'],
  },
  {
    id: 'press-pierna-tecnica',
    title: 'Rutina y técnica correcta para press de pierna en la prensa',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=bNsrqXUIJqc'),
    url: 'https://www.youtube.com/watch?v=bNsrqXUIJqc',
    category: 'piernas',
    relatedExercises: ['press-piernas'],
  },
  {
    id: 'core-abdominales',
    title: 'Por qué no necesitas una rutina de abdominales para tener sixpack',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=EPbumTj3agk'),
    url: 'https://www.youtube.com/watch?v=EPbumTj3agk',
    category: 'core',
    relatedExercises: ['plancha-frontal', 'plancha-lateral', 'elevacion-piernas-colgado'],
  },
  {
    id: 'errores-comunes-tecnica',
    title: 'Errores comunes y patrones clave para mejorar la técnica',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=YSIMV2ZmZCw'),
    url: 'https://www.youtube.com/watch?v=YSIMV2ZmZCw',
    category: 'general',
    relatedExercises: [], // Aplica a todos
  },
  {
    id: 'perder-grasa',
    title: 'Cómo Perder Grasa: La Guía Simple y Realista',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=DHqnLf6R1dk'),
    url: 'https://www.youtube.com/watch?v=DHqnLf6R1dk',
    category: 'nutricion',
    relatedExercises: [],
  },
];

// Helper functions
export const getVideosByExercise = (exerciseId: string): ExerciseVideo[] => {
  return exerciseVideos.filter(video =>
    video.relatedExercises.includes(exerciseId)
  );
};

export const getVideosByCategory = (category: string): ExerciseVideo[] => {
  return exerciseVideos.filter(video => video.category === category);
};

export const getVideoById = (videoId: string): ExerciseVideo | undefined => {
  return exerciseVideos.find(video => video.id === videoId);
};
