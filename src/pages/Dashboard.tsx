import { useEffect, useState, useRef, useCallback, memo } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { WeeklyOverride } from '@/store';
import type { RutinaSemanal, WorkoutLog, ProgressPhoto, DiaRutina } from '@/types';
import { inferirSiguienteDia } from '@/utils/workoutInference';
import { Dumbbell, TrendingUp, Award, Flame, ChevronRight, Trophy, Calendar, Plus, Share2, Camera, RefreshCw, CheckCircle, RotateCcw } from 'lucide-react';
import StatsShareCard from '@/components/StatsShareCard';
import InjuryPanel from '@/components/InjuryPanel';
import { ID } from 'appwrite';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

// ─── Weekly Timeline ──────────────────────────────────────────────────────────

const MUSCLE_IMAGES: Record<string, string> = {
  pecho: '/images/muscles/chest.png',
  espalda: '/images/muscles/back.png',
  piernas: '/images/muscles/legs.png',
  hombros: '/images/muscles/shoulders.png',
  biceps: '/images/muscles/biceps.png',
  triceps: '/images/muscles/triceps.png',
  abdominales: '/images/muscles/abs.png',
  femorales_gluteos: '/images/muscles/glutes.png',
  antebrazos: '/images/muscles/forearms.png',
};

const isTrainingDay = (dayOfWeek: number, totalDays: number) => {
  switch (totalDays) {
    case 3: return [0, 2, 4].includes(dayOfWeek); // L, X, V
    case 4: return [0, 1, 3, 4].includes(dayOfWeek); // L, M, J, V
    case 5: return [0, 1, 2, 3, 4].includes(dayOfWeek); // L-V
    case 6: return [0, 1, 2, 3, 4, 5].includes(dayOfWeek); // L-S
    default: return true;
  }
};

export function getWeekKey(date: Date = new Date()): string {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

type WeekDay = {
  label: string;
  date: Date;
  isToday: boolean;
  isPast: boolean;
  trained: boolean;
  isRest: boolean;
  routineDay: DiaRutina | null;
  muscleImages: string[];
};

// ─── DayCell ─────────────────────────────────────────────────────────────────

interface DayCellProps extends WeekDay {
  i: number;
  isOverrideFrom: boolean;
  isOverrideTo: boolean;
  canDrag: boolean;
}

const DayCell = memo(function DayCell({
  i, label, isToday, isPast, trained, isRest,
  routineDay, muscleImages,
  isOverrideFrom, isOverrideTo, canDrag,
}: DayCellProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${i}`,
    disabled: trained,
  });
  const {
    attributes, listeners,
    setNodeRef: setDragRef,
    isDragging,
    transform,
  } = useDraggable({
    id: `day-${i}`,
    disabled: !canDrag,
  });

  const ref = useCallback((node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  }, [setDragRef, setDropRef]);

  const style: CSSProperties = {
    // Prevents the browser from stealing the touch for scrolling on mobile
    touchAction: canDrag ? 'none' : 'auto',
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50, position: 'relative' as const }
      : {}),
  };

  const cellClass = [
    'relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all overflow-hidden select-none',
    canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
    isDragging ? 'opacity-30 ring-2 ring-primary scale-95' :
    isOver ? 'ring-2 ring-primary/80 ring-offset-1 bg-primary/15 scale-105' :
    isOverrideFrom ? 'opacity-40 bg-amber-100 dark:bg-amber-950/30 border-2 border-dashed border-amber-400/60' :
    isOverrideTo ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/20' :
    isToday && !trained ? 'ring-2 ring-primary ring-offset-2 bg-primary/10' :
    trained ? 'bg-green-500/20' :
    isRest ? 'bg-muted/30 border-dashed border border-muted-foreground/20' :
    'bg-muted/50',
  ].join(' ');

  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <div ref={ref} style={style} className={cellClass} {...attributes} {...listeners}>
        {isOverrideFrom ? (
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-normal text-center leading-tight px-0.5">
            Movido
          </span>
        ) : isRest && !trained && !isOverrideTo ? (
          <span className="text-[10px] text-muted-foreground/40 font-normal">Zzz</span>
        ) : muscleImages.length > 0 ? (
          <div className={`w-full h-full p-0.5 grid gap-0.5 ${muscleImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2 grid-rows-2'}`}>
            {muscleImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Muscle"
                className={`w-full h-full object-cover ${
                  trained ? 'opacity-100 scale-105 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                  isPast ? 'opacity-50 grayscale hover:opacity-80 hover:grayscale-0 transition-all' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all'
                } ${muscleImages.length === 3 && idx === 2 ? 'row-span-2 col-start-2 row-start-1' : ''
                } ${muscleImages.length === 2 && (idx === 0 || idx === 1) ? 'row-span-2' : ''}`}
              />
            ))}
            {trained && (
              <div className="absolute inset-0 bg-green-500/10 flex items-end justify-end p-0.5">
                <CheckCircle className="w-2.5 h-2.5 text-green-500 drop-shadow-md bg-white rounded-full" />
              </div>
            )}
          </div>
        ) : (
          <span className={trained ? 'text-green-500' : isToday ? 'text-primary' : 'text-muted-foreground/50'}>
            {trained ? '✓' : isToday ? '→' : '·'}
          </span>
        )}
      </div>
      {isOverrideFrom ? (
        <span className="text-[9px] text-amber-500 italic">Movido</span>
      ) : isRest && !trained && !isOverrideTo ? (
        <span className="text-[9px] text-muted-foreground/60 italic">Descanso</span>
      ) : routineDay ? (
        <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full">
          {routineDay.nombre.split(' ')[0]}
        </span>
      ) : null}
    </div>
  );
});

