import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeDatabase } from '@/utils/seedData';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ExerciseLibrary from '@/pages/ExerciseLibrary';
import { Dumbbell } from 'lucide-react';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setCurrentUser, isDarkMode } = useAppStore();

  useEffect(() => {
    // Aplicar modo oscuro
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // Inicializar base de datos
      await initializeDatabase();

      // Cargar usuario actual
      const user = await dbHelpers.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error inicializando app:', error);
      setIsInitialized(true); // Continuar de todas formas
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 animate-pulse mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">GymBro</h2>
          <p className="text-muted-foreground">Inicializando tu gimnasio virtual...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="exercises" element={<ExerciseLibrary />} />
          <Route path="workout" element={<div className="p-8">Entrenamiento (próximamente)</div>} />
          <Route path="workout/:id" element={<div className="p-8">Detalle de entrenamiento (próximamente)</div>} />
          <Route path="routine-generator" element={<div className="p-8">Generador de rutinas (próximamente)</div>} />
          <Route path="progress" element={<div className="p-8">Progreso (próximamente)</div>} />
          <Route path="nutrition" element={<div className="p-8">Nutrición (próximamente)</div>} />
          <Route path="profile" element={<div className="p-8">Perfil (próximamente)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
