/**
 * Mapeo de videos de BlueGym Animation con ejercicios
 * Videos educativos del canal oficial
 * 
 * Total: 28 videos (actualizado enero 2026)
 * Canal: https://www.youtube.com/@bluegymanimation
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
  // === VIDEOS 2026 (Más recientes) ===
  {
    id: 'agarre-ejercicios-necesarios',
    title: 'Tu agarre necesita estos ejercicios',
    youtubeId: getYouTubeId('https://youtu.be/1k6wAMKcQek'),
    url: 'https://youtu.be/1k6wAMKcQek',
    category: 'brazos',
    relatedExercises: ['peso-muerto-convencional', 'dominadas-pronas', 'curl-muneca-barra', 'remo-barra'],
  },
  {
    id: 'hombros-crecimiento',
    title: 'Así crecen tus Hombros',
    youtubeId: getYouTubeId('https://youtu.be/ZI2YJqLHAfI'),
    url: 'https://youtu.be/ZI2YJqLHAfI',
    category: 'hombros',
    relatedExercises: ['press-militar-mancuernas', 'elevaciones-laterales-mancuernas', 'press-militar-barra', 'face-pull'],
  },
  {
    id: 'abdomen-mejores-ejercicios',
    title: 'Los 4 MEJORES ejercicios para tu ABDOMEN',
    youtubeId: getYouTubeId('https://youtu.be/irNCQSudRwM'),
    url: 'https://youtu.be/irNCQSudRwM',
    category: 'core',
    relatedExercises: ['plancha-frontal', 'plancha-lateral', 'elevacion-piernas-colgado', 'crunch-cable'],
  },
  {
    id: 'empezar-entrenar-bien',
    title: 'Cómo empezar a entrenar BIEN (Lo que has saber + Rutina Completa)',
    youtubeId: getYouTubeId('https://youtu.be/GgRayaEGHL0'),
    url: 'https://youtu.be/GgRayaEGHL0',
    category: 'general',
    relatedExercises: ['press-banca-barra', 'sentadilla-barra', 'dominadas-pronas', 'remo-barra'],
  },
  {
    id: 'pecho-crecimiento',
    title: 'Así crece tu Pecho',
    youtubeId: getYouTubeId('https://youtu.be/qF1iK-mpuPY'),
    url: 'https://youtu.be/qF1iK-mpuPY',
    category: 'pecho',
    relatedExercises: ['press-banca-barra', 'press-banca-mancuernas', 'aperturas-mancuernas', 'press-inclinado-mancuernas'],
  },
  // === VIDEOS 2025 ===
  {
    id: 'principiante-a-intermedio',
    title: 'Pasar de principiante a intermedio',
    youtubeId: getYouTubeId('https://youtu.be/u1H0CEYxo74'),
    url: 'https://youtu.be/u1H0CEYxo74',
    category: 'general',
    relatedExercises: ['press-banca-barra', 'sentadilla-barra', 'peso-muerto-convencional', 'dominadas', 'press-militar'],
  },
  {
    id: 'dorsales-crecimiento',
    title: 'Así crecen tus Dorsales',
    youtubeId: getYouTubeId('https://youtu.be/QucbwJWZtiE'),
    url: 'https://youtu.be/QucbwJWZtiE',
    category: 'espalda',
    relatedExercises: ['lat-pulldown', 'dominadas', 'chin-ups', 'remo-barra', 'remo-mancuerna-unilateral', 'pullover-mancuerna'],
  },
  {
    id: 'ejercicios-gluteo',
    title: 'Los MEJORES ejercicios de GLÚTEO',
    youtubeId: getYouTubeId('https://youtu.be/ziimTMMKZxk'),
    url: 'https://youtu.be/ziimTMMKZxk',
    category: 'piernas',
    relatedExercises: ['hip-thrust', 'sentadilla-barra', 'peso-muerto-rumano', 'zancadas', 'prensa-pierna'],
  },
  {
    id: 'evitar-lesiones-rendimiento',
    title: 'Cómo evitar lesiones y mejorar rendimiento',
    youtubeId: getYouTubeId('https://youtu.be/NAPI0odb9HQ'),
    url: 'https://youtu.be/NAPI0odb9HQ',
    category: 'general',
    relatedExercises: ['press-banca-barra', 'sentadilla-barra', 'peso-muerto-convencional', 'peso-muerto-rumano', 'press-militar'],
  },
  {
    id: 'rutina-mancuernas-completa',
    title: 'TODO solo con mancuernas (Rutina completa + explicación)',
    youtubeId: getYouTubeId('https://youtu.be/kIaSk_4znvk'),
    url: 'https://youtu.be/kIaSk_4znvk',
    category: 'general',
    relatedExercises: ['press-banca-mancuernas', 'press-inclinado-mancuernas', 'press-militar-mancuernas', 'remo-mancuerna', 'curl-mancuernas', 'elevaciones-laterales-mancuernas', 'sentadilla-mancuernas'],
  },
  {
    id: 'perder-grasa',
    title: 'Perder grasa es simple (de verdad)',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=DHqnLf6R1dk'),
    url: 'https://www.youtube.com/watch?v=DHqnLf6R1dk',
    category: 'nutricion',
    relatedExercises: [],
  },
  {
    id: 'aumentar-dominadas',
    title: 'Aumenta tu número de dominadas',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=GScM1sXnbjI'),
    url: 'https://www.youtube.com/watch?v=GScM1sXnbjI',
    category: 'espalda',
    relatedExercises: ['dominadas-pronas', 'dominadas-supinas'],
  },
  {
    id: 'biceps-mejores-ejercicios',
    title: 'Los MEJORES ejercicios de BÍCEPS',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=-QnKDiHhSro'),
    url: 'https://www.youtube.com/watch?v=-QnKDiHhSro',
    category: 'brazos',
    relatedExercises: ['curl-barra-z', 'curl-mancuernas', 'curl-martillo', 'curl-predicador'],
  },
  {
    id: 'errores-comunes-gym',
    title: 'Errores comunes en el GYM',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=YSIMV2ZmZCw'),
    url: 'https://www.youtube.com/watch?v=YSIMV2ZmZCw',
    category: 'general',
    relatedExercises: [],
  },
  {
    id: 'crear-tu-rutina',
    title: 'Cómo crear tu rutina',
    youtubeId: getYouTubeId('https://youtu.be/dmX0l1TprQg'),
    url: 'https://youtu.be/dmX0l1TprQg',
    category: 'general',
    relatedExercises: ['press-banca-barra', 'sentadilla-barra', 'peso-muerto-convencional', 'dominadas', 'press-militar'],
  },
  {
    id: 'antebrazo-crecimiento',
    title: 'Así crece tu antebrazo',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=npCJatMfYKg'),
    url: 'https://www.youtube.com/watch?v=npCJatMfYKg',
    category: 'brazos',
    relatedExercises: ['curl-muneca-barra'],
  },
  {
    id: 'espalda-mejores-ejercicios',
    title: 'Los 4 MEJORES ejercicios de ESPALDA',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=CO5qxkz-KkY'),
    url: 'https://www.youtube.com/watch?v=CO5qxkz-KkY',
    category: 'espalda',
    relatedExercises: ['dominadas-pronas', 'remo-barra', 'remo-mancuerna', 'lat-pulldown'],
  },
  {
    id: 'core-no-abdominales',
    title: 'No hagas abdominales, haz CORE',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=EPbumTj3agk'),
    url: 'https://www.youtube.com/watch?v=EPbumTj3agk',
    category: 'core',
    relatedExercises: ['plancha-frontal', 'plancha-lateral', 'elevacion-piernas-colgado'],
  },
  {
    id: 'press-banca-100kg',
    title: 'Cómo levantar 100KG en press banca',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=1hgA5OBVwcQ'),
    url: 'https://www.youtube.com/watch?v=1hgA5OBVwcQ',
    category: 'pecho',
    relatedExercises: ['press-banca-barra'],
  },
  {
    id: 'hombros-ejercicios-necesarios',
    title: 'Tus hombros necesitan estos ejercicios',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=4JY1-jVNRqc'),
    url: 'https://www.youtube.com/watch?v=4JY1-jVNRqc',
    category: 'hombros',
    relatedExercises: ['press-militar-mancuernas', 'elevaciones-laterales-mancuernas', 'elevaciones-frontales-mancuernas'],
  },
  {
    id: 'pierna-tierlist',
    title: 'Tierlist de PIERNA para CASA y GYM',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=IIBeY0IyyCU'),
    url: 'https://www.youtube.com/watch?v=IIBeY0IyyCU',
    category: 'piernas',
    relatedExercises: ['sentadilla-barra', 'press-piernas', 'curl-femoral', 'extension-cuadriceps'],
  },
  {
    id: 'desbloquear-dominadas',
    title: 'Desbloquea tus primeras DOMINADAS',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=npyLB-7o19o'),
    url: 'https://www.youtube.com/watch?v=npyLB-7o19o',
    category: 'espalda',
    relatedExercises: ['dominadas-pronas', 'dominadas-supinas'],
  },
  {
    id: 'prensa-pierna-todo',
    title: 'Todo sobre la PRENSA DE PIERNA',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=bNsrqXUIJqc'),
    url: 'https://www.youtube.com/watch?v=bNsrqXUIJqc',
    category: 'piernas',
    relatedExercises: ['press-piernas'],
  },
  {
    id: 'triceps-crecimiento',
    title: 'Haz crecer tu TRÍCEPS',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=xfS2-dkcC1k'),
    url: 'https://www.youtube.com/watch?v=xfS2-dkcC1k',
    category: 'brazos',
    relatedExercises: ['extension-triceps-polea', 'extension-triceps-cuerda', 'press-frances'],
  },
  {
    id: 'pecho-mejores-ejercicios',
    title: 'Los 4 MEJORES ejercicios de PECHO',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=4VuCF75s6jE'),
    url: 'https://www.youtube.com/watch?v=4VuCF75s6jE',
    category: 'pecho',
    relatedExercises: ['press-banca-mancuernas', 'aperturas-mancuernas', 'press-inclinado-mancuernas'],
  },
  {
    id: 'curl-biceps-diferencias',
    title: 'Barra VS Mancuerna en CURL DE BÍCEPS',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=M67E8xSxrsA'),
    url: 'https://www.youtube.com/watch?v=M67E8xSxrsA',
    category: 'brazos',
    relatedExercises: ['curl-barra-z', 'curl-mancuernas'],
  },
  {
    id: 'press-banca-perfecto',
    title: 'Cómo hacer PRESS DE BANCA perfecto',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=TAH8RxOS0VI'),
    url: 'https://www.youtube.com/watch?v=TAH8RxOS0VI',
    category: 'pecho',
    relatedExercises: ['press-banca-barra', 'press-banca-inclinado-barra'],
  },
  {
    id: 'evitar-dolor-hombros',
    title: 'Evitar el dolor de hombros',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=AhuhoGgZ9I4'),
    url: 'https://www.youtube.com/watch?v=AhuhoGgZ9I4',
    category: 'hombros',
    relatedExercises: ['press-banca-barra', 'press-militar-barra', 'fondos-paralelas'],
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

export const getAllVideos = (): ExerciseVideo[] => {
  return exerciseVideos;
};

export const getVideoCount = (): number => {
  return exerciseVideos.length;
};
