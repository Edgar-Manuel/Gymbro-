# Configuración de Appwrite para GymBro

Si estás viendo errores 401 (Unauthorized) en la consola o tu aplicación no sincroniza datos, es probable que necesites configurar los permisos en tu consola de Appwrite.

## 1. Configurar Permisos de Colecciones

Para cada colección en tu base de datos (`users`, `routines`, `workouts`, `statistics`, etc.), debes configurar los permisos de acceso.

1. Ve a tu consola de Appwrite > Databases > GymBro DB.
2. Entra en la colección **Users**.
3. Ve a la pestaña **Settings** (Configuración).
4. En la sección **Permissions** (Permisos):
   - Añade un rol: **Any** (Cualquiera) o **Users** (Usuarios autenticados).
   - Marca las casillas: **Read**, **Create**, **Update**, **Delete**.
   - *Nota: Para mayor seguridad en producción, deberías usar "Users" y configurar permisos a nivel de documento, pero para empezar "Any" o "Users" con acceso total es más fácil.*
5. Haz clic en **Update**.

**Repite esto para TODAS las colecciones:**
- Routines
- Workouts
- Statistics
- Achievements
- Nutrition
- Body Measurements
- Progress Photos

## 2. Verificar ID del Proyecto

Asegúrate de que el ID de tu proyecto en `src/config/appwriteSchema.ts` coincide con el de tu consola.

## 3. Modo Offline

Recuerda que GymBro funciona perfectamente sin Appwrite. Si no quieres configurar la nube ahora, la aplicación guardará todo en tu dispositivo localmente.