// ─── Week computation & override helpers (module-level so banner + drag share them)

function computeWeek(
  routine: RutinaSemanal | null,
  workouts: WorkoutLog[],
  nextDay: DiaRutina | null,
): { week: WeekDay[]; diasRutina: DiaRutina[] } {
  const today = new Date();
  const todayWeekIndex = (today.getDay() + 6) % 7;
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const dayMs = 24 * 60 * 60 * 1000;

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const totalDays = routine?.diasPorSemana || routine?.dias?.length || 4;
  const diasRutina = routine?.dias ?? [];

  let anchorWeekIdx = todayWeekIndex;
  if (!isTrainingDay(todayWeekIndex, totalDays)) {
    for (let k = 1; k <= 7; k++) {
      const idx = (todayWeekIndex + k) % 7;
      if (isTrainingDay(idx, totalDays)) { anchorWeekIdx = idx; break; }
    }
  }
  const anchorRoutineIdx = nextDay
    ? diasRutina.findIndex(d => d.id === nextDay.id)
    : -1;

  const week: WeekDay[] = days.map((label, i) => {
    const date = new Date(monday.getTime() + i * dayMs);
    const dateStr = date.toDateString();
    const isToday = i === todayWeekIndex;
    const isPast = !isToday && date < today;

    const workoutDelDia = workouts.find(w => new Date(w.fecha).toDateString() === dateStr);
    const trained = !!workoutDelDia;
    const isRest = !isTrainingDay(i, totalDays);

    let routineDay: DiaRutina | null = null;
    if (!isRest && anchorRoutineIdx !== -1 && diasRutina.length > 0) {
      let offset = 0;
      if (i < anchorWeekIdx) {
        for (let j = i; j < anchorWeekIdx; j++) {
          if (isTrainingDay(j, totalDays)) offset--;
        }
      } else if (i > anchorWeekIdx) {
        for (let j = anchorWeekIdx + 1; j <= i; j++) {
          if (isTrainingDay(j, totalDays)) offset++;
        }
      }
      const len = diasRutina.length;
      routineDay = diasRutina[((anchorRoutineIdx + offset) % len + len) % len];
    }

    let dailyMuscles: string[] = [];
    if (trained && workoutDelDia) {
      const rd = diasRutina.find(d => d.id === workoutDelDia.diaRutinaId);
      if (rd?.grupos?.length > 0) {
        dailyMuscles = rd.grupos;
      } else {
        dailyMuscles = [...new Set(
          (workoutDelDia.ejercicios ?? [])
            .map(e => e.ejercicio?.grupoMuscular)
            .filter(Boolean) as string[]
        )];
      }
      // Fallback: use scheduled routineDay when workout log has no muscle data
      if (dailyMuscles.length === 0 && routineDay) {
        if (routineDay.grupos?.length > 0) {
          dailyMuscles = routineDay.grupos;
        } else {
          dailyMuscles = [...new Set(
            (routineDay.ejercicios ?? [])
              .map(e => e.ejercicio?.grupoMuscular)
              .filter(Boolean) as string[]
          )];
        }
      }
    } else if (routineDay) {
      if (routineDay.grupos?.length > 0) {
        dailyMuscles = routineDay.grupos;
      } else {
        dailyMuscles = [...new Set(
          (routineDay.ejercicios ?? [])
            .map(e => e.ejercicio?.grupoMuscular)
            .filter(Boolean) as string[]
        )];
      }
    }

    const muscleImages = dailyMuscles.map(m => MUSCLE_IMAGES[m]).filter(Boolean).slice(0, 4);
    return { label, date, isToday, isPast, trained, isRest, routineDay, muscleImages };
  });

  return { week, diasRutina };
}

