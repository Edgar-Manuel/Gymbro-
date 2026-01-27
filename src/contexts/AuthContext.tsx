import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { account } from '@/services/appwrite';
import { setStorageMode } from '@/db';

// Tipo para el usuario de Appwrite
interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AppwriteUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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
    if (user) {
      // Usuario autenticado: usar Appwrite (cloud)
      setStorageMode('cloud');
    } else {
      // Sin autenticación: usar IndexedDB (local)
      setStorageMode('local');
    }
  }, [user]);

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
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
      } catch (error: any) {
        console.warn(`Intento ${attempt} falló:`, error.message);
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
    } catch (error: any) {
      console.error('Error al registrarse:', error);
      // Si el error es que la cuenta ya existe, intentar login directamente
      if (error.code === 409) {
        console.log('La cuenta ya existe, intentando login...');
        await loginWithRetry(email, password);
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
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
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
