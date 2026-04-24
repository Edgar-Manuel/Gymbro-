import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { account } from '@/services/appwrite';
import { setStorageMode, dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import { OAuthProvider } from 'appwrite';

// Tipo para el usuario de Appwrite
interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: AppwriteUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión actual al cargar
  useEffect(() => {
    checkSession();
  }, []);

  // Cambiar modo de almacenamiento según autenticación
  useEffect(() => {
    const handleUserChange = async () => {
      if (user) {
        // Usuario autenticado: usar Appwrite (cloud)
        setStorageMode('cloud');
        
        try {
          const store = useAppStore.getState();
          const localUser = store.currentUser;
          
          // Si hay un usuario local y no es el usuario por defecto ('user-1')
          // Y además el email es distinto al de la sesión actual de Appwrite
          if (localUser && localUser.id !== 'user-1' && localUser.email && localUser.email !== user.email) {
            console.log('🔄 Cambio de cuenta detectado. Limpiando base de datos local...');
            
            // Limpiar datos antiguos
            await dbHelpers.clearAllData();
            
            // Limpiar estado
            store.setCurrentUser(null);
            store.setActiveRoutine(null);
            store.setStatistics(null);
            store.finishWorkout();
            
            // Recargar datos iniciales (ejercicios)
            const { initializeDatabase } = await import('@/utils/seedData');
            await initializeDatabase();
          }

          // Intentar obtener el perfil de la nube
          const { appwriteDbHelpers } = await import('@/db/appwriteDb');
          const cloudUser = await appwriteDbHelpers.getCurrentUser();
          
          if (cloudUser) {
            // Guardar localmente
            await dbHelpers.createOrUpdateUser(cloudUser);
            store.setCurrentUser(cloudUser);
          }
        } catch (error) {
          console.error('Error sincronizando usuario tras login:', error);
        }
      } else {
        // Sin autenticación: usar IndexedDB (local)
        setStorageMode('local');
      }
    };

    handleUserChange();
  }, [user]);

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      setUser(session);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  // Helper para esperar un tiempo
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper para intentar login con retries
  const loginWithRetry = async (email: string, password: string, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Intento de login ${attempt}/${maxRetries}...`);
        await account.createEmailPasswordSession(email, password);
        const session = await account.get();
        setUser(session);
        console.log('✅ Login exitoso');
        return; // Éxito, salir
      } catch (error) {
        console.warn(`Intento ${attempt} falló:`, (error as Error).message);
        if (attempt < maxRetries) {
          // Esperar antes de reintentar (incrementalmente más tiempo)
          const waitTime = attempt * 500; // 500ms, 1000ms, 1500ms
          console.log(`Esperando ${waitTime}ms antes de reintentar...`);
          await delay(waitTime);
        } else {
          // Último intento falló
          throw error;
        }
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Crear cuenta
      console.log('Creando cuenta en Appwrite...');
      await account.create('unique()', email, password, name);
      console.log('✅ Cuenta creada exitosamente');

      // Pequeño delay para que Appwrite procese la cuenta
      await delay(300);

      // Iniciar sesión automáticamente con retry
      await loginWithRetry(email, password);
    } catch (error) {
      console.error('Error al registrarse:', error);
      // Si el error es que la cuenta ya existe, intentar login directamente
      if ((error as { code?: number }).code === 409) {
        console.log('La cuenta ya existe, intentando login...');
        await loginWithRetry(email, password);
      } else {
        throw error;
      }
    }
  };

  const loginWithGoogle = () => {
    try {
      // Para Appwrite web, redirige directamente
      account.createOAuth2Session(
        OAuthProvider.Google, // provider
        `${window.location.origin}/`, // success URL
        `${window.location.origin}/login?error=oauth` // failure URL
      );
    } catch (error) {
      console.error('Error al iniciar con Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      
      console.log('Cerrando sesión. Limpiando datos locales...');
      // Limpiar base de datos local
      await dbHelpers.clearAllData();
      
      // Volver a cargar ejercicios por defecto
      const { initializeDatabase } = await import('@/utils/seedData');
      await initializeDatabase();
      
      // Limpiar estado de Zustand
      const store = useAppStore.getState();
      store.setCurrentUser(null);
      store.setActiveRoutine(null);
      store.setStatistics(null);
      store.finishWorkout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
