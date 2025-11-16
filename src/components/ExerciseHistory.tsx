import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dbHelpers } from '@/db';
import type { ExerciseHistoryEntry } from '@/types';
import { TrendingUp, Calendar, Weight, BarChart3 } from 'lucide-react';

interface ExerciseHistoryProps {
  ejercicioId: string;
  ejercicioNombre: string;
  userId: string;
  onClose?: () => void;
}

export default function ExerciseHistory({ ejercicioId, ejercicioNombre, userId, onClose }: ExerciseHistoryProps) {
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [ejercicioId]);

  const loadHistory = async () => {
    try {
      const workouts = await dbHelpers.getWorkoutsByUser(userId, 50);

      const exerciseHistory: ExerciseHistoryEntry[] = [];

      for (const workout of workouts) {
        const ejercicioLog = workout.ejercicios.find(e => e.ejercicioId === ejercicioId);

        if (ejercicioLog && ejercicioLog.series.length > 0) {
          const pesoMaximo = Math.max(...ejercicioLog.series.map(s => s.peso));
          const volumenTotal = ejercicioLog.series.reduce((sum, s) => sum + (s.peso * s.repeticiones), 0);
          const repsPromedio = ejercicioLog.series.reduce((sum, s) => sum + s.repeticiones, 0) / ejercicioLog.series.length;

          exerciseHistory.push({
            fecha: workout.fecha,
            series: ejercicioLog.series,
            pesoMaximo,
            volumenTotal,
            repsPromedio,
            workoutId: workout.id
          });
        }
      }

      setHistory(exerciseHistory);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Cargando historial...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No hay historial para este ejercicio</p>
        </CardContent>
      </Card>
    );
  }

  const mejorPeso = Math.max(...history.map(h => h.pesoMaximo));
  const mejorVolumen = Math.max(...history.map(h => h.volumenTotal));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{ejercicioNombre}</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-accent/50 rounded-lg">
              <Weight className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{mejorPeso}kg</p>
              <p className="text-xs text-muted-foreground">Mejor Peso</p>
            </div>
            <div className="text-center p-3 bg-accent/50 rounded-lg">
              <BarChart3 className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{mejorVolumen.toFixed(0)}kg</p>
              <p className="text-xs text-muted-foreground">Mejor Volumen</p>
            </div>
            <div className="text-center p-3 bg-accent/50 rounded-lg">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-xs text-muted-foreground">Sesiones</p>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Historial reciente:</h3>
            {history.slice(0, 10).map((entry, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {new Date(entry.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {entry.series.length} series
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Peso Máx</p>
                      <p className="font-semibold">{entry.pesoMaximo}kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Volumen</p>
                      <p className="font-semibold">{entry.volumenTotal.toFixed(0)}kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reps Prom</p>
                      <p className="font-semibold">{entry.repsPromedio.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Series detail */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-2">
                      {entry.series.map((serie, sIdx) => (
                        <Badge key={sIdx} variant="secondary" className="text-xs">
                          {serie.repeticiones} × {serie.peso}kg
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {history.length > 10 && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Mostrando las 10 sesiones más recientes de {history.length} totales
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
