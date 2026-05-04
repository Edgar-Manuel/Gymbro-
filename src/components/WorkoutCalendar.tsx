import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { WorkoutLog } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, ChevronRight as ChevronRightIcon } from 'lucide-react';
import WorkoutHeatmap from './WorkoutHeatmap';
import { getVolumenSesion, getGruposMuscularesEntrenados } from '@/utils/exerciseUtils';

const GRUPO_ABREV: Record<string, string> = {
  pecho: 'Pec',
  espalda: 'Esp',
  piernas: 'Pier',
  hombros: 'Hom',
  biceps: 'Bic',
  triceps: 'Tric',
  abdominales: 'Core',
  antebrazos: 'Ant',
  femorales_gluteos: 'Glút',
};

function abreviacionGrupos(workout: WorkoutLog): string | null {
  const grupos = getGruposMuscularesEntrenados(workout);
  if (grupos.length === 0) return null;
  // Toma los primeros 2 grupos abreviados
  return grupos.slice(0, 2).map(g => GRUPO_ABREV[g] ?? g.slice(0, 3)).join('·');
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function WorkoutCalendar() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<WorkoutLog[] | null>(null);
  const [yearWorkouts, setYearWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, [currentUser, currentDate]);

  useEffect(() => {
    loadYearWorkouts();
  }, [currentUser]);

  const loadYearWorkouts = async () => {
    if (!currentUser) return;
    try {
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      const data = await dbHelpers.getWorkoutsByDateRange(currentUser.id, start, end);
      setYearWorkouts(data);
    } catch (error) {
      console.error('Error cargando workouts del año:', error);
    } finally {
      setYearLoading(false);
    }
  };

  const loadWorkouts = async () => {
    if (!currentUser) return;

    try {
      // Cargar workouts del mes actual
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const monthWorkouts = await dbHelpers.getWorkoutsByDateRange(
        currentUser.id,
        startDate,
        endDate
      );

      setWorkouts(monthWorkouts);
    } catch (error) {
      console.error('Error cargando workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getWorkoutsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return workouts.filter(w => {
      const workoutDate = new Date(w.fecha);
      return workoutDate.getDate() === day &&
             workoutDate.getMonth() === month &&
             workoutDate.getFullYear() === year;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // Crear array de días para renderizar
  const calendarDays: (number | null)[] = [];

  // Espacios en blanco antes del primer día
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Calcular streak del mes
  const workoutDays = new Set(
    workouts.map(w => new Date(w.fecha).getDate())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[140px] rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-8">
            <Skeleton className="h-[300px] rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Heatmap anual */}
      <WorkoutHeatmap workouts={yearWorkouts} loading={yearLoading} />

      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario de Entrenamientos
            </CardTitle>
            <CardDescription>
              {workoutDays.size} días entrenados este mes
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Navegación del mes */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <h3 className="font-bold text-lg">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Hoy
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendario */}
        <div className="space-y-2">
          {/* Encabezado días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayWorkouts = getWorkoutsForDay(day);
              const hasWorkout = dayWorkouts.length > 0;
              const today = isToday(day);

              const abrev = hasWorkout ? abreviacionGrupos(dayWorkouts[0]) : null;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => hasWorkout && setSelectedDayWorkouts(dayWorkouts)}
                  disabled={!hasWorkout}
                  className={`
                    aspect-square relative rounded-lg border-2 p-1 transition-all text-left
                    ${today ? 'border-primary bg-primary/5' : 'border-border'}
                    ${hasWorkout ? 'bg-green-50 dark:bg-green-950/20 border-green-500 hover:shadow-md cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-950/30' : 'cursor-default'}
                  `}
                  title={hasWorkout ? `${dayWorkouts.length} ${dayWorkouts.length === 1 ? 'entrenamiento' : 'entrenamientos'} — clic para ver detalle` : undefined}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-xs font-semibold
                      ${today ? 'text-primary' : ''}
                      ${hasWorkout ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}
                    `}>
                      {day}
                    </span>

                    {hasWorkout && (
                      <>
                        <div className="flex-1 flex items-center justify-center">
                          <Dumbbell className="w-3 h-3 text-green-600" />
                        </div>
                        {abrev && (
                          <span className="text-[8px] font-medium text-green-700 dark:text-green-300 text-center leading-tight truncate">
                            {abrev}
                          </span>
                        )}
                      </>
                    )}

                    {dayWorkouts.length > 1 && (
                      <div className="absolute top-0.5 right-0.5">
                        <span className="bg-green-600 text-white text-[8px] font-bold rounded-full px-1 leading-tight">
                          {dayWorkouts.length}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary/5" />
            <span className="text-muted-foreground">Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <Dumbbell className="w-2 h-2 text-green-600" />
            </div>
            <span className="text-muted-foreground">Entrenamiento</span>
          </div>
        </div>

        {/* Stats del mes con donut */}
        {workoutDays.size > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-3">Resumen del Mes</h4>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Donut: días activos vs descanso */}
              <div className="w-24 h-24 shrink-0 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Activos', value: workoutDays.size },
                        { name: 'Descanso', value: Math.max(0, daysInMonth - workoutDays.size) },
                      ]}
                      dataKey="value"
                      innerRadius={28}
                      outerRadius={42}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-bold leading-none">
                    {((workoutDays.size / daysInMonth) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <p className="text-2xl font-bold text-green-600">{workoutDays.size}</p>
                  <p className="text-xs text-muted-foreground">días activos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">{Math.max(0, daysInMonth - workoutDays.size)}</p>
                  <p className="text-xs text-muted-foreground">días de descanso</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{workouts.length}</p>
                  <p className="text-xs text-muted-foreground">entrenamientos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(workouts.reduce((sum, w) => sum + (w.duracionReal ?? w.duracion ?? 0), 0) / 60)}h
                  </p>
                  <p className="text-xs text-muted-foreground">tiempo total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workouts recientes del mes seleccionado */}
        {workouts.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Entrenamientos Recientes</h4>
            <div className="space-y-2">
              {workouts.slice(0, 5).map(workout => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{workout.diaRutina}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workout.fecha).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workout.completado ? 'success' : 'secondary'} className="text-xs">
                      {workout.duracionReal}min
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {workouts.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No hay entrenamientos registrados en {MONTHS[currentDate.getMonth()]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Dialog: detalle del día seleccionado */}
    <Dialog open={selectedDayWorkouts !== null} onOpenChange={(open) => { if (!open) setSelectedDayWorkouts(null); }}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedDayWorkouts && selectedDayWorkouts.length > 0 && (
              new Date(selectedDayWorkouts[0].fecha).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedDayWorkouts?.length === 1
              ? '1 entrenamiento'
              : `${selectedDayWorkouts?.length} entrenamientos`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {selectedDayWorkouts?.map((w) => {
            const grupos = getGruposMuscularesEntrenados(w);
            const volumen = getVolumenSesion(w);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setSelectedDayWorkouts(null);
                  navigate(`/workout/${w.id}`);
                }}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">
                      {w.diaRutina?.trim() || 'Entrenamiento libre'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.ejercicios.length} ejercicios · {w.duracionReal ?? w.duracion ?? '?'} min
                      {volumen > 0 && ` · ${(volumen / 1000).toFixed(1)}t volumen`}
                    </p>
                    {grupos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {grupos.map(g => (
                          <Badge key={g} variant="secondary" className="text-[10px] capitalize">
                            {g.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
