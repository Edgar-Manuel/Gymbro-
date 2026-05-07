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
import type { WorkoutLog, ExerciseLog, SerieLog, DiaRutina, Lesion, GrupoMuscular, WorkoutSetType } from '@/types';

// Item sortable de ejercicio en la pre-sesión
function SortableSessionExercise({ id, nombre, index, series, reps }: {
  id: string;
  nombre: string;
  index: number;
  series: number;
  reps: number | [number, number];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 5 : 'auto' as const,
  };
  const repsStr = Array.isArray(reps) ? `${reps[0]}-${reps[1]}` : String(reps);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 rounded-lg border bg-background"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none p-1 -ml-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{index + 1}. {nombre}</p>
        <p className="text-xs text-muted-foreground">{series} series × {repsStr} reps</p>
      </div>
    </div>
  );
}

// Detecta el tipo de set basándose en tags y equipamiento del ejercicio
function detectSetType(ej: { tags?: string[]; equipamiento?: string[] } | undefined): WorkoutSetType {
  if (!ej) return 'WEIGHT';
  const tags = ej.tags ?? [];
  if (tags.some(t => /isometr|cardio|tiempo|plancha/i.test(t))) return 'TIME';
  const eq = ej.equipamiento ?? [];
  // Solo peso corporal sin pesa adicional → BODYWEIGHT
  if (eq.length === 1 && eq[0] === 'peso_corporal') return 'BODYWEIGHT';
  return 'WEIGHT';
}
import { inferirSiguienteDia } from '@/utils/workoutInference';
import { getVideoForExercise, getVolumenSesion } from '@/utils/exerciseUtils';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import EditSerieDialog from '@/components/EditSerieDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { INJURY_AFFECTS, LESION_ZONA_LABELS, REHAB_EXERCISES } from '@/utils/injuryData';
import { CARDIO_RECOMENDACIONES } from '@/utils/cardioData';
import CardioPanel from '@/components/CardioPanel';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Save,
  Lightbulb,
  ArrowLeftRight,
  AlertTriangle,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function WorkoutSession() {
  const navigate = useNavigate();
  const { currentUser, activeRoutine, startWorkout, finishWorkout, activeWorkout } = useAppStore();

  // Estado para selector de día
  const [selectedDay, setSelectedDay] = useState<DiaRutina | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [editingSerie, setEditingSerie] = useState<SerieLog | null>(null);
  const [confirmDeleteSerie, setConfirmDeleteSerie] = useState<SerieLog | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [startTime, setStartTime] = useState(new Date());

  // Formulario de serie actual
  const [reps, setReps] = useState('');
  const [peso, setPeso] = useState('');
  const [tiempoSegundos, setTiempoSegundos] = useState('');
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

  const [showTechModal, setShowTechModal] = useState(false);

  // Injury awareness
  const [activeInjuries, setActiveInjuries] = useState<Lesion[]>([]);
  const [affectedInjuries, setAffectedInjuries] = useState<Lesion[]>([]);
  const [showRehabSection, setShowRehabSection] = useState(false);

  useEffect(() => {
    if (!currentUser || !activeRoutine) {
      navigate('/');
    }
  }, [currentUser, activeRoutine, navigate]);

  const [previousRef, setPreviousRef] = useState<{
    peso: number;
    reps: number;
    rir: number;
    fecha: Date;
    best1RM: number;
    pesoMaxHistorico: number;
  } | null>(null);

  const loadPesoSugerido = async () => {
    if (!currentUser || !selectedDay) return;

    const ejercicioActual = selectedDay.ejercicios[currentExerciseIndex];
    if (!ejercicioActual) return;

    try {
      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 30);
      const sorted = [...workouts].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      // Última sesión con este ejercicio
      let lastLog: typeof workouts[0]['ejercicios'][0] | null = null;
      let lastFecha: Date | null = null;
      let pesoMaxHistorico = 0;
      let best1RM = 0;

      for (const workout of sorted) {
        const ejercicioLog = workout.ejercicios.find(e => e.ejercicioId === ejercicioActual.ejercicioId);
        if (!ejercicioLog || ejercicioLog.series.length === 0) continue;
        if (!lastLog) {
          lastLog = ejercicioLog;
          lastFecha = new Date(workout.fecha);
        }
        for (const s of ejercicioLog.series) {
          if (s.peso > pesoMaxHistorico) pesoMaxHistorico = s.peso;
          const e1rm = s.peso * (1 + s.repeticiones / 30);
          if (e1rm > best1RM) best1RM = e1rm;
        }
      }

      if (!lastLog || !lastFecha) {
        setPesoSugerido(null);
        setPreviousRef(null);
        return;
      }

      // Pesos representativos de la primera serie
      const firstSerie = lastLog.series[0];
      setPesoSugerido(firstSerie.peso);
      setPeso(firstSerie.peso.toString());
      setPreviousRef({
        peso: firstSerie.peso,
        reps: firstSerie.repeticiones,
        rir: firstSerie.RIR,
        fecha: lastFecha,
        best1RM: Math.round(best1RM),
        pesoMaxHistorico,
      });
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

  // Load active injuries
  useEffect(() => {
    if (!currentUser) return;
    dbHelpers.getActiveInjuries(currentUser.id)
      .then(setActiveInjuries)
      .catch(() => {});
  }, [currentUser]);

  // Compute which injuries affect the selected day
  useEffect(() => {
    if (!selectedDay || activeInjuries.length === 0) {
      setAffectedInjuries([]);
      return;
    }
    const affected = activeInjuries.filter(l =>
      INJURY_AFFECTS[l.zona].some(m => (selectedDay.grupos ?? []).includes(m as GrupoMuscular))
    );
    setAffectedInjuries(affected);
  }, [selectedDay, activeInjuries]);

  // Auto-preselect day by muscle overlap — works across routine changes
  useEffect(() => {
    const autoSelectDay = async () => {
      if (!currentUser || !activeRoutine?.dias?.length) return;
      const activeDias = activeRoutine.dias.filter(d => d.ejercicios.length > 0);
      if (!activeDias.length) return;

      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 10);
      const completados = workouts
        .filter(w => w.completado)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      if (!completados.length) return;

      const nextDay = inferirSiguienteDia(activeDias, completados);
      setSelectedDay(nextDay);
    };
    autoSelectDay();
  }, [activeRoutine, currentUser]);

  // Drag and drop pre-sesión: reordena ejercicios del día seleccionado
  const reorderSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleReorderExerciseInDay = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedDay) return;
    const oldIdx = selectedDay.ejercicios.findIndex(ej => ej.ejercicioId === active.id);
    const newIdx = selectedDay.ejercicios.findIndex(ej => ej.ejercicioId === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setSelectedDay({
      ...selectedDay,
      ejercicios: arrayMove(selectedDay.ejercicios, oldIdx, newIdx),
    });
  };

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

        {selectedDay && !hasStarted && affectedInjuries.length > 0 && (
          <div className="mx-4 mt-4 p-4 rounded-xl border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-800 dark:text-orange-200">
                  Modo Lesión Activo
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {affectedInjuries.map(l => LESION_ZONA_LABELS[l.zona]).join(', ')} afecta a ejercicios de hoy.
                  Los pesos se ajustarán automáticamente. Al terminar verás tu plan de rehabilitación.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {affectedInjuries.map(l => (
                    <span key={l.id} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-medium capitalize">
                      {l.severidad}: {LESION_ZONA_LABELS[l.zona]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedDay && !hasStarted && currentUser && (() => {
          const somatotipo = currentUser.somatotipo ?? 'mesomorfo';
          const rec = CARDIO_RECOMENDACIONES[somatotipo];
          if (rec.momento !== 'antes') return null;
          return (
            <div className="mx-4 mt-4">
              <CardioPanel
                userId={currentUser.id}
                somatotipo={somatotipo}
                momento="antes"
              />
            </div>
          );
        })()}

        {/* Lista de ejercicios reordenable (pre-sesión) */}
        {selectedDay && !hasStarted && selectedDay.ejercicios.length > 0 && (
          <div className="mx-4 mt-4 mb-32">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <GripVertical className="w-3.5 h-3.5" />
              <span>Arrastra para reordenar antes de empezar</span>
            </div>
            <DndContext
              sensors={reorderSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleReorderExerciseInDay}
            >
              <SortableContext
                items={selectedDay.ejercicios.map(ej => ej.ejercicioId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {selectedDay.ejercicios.map((ej, idx) => (
                    <SortableSessionExercise
                      key={ej.ejercicioId}
                      id={ej.ejercicioId}
                      nombre={ej.ejercicio?.nombre ?? ej.ejercicioId}
                      index={idx}
                      series={ej.seriesObjetivo}
                      reps={ej.repsObjetivo}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

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
    const setType = detectSetType(ejercicioActual.ejercicio);

    // Validación según tipo
    if (setType === 'TIME') {
      if (!tiempoSegundos || parseInt(tiempoSegundos) <= 0) {
        alert('Introduce la duración en segundos');
        return;
      }
    } else if (setType === 'BODYWEIGHT') {
      if (!reps) {
        alert('Introduce las repeticiones');
        return;
      }
    } else {
      if (!reps || !peso) {
        alert('Por favor completa repeticiones y peso');
        return;
      }
    }

    const nuevaSerie: SerieLog = {
      numero: currentSetNumber,
      repeticiones: setType === 'TIME' ? 0 : parseInt(reps || '0'),
      peso: setType === 'WEIGHT' ? parseFloat(peso || '0') : 0,
      RIR: rir,
      tiempoDescanso: ejercicioActual.ejercicio?.descansoSugerido || 90,
      completada: true,
      tipo: setType,
      tiempoSegundos: setType === 'TIME' ? parseInt(tiempoSegundos) : undefined,
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
    setTiempoSegundos('');
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

  // Aplica una transformación al log del ejercicio actual.
  const updateExerciseLog = (transform: (log: ExerciseLog) => ExerciseLog) => {
    const ejId = ejerciciosDelDia[currentExerciseIndex]?.ejercicioId;
    if (!ejId) return;
    setEjercicioLogs(prev => {
      const next = new Map(prev);
      const existing = next.get(ejId);
      if (!existing) return prev;
      next.set(ejId, transform(existing));
      return next;
    });
  };

  const handleEditSerie = (updated: SerieLog) => {
    updateExerciseLog(log => ({
      ...log,
      series: log.series.map(s => (s.numero === updated.numero ? updated : s)),
    }));
    toast.success('Serie actualizada');
  };

  const performDeleteSerie = () => {
    if (!confirmDeleteSerie) return;
    const num = confirmDeleteSerie.numero;
    updateExerciseLog(log => ({
      ...log,
      // Filtra la serie y renumera las restantes para evitar gaps
      series: log.series
        .filter(s => s.numero !== num)
        .map((s, i) => ({ ...s, numero: i + 1 })),
    }));
    // Reajusta el contador de la próxima serie
    const ejId = ejerciciosDelDia[currentExerciseIndex]?.ejercicioId;
    if (ejId) {
      const log = ejercicioLogs.get(ejId);
      const remaining = (log?.series.length ?? 1) - 1;
      setCurrentSetNumber(remaining + 1);
    }
    setConfirmDeleteSerie(null);
    toast.success('Serie eliminada');
  };

  // Calcula el próximo número de serie de un ejercicio basándose en las
  // series ya registradas. Evita duplicar "Serie 1" al volver atrás.
  const nextSetNumberForExercise = (ejId: string) => {
    const log = ejercicioLogs.get(ejId);
    if (!log || log.series.length === 0) return 1;
    return Math.max(...log.series.map(s => s.numero)) + 1;
  };

  const handleSiguienteEjercicio = () => {
    if (currentExerciseIndex < ejerciciosDelDia.length - 1) {
      const nextEj = ejerciciosDelDia[currentExerciseIndex + 1];
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetNumber(nextSetNumberForExercise(nextEj.ejercicioId));
      setShowTimer(false);
      setPeso('');
      setEstimated1RM(null);
      setShowTechModal(false);
    } else {
      // Último ejercicio, finalizar entrenamiento
      handleFinalizarEntrenamiento();
    }
  };

  const handleAnteriorEjercicio = () => {
    if (currentExerciseIndex > 0) {
      const prevEj = ejerciciosDelDia[currentExerciseIndex - 1];
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSetNumber(nextSetNumberForExercise(prevEj.ejercicioId));
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
          totalEntrenamientos: (stats.totalEntrenamientos ?? stats.totalWorkouts ?? 0) + 1,
          totalWorkouts: (stats.totalWorkouts ?? stats.totalEntrenamientos ?? 0) + 1,
          volumenEsteMes: (stats.volumenEsteMes ?? 0) + volumenSesion,
          volumenTotalMovido: (stats.volumenTotalMovido ?? 0) + volumenSesion,
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
          <div className="flex items-center justify-between mt-2 text-sm opacity-90">
            <span>Ejercicio {currentExerciseIndex + 1} de {ejerciciosDelDia.length}</span>
            {(() => {
              const currentVolumen = getVolumenSesion({
                id: '', userId: '', fecha: new Date(),
                ejercicios: Array.from(ejercicioLogs.values()),
                completado: false,
              });
              if (currentVolumen <= 0) return null;
              return (
                <span className="font-semibold tabular-nums">
                  Volumen: {currentVolumen >= 1000 ? `${(currentVolumen / 1000).toFixed(1)}t` : `${Math.round(currentVolumen)} kg`}
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Tarjeta del ejercicio actual */}
        <Card className="mb-4 border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-2xl">
                    {ejercicioActual.ejercicio?.nombre}
                  </CardTitle>
                  {ejercicioActual.ejercicio?.tecnica && (
                    <button
                      onClick={() => setShowTechModal(true)}
                      className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors"
                      title="Ver técnica"
                    >
                      <Info className="w-4 h-4 text-primary" />
                    </button>
                  )}
                </div>
                <CardDescription className="text-base">
                  {ejercicioActual.ejercicio?.grupoMuscular} • {ejercicioActual.ejercicio?.categoria}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={ejercicioActual.ejercicio?.tier === 'S' ? 'success' : 'default'} className="text-lg px-3 py-1">
                  Tier {ejercicioActual.ejercicio?.tier}
                </Badge>
                {(() => {
                  const hits = affectedInjuries.filter(l =>
                    INJURY_AFFECTS[l.zona].includes(ejercicioActual.ejercicio?.grupoMuscular as GrupoMuscular)
                  );
                  if (hits.length === 0) return null;
                  const worst = hits.find(l => l.severidad === 'grave') ?? hits.find(l => l.severidad === 'moderada') ?? hits[0];
                  return (
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                      worst.severidad === 'grave'    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' :
                      worst.severidad === 'moderada' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' :
                                                       'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      {LESION_ZONA_LABELS[worst.zona]}
                    </div>
                  );
                })()}
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

            {/* Peso sugerido — ajustado por lesión si aplica */}
            {pesoSugerido && (() => {
              const hits = affectedInjuries.filter(l =>
                INJURY_AFFECTS[l.zona].includes(ejercicioActual.ejercicio?.grupoMuscular as GrupoMuscular)
              );
              const worst = hits.find(l => l.severidad === 'grave') ?? hits.find(l => l.severidad === 'moderada') ?? hits[0];
              const factor = worst?.severidad === 'grave' ? 0.4 : worst?.severidad === 'moderada' ? 0.55 : worst ? 0.7 : 1;
              const adjusted = factor < 1 ? Math.round(pesoSugerido * factor * 4) / 4 : pesoSugerido;
              const isInjured = factor < 1;
              return (
                <div className={`p-3 rounded-lg mb-4 border ${
                  isInjured
                    ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                }`}>
                  <p className={`text-sm font-medium ${isInjured ? 'text-orange-900 dark:text-orange-100' : 'text-blue-900 dark:text-blue-100'}`}>
                    💡 Peso sugerido: <span className="font-bold">{adjusted}kg</span>
                    {isInjured && <span className="ml-2 text-xs font-normal line-through opacity-50">{pesoSugerido}kg</span>}
                  </p>
                  {isInjured && (
                    <p className="text-xs mt-0.5 text-orange-700 dark:text-orange-300">
                      Reducido {Math.round((1 - factor) * 100)}% por lesión activa
                    </p>
                  )}
                </div>
              );
            })()}

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

            {/* Referencia última sesión */}
            {previousRef && (
              <div className="bg-muted/50 p-3 rounded-lg mb-4 border text-sm flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-xs text-muted-foreground">Última vez ({(() => {
                    const days = Math.round((Date.now() - previousRef.fecha.getTime()) / (24 * 60 * 60 * 1000));
                    return days === 0 ? 'hoy' : days === 1 ? 'ayer' : `hace ${days}d`;
                  })()})</p>
                  <p className="font-semibold">
                    {previousRef.peso}kg × {previousRef.reps} reps
                    <span className="text-xs text-muted-foreground ml-1">RIR {previousRef.rir}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {previousRef.best1RM > 0 && (
                    <Badge variant="outline" className="text-xs">
                      ⚡ Mejor 1RM: {previousRef.best1RM}kg
                    </Badge>
                  )}
                  {peso && parseFloat(peso) > previousRef.pesoMaxHistorico && previousRef.pesoMaxHistorico > 0 && (
                    <Badge variant="success" className="text-xs animate-pulse">
                      🏆 ¡Nuevo PR!
                    </Badge>
                  )}
                </div>
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

              {(() => {
                const setType = detectSetType(ejercicioActual.ejercicio);
                if (setType === 'TIME') {
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="tiempo" className="text-xs">Duración (segundos)</Label>
                        <Input
                          id="tiempo"
                          type="number"
                          inputMode="numeric"
                          value={tiempoSegundos}
                          onChange={(e) => setTiempoSegundos(e.target.value)}
                          placeholder="60"
                          className="text-lg font-semibold text-center h-14"
                          min="1"
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
                  );
                }
                if (setType === 'BODYWEIGHT') {
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="reps" className="text-xs">Repeticiones</Label>
                        <Input
                          id="reps"
                          type="number"
                          inputMode="numeric"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          placeholder={repsObjetivo.toString()}
                          className="text-lg font-semibold text-center h-14"
                          min="1"
                          max="50"
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
                  );
                }
                // WEIGHT: comportamiento por defecto (3 columnas)
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="reps" className="text-xs">Repeticiones</Label>
                      <Input
                        id="reps"
                        type="number"
                        inputMode="numeric"
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
                        inputMode="decimal"
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
                );
              })()}

              <Button
                onClick={handleRegistrarSerie}
                size="lg"
                className="w-full h-14 text-lg"
                disabled={(() => {
                  const t = detectSetType(ejercicioActual.ejercicio);
                  if (t === 'TIME') return !tiempoSegundos || parseInt(tiempoSegundos) <= 0;
                  if (t === 'BODYWEIGHT') return !reps;
                  return !reps || !peso;
                })()}
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
                      className="flex items-center justify-between gap-2 p-3 rounded-lg bg-accent/30 border"
                    >
                      <span className="font-medium shrink-0">Serie {serie.numero}</span>
                      <div className="text-sm flex-1 text-right">
                        {serie.tipo === 'TIME' ? (
                          <span className="font-semibold">{serie.tiempoSegundos}s</span>
                        ) : serie.tipo === 'BODYWEIGHT' ? (
                          <span className="font-semibold">{serie.repeticiones} reps (PC)</span>
                        ) : (
                          <>
                            <span className="font-semibold">{serie.repeticiones} reps</span>
                            {' × '}
                            <span className="font-semibold">{serie.peso}kg</span>
                          </>
                        )}
                        {' • '}
                        <span className="text-muted-foreground">RIR {serie.RIR}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingSerie(serie)}
                          title="Editar serie"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setConfirmDeleteSerie(serie)}
                          title="Borrar serie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notas del ejercicio */}
            <div className="mt-6">
              <details className="group">
                <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none flex items-center gap-1">
                  <span className="group-open:hidden">+ Añadir notas</span>
                  <span className="hidden group-open:inline">− Notas del ejercicio</span>
                  {ejercicioLog?.notas && <span className="text-primary">●</span>}
                </summary>
                <textarea
                  className="mt-2 w-full text-sm p-2 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="Sensaciones, ajustes técnicos, etc."
                  value={ejercicioLog?.notas ?? ''}
                  onChange={(e) => {
                    const notasValue = e.target.value;
                    setEjercicioLogs(prev => {
                      const next = new Map(prev);
                      const existing = next.get(ejercicioActual.ejercicioId) ?? {
                        ejercicioId: ejercicioActual.ejercicioId,
                        ejercicio: ejercicioActual.ejercicio,
                        series: [],
                        tecnicaCorrecta: true,
                        sensacionMuscular: 3 as const,
                      };
                      next.set(ejercicioActual.ejercicioId, { ...existing, notas: notasValue });
                      return next;
                    });
                  }}
                />
              </details>
            </div>
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

      {/* Rehabilitación */}
      {affectedInjuries.length > 0 && (
        <div className="mt-4">
          <button
            className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 w-full justify-center py-2 border border-orange-200 dark:border-orange-800 rounded-xl bg-orange-50/50 dark:bg-orange-950/20"
            onClick={() => setShowRehabSection(!showRehabSection)}
          >
            <Heart className="w-4 h-4" />
            Plan de Rehabilitación
            {showRehabSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRehabSection && (
            <div className="space-y-3 mt-3">
              {affectedInjuries.map(lesion => (
                <div key={lesion.id}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    {LESION_ZONA_LABELS[lesion.zona]}
                  </p>
                  {REHAB_EXERCISES[lesion.zona].map((ex, idx) => (
                    <Card key={idx} className="mb-2 border-orange-200 dark:border-orange-800">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{ex.nombre}</p>
                          <span className="text-xs text-muted-foreground font-medium">{ex.series}×{ex.reps}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{ex.musculo}</p>
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2.5">
                          <p className="text-xs leading-relaxed">{ex.notas}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cardio post-entreno */}
      {currentUser && (() => {
        const somatotipo = currentUser.somatotipo ?? 'mesomorfo';
        const rec = CARDIO_RECOMENDACIONES[somatotipo];
        if (rec.momento !== 'despues') return null;
        return (
          <div className="mt-4">
            <CardioPanel
              userId={currentUser.id}
              workoutId={activeWorkout?.id}
              somatotipo={somatotipo}
              momento="despues"
            />
          </div>
        );
      })()}

      {/* Modal técnica del ejercicio */}
      {showTechModal && ejercicioActual.ejercicio?.tecnica && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b shrink-0">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Técnica</p>
                <h2 className="font-bold text-lg leading-tight">{ejercicioActual.ejercicio.nombre}</h2>
              </div>
              <button
                onClick={() => setShowTechModal(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {/* Video de YouTube si está disponible */}
              {(() => {
                const video = getVideoForExercise(ejercicioActual.ejercicioId, ejercicioActual.ejercicio);
                if (!video?.youtubeId) return null;
                return (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      🎥 {video.title}
                    </p>
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                        title={video.title}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Posición inicial */}
              {ejercicioActual.ejercicio.tecnica.posicionInicial && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Posición inicial
                  </p>
                  <p className="text-sm leading-relaxed">{ejercicioActual.ejercicio.tecnica.posicionInicial}</p>
                </div>
              )}

              {/* Ejecución paso a paso */}
              {ejercicioActual.ejercicio.tecnica.ejecucion?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Ejecución
                  </p>
                  <ol className="space-y-2">
                    {ejercicioActual.ejercicio.tecnica.ejecucion.map((paso, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{paso}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Errores comunes */}
              {ejercicioActual.ejercicio.tecnica.erroresComunes?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Errores comunes
                  </p>
                  <ul className="space-y-1.5">
                    {ejercicioActual.ejercicio.tecnica.erroresComunes.map((err, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed text-muted-foreground">{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Consejos clave */}
              {ejercicioActual.ejercicio.tecnica.consejosClave?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Consejos clave
                  </p>
                  <ul className="space-y-1.5">
                    {ejercicioActual.ejercicio.tecnica.consejosClave.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Músculos enfocados */}
              {ejercicioActual.ejercicio.enfoqueMuscular?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Músculos trabajados
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ejercicioActual.ejercicio.enfoqueMuscular.map(m => (
                      <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t shrink-0">
              <button
                onClick={() => setShowTechModal(false)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                Entendido, a entrenar
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Editar serie */}
      <EditSerieDialog
        open={editingSerie !== null}
        onOpenChange={(open) => { if (!open) setEditingSerie(null); }}
        serie={editingSerie}
        onSave={handleEditSerie}
      />

      {/* Confirmar borrado de serie */}
      <ConfirmDialog
        open={confirmDeleteSerie !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteSerie(null); }}
        title={`¿Borrar Serie ${confirmDeleteSerie?.numero ?? ''}?`}
        description={confirmDeleteSerie ? (
          confirmDeleteSerie.tipo === 'TIME'
            ? <>Vas a borrar la serie de <strong>{confirmDeleteSerie.tiempoSegundos}s</strong>. Las restantes se renumeran automáticamente.</>
            : <>Vas a borrar la serie de <strong>{confirmDeleteSerie.repeticiones} reps × {confirmDeleteSerie.peso}kg</strong>. Las restantes se renumeran automáticamente.</>
        ) : null}
        confirmLabel="Borrar"
        onConfirm={performDeleteSerie}
      />
    </div>
  );
}
