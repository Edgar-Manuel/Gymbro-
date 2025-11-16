import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 animate-pulse mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">GymBro</h2>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar contenido protegido
  return <>{children}</>;
}
