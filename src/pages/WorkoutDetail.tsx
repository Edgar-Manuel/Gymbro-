import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import type { WorkoutLog } from '@/types';
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Target,
  TrendingUp,
  Flame,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEx, setExpandedEx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    dbHelpers.getWorkoutById(id).then(w => {
      if (!w) navigate('/');
      else setWorkout(w);
      setLoading(false);
    });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Dumbbell className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (!workout) return null;

  const volumenTotal = workout.ejercicios.reduce((t, ej) =>
    t + ej.series.reduce((s, sr) => s + sr.peso * sr.repeticiones, 0), 0);
  const totalSeries = workout.ejercicios.reduce((t, ej) => t + ej.series.length, 0);
  const totalReps = workout.ejercicios.reduce((t, ej) =>
    t + ej.series.reduce((s, sr) => s + sr.repeticiones, 0), 0);

  let mejorSerie = { ejercicio: '', peso: 0, reps: 0 };
  workout.ejercicios.forEach(ej => {
    ej.series.forEach(sr => {
      if (sr.peso > mejorSerie.peso) {
        mejorSerie = { ejercicio: ej.ejercicio?.nombre || '', peso: sr.peso, reps: sr.repeticiones };
      }
    });
  });

  const fecha = new Date(workout.fecha);
  const fechaLabel = fecha.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg truncate">{workout.diaRutina || 'Entrenamiento'}</h1>
          <p className="text-xs text-muted-foreground capitalize">{fechaLabel}</p>
        </div>
        <Badge variant={workout.completado ? 'success' : 'secondary'} className="shrink-0">
          {workout.completado ? '✓ Completado' : 'Parcial'}
        </Badge>
      </div>

      <div className="container mx-auto px-4 max-w-2xl pt-4 space-y-4">
        {/* Stats rápidas */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Clock, value: `${workout.duracionReal}`, unit: 'min', color: 'text-blue-500' },
            { icon: Dumbbell, value: volumenTotal >= 1000 ? `${(volumenTotal/1000).toFixed(1)}t` : `${volumenTotal.toLocaleString()}`, unit: 'kg vol', color: 'text-green-500' },
            { icon: Target, value: `${totalSeries}`, unit: 'series', color: 'text-purple-500' },
            { icon: TrendingUp, value: `${totalReps}`, unit: 'reps', color: 'text-orange-500' },
          ].map(({ icon: Icon, value, unit, color }) => (
            <Card key={unit}>
              <CardContent className="pt-4 pb-3 text-center px-2">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{unit}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mejor serie */}
        {mejorSerie.peso > 0 && (
          <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="py-3 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">Serie más pesada</p>
                <p className="font-bold">{mejorSerie.ejercicio}</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {mejorSerie.peso} kg × {mejorSerie.reps} reps
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ejercicios */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              {workout.ejercicios.length} ejercicios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {workout.ejercicios.map((ej, idx) => {
              const volEj = ej.series.reduce((s, sr) => s + sr.peso * sr.repeticiones, 0);
              const pesoMax = Math.max(...ej.series.map(s => s.peso));
              const isOpen = expandedEx === idx;

              return (
                <div key={idx} className="border rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors text-left"
                    onClick={() => setExpandedEx(isOpen ? null : idx)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{ej.ejercicio?.nombre || `Ejercicio ${idx + 1}`}</span>
                        {ej.ejercicio?.tier && (
                          <Badge variant={ej.ejercicio.tier === 'S' ? 'success' : 'outline'} className="text-[10px] h-4">
                            {ej.ejercicio.tier}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ej.series.length} series · {pesoMax} kg máx · {volEj.toLocaleString()} kg vol
                      </p>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    }
                  </button>

                  {isOpen && (
                    <div className="border-t bg-muted/30 divide-y">
                      {ej.series.map((sr, si) => (
                        <div key={si} className="flex items-center justify-between px-4 py-2 text-sm">
                          <span className="text-muted-foreground w-14">Serie {sr.numero}</span>
                          <span className={`font-semibold ${sr.peso === pesoMax ? 'text-primary' : ''}`}>
                            {sr.peso} kg
                          </span>
                          <span className="text-muted-foreground">×</span>
                          <span className="font-medium">{sr.repeticiones} reps</span>
                          <span className="text-xs text-muted-foreground">RIR {sr.RIR}</span>
                          {sr.peso === pesoMax && <Trophy className="w-3 h-3 text-yellow-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {workout.notas && (
          <Card>
            <CardContent className="py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notas</p>
              <p className="text-sm">{workout.notas}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
