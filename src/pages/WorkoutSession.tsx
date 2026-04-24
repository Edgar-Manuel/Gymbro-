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
import DaySelector from '@/components/DaySelector';
import SwapExerciseModal from '@/components/SwapExerciseModal';
import AchievementUnlocked from '@/components/AchievementUnlocked';
import { checkAndAwardAchievements, type EarnedAchievement } from '@/utils/achievementChecker';
import { notificationManager } from '@/utils/notificationManager';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import type { WorkoutLog, ExerciseLog, SerieLog, DiaRutina } from '@/types';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Save,
  Lightbulb,
  ArrowLeftRight
} from 'lucide-react';

export default function WorkoutSession() {
  const navigate = useNavigate();
  const { currentUser, activeRoutine, startWorkout, finishWorkout, activeWorkout } = useAppStore();

  // Estado para selector de día
  const [selectedDay, setSelectedDay] = useState<DiaRutina | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [startTime, setStartTime] = useState(new Date());

  // Formulario de serie actual
  const [reps, setReps] = useState('');
  const [peso, setPeso] = useState('');
  const [rir, setRir] = useState<number>(2);

  // Estado del entrenamiento
  const [ejercicioLogs, setEjercicioLogs] = useState<Map<string, ExerciseLog>>(new Map());

  // Sugerencias de peso basadas en historial
  const [pesoSugerido, setPesoSugerido] = useState<number | null>(null);

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [estimated1RM, setEstimated1RM] = useState<number | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<EarnedAchievement[]>([]);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [wellnessScore, setWellnessScore] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  useEffect(() => {
    if (!currentUser || !activeRoutine) {
      navigate('/');
    }
  }, [currentUser, activeRoutine, navigate]);

  const loadPesoSugerido = async () => {
    if (!currentUser || !selectedDay) return;

    const ejercicioActual = selectedDay.ejercicios[currentExerciseIndex];
    if (!ejercicioActual) return;

    try {
      // Obtener últimos workouts
      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 10);

      // Buscar última vez que se hizo este ejercicio
      for (const workout of workouts) {
        const ejercicioLog = workout.ejercicios.find(e => e.ejercicioId === ejercicioActual.ejercicioId);
        if (ejercicioLog && ejercicioLog.series.length > 0) {
          // Tomar el peso promedio de la primera serie
          const pesoPromedio = ejercicioLog.series[0].peso;
          setPesoSugerido(pesoPromedio);
          setPeso(pesoPromedio.toString());
          return;
        }
      }

      setPesoSugerido(null);
    } catch (error) {
      console.error('Error cargando peso sugerido:', error);
    }
  };

  // Cargar peso sugerido cuando cambia el ejercicio
  useEffect(() => {
    if (selectedDay && hasStarted) {
      loadPesoSugerido();
    }
  }, [currentExerciseIndex, selectedDay, hasStarted]);

  const handleSelectDay = (dia: DiaRutina) => {
    setSelectedDay(dia);
  };

  const handleStartWorkout = (score: 1 | 2 | 3 | 4 | 5 = 3) => {
    if (!currentUser || !selectedDay) return;

    const workoutLog: WorkoutLog = {
      id: `workout-${Date.now()}`,
      userId: currentUser.id,
      fecha: new Date(),
      diaRutina: selectedDay.nombre,
      diaRutinaId: selectedDay.id,
      ejercicios: [],
      duracionReal: 0,
      sensacionGeneral: score,
      completado: false
    };

    startWorkout(workoutLog);
    setStartTime(new Date());
    setHasStarted(true);
    setShowWellnessCheck(false);
  };

  if (!activeRoutine || !currentUser) {
    return null;
  }

  // Si no ha seleccionado día o no ha empezado, mostrar selector
  if (!selectedDay || !hasStarted) {
    const wellnessOptions: { score: 1 | 2 | 3 | 4 | 5; emoji: string; label: string; hint: string; color: string }[] = [
      { score: 2, emoji: '😴', label: 'Cansado', hint: 'Considera bajar el peso un 10%', color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' },
      { score: 3, emoji: '😐', label: 'Normal', hint: '¡Listo para entrenar!', color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30' },
      { score: 5, emoji: '💪', label: 'Con energía', hint: '¡Día perfecto para superar marcas!', color: 'border-green-400 bg-green-50 dark:bg-green-950/30' },
    ];

    return (
      <>
        <DaySelector
          dias={activeRoutine.dias.filter(d => d.ejercicios.length > 0)}
          onSelectDay={handleSelectDay}
          selectedDayId={selectedDay?.id}
        />

        {selectedDay && !hasStarted && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
            <div className="container mx-auto max-w-4xl">
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={() => setShowWellnessCheck(true)}
              >
                <Check className="w-5 h-5 mr-2" />
                Comenzar Entrenamiento: {selectedDay.nombre}
              </Button>
            </div>
          </div>
        )}

        {/* Wellness check-in modal */}
        {showWellnessCheck && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border rounded-2xl p-6 w-full max-w-sm space-y-5">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Check-in
                </p>
                <h2 className="text-xl font-bold">¿Cómo te sientes hoy?</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {wellnessOptions.map(opt => (
                  <button
                    key={opt.score}
                    onClick={() => setWellnessScore(opt.score)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      wellnessScore === opt.score
                        ? opt.color + ' scale-105'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>

              {wellnessScore && (
                <p className="text-center text-sm text-muted-foreground">
                  {wellnessOptions.find(o => o.score === wellnessScore)?.hint}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowWellnessCheck(false)}
                >
                  Volver
                </Button>
                <Button
                  className="flex-1"
                  disabled={!wellnessScore}
                  onClick={() => handleStartWorkout(wellnessScore!)}
                >
                  Empezar →
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const ejerciciosDelDia = selectedDay.ejercicios;
  const ejercicioActual = ejerciciosDelDia[currentExerciseIndex];

  if (!ejercicioActual) {
    return null;
  }

  const ejercicioLog = ejercicioLogs.get(ejercicioActual.ejercicioId);
  const seriesCompletadas = ejercicioLog?.series.length || 0;
  const totalSeries = ejercicioActual.seriesObjetivo;

  const handleRegistrarSerie = () => {
    if (!reps || !peso) {
      alert('Por favor completa repeticiones y peso');
      return;
    }

    const nuevaSerie: SerieLog = {
      numero: currentSetNumber,
      repeticiones: parseInt(reps),
      peso: parseFloat(peso),
      RIR: rir,
      tiempoDescanso: ejercicioActual.ejercicio?.descansoSugerido || 90,
      completada: true
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

    // Calcular 1RM estimado (fórmula de Epley)
    const repsNum = parseInt(reps);
    const pesoNum = parseFloat(peso);
    if (repsNum > 0 && repsNum <= 12 && pesoNum > 0) {
      setEstimated1RM(Math.round(pesoNum * (1 + repsNum / 30)));
    }

    // Limpiar formulario
    setReps('');
    setRir(2);

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
      setPeso('');
      setEstimated1RM(null);
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
      setPeso('');
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
      notificationManager.markTrained();

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

      // Comprobar logros
      const updatedStats = await dbHelpers.getUserStatistics(currentUser.id);
      if (updatedStats) {
        const newAchievements = await checkAndAwardAchievements(
          currentUser.id,
          workoutFinal,
          updatedStats,
        );
        if (newAchievements.length > 0) {
          setEarnedAchievements(newAchievements);
          // La navegación ocurrirá tras cerrar el modal de logros
          finishWorkout();
          return;
        }
      }

      finishWorkout();
      navigate('/workout/summary', { state: { workout: workoutFinal } });
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
      alert('Error al guardar el entrenamiento. Por favor, intenta de nuevo.');
    }
  };

  const handleCancelarEntrenamiento = () => {
    if (confirm('¿Seguro que quieres cancelar este entrenamiento? Se perderá el progreso.')) {
      finishWorkout();
      navigate('/');
    }
  };

  const handleSwap = (nuevo: typeof ejercicioActual) => {
    if (!selectedDay) return;
    const ejerciciosActualizados = selectedDay.ejercicios.map((ej, idx) =>
      idx === currentExerciseIndex ? nuevo : ej
    );
    setSelectedDay({ ...selectedDay, ejercicios: ejerciciosActualizados });
    setCurrentSetNumber(1);
    setPesoSugerido(null);
    setPeso('');
    setReps('');
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
            <h1 className="text-xl font-bold">{selectedDay.nombre}</h1>
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
              <div className="flex flex-col items-end gap-2">
                <Badge variant={ejercicioActual.ejercicio?.tier === 'S' ? 'success' : 'default'} className="text-lg px-3 py-1">
                  Tier {ejercicioActual.ejercicio?.tier}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSwapModal(true)}
                  className="text-xs h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-950"
                >
                  <ArrowLeftRight className="w-3 h-3 mr-1" />
                  Máquina ocupada
                </Button>
              </div>
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

            {/* Peso sugerido */}
            {pesoSugerido && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 Última vez usaste: <span className="font-bold">{pesoSugerido}kg</span>
                </p>
              </div>
            )}

            {/* 1RM estimado */}
            {estimated1RM !== null && (
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg mb-4 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  ⚡ 1RM estimado: <span className="font-bold text-lg">{estimated1RM} kg</span>
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-300">
                  Hipertrofia: ~{Math.round(estimated1RM * 0.75)}kg
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
                    placeholder={pesoSugerido?.toString() || "0"}
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
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border"
                    >
                      <span className="font-medium">Serie {serie.numero}</span>
                      <div className="text-sm">
                        <span className="font-semibold">{serie.repeticiones} reps</span>
                        {' × '}
                        <span className="font-semibold">{serie.peso}kg</span>
                        {' • '}
                        <span className="text-muted-foreground">RIR {serie.RIR}</span>
                      </div>
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

      {/* Modal de logros */}
      {earnedAchievements.length > 0 && (
        <AchievementUnlocked
          achievements={earnedAchievements}
          onClose={() => {
            setEarnedAchievements([]);
            navigate('/workout/summary', { state: { workout: activeWorkout } });
          }}
        />
      )}

      {/* Modal de swap */}
      <SwapExerciseModal
        open={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        ejercicioActual={ejercicioActual}
        onSwap={handleSwap}
      />
    </div>
  );
}
