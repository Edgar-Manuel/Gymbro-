# Sistema de Sincronización de Videos de BlueGym Animation

Este sistema permite sincronizar automáticamente los videos del canal de YouTube [BlueGym Animation](https://www.youtube.com/@bluegymanimation) con la aplicación GymBro.

## 🎯 Funcionalidades

1. **Sincronización automática cada lunes** vía GitHub Actions
2. **Clasificación automática** de videos por categoría (pecho, espalda, brazos, etc.)
3. **Mapeo automático** a ejercicios relacionados en la app
4. **Commits automáticos** cuando hay videos nuevos

## 🔧 Configuración

### Paso 1: Obtener YouTube API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **APIs & Services** → **Enable APIs and Services**
4. Busca y habilita **YouTube Data API v3**
5. Ve a **APIs & Services** → **Credentials**
6. Crea una **API Key**
7. (Opcional) Restringe la API Key solo a YouTube Data API

### Paso 2: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Añade los siguientes secrets:

| Secret Name | Descripción |
|-------------|-------------|
| `YOUTUBE_API_KEY` | Tu API Key de YouTube Data API v3 |
| `GROQ_API_KEY` | (Opcional) Para clasificación con IA |

### Paso 3: Probar el Script Localmente

```bash
# Añadir a tu .env
YOUTUBE_API_KEY=tu_api_key_aqui

# Ejecutar el script
npx tsx scripts/sync-bluegym-videos.ts
```

## 📂 Archivos del Sistema

- `scripts/sync-bluegym-videos.ts` - Script principal de sincronización
- `.github/workflows/sync-bluegym-videos.yml` - GitHub Action (cada lunes)
- `src/data/exerciseVideos.ts` - Base de datos de videos
- `archivos/Lista de Videos Analizados de BlueGym Animation.md` - Lista de referencia

## ⚙️ Cómo Funciona

1. **Obtención de videos**: Usa YouTube Data API para listar videos del canal
2. **Detección de nuevos**: Compara con los videos existentes en `exerciseVideos.ts`
3. **Clasificación**: Usa heurísticas de palabras clave para categorizar
4. **Mapeo de ejercicios**: Relaciona cada video con ejercicios de la app
5. **Actualización**: Modifica `exerciseVideos.ts` y hace commit

## 🏷️ Categorías Soportadas

| Categoría | Palabras Clave |
|-----------|---------------|
| `pecho` | pecho, press de banca, aperturas, push |
| `espalda` | espalda, dorsal, dominadas, remo, jalon |
| `piernas` | pierna, sentadilla, prensa, glúteo |
| `hombros` | hombro, deltoides, press militar |
| `brazos` | bíceps, tríceps, curl, antebrazo |
| `core` | core, abdominales, plancha |
| `general` | rutina, técnica, principiante |
| `nutricion` | dieta, grasa, proteína, calorías |

## 🔄 Ejecución Manual

Puedes ejecutar el workflow manualmente desde GitHub:

1. Ve a **Actions** → **Sync BlueGym Videos**
2. Click en **Run workflow**
3. Espera a que termine y revisa los cambios

## 📝 Añadir Videos Manualmente

Si quieres añadir un video manualmente, edita `src/data/exerciseVideos.ts`:

```typescript
{
  id: 'nombre-descriptivo-del-video',
  title: 'Título del Video',
  youtubeId: getYouTubeId('https://www.youtube.com/watch?v=VIDEO_ID'),
  url: 'https://www.youtube.com/watch?v=VIDEO_ID',
  category: 'pecho', // o espalda, piernas, etc.
  relatedExercises: ['press-banca-barra', 'otro-ejercicio'],
},
```

## 🐛 Solución de Problemas

### Error: "YOUTUBE_API_KEY no configurada"
- Verifica que el secret está configurado en GitHub
- Para pruebas locales, añádelo a tu `.env`

### Error: "Quota exceeded"
- YouTube API tiene límites diarios (10,000 unidades)
- Cada búsqueda usa ~100 unidades
- Espera hasta el día siguiente o solicita más cuota

### Los videos no se clasifican correctamente
- Revisa las palabras clave en `CATEGORY_KEYWORDS`
- Añade nuevas palabras clave según sea necesario