function getMusclesForDay(
  i: number,
  week: WeekDay[],
  diasRutina: DiaRutina[],
  pendingAssignments: Record<number, string>,
): Set<string> {
  if (i < 0 || i > 6) return new Set();
  const assignedId = pendingAssignments[i];
  if (assignedId) {
    const rd = diasRutina.find(d => d.id === assignedId);
    return new Set(rd?.grupos ?? []);
  }
  return new Set(week[i]?.routineDay?.grupos ?? []);
}

function findCascadeTarget(
  week: WeekDay[],
  diasRutina: DiaRutina[],
  afterIdx: number,
  displaced: number[],
  pendingAssignments: Record<number, string>,
  routineDay: DiaRutina,
): number | null {
  const muscles = new Set(routineDay.grupos ?? []);
  const candidates: number[] = [];
  for (let i = afterIdx + 1; i <= 6; i++) {
    const d = week[i];
    if (!d || d.trained) continue;
    if (pendingAssignments[i] !== undefined) continue;
    if (d.isRest || displaced.includes(i)) candidates.push(i);
  }
  for (const c of candidates) {
    const prev = getMusclesForDay(c - 1, week, diasRutina, pendingAssignments);
    const next = getMusclesForDay(c + 1, week, diasRutina, pendingAssignments);
    const conflict = [...muscles].some(m => prev.has(m) || next.has(m));
    if (!conflict) return c;
  }
  return candidates[0] ?? null;
}

/**
 * Apply a single day move (fromIdx → toIdx) to a WeeklyOverride.
 * Cascades any workout originally on `toIdx` to the next available rest day,
 * preferring slots without same-muscle-group on adjacent days.
 */
