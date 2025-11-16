import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { WorkoutLog } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function WorkoutCalendar() {
  const { currentUser } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, [currentUser, currentDate]);

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
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando calendario...</p>
        </CardContent>
      </Card>
    );
  }

  return (
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

              return (
                <div
                  key={day}
                  className={`
                    aspect-square relative rounded-lg border-2 p-1 transition-all
                    ${today ? 'border-primary bg-primary/5' : 'border-border'}
                    ${hasWorkout ? 'bg-green-50 dark:bg-green-950/20 border-green-500' : ''}
                    hover:shadow-md
                  `}
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
                      <div className="flex-1 flex items-center justify-center">
                        <Dumbbell className="w-3 h-3 text-green-600" />
                      </div>
                    )}

                    {dayWorkouts.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="flex gap-0.5 justify-center">
                          {dayWorkouts.slice(0, 3).map((w, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full bg-green-600"
                              title={w.diaRutina}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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

        {/* Stats del mes */}
        {workoutDays.size > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-3">Resumen del Mes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{workoutDays.size}</p>
                <p className="text-xs text-muted-foreground">días activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{workouts.length}</p>
                <p className="text-xs text-muted-foreground">entrenamientos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(workouts.reduce((sum, w) => sum + w.duracionReal, 0) / 60)}h
                </p>
                <p className="text-xs text-muted-foreground">tiempo total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {((workoutDays.size / daysInMonth) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">consistencia</p>
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
  );
}
