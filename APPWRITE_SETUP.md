# Configuración de Appwrite Database para GymBro

Este documento explica cómo configurar la base de datos en Appwrite Console para que la aplicación funcione correctamente.

## Requisitos Previos

1. Cuenta en Appwrite Cloud (https://cloud.appwrite.io)
2. Proyecto de Appwrite creado
3. Variables de entorno configuradas:
   - `VITE_APPWRITE_ENDPOINT`
   - `VITE_APPWRITE_PROJECT_ID`

## Paso 1: Crear la Base de Datos

1. Ve a tu proyecto en Appwrite Console
2. En el menú lateral, selecciona **Databases**
3. Haz clic en **Create Database**
4. Configura:
   - **Database ID**: `gymbro-db`
   - **Name**: `GymBro Database`
5. Haz clic en **Create**

## Paso 2: Agregar Variable de Entorno

1. En Appwrite Console, ve a **Settings** → **Environment Variables**
2. Agrega la siguiente variable (tanto en local .env como en Appwrite Console):
   ```
   VITE_APPWRITE_DATABASE_ID=gymbro-db
   ```

## Paso 3: Crear las Colecciones

Para cada colección, sigue estos pasos:

### 3.1 Colección: Users

1. Dentro de la base de datos `gymbro-db`, haz clic en **Create Collection**
2. Configura:
   - **Collection ID**: `users`
   - **Name**: `Users`
3. Haz clic en **Create**
4. Ve a la pestaña **Attributes** y agrega los siguientes atributos:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| userId | string | 255 | ✓ | ✗ | - |
| nombre | string | 255 | ✓ | ✗ | - |
| email | string | 255 | ✓ | ✗ | - |
| edad | integer | - | ✓ | ✗ | - |
| peso | double | - | ✓ | ✗ | - |
| pesoActual | double | - | ✓ | ✗ | - |
| altura | integer | - | ✓ | ✗ | - |
| objetivo | string | 100 | ✓ | ✗ | - |
| nivel | string | 50 | ✓ | ✗ | - |
| diasDisponibles | integer | - | ✓ | ✗ | - |
| equipamiento | string | 5000 | ✓ | ✓ | - |
| preferencias | string | 10000 | ✗ | ✗ | - |
| restricciones | string | 10000 | ✗ | ✗ | - |

5. Ve a **Indexes** y crea:
   - Index Key: `userId_idx`, Type: `unique`, Attributes: `userId`
   - Index Key: `email_idx`, Type: `unique`, Attributes: `email`

6. Ve a **Settings** → **Permissions** y configura:
   - Read: `read("user:{userId}")`
   - Write: `write("user:{userId}")`

### 3.2 Colección: Exercises

1. **Collection ID**: `exercises`
2. **Name**: `Exercises`
3. **Attributes**:

| Key | Type | Size | Required | Array |
|-----|------|------|----------|-------|
| nombre | string | 255 | ✓ | ✗ |
| grupoMuscular | string | 100 | ✓ | ✗ |
| categoria | string | 100 | ✓ | ✗ |
| tier | string | 50 | ✓ | ✗ |
| descripcion | string | 2000 | ✓ | ✗ |
| instrucciones | string | 5000 | ✓ | ✓ |
| equipamiento | string | 1000 | ✓ | ✓ |
| dificultad | string | 50 | ✓ | ✗ |
| musculos | string | 10000 | ✓ | ✗ |
| advertencias | string | 5000 | ✗ | ✓ |
| videoUrl | string | 500 | ✗ | ✗ |
| tags | string | 2000 | ✗ | ✓ |

4. **Indexes**:
   - `grupoMuscular_idx` (key) → grupoMuscular
   - `tier_idx` (key) → tier
   - `categoria_idx` (key) → categoria

5. **Permissions**:
   - Read: `read("any")`
   - Write: `write("role:admin")`

### 3.3 Colección: Routines

1. **Collection ID**: `routines`
2. **Name**: `Routines`
3. **Attributes**:

| Key | Type | Size | Required | Default |
|-----|------|------|----------|---------|
| userId | string | 255 | ✓ | - |
| nombre | string | 255 | ✓ | - |
| objetivo | string | 100 | ✓ | - |
| nivel | string | 50 | ✓ | - |
| diasPorSemana | integer | - | ✓ | - |
| diasRutina | string | 50000 | ✓ | - |
| duracionTotal | integer | - | ✓ | - |
| activa | boolean | - | ✓ | false |
| fechaCreacion | datetime | - | ✓ | - |

4. **Indexes**:
   - `userId_idx` (key) → userId
   - `activa_idx` (key) → activa

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

### 3.4 Colección: Workouts

1. **Collection ID**: `workouts`
2. **Name**: `Workouts`
3. **Attributes**:

| Key | Type | Size | Required |
|-----|------|------|----------|
| userId | string | 255 | ✓ |
| rutinaId | string | 255 | ✗ |
| diaRutinaId | string | 255 | ✗ |
| fecha | datetime | - | ✓ |
| ejercicios | string | 50000 | ✓ |
| duracion | integer | - | ✓ |
| notas | string | 2000 | ✗ |
| completado | boolean | - | ✓ |
| volumenTotal | double | - | ✗ |
| caloriaQuemadas | integer | - | ✗ |

4. **Indexes**:
   - `userId_idx` (key) → userId
   - `fecha_idx` (key) → fecha
   - `completado_idx` (key) → completado

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

### 3.5 Colección: Achievements

1. **Collection ID**: `achievements`
2. **Name**: `Achievements`
3. **Attributes**:

| Key | Type | Size | Required |
|-----|------|------|----------|
| userId | string | 255 | ✓ |
| tipo | string | 100 | ✓ |
| nombre | string | 255 | ✓ |
| descripcion | string | 1000 | ✓ |
| icono | string | 100 | ✓ |
| fecha | datetime | - | ✓ |
| detalles | string | 5000 | ✗ |

4. **Indexes**:
   - `userId_idx` (key) → userId
   - `tipo_idx` (key) → tipo
   - `fecha_idx` (key) → fecha

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

### 3.6 Colección: Nutrition

1. **Collection ID**: `nutrition`
2. **Name**: `Nutrition`
3. **Attributes**:

| Key | Type | Size | Required | Default |
|-----|------|------|----------|---------|
| userId | string | 255 | ✓ | - |
| fecha | datetime | - | ✓ | - |
| calorias | integer | - | ✓ | - |
| proteinas | double | - | ✓ | - |
| carbohidratos | double | - | ✓ | - |
| grasas | double | - | ✓ | - |
| comidas | string | 50000 | ✓ | - |
| agua | integer | - | ✗ | 0 |

4. **Indexes**:
   - `userId_fecha_idx` (unique) → userId, fecha

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

### 3.7 Colección: Statistics

1. **Collection ID**: `statistics`
2. **Name**: `Statistics`
3. **Attributes**:

| Key | Type | Size | Required | Default |
|-----|------|------|----------|---------|
| userId | string | 255 | ✓ | - |
| totalWorkouts | integer | - | ✓ | 0 |
| currentStreak | integer | - | ✓ | 0 |
| longestStreak | integer | - | ✓ | 0 |
| totalVolume | double | - | ✓ | 0 |
| totalCalories | integer | - | ✓ | 0 |
| totalMinutes | integer | - | ✓ | 0 |
| favoriteExercises | string | 10000 | ✗ | - |
| muscleGroupStats | string | 10000 | ✗ | - |
| lastWorkoutDate | datetime | - | ✗ | - |

4. **Indexes**:
   - `userId_idx` (unique) → userId

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

### 3.8 Colección: BodyMeasurements

1. **Collection ID**: `bodyMeasurements`
2. **Name**: `BodyMeasurements`
3. **Attributes**:

| Key | Type | Size | Required |
|-----|------|------|----------|
| userId | string | 255 | ✓ |
| fecha | datetime | - | ✓ |
| peso | double | - | ✓ |
| cintura | double | - | ✗ |
| cadera | double | - | ✗ |
| pecho | double | - | ✗ |
| brazoDerecho | double | - | ✗ |
| brazoIzquierdo | double | - | ✗ |
| musloDerecho | double | - | ✗ |
| musloIzquierdo | double | - | ✗ |
| pantorrillaDerecha | double | - | ✗ |
| pantorrillaIzquierda | double | - | ✗ |
| grasaCorporal | double | - | ✗ |
| masaMuscular | double | - | ✗ |
| notas | string | 2000 | ✗ |

4. **Indexes**:
   - `userId_idx` (key) → userId
   - `fecha_idx` (key) → fecha

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

### 3.9 Colección: ProgressPhotos

1. **Collection ID**: `progressPhotos`
2. **Name**: `ProgressPhotos`
3. **Attributes**:

| Key | Type | Size | Required |
|-----|------|------|----------|
| userId | string | 255 | ✓ |
| fecha | datetime | - | ✓ |
| tipo | string | 50 | ✓ |
| fileId | string | 255 | ✓ |
| url | string | 1000 | ✓ |
| peso | double | - | ✗ |
| notas | string | 2000 | ✗ |

4. **Indexes**:
   - `userId_idx` (key) → userId
   - `fecha_idx` (key) → fecha
   - `tipo_idx` (key) → tipo

5. **Permissions**: `read("user:{userId}")`, `write("user:{userId}")`

## Paso 4: Habilitar Autenticación

1. Ve a **Auth** en el menú lateral
2. Ve a **Settings**
3. Asegúrate de que **Email/Password** esté habilitado

## Paso 5: Verificar Variables de Entorno

Asegúrate de tener todas estas variables configuradas en Appwrite Console (Settings → Environment Variables):

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<tu-project-id>
VITE_APPWRITE_DATABASE_ID=gymbro-db
```

## Cómo Funciona

### Almacenamiento Híbrido

La aplicación usa un sistema de almacenamiento híbrido:

1. **Modo Cloud** (cuando el usuario está autenticado):
   - Los datos se guardan primero en Appwrite
   - También se cachean en IndexedDB local para acceso rápido
   - Si Appwrite falla, automáticamente usa IndexedDB como fallback

2. **Modo Local** (sin autenticación):
   - Usa solo IndexedDB
   - Los datos están solo en el dispositivo

### Sincronización

- Cuando un usuario inicia sesión, los datos se sincronizan automáticamente con Appwrite
- Los datos se persisten en la nube y no se pierden cuando el teléfono se bloquea
- El cache local (IndexedDB) permite que la app funcione incluso sin conexión

### Permisos

Los permisos configurados aseguran que:
- Cada usuario solo puede ver y editar sus propios datos
- Los ejercicios son públicos (lectura para todos)
- Solo administradores pueden editar ejercicios

## Solución de Problemas

### Error: "Document permissions prevent access"
- Verifica que los permisos estén configurados correctamente
- Asegúrate de usar `read("user:{userId}")` y `write("user:{userId}")` (incluyendo las llaves)

### Error: "Database not found"
- Verifica que `VITE_APPWRITE_DATABASE_ID` esté configurado correctamente
- Asegúrate de que la base de datos existe en Appwrite Console

### Los datos no se guardan
- Revisa la consola del navegador para ver errores
- Verifica que el usuario esté autenticado
- Comprueba que las colecciones existan y tengan los atributos correctos

## Notas Importantes

1. **Tipos JSON**: Algunos campos (como `diasRutina`, `ejercicios`, `comidas`, etc.) se almacenan como strings JSON. La aplicación los parsea automáticamente.

2. **IDs de Documentos**: Appwrite genera IDs únicos automáticamente usando `ID.unique()`.

3. **Fechas**: Todas las fechas se almacenan en formato ISO 8601 (datetime de Appwrite).

4. **Arrays**: Los campos de tipo array deben tener el checkbox "Array" marcado en Appwrite.

5. **IndexedDB como Fallback**: Si Appwrite no está disponible, la app seguirá funcionando usando solo IndexedDB local.

## Próximos Pasos

Después de completar la configuración:

1. Reinicia tu aplicación
2. Registra un nuevo usuario
3. Los datos ahora se guardarán automáticamente en Appwrite
4. Prueba bloquear el teléfono durante un workout - los datos ya no se perderán
