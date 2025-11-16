import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { RutinaSemanal, WorkoutLog } from '@/types';
import { Dumbbell, TrendingUp, Calendar, Award, Flame, Target } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, statistics, setStatistics } = useAppStore();
  const [activeRoutine, setActiveRoutine] = useState<RutinaSemanal | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      // Cargar rutina activa
      const routine = await dbHelpers.getActiveRoutine(currentUser.id);
      setActiveRoutine(routine || null);

      // Cargar estadísticas
      const stats = await dbHelpers.getUserStatistics(currentUser.id);
      if (stats) {
        setStatistics(stats);
      }

      // Cargar entrenamientos recientes
      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 5);
      setRecentWorkouts(workouts);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextWorkoutDay = () => {
    if (!activeRoutine || !activeRoutine.dias.length) return null;

    // Si no hay workouts previos, empezar con el primer día
    if (recentWorkouts.length === 0) {
      return activeRoutine.dias[0];
    }

    // Buscar qué día se entrenó la última vez
    const ultimoWorkout = recentWorkouts[0];
    const ultimoDiaIndex = activeRoutine.dias.findIndex(
      d => d.id === ultimoWorkout.diaRutinaId || d.nombre === ultimoWorkout.diaRutina
    );

    // Si encontramos el último día, sugerir el siguiente en la rotación
    if (ultimoDiaIndex !== -1) {
      const nextIndex = (ultimoDiaIndex + 1) % activeRoutine.dias.length;
      return activeRoutine.dias[nextIndex];
    }

    // Fallback: primer día
    return activeRoutine.dias[0];
  };

  const nextDay = getNextWorkoutDay();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Bienvenido, {currentUser?.nombre || 'Atleta'}
        </h1>
        <p className="text-muted-foreground">
          Tu progreso te espera. Es hora de entrenar.
        </p>
      </div>

      {/* Entrenamiento de hoy */}
      <Card className="mb-6 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {nextDay ? `Hoy: ${nextDay.nombre}` : 'Configura tu Rutina'}
              </CardTitle>
              <CardDescription>
                {nextDay
                  ? `${nextDay.ejercicios.length} ejercicios • ~${nextDay.duracionEstimada} minutos`
                  : 'Crea una rutina personalizada para comenzar'}
              </CardDescription>
            </div>
            <Dumbbell className="w-12 h-12 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {nextDay ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {nextDay.grupos.map((grupo) => (
                  <Badge key={grupo} variant="secondary">
                    {grupo}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => navigate('/workout-session')}
                size="lg"
                className="w-full md:w-auto"
              >
                Comenzar Entrenamiento
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/routine-generator')}
              size="lg"
              className="w-full md:w-auto"
            >
              Generar Rutina Personalizada
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-orange-500 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {statistics?.rachaActual || 0} 🔥
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mejor racha: {statistics?.rachaMasLarga || 0} días
            </p>
            {(statistics?.rachaActual || 0) >= 7 && (
              <Badge variant="default" className="mt-2 bg-orange-500">
                ¡Increíble consistencia!
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Entrenamientos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.totalEntrenamientos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sigue así
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Volumen Este Mes
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.volumenEsteMes
                ? `${(statistics.volumenEsteMes / 1000).toFixed(1)}t`
                : '0t'}
            </div>
            <p className="text-xs text-muted-foreground">
              Toneladas movidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entrenamientos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos Recientes</CardTitle>
          <CardDescription>
            Tus últimas 5 sesiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/workout/${workout.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{workout.diaRutina}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(workout.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={workout.completado ? 'success' : 'secondary'}>
                      {workout.completado ? 'Completado' : 'Incompleto'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workout.duracionReal} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aún no has registrado ningún entrenamiento
              </p>
              <Button
                onClick={() => navigate('/workout-session')}
                variant="outline"
                className="mt-4"
              >
                Comenzar ahora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/exercises')}>
          <CardHeader>
            <CardTitle>Biblioteca de Ejercicios</CardTitle>
            <CardDescription>
              Explora todos los ejercicios disponibles
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/progress')}>
          <CardHeader>
            <CardTitle>Ver Progreso</CardTitle>
            <CardDescription>
              Analiza tu evolución y estadísticas
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
