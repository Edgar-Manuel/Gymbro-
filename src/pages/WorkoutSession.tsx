import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RestTimer from '@/components/RestTimer';
import PRCelebration from '@/components/PRCelebration';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import { detectarPR, generarSetsCalentamiento } from '@/utils/gymCalculators';
import type { WorkoutLog, ExerciseLog, SerieLog, PersonalRecord } from '@/types';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Save,
  Lightbulb
} from 'lucide-react';

export default function WorkoutSession() {
  const navigate = useNavigate();
  const { currentUser, activeRoutine, startWorkout, finishWorkout, activeWorkout } = useAppStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [startTime] = useState(new Date());

  // Formulario de serie actual
  const [reps, setReps] = useState('');
  const [peso, setPeso] = useState('');
  const [rir, setRir] = useState<number>(2);
  const [nota, setNota] = useState('');

  // Estado del entrenamiento
  const [ejercicioLogs, setEjercicioLogs] = useState<Map<string, ExerciseLog>>(new Map());

  // PR Tracking
  const [currentPR, setCurrentPR] = useState<PersonalRecord | null>(null);
  const [showPRCelebration, setShowPRCelebration] = useState(false);

  // Previous Performance Tracking
  const [previousPerformance, setPreviousPerformance] = useState<{
    series: SerieLog[];
    fecha: Date;
    volumenTotal: number;
  } | null>(null);

  // Warmup Sets
  const [isWarmupMode, setIsWarmupMode] = useState(true);
  const [warmupSetsCompleted, setWarmupSetsCompleted] = useState<SerieLog[]>([]);
  const [showWarmupSuggestions, setShowWarmupSuggestions] = useState(true);

  useEffect(() => {
    initializeWorkout();
  }, []);

  // Load previous performance when exercise changes
  useEffect(() => {
    loadPreviousPerformance();
    // Reset warmup mode for new exercise
    setIsWarmupMode(true);
    setWarmupSetsCompleted([]);
    setShowWarmupSuggestions(true);
  }, [currentExerciseIndex]);

  const loadPreviousPerformance = async () => {
    if (!currentUser || !ejercicioActual) return;

    try {
      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 10);

      // Find the most recent workout that included this exercise
      for (const workout of workouts) {
        const ejercicioLog = workout.ejercicios.find(
          e => e.ejercicioId === ejercicioActual.ejercicioId
        );

        if (ejercicioLog && ejercicioLog.series.length > 0) {
          const volumenTotal = ejercicioLog.series.reduce(
            (sum, s) => sum + (s.peso * s.repeticiones),
            0
          );

          setPreviousPerformance({
            series: ejercicioLog.series,
            fecha: workout.fecha,
            volumenTotal
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error loading previous performance:', error);
    }
  };

  const initializeWorkout = () => {
    if (!currentUser || !activeRoutine) {
      navigate('/');
      return;
    }

    // Obtener el primer día con ejercicios
    const diaConEjercicios = activeRoutine.dias.find(d => d.ejercicios.length > 0);
    if (!diaConEjercicios) {
      navigate('/');
      return;
    }

    // Inicializar workout log
    const workoutLog: WorkoutLog = {
      id: `workout-${Date.now()}`,
      userId: currentUser.id,
      fecha: new Date(),
      diaRutina: diaConEjercicios.nombre,
      ejercicios: [],
      duracionReal: 0,
      sensacionGeneral: 3,
      completado: false
    };

    startWorkout(workoutLog);
  };

  if (!activeRoutine || !currentUser) {
    return null;
  }

  const diaActual = activeRoutine.dias.find(d => d.ejercicios.length > 0);
  if (!diaActual) {
    return null;
  }

  const ejerciciosDelDia = diaActual.ejercicios;
  const ejercicioActual = ejerciciosDelDia[currentExerciseIndex];

  if (!ejercicioActual) {
    return null;
  }

  const ejercicioLog = ejercicioLogs.get(ejercicioActual.ejercicioId);
  const seriesCompletadas = ejercicioLog?.series.length || 0;
  const totalSeries = ejercicioActual.seriesObjetivo;

  const handleRegistrarSerie = async () => {
    if (!reps || !peso || !currentUser) {
      alert('Por favor completa repeticiones y peso');
      return;
    }

    const nuevaSerie: SerieLog = {
      numero: currentSetNumber,
      repeticiones: parseInt(reps),
      peso: parseFloat(peso),
      RIR: rir,
      tiempoDescanso: ejercicioActual.ejercicio?.descansoSugerido || 90,
      completada: true,
      notas: nota || undefined
    };

    // Actualizar o crear ejercicio log
    const logActual = ejercicioLog || {
      ejercicioId: ejercicioActual.ejercicioId,
      ejercicio: ejercicioActual.ejercicio,
      series: [],
      tecnicaCorrecta: true,
      sensacionMuscular: 3
    };

    const seriesActualizadas = [...logActual.series, nuevaSerie];
    const logActualizado = { ...logActual, series: seriesActualizadas };

    setEjercicioLogs(prev => new Map(prev.set(ejercicioActual.ejercicioId, logActualizado)));

    // *** PR DETECTION ***
    // Check if this set is a new personal record
    try {
      const prAnterior = await dbHelpers.getLatestPR(
        currentUser.id,
        ejercicioActual.ejercicioId,
        'peso_maximo'
      );

      const nuevoPR = detectarPR(
        ejercicioActual.ejercicioId,
        ejercicioActual.ejercicio?.nombre || 'Ejercicio',
        currentUser.id,
        nuevaSerie,
        prAnterior
      );

      if (nuevoPR) {
        // Save PR to database
        await dbHelpers.addPersonalRecord(nuevoPR);

        // Show celebration after a brief delay
        setTimeout(() => {
          setCurrentPR(nuevoPR);
          setShowPRCelebration(true);
        }, 800);
      }
    } catch (error) {
      console.error('Error checking for PR:', error);
    }

    // Limpiar formulario
    setReps('');
    setPeso('');
    setRir(2);
    setNota('');

    // Incrementar número de serie
    setCurrentSetNumber(prev => prev + 1);

    // Mostrar timer de descanso si no es la última serie
    if (seriesCompletadas + 1 < totalSeries) {
      setShowTimer(true);
    } else {
      // Última serie del ejercicio completada
      // Auto-avanzar al siguiente ejercicio
      setTimeout(() => {
        handleSiguienteEjercicio();
      }, 500);
    }
  };

  const handleSiguienteEjercicio = () => {
    if (currentExerciseIndex < ejerciciosDelDia.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetNumber(1);
      setShowTimer(false);
    } else {
      // Último ejercicio, finalizar entrenamiento
      handleFinalizarEntrenamiento();
    }
  };

  const handleAnteriorEjercicio = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSetNumber(1);
      setShowTimer(false);
    }
  };

  const handleFinalizarEntrenamiento = async () => {
    if (!activeWorkout || !currentUser) return;

    const duracionMinutos = Math.round((new Date().getTime() - startTime.getTime()) / 60000);

    const workoutFinal: WorkoutLog = {
      ...activeWorkout,
      ejercicios: Array.from(ejercicioLogs.values()),
      duracionReal: duracionMinutos,
      completado: true
    };

    try {
      await dbHelpers.logWorkout(workoutFinal);

      // Actualizar estadísticas
      const stats = await dbHelpers.getUserStatistics(currentUser.id);
      if (stats) {
        const volumenSesion = workoutFinal.ejercicios.reduce((total, ej) => {
          return total + ej.series.reduce((sum, serie) => {
            return sum + (serie.peso * serie.repeticiones);
          }, 0);
        }, 0);

        await dbHelpers.updateStatistics({
          ...stats,
          totalEntrenamientos: stats.totalEntrenamientos + 1,
          volumenEsteMes: stats.volumenEsteMes + volumenSesion,
          volumenTotalMovido: stats.volumenTotalMovido + volumenSesion
        });
      }

      finishWorkout();
      navigate('/progress');
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
    }
  };

  const handleCancelarEntrenamiento = () => {
    if (confirm('¿Seguro que quieres cancelar este entrenamiento? Se perderá el progreso.')) {
      finishWorkout();
      navigate('/');
    }
  };

  const progreso = ((currentExerciseIndex + 1) / ejerciciosDelDia.length) * 100;
  const repsObjetivo = Array.isArray(ejercicioActual.repsObjetivo)
    ? `${ejercicioActual.repsObjetivo[0]}-${ejercicioActual.repsObjetivo[1]}`
    : ejercicioActual.repsObjetivo;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header con progreso */}
      <div className="sticky top-0 z-40 bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{diaActual.nombre}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelarEntrenamiento}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progreso} className="h-2 bg-primary-foreground/20" />
          <p className="text-sm mt-2 opacity-90">
            Ejercicio {currentExerciseIndex + 1} de {ejerciciosDelDia.length}
          </p>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Tarjeta del ejercicio actual */}
        <Card className="mb-4 border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">
                  {ejercicioActual.ejercicio?.nombre}
                </CardTitle>
                <CardDescription className="text-base">
                  {ejercicioActual.ejercicio?.grupoMuscular} • {ejercicioActual.ejercicio?.categoria}
                </CardDescription>
              </div>
              <Badge variant={ejercicioActual.ejercicio?.tier === 'S' ? 'success' : 'default'} className="text-lg px-3 py-1">
                Tier {ejercicioActual.ejercicio?.tier}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Objetivo */}
            <div className="bg-accent/50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-1">Objetivo:</p>
              <p className="text-2xl font-bold">
                {totalSeries} series × {repsObjetivo} reps
              </p>
            </div>

            {/* Previous Performance Comparison */}
            {previousPerformance && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    📊 Última vez ({new Date(previousPerformance.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}):
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {previousPerformance.volumenTotal.toFixed(0)}kg total
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {previousPerformance.series.slice(0, 6).map((serie, idx) => (
                    <div
                      key={idx}
                      className="bg-background/50 p-2 rounded text-center text-sm"
                    >
                      <span className="font-semibold">{serie.repeticiones}</span>
                      <span className="text-muted-foreground"> × </span>
                      <span className="font-semibold">{serie.peso}kg</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ¡Intenta igualar o superar estos números!
                </p>
              </div>
            )}

            {/* Consejo clave */}
            {ejercicioActual.notas && (
              <div className="bg-primary/10 p-4 rounded-lg mb-4 flex gap-3">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Consejo Clave:</p>
                  <p className="text-sm">{ejercicioActual.notas}</p>
                </div>
              </div>
            )}

            {/* Warmup Suggestions */}
            {isWarmupMode && showWarmupSuggestions && seriesCompletadas === 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      Calentamiento Sugerido
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsWarmupMode(false);
                      setShowWarmupSuggestions(false);
                    }}
                    className="text-xs"
                  >
                    Saltar
                  </Button>
                </div>
                {(() => {
                  // Get estimated working weight from previous performance
                  const estimatedWeight = previousPerformance?.series[0]?.peso || 60;
                  const warmupSets = generarSetsCalentamiento(
                    estimatedWeight,
                    Array.isArray(ejercicioActual.repsObjetivo)
                      ? ejercicioActual.repsObjetivo[0]
                      : ejercicioActual.repsObjetivo
                  );

                  return (
                    <div className="space-y-2">
                      {warmupSets.map((set, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            warmupSetsCompleted.length > idx
                              ? 'bg-green-500/20 border border-green-500/30'
                              : 'bg-background/50'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {set.reps} reps × {set.peso}kg
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {set.descripcion}
                            </p>
                          </div>
                          {warmupSetsCompleted.length === idx && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const completedSet: SerieLog = {
                                  numero: warmupSetsCompleted.length + 1,
                                  repeticiones: set.reps,
                                  peso: set.peso,
                                  RIR: 5,
                                  tiempoDescanso: 30,
                                  completada: true
                                };
                                setWarmupSetsCompleted([...warmupSetsCompleted, completedSet]);

                                // If all warmup sets completed, exit warmup mode
                                if (warmupSetsCompleted.length + 1 >= warmupSets.length) {
                                  setTimeout(() => {
                                    setIsWarmupMode(false);
                                    setShowWarmupSuggestions(false);
                                  }, 500);
                                }
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {warmupSetsCompleted.length > idx && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  El calentamiento reduce lesiones y mejora el rendimiento
                </p>
              </div>
            )}

            {/* Formulario de serie */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  Serie {currentSetNumber} de {totalSeries}
                </h3>
                <Badge variant="outline">
                  {seriesCompletadas} completadas
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="reps" className="text-xs">Repeticiones</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder={repsObjetivo.toString()}
                    className="text-lg font-semibold text-center h-14"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <Label htmlFor="peso" className="text-xs">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.25"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="0"
                    className="text-lg font-semibold text-center h-14"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="rir" className="text-xs">RIR</Label>
                  <Select value={rir.toString()} onValueChange={(v) => setRir(parseInt(v))}>
                    <SelectTrigger id="rir" className="h-14">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">RIR 0 (fallo)</SelectItem>
                      <SelectItem value="1">RIR 1</SelectItem>
                      <SelectItem value="2">RIR 2</SelectItem>
                      <SelectItem value="3">RIR 3</SelectItem>
                      <SelectItem value="4">RIR 4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Notes */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Notas rápidas (opcional):</Label>
                <div className="flex flex-wrap gap-2">
                  {['💪 Fácil', '😤 Difícil', '🔥 Fallo', '⚠️ Técnica mala', '✅ Buena forma'].map((quickNote) => (
                    <Button
                      key={quickNote}
                      type="button"
                      variant={nota === quickNote ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNota(nota === quickNote ? '' : quickNote)}
                      className="text-xs"
                    >
                      {quickNote}
                    </Button>
                  ))}
                </div>
                <Input
                  type="text"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="O escribe tu nota personalizada..."
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleRegistrarSerie}
                size="lg"
                className="w-full h-14 text-lg"
                disabled={!reps || !peso}
              >
                <Check className="w-5 h-5 mr-2" />
                Completar Serie {currentSetNumber}
              </Button>
            </div>

            {/* Series completadas */}
            {ejercicioLog && ejercicioLog.series.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Series Completadas:</h4>
                <div className="space-y-2">
                  {ejercicioLog.series.map((serie) => (
                    <div
                      key={serie.numero}
                      className="p-3 rounded-lg bg-accent/30 border"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Serie {serie.numero}</span>
                        <div className="text-sm">
                          <span className="font-semibold">{serie.repeticiones} reps</span>
                          {' × '}
                          <span className="font-semibold">{serie.peso}kg</span>
                          {' • '}
                          <span className="text-muted-foreground">RIR {serie.RIR}</span>
                        </div>
                      </div>
                      {serie.notas && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {serie.notas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAnteriorEjercicio}
            disabled={currentExerciseIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentExerciseIndex === ejerciciosDelDia.length - 1 ? (
            <Button
              onClick={handleFinalizarEntrenamiento}
              className="flex-1"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          ) : (
            <Button
              onClick={handleSiguienteEjercicio}
              className="flex-1"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Timer de descanso */}
      {showTimer && (
        <RestTimer
          duration={ejercicioActual.ejercicio?.descansoSugerido || 90}
          onComplete={() => setShowTimer(false)}
          onClose={() => setShowTimer(false)}
        />
      )}

      {/* PR Celebration */}
      {showPRCelebration && currentPR && (
        <PRCelebration
          pr={currentPR}
          onClose={() => {
            setShowPRCelebration(false);
            setCurrentPR(null);
          }}
        />
      )}
    </div>
  );
}
