# 🚀 Setup FÁCIL de Appwrite Database

## ¡Olvídate de crear las colecciones manualmente!

Este script lo hace TODO automáticamente.

## Paso 1: Crear una API Key

1. Ve a tu proyecto en Appwrite Console (https://cloud.appwrite.io)
2. En el menú lateral, haz clic en **Overview**
3. Baja hasta **API Keys** y haz clic en **Create API Key**
4. Configura:
   - **Name**: `Setup Script`
   - **Expiration**: Sin expiración (o la que prefieras)
   - **Scopes**: Marca estas opciones:
     - ✅ `databases.read`
     - ✅ `databases.write`
     - ✅ `collections.read`
     - ✅ `collections.write`
     - ✅ `attributes.read`
     - ✅ `attributes.write`
     - ✅ `indexes.read`
     - ✅ `indexes.write`
5. Haz clic en **Create**
6. **COPIA** la API Key que te muestra (solo se muestra una vez)

## Paso 2: Agregar la API Key a tu .env

Abre tu archivo `.env` y agrega:

```env
APPWRITE_API_KEY=tu-api-key-aqui
```

(Las otras variables ya las tienes: `VITE_APPWRITE_ENDPOINT` y `VITE_APPWRITE_PROJECT_ID`)

## Paso 3: Ejecutar el script

En la terminal, ejecuta:

```bash
npx tsx scripts/setup-appwrite-db.ts
```

## ¡Eso es todo!

El script creará:
- ✅ La base de datos `gymbro-db`
- ✅ Las 9 colecciones con todos sus atributos
- ✅ Todos los índices
- ✅ Los permisos correctos

Todo en **menos de 1 minuto**.

## Si algo falla

El script te dirá exactamente qué error ocurrió. Normalmente es porque:
- ❌ Falta la API Key
- ❌ La API Key no tiene los permisos correctos
- ❌ El PROJECT_ID está mal

## Después del script

Solo falta:
1. Ir a **Auth** → **Settings** en Appwrite Console
2. Habilitar **Email/Password**
3. ¡Listo para usar la app!

---

**Nota**: Después de ejecutar el script, puedes **borrar la API Key** de Appwrite Console por seguridad. Ya no la necesitarás.