export function applyMoveToOverride(
  week: WeekDay[],
  diasRutina: DiaRutina[],
  fromIdx: number,
  toIdx: number,
  current: WeeklyOverride,
  weekKey: string,
): WeeklyOverride {
  if (fromIdx === toIdx) return current;

  // What routine sits on fromIdx right now? (override assignment > original)
  const sourceRoutineId = current?.assignments[fromIdx]
    ?? week[fromIdx]?.routineDay?.id;
  if (!sourceRoutineId) return current;

  const newAssignments: Record<number, string> = { ...(current?.assignments ?? {}) };
  const newDisplaced: number[] = [...(current?.displaced ?? [])];

  // Move source onto target
  newAssignments[toIdx] = sourceRoutineId;
  delete newAssignments[fromIdx]; // fromIdx no longer holds a routine
  if (!newDisplaced.includes(fromIdx)) newDisplaced.push(fromIdx);
  // toIdx is no longer "displaced" — it now has a workout
  const dispIdx = newDisplaced.indexOf(toIdx);
  if (dispIdx !== -1) newDisplaced.splice(dispIdx, 1);

  // What was on toIdx before this move? Could be original routine OR a previous override
  const previousOnTargetId = current?.assignments[toIdx] ?? week[toIdx]?.routineDay?.id;
  const wasTrainingSlot = previousOnTargetId
    && !week[toIdx]?.trained
    && (current?.assignments[toIdx] !== undefined || !week[toIdx]?.isRest);

  // Only cascade if this routine isn't already placed somewhere else in the week
  const alreadyPlacedElsewhere = previousOnTargetId
    && Object.values(newAssignments).includes(previousOnTargetId);

  if (wasTrainingSlot && previousOnTargetId && !alreadyPlacedElsewhere) {
    const previousRoutine = diasRutina.find(d => d.id === previousOnTargetId);
    if (previousRoutine) {
      const cascadeIdx = findCascadeTarget(
        week, diasRutina, toIdx, newDisplaced, newAssignments, previousRoutine
      );
      if (cascadeIdx !== null) {
        newAssignments[cascadeIdx] = previousRoutine.id;
        const cIdx = newDisplaced.indexOf(cascadeIdx);
        if (cIdx !== -1) newDisplaced.splice(cIdx, 1);
      }
    }
  }

  return { assignments: newAssignments, displaced: newDisplaced, weekKey };
}

// ─── WeeklyTimeline ───────────────────────────────────────────────────────────

