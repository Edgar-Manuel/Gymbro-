import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkoutLog } from '@/types';
import {
  Trophy,
  TrendingUp,
  Clock,
  Dumbbell,
  Target,
  ArrowRight,
  CheckCircle2,
  Flame
} from 'lucide-react';

export default function WorkoutSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    // Obtener workout del state de navegación
    const workoutData = location.state?.workout as WorkoutLog;
    if (!workoutData) {
      navigate('/');
      return;
    }
    setWorkout(workoutData);
  }, [location, navigate]);

  if (!workout) {
    return null;
  }

  // Calcular métricas
  const volumenTotal = workout.ejercicios.reduce((total, ej) => {
    return total + ej.series.reduce((sum, serie) => {
      return sum + (serie.peso * serie.repeticiones);
    }, 0);
  }, 0);

  const totalSeries = workout.ejercicios.reduce((total, ej) => total + ej.series.length, 0);
  const totalReps = workout.ejercicios.reduce((total, ej) => {
    return total + ej.series.reduce((sum, serie) => sum + serie.repeticiones, 0);
  }, 0);

  // Encontrar PR (Personal Record) - serie más pesada
  let serieMaxima = { ejercicio: '', peso: 0, reps: 0 };
  workout.ejercicios.forEach(ej => {
    ej.series.forEach(serie => {
      if (serie.peso > serieMaxima.peso) {
        serieMaxima = {
          ejercicio: ej.ejercicio?.nombre || 'Ejercicio',
          peso: serie.peso,
          reps: serie.repeticiones
        };
      }
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-8">
      {/* Header celebratorio */}
      <div className="bg-primary text-primary-foreground p-8 text-center">
        <div className="container mx-auto max-w-4xl">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">¡Entrenamiento Completado!</h1>
          <p className="text-lg opacity-90">
            Excelente trabajo, {workout.diaRutina}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold">{workout.duracionReal}</p>
              <p className="text-sm text-muted-foreground">minutos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold">{volumenTotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">kg totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold">{totalSeries}</p>
              <p className="text-sm text-muted-foreground">series</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-3xl font-bold">{totalReps}</p>
              <p className="text-sm text-muted-foreground">repeticiones</p>
            </CardContent>
          </Card>
        </div>

        {/* Serie más pesada */}
        {serieMaxima.peso > 0 && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-lg">Serie Más Pesada</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{serieMaxima.ejercicio}</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {serieMaxima.peso}kg × {serieMaxima.reps} reps
              </p>
            </CardContent>
          </Card>
        )}

        {/* Desglose por ejercicio */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Desglose del Entrenamiento</CardTitle>
            <CardDescription>{workout.ejercicios.length} ejercicios completados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workout.ejercicios.map((ej, index) => {
              const volumenEjercicio = ej.series.reduce((sum, s) => sum + (s.peso * s.repeticiones), 0);
              const pesoMaximo = Math.max(...ej.series.map(s => s.peso));

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{ej.ejercicio?.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ej.series.length} series • {volumenEjercicio.toLocaleString()}kg total
                      </p>
                    </div>
                    <Badge variant={ej.ejercicio?.tier === 'S' ? 'success' : 'default'}>
                      Tier {ej.ejercicio?.tier}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {ej.series.map((serie, sIndex) => (
                      <div
                        key={sIndex}
                        className="flex items-center justify-between text-sm bg-accent/30 p-2 rounded"
                      >
                        <span className="text-muted-foreground">Serie {serie.numero}</span>
                        <div className="font-medium">
                          <span className={serie.peso === pesoMaximo ? 'text-primary font-bold' : ''}>
                            {serie.peso}kg
                          </span>
                          {' × '}
                          {serie.repeticiones} reps
                          {' • '}
                          <span className="text-muted-foreground">RIR {serie.RIR}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Consejos post-entreno */}
        <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Siguiente Paso: Recuperación</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Consume proteína en los próximos 2 horas (30-40g)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Hidratación: bebe al menos 500ml de agua ahora</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Descanso: duerme 7-9 horas esta noche para recuperación</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Próximo entreno: deja al menos 48h para este grupo muscular</span>
            </p>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/progress')}
            className="h-14"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Ver Progreso
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="h-14"
          >
            Volver al Inicio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
