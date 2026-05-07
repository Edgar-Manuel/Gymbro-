import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WorkoutLog } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SENSACION_EMOJI: Record<number, string> = {
  1: '😫', 2: '😕', 3: '😐', 4: '💪', 5: '🔥'
};

interface Props {
  workouts: WorkoutLog[];
}

export default function RecentWorkoutsList({ workouts }: Props) {
  const navigate = useNavigate();
  const [visibles, setVisibles] = useState(5);
  const sorted = [...workouts].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const lista = sorted.slice(0, visibles);

  function calcVolumen(w: WorkoutLog) {
    return w.ejercicios.reduce((t, ej) =>
      t + ej.series.reduce((s, serie) => s + serie.peso * serie.repeticiones, 0), 0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrenamientos Recientes</CardTitle>
        <CardDescription>Últimas sesiones completadas</CardDescription>
      </CardHeader>
      <CardContent>
        {lista.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay entrenamientos registrados.</p>
        ) : (
          <div className="space-y-3">
            {lista.map(workout => {
              const vol = calcVolumen(workout);
              const sensacion = workout.sensacionGeneral ?? 3;
              const nombre = workout.diaRutina?.trim() || 'Entrenamiento libre';

              return (
                <div
                  key={workout.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => navigate(`/workout/${workout.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold truncate">{nombre}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.fecha).toLocaleDateString('es-ES', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-medium">{workout.duracionReal ?? workout.duracion ?? '?'} min</p>
                      <p className="text-xs text-muted-foreground">{workout.ejercicios.length} ejercicios</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg" title={`Sensación: ${sensacion}/5`}>
                        {SENSACION_EMOJI[sensacion] || '😐'} {sensacion}/5
                      </span>
                      {vol > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {(vol / 1000).toFixed(1)}t vol.
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {sorted.length > visibles && (
          <button
            onClick={() => setVisibles(v => v + 5)}
            className="w-full mt-4 py-2 text-sm text-primary hover:underline"
          >
            Cargar más ({sorted.length - visibles} restantes)
          </button>
        )}
      </CardContent>
    </Card>
  );
}
