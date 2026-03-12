/**
 * Script para sincronizar videos de BlueGym Animation
 * 
 * Este script:
 * 1. Obtiene la lista de videos del canal de YouTube de BlueGym Animation
 * 2. Los compara con los videos ya existentes en exerciseVideos.ts
 * 3. Usa IA para clasificar los videos nuevos por categoría y ejercicios relacionados
 * 4. Actualiza el archivo exerciseVideos.ts con los nuevos videos
 * 
 * Requisitos:
 * - YOUTUBE_API_KEY: API Key de YouTube Data API v3
 * - GROQ_API_KEY: Para clasificar videos con IA (opcional, usa heurísticas si no está)
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Crear __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
// Se detectará automáticamente mediante la API de YouTube

// Mapeo de palabras clave a categorías
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    pecho: ['pecho', 'press de banca', 'bench press', 'aperturas', 'push', 'empuje', 'pectoral'],
    espalda: ['espalda', 'dorsal', 'dominadas', 'remo', 'jalon', 'pulldown', 'pull', 'back'],
    piernas: ['pierna', 'sentadilla', 'squat', 'prensa', 'cuadriceps', 'femoral', 'gluteo', 'hip thrust'],
    hombros: ['hombro', 'deltoides', 'press militar', 'elevaciones laterales', 'shoulder'],
    brazos: ['biceps', 'triceps', 'curl', 'brazo', 'arm', 'antebrazo'],
    core: ['core', 'abdominales', 'abs', 'plancha', 'oblicuos'],
    general: ['rutina', 'principiante', 'intermedio', 'avanzado', 'lesion', 'tecnica'],
    nutricion: ['nutricion', 'dieta', 'grasa', 'proteina', 'calorias', 'deficit', 'superavit'],
};

// Mapeo de palabras clave a ejercicios relacionados
const EXERCISE_KEYWORDS: Record<string, string[]> = {
    'press-banca-barra': ['press de banca', 'bench press'],
    'press-banca-mancuernas': ['press mancuernas', 'press con mancuernas'],
    'dominadas-pronas': ['dominadas', 'pull-up', 'pullup'],
    'peso-muerto-convencional': ['peso muerto', 'deadlift'],
    'sentadilla-barra': ['sentadilla', 'squat'],
    'curl-barra-z': ['curl barra', 'curl de biceps', 'curl biceps'],
    'press-militar': ['press militar', 'overhead press', 'press hombro'],
    'hip-thrust': ['hip thrust', 'gluteo', 'glúteo'],
    'remo-barra': ['remo', 'row'],
    'press-piernas': ['prensa', 'leg press', 'press pierna'],
};

interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
}

interface ExerciseVideo {
    id: string;
    title: string;
    youtubeId: string;
    url: string;
    category: string;
    relatedExercises: string[];
}

// Obtener videos del canal de BlueGym Animation
async function getBlueGymVideos(): Promise<YouTubeVideo[]> {
    if (!YOUTUBE_API_KEY) {
        console.error('❌ YOUTUBE_API_KEY no configurada');
        console.log('   Configura YOUTUBE_API_KEY o VITE_YOUTUBE_API_KEY en tu .env');
        console.log('   Obtén una API key en: https://console.cloud.google.com/apis/credentials');
        return [];
    }

    try {
        // Primero, buscar el canal por nombre para obtener el ID
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=BlueGym+Animation&type=channel&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.error) {
            console.error('❌ Error de YouTube API:', searchData.error.message);
            return [];
        }

        const channelId = searchData.items?.[0]?.id?.channelId;
        if (!channelId) {
            console.error('❌ No se encontró el canal BlueGym Animation');
            return [];
        }

        console.log(`✅ Canal encontrado: ${channelId}`);

        // Obtener videos del canal
        const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&key=${YOUTUBE_API_KEY}`;
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();

        if (videosData.error) {
            console.error('❌ Error obteniendo videos:', videosData.error.message);
            return [];
        }

        const videos: YouTubeVideo[] = videosData.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        })) || [];

        console.log(`📺 ${videos.length} videos encontrados en el canal`);
        return videos;
    } catch (error) {
        console.error('❌ Error conectando con YouTube API:', error);
        return [];
    }
}

// Clasificar video por categoría usando heurísticas
function classifyVideoCategory(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }

    return 'general';
}

// Encontrar ejercicios relacionados usando heurísticas
function findRelatedExercises(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const related: string[] = [];

    for (const [exerciseId, keywords] of Object.entries(EXERCISE_KEYWORDS)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                related.push(exerciseId);
                break;
            }
        }
    }

    return related;
}

// Crear ID único para el video
function createVideoId(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
}

// Leer videos existentes
function getExistingVideos(): ExerciseVideo[] {
    const filePath = path.join(__dirname, '..', 'src', 'data', 'exerciseVideos.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extraer los youtubeIds existentes
    const youtubeIdMatches = content.match(/youtubeId:\s*getYouTubeId\(['"]([^'"]+)['"]\)/g);
    const existingIds: string[] = [];

    youtubeIdMatches?.forEach(match => {
        const urlMatch = match.match(/['"]([^'"]+)['"]/);
        if (urlMatch) {
            const id = extractYouTubeId(urlMatch[1]);
            if (id) existingIds.push(id);
        }
    });

    return existingIds.map(id => ({ youtubeId: id } as ExerciseVideo));
}

function extractYouTubeId(url: string): string {
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];

    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];

    return '';
}

// Generar nuevo contenido para exerciseVideos.ts
function generateNewVideoEntry(video: YouTubeVideo): string {
    const category = classifyVideoCategory(video.title, video.description);
    const relatedExercises = findRelatedExercises(video.title, video.description);
    const videoId = createVideoId(video.title);

    return `  {
    id: '${videoId}',
    title: '${video.title.replace(/'/g, "\\'")}',
    youtubeId: getYouTubeId('https://www.youtube.com/watch?v=${video.id}'),
    url: 'https://www.youtube.com/watch?v=${video.id}',
    category: '${category}',
    relatedExercises: [${relatedExercises.map(e => `'${e}'`).join(', ')}],
  },`;
}

// Actualizar archivo exerciseVideos.ts
function updateExerciseVideosFile(newVideos: YouTubeVideo[]): void {
    const filePath = path.join(__dirname, '..', 'src', 'data', 'exerciseVideos.ts');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Encontrar el cierre del array y añadir los nuevos videos antes
    const insertPosition = content.lastIndexOf('];');

    if (insertPosition === -1) {
        console.error('❌ No se encontró el array en exerciseVideos.ts');
        return;
    }

    const newEntries = newVideos.map(v => generateNewVideoEntry(v)).join('\n');

    content = content.slice(0, insertPosition) + newEntries + '\n' + content.slice(insertPosition);

    fs.writeFileSync(filePath, content);
    console.log(`✅ Archivo actualizado con ${newVideos.length} nuevos videos`);
}

// Función principal
async function syncBlueGymVideos() {
    console.log('🔄 Sincronizando videos de BlueGym Animation...\n');

    // 1. Obtener videos del canal
    const channelVideos = await getBlueGymVideos();
    if (channelVideos.length === 0) {
        console.log('⚠️ No se pudieron obtener videos del canal');
        return;
    }

    // 2. Obtener videos existentes
    const existingVideos = getExistingVideos();
    const existingIds = new Set(existingVideos.map(v => v.youtubeId));

    console.log(`📚 Videos existentes en la app: ${existingIds.size}`);

    // 3. Encontrar videos nuevos
    const newVideos = channelVideos.filter(v => !existingIds.has(v.id));

    if (newVideos.length === 0) {
        console.log('✅ No hay videos nuevos para añadir');
        return;
    }

    console.log(`\n🆕 Videos nuevos encontrados: ${newVideos.length}`);
    newVideos.forEach(v => {
        const category = classifyVideoCategory(v.title, v.description);
        console.log(`   - [${category}] ${v.title}`);
    });

    // 4. Actualizar archivo
    updateExerciseVideosFile(newVideos);

    // 5. Actualizar la lista de videos analizados
    const mdPath = path.join(__dirname, '..', 'archivos', 'Lista de Videos Analizados de BlueGym Animation.md');
    let mdContent = fs.readFileSync(mdPath, 'utf-8');

    const newMdEntries = newVideos.map(v => {
        const category = classifyVideoCategory(v.title, v.description);
        return `| ${v.title} | ${category} | [Ver Video](https://www.youtube.com/watch?v=${v.id}) |`;
    }).join('\n');

    mdContent += '\n' + newMdEntries + '\n';
    fs.writeFileSync(mdPath, mdContent);

    console.log('\n🎉 Sincronización completada!');
    console.log(`   Videos añadidos: ${newVideos.length}`);
}

// Ejecutar
syncBlueGymVideos();
