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

  const register = async (email: string, password: string, name: string) => {
    try {
      // Crear cuenta
      await account.create('unique()', email, password, name);

      // Iniciar sesión automáticamente
      await login(email, password);
    } catch (error) {
      console.error('Error al registrarse:', error);
      throw error;
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
