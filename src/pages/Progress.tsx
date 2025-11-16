import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import { analizarProgresoEjercicio, generarDatosGrafico, calcularEstadisticasGenerales } from '@/utils/progressAnalyzer';
import type { WorkoutLog, ExerciseKnowledge, ProgressAnalysis } from '@/types';
import BodyMeasurements from '@/components/BodyMeasurements';
import PhotoProgress from '@/components/PhotoProgress';
import WorkoutCalendar from '@/components/WorkoutCalendar';
import BodyWeightChart from '@/components/BodyWeightChart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Dumbbell,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb
} from 'lucide-react';

export default function Progress() {
  const { currentUser } = useAppStore();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<ExerciseKnowledge[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedExerciseId && exercises.length > 0 && workouts.length > 0) {
      analyzeExercise(selectedExerciseId);
    }
  }, [selectedExerciseId, exercises, workouts]);

  const loadData = async () => {
    if (!currentUser) return;

    const [allWorkouts, allExercises] = await Promise.all([
      dbHelpers.getWorkoutsByUser(currentUser.id),
      dbHelpers.getAllExercises()
    ]);

    setWorkouts(allWorkouts);
    setExercises(allExercises);

    // Seleccionar el primer ejercicio realizado
    if (allWorkouts.length > 0 && allWorkouts[0].ejercicios.length > 0) {
      setSelectedExerciseId(allWorkouts[0].ejercicios[0].ejercicioId);
    }
  };

  const analyzeExercise = (ejercicioId: string) => {
    const exercise = exercises.find(e => e.id === ejercicioId);
    if (!exercise) return;

    const progressAnalysis = analizarProgresoEjercicio(ejercicioId, workouts, exercise);
    setAnalysis(progressAnalysis);
  };

  if (!currentUser) {
    return null;
  }

  const stats = calcularEstadisticasGenerales(workouts);
  const chartData = selectedExerciseId ? generarDatosGrafico(selectedExerciseId, workouts) : [];

  // Obtener lista de ejercicios realizados
  const ejerciciosRealizados = new Set<string>();
  workouts.forEach(w => {
    w.ejercicios.forEach(e => ejerciciosRealizados.add(e.ejercicioId));
  });

  const ejerciciosDisponibles = exercises.filter(e => ejerciciosRealizados.has(e.id));

  const getRecomendacionIcon = (recomendacion: string) => {
    switch (recomendacion) {
      case 'subir_peso':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'subir_reps':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'deload':
        return <ArrowDown className="w-4 h-4 text-orange-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRecomendacionColor = (recomendacion: string) => {
    switch (recomendacion) {
      case 'subir_peso':
        return 'success';
      case 'subir_reps':
        return 'default';
      case 'deload':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Análisis de Progreso</h1>
        <p className="text-muted-foreground">
          Visualiza tu evolución y recibe recomendaciones personalizadas
        </p>
      </div>

      <Tabs defaultValue="entrenamientos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="entrenamientos">Entrenamientos</TabsTrigger>
          <TabsTrigger value="corporal">Peso & Medidas</TabsTrigger>
          <TabsTrigger value="fotos">Fotos</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
        </TabsList>

        {/* Tab: Entrenamientos */}
        <TabsContent value="entrenamientos">
          {workouts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sin Datos de Entrenamiento</CardTitle>
                <CardDescription>
                  Completa tu primer entrenamiento para ver tus estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Las gráficas y análisis aparecerán aquí una vez que empieces a registrar tus entrenamientos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entrenamientos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workouts.length}</div>
                <p className="text-xs text-muted-foreground">
                  sesiones completadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.volumenTotalMovido / 1000).toFixed(1)}t
                </div>
                <p className="text-xs text-muted-foreground">
                  kilogramos movidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volumen Promedio</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.volumenPromedioPorSesion / 1000).toFixed(1)}t
                </div>
                <p className="text-xs text-muted-foreground">
                  por sesión
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mejor Racha</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mejorRacha}</div>
                <p className="text-xs text-muted-foreground">
                  entrenamientos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Selector de Ejercicio */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Analizar Ejercicio Específico</CardTitle>
              <CardDescription>
                Selecciona un ejercicio para ver tu progresión detallada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  {ejerciciosDisponibles.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Análisis y Recomendación */}
          {analysis && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{analysis.nombre}</CardTitle>
                  <Badge variant={getRecomendacionColor(analysis.recomendacion)}>
                    <span className="flex items-center gap-1">
                      {getRecomendacionIcon(analysis.recomendacion)}
                      {analysis.recomendacion.replace('_', ' ').toUpperCase()}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Volumen */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      Volumen Total (kg × reps)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Semana actual:</span>
                        <span className="font-semibold">{analysis.volumenTotal.semanaActual.toFixed(0)} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Semana anterior:</span>
                        <span className="font-semibold">{analysis.volumenTotal.semanaAnterior.toFixed(0)} kg</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Cambio:</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          analysis.volumenTotal.cambio > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {analysis.volumenTotal.cambio > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {analysis.volumenTotal.cambio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Peso Máximo */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Peso Máximo
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Actual:</span>
                        <span className="font-semibold">{analysis.pesoMaximo.actual.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Hace 4 semanas:</span>
                        <span className="font-semibold">{analysis.pesoMaximo.hace4Semanas.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Progreso:</span>
                        <span className={`font-bold ${
                          analysis.pesoMaximo.cambio > 0 ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          +{analysis.pesoMaximo.cambio.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recomendación */}
                <div className="bg-primary/10 p-4 rounded-lg flex gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Próximo Objetivo:</p>
                    <p className="text-sm">{analysis.proximoObjetivo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráficos */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Peso Máximo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolución de Peso Máximo</CardTitle>
                  <CardDescription>Progresión de carga en el tiempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="pesoMaximo"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Peso Máximo (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Volumen Total */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Volumen Total por Sesión</CardTitle>
                  <CardDescription>kg × reps totales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="volumenTotal"
                        fill="#10b981"
                        name="Volumen (kg)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Entrenamientos Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Entrenamientos Recientes</CardTitle>
              <CardDescription>Últimas 10 sesiones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workouts.slice(0, 10).map((workout) => (
                  <div
                    key={workout.id}
                    className="p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{workout.diaRutina}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.fecha).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{workout.duracionReal} min</p>
                        <p className="text-xs text-muted-foreground">
                          {workout.ejercicios.length} ejercicios
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i <= workout.sensacionGeneral ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        Sensación general
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Peso & Medidas */}
        <TabsContent value="corporal" className="space-y-6">
          <BodyWeightChart />
          <BodyMeasurements />
        </TabsContent>

        {/* Tab: Fotos */}
        <TabsContent value="fotos">
          <PhotoProgress />
        </TabsContent>

        {/* Tab: Calendario */}
        <TabsContent value="calendario">
          <WorkoutCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