function WeeklyTimeline({
  week,
  diasRutina,
  weeklyOverride,
  onOverrideChange,
  weekKey,
}: {
  week: WeekDay[];
  diasRutina: DiaRutina[];
  weeklyOverride: WeeklyOverride;
  onOverrideChange: (o: WeeklyOverride) => void;
  weekKey: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const fromIdx = parseInt((active.id as string).replace('day-', ''));
    const toIdx = parseInt((over.id as string).replace('drop-', ''));
    if (isNaN(fromIdx) || isNaN(toIdx)) return;
    const next = applyMoveToOverride(week, diasRutina, fromIdx, toIdx, weeklyOverride, weekKey);
    onOverrideChange(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <div className="flex gap-1.5 justify-between mt-4">
        {week.map((day, i) => {
          const isOverrideFrom = weeklyOverride?.displaced.includes(i) ?? false;
          const assignedId = weeklyOverride?.assignments[i];
          const isOverrideTo = assignedId !== undefined;

          // Resolve display routine: override assignment takes priority
          let displayRoutineDay = day.routineDay;
          let displayMuscleImages = day.muscleImages;
          if (isOverrideTo && assignedId) {
            const rd = diasRutina.find(d => d.id === assignedId);
            if (rd) {
              displayRoutineDay = rd;
              const muscles = rd.grupos?.length
                ? rd.grupos
                : [...new Set((rd.ejercicios ?? []).map(e => e.ejercicio?.grupoMuscular).filter(Boolean) as string[])];
              displayMuscleImages = muscles.map(m => MUSCLE_IMAGES[m]).filter(Boolean).slice(0, 4);
            }
          }

          const canDrag = !day.trained && (!!displayRoutineDay) && !isOverrideFrom;

          return (
            <DayCell
              key={i}
              i={i}
              {...day}
              routineDay={displayRoutineDay}
              muscleImages={displayMuscleImages}
              isOverrideFrom={isOverrideFrom}
              isOverrideTo={isOverrideTo}
              canDrag={canDrag}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

// ─── TrainAnywayButton ────────────────────────────────────────────────────────
// Shown on rest days. Asks which routine day to do before starting.

function TrainAnywayButton({
  diasRutina,
  onSelect,
}: {
  diasRutina: DiaRutina[];
  onSelect: (diaId: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const available = diasRutina.filter(d => d.ejercicios.length > 0);

  if (!picking) {
    return (
      <Button variant="outline" size="lg" className="w-full" onClick={() => setPicking(true)}>
        Entrenar de todos modos
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground text-center">¿Qué día de la rutina quieres hacer?</p>
      {available.map(dia => (
        <Button
          key={dia.id}
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => onSelect(dia.id)}
        >
          <Dumbbell className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{dia.nombre}</span>
          {dia.grupos?.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto shrink-0">
              {dia.grupos.slice(0, 2).join(', ')}
            </span>
          )}
        </Button>
      ))}
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setPicking(false)}>
        Cancelar
      </Button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    currentUser, statistics, setStatistics,
    setActiveRoutine: setStoreRoutine,
    weeklyOverride, setWeeklyOverride,
  } = useAppStore();
  const [activeRoutine, setActiveRoutine] = useState<RutinaSemanal | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentWeekKey = getWeekKey();

  const loadDashboardData = async () => {
    if (!currentUser) return;
    try {
      const routine = await dbHelpers.getActiveRoutine(currentUser.id);
      setActiveRoutine(routine || null);
      setStoreRoutine(routine || null);

      const stats = await dbHelpers.getUserStatistics(currentUser.id);
      console.log('[Dashboard] stats:', stats);
      if (stats) setStatistics(stats);

      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 100);
      setRecentWorkouts(workouts.slice(0, 10));

      // Si hay workouts pero las stats muestran 0, recalcular desde IndexedDB
      if (workouts.length > 0) {
        const totalEnStats = stats?.totalEntrenamientos ?? stats?.totalWorkouts ?? 0;
        if (totalEnStats === 0) {
          const recalculadas = await dbHelpers.recalcularEstadisticas(currentUser.id);
          setStatistics(recalculadas as any);
        }
      }

      const ach = await dbHelpers.getUserAchievements(currentUser.id);
      setAchievements(ach.slice(0, 3));
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [currentUser]);

  // Clear override when a new week starts
  useEffect(() => {
    if (weeklyOverride && weeklyOverride.weekKey !== currentWeekKey) {
      setWeeklyOverride(null);
    }
  }, [currentWeekKey]);

  const handleQuickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const photo: ProgressPhoto = {
        id: ID.unique(),
        userId: currentUser.id,
        fecha: new Date(),
        tipo: 'frontal',
        url: ev.target?.result as string,
        peso: currentUser.pesoActual || currentUser.peso,
      };
      await dbHelpers.addProgressPhoto(photo);
      setPhotoSaved(true);
      setTimeout(() => setPhotoSaved(false), 2500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getNextWorkoutDay = () => {
    if (!activeRoutine?.dias?.length) return null;
    const activeDias = activeRoutine.dias.filter(d => d.ejercicios.length > 0);
    if (!activeDias.length) return null;

    const completados = recentWorkouts
      .filter(w => w.completado)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    if (!completados.length) return activeDias[0];

    return inferirSiguienteDia(activeDias, completados);
  };

  const nextDay = getNextWorkoutDay();

  // Compute week + diasRutina once for both timeline and banner cascade
  const { week, diasRutina } = computeWeek(activeRoutine, recentWorkouts, nextDay);

  // ¿Hoy toca entrenar o es día de descanso según el calendario semanal?
  const todayWeekIdx = (new Date().getDay() + 6) % 7;
  const totalTrainingDays = activeRoutine?.diasPorSemana || activeRoutine?.dias?.length || 0;

  // Override: if workout was assigned TO today, override rest day status
  const isOverrideActiveThisWeek = weeklyOverride?.weekKey === currentWeekKey;
  const todayAssignedId = isOverrideActiveThisWeek ? weeklyOverride?.assignments[todayWeekIdx] : undefined;
  const overrideMoveToToday = todayAssignedId !== undefined;

  const isRestToday = !!activeRoutine && totalTrainingDays > 0
    && !isTrainingDay(todayWeekIdx, totalTrainingDays)
    && !overrideMoveToToday;

  // If override assigned a routine day to today, use that as the effective next day
  const effectiveNextDay = overrideMoveToToday && activeRoutine
    ? (activeRoutine.dias.find(d => d.id === todayAssignedId) ?? nextDay)
    : nextDay;

  let nextTrainingWeekIdx = todayWeekIdx;
  if (isRestToday) {
    for (let k = 1; k <= 7; k++) {
      const idx = (todayWeekIdx + k) % 7;
      if (isTrainingDay(idx, totalTrainingDays)) { nextTrainingWeekIdx = idx; break; }
    }
  }
  const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const nextTrainingDayName = dayNames[nextTrainingWeekIdx];

  // Missed workout detection: yesterday was a training day but no workout logged
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayWeekIdx = (yesterday.getDay() + 6) % 7;
  const yesterdayWasTrainingDay = totalTrainingDays > 0 && isTrainingDay(yesterdayWeekIdx, totalTrainingDays);
  const trainedYesterday = recentWorkouts.some(
    w => new Date(w.fecha).toDateString() === yesterday.toDateString()
  );
  const showMissedBanner = !!activeRoutine
    && yesterdayWasTrainingDay
    && !trainedYesterday
    && !isOverrideActiveThisWeek;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Dumbbell className="w-10 h-10 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-5">

      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-3xl font-bold">{currentUser?.nombre || 'Atleta'} 👋</h1>
      </div>

      {/* Stats rápidas */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-muted-foreground">Esta semana</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5"
          onClick={() => setShowShareCard(true)}
        >
          <Share2 className="w-3 h-3" />
          Compartir
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-orange-500/40 bg-gradient-to-br from-orange-50 dark:from-orange-950/20">
          <CardContent className="pt-4 pb-3 px-3 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-600">{statistics?.rachaActual ?? 0}</div>
            <p className="text-xs text-muted-foreground">Racha actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-3 text-center">
            <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{statistics?.totalEntrenamientos ?? 0}</div>
            <p className="text-xs text-muted-foreground">Entrenos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-3 text-center">
            <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {statistics?.volumenEsteMes
                ? `${(statistics.volumenEsteMes / 1000).toFixed(1)}t`
                : '0t'}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Banner: entreno perdido ayer */}
      {showMissedBanner && (
        <Card className="border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/20">
          <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">😅</span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">Ayer no pudiste entrenar</p>
                <p className="text-xs text-muted-foreground">¿Recuperar el entreno hoy?</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-400 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 shrink-0"
              onClick={() => {
                if (!activeRoutine) return;
                const next = applyMoveToOverride(
                  week, diasRutina,
                  yesterdayWeekIdx, todayWeekIdx,
                  isOverrideActiveThisWeek ? weeklyOverride : null,
                  currentWeekKey,
                );
                setWeeklyOverride(next);
              }}
            >
              Recuperar hoy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Banner: override activo */}
      {isOverrideActiveThisWeek && (
        <Card className="border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/10">
          <CardContent className="py-2 px-4 flex items-center justify-between gap-2">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Entreno reprogramado para hoy
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={() => setWeeklyOverride(null)}
            >
              <RotateCcw className="w-3 h-3" />
              Deshacer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Entrenamiento de hoy */}
      <Card className="border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>
                {!effectiveNextDay
                  ? 'Sin rutina activa'
                  : isRestToday
                    ? '💤 Hoy descansas'
                    : effectiveNextDay.nombre}
              </CardTitle>
              <CardDescription>
                {!effectiveNextDay
                  ? 'Genera una rutina para empezar'
                  : isRestToday
                    ? <>Próximo entreno <span className="capitalize">{nextTrainingDayName}</span>: {effectiveNextDay.nombre}</>
                    : `${effectiveNextDay.ejercicios.length} ejercicios · ~${effectiveNextDay.duracionEstimada} min`}
              </CardDescription>
            </div>
            <Dumbbell className="w-8 h-8 text-primary/60 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {effectiveNextDay ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {effectiveNextDay.grupos?.map((g) => (
                  <Badge key={g} variant="secondary" className="capitalize">{g}</Badge>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {isRestToday ? (
                  <TrainAnywayButton
                    diasRutina={activeRoutine?.dias ?? []}
                    onSelect={(diaId) => {
                      setWeeklyOverride({
                        assignments: { [todayWeekIdx]: diaId },
                        displaced: [],
                        weekKey: currentWeekKey,
                      });
                      navigate('/workout-session');
                    }}
                  />
                ) : (
                  <Button onClick={() => navigate('/workout-session')} size="lg" className="w-full">
                    Comenzar Entrenamiento
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/routine-generator')}
                  className="w-full text-muted-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cambiar o generar nueva rutina
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={() => navigate('/routine-generator')} size="lg" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Generar Rutina Personalizada
            </Button>
          )}

          {/* Timeline semanal */}
          <WeeklyTimeline
            week={week}
            diasRutina={diasRutina}
            weeklyOverride={isOverrideActiveThisWeek ? weeklyOverride : null}
            onOverrideChange={setWeeklyOverride}
            weekKey={currentWeekKey}
          />
        </CardContent>
      </Card>

      {/* Logros recientes */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-base">Logros recientes</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="text-xs">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span className="text-2xl">{a.icono}</span>
                <div>
                  <p className="text-sm font-medium">{a.nombre ?? a.titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.descripcion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Entrenamientos recientes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Entrenamientos recientes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-2">
              {recentWorkouts.slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/workout/${w.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{w.diaRutina}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.fecha).toLocaleDateString('es-ES', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={w.completado ? 'success' : 'secondary'} className="text-xs">
                      {w.completado ? '✓' : '…'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{w.duracionReal}min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aún no hay entrenamientos registrados</p>
              <Button onClick={() => navigate('/workout-session')} variant="outline" size="sm">
                Empezar ahora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesiones activas */}
      {currentUser && <InjuryPanel userId={currentUser.id} />}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/exercises')}
        >
          <CardHeader className="py-4">
            <CardTitle className="text-sm">Ejercicios</CardTitle>
            <CardDescription className="text-xs">Biblioteca completa</CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/progress')}
        >
          <CardHeader className="py-4">
            <CardTitle className="text-sm">Progreso</CardTitle>
            <CardDescription className="text-xs">Estadísticas y evolución</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* FAB - Foto de progreso rápida */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleQuickPhoto}
      />
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center transition-transform active:scale-95 hover:opacity-90"
        title="Foto de progreso rápida"
      >
        <Camera className="w-6 h-6 text-primary-foreground" />
      </button>
      {photoSaved && (
        <div className="fixed bottom-36 right-4 z-50 bg-green-500 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-in slide-in-from-right">
          ✓ Foto guardada
        </div>
      )}

      {/* Tarjeta compartible */}
      {showShareCard && (() => {
        const now = new Date();
        const semanaNum = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000));
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const weekWorkouts = recentWorkouts.filter(w => new Date(w.fecha) >= monday);
        const weekVolume = weekWorkouts.reduce((t, w) =>
          t + w.ejercicios.reduce((s, e) =>
            s + e.series.reduce((r, sr) => r + sr.peso * sr.repeticiones, 0), 0), 0);
        const muscleCount: Record<string, number> = {};
        weekWorkouts.forEach(w =>
          w.ejercicios.forEach(e => {
            const m = e.ejercicio?.grupoMuscular;
            if (m) muscleCount[m] = (muscleCount[m] || 0) + 1;
          })
        );
        const musculosTop = Object.entries(muscleCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([m]) => m);

        return (
          <StatsShareCard
            nombre={currentUser?.nombre || 'Atleta'}
            semanaNum={semanaNum}
            entrenamientos={weekWorkouts.length}
            volumenKg={Math.round(weekVolume)}
            racha={statistics?.rachaActual ?? 0}
            musculosTop={musculosTop}
            onClose={() => setShowShareCard(false)}
          />
        );
      })()}
    </div>
  );
}
