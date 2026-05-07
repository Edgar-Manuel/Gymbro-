import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Zap,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Epley 1RM estimate — most reliable for 1-15 reps
const epley = (peso: number, reps: number): number => {
  if (reps <= 0) return peso;
  if (reps === 1) return peso;
  return Math.round(peso * (1 + reps / 30));
};

const fmtVol = (kg: number): { value: string; unit: string } => {
  if (kg >= 1000) {
    const t = kg / 1000;
    return { value: t % 1 === 0 ? `${t}` : t.toFixed(2), unit: 't' };
  }
  return { value: kg.toLocaleString(), unit: 'kg' };
};

interface EditState {
  ejIdx: number;
  serieIdx: number;
  reps: string;
  peso: string;
  rir: string;
  tiempo: string;
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedEx, setExpandedEx] = useState<number | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    dbHelpers.getWorkoutById(id).then(w => {
      if (!w) navigate('/');
      else setWorkout(w);
      setLoading(false);
    });
  }, [id, navigate]);

  const startEdit = useCallback((ejIdx: number, serieIdx: number) => {
    if (!workout) return;
    const sr = workout.ejercicios[ejIdx].series[serieIdx];
    setEditing({
      ejIdx,
      serieIdx,
      reps: String(sr.repeticiones ?? ''),
      peso: String(sr.peso ?? ''),
      rir: String(sr.RIR ?? 2),
      tiempo: String(sr.tiempoSegundos ?? ''),
    });
  }, [workout]);

  const saveEdit = useCallback(async () => {
    if (!editing || !workout) return;
    setSaving(true);
    try {
      const updated: WorkoutLog = {
        ...workout,
        ejercicios: workout.ejercicios.map((ej, ei) => {
          if (ei !== editing.ejIdx) return ej;
          return {
            ...ej,
            series: ej.series.map((sr, si) => {
              if (si !== editing.serieIdx) return sr;
              const newSr = { ...sr, RIR: parseInt(editing.rir) ?? sr.RIR };
              if (sr.tipo === 'TIME') {
                newSr.tiempoSegundos = parseInt(editing.tiempo) || sr.tiempoSegundos;
              } else if (sr.tipo === 'BODYWEIGHT') {
                newSr.repeticiones = parseInt(editing.reps) || sr.repeticiones;
              } else {
                newSr.repeticiones = parseInt(editing.reps) || sr.repeticiones;
                newSr.peso = parseFloat(editing.peso) || sr.peso;
              }
              return newSr;
            }),
          };
        }),
      };
      await dbHelpers.updateWorkout(workout.id, { ejercicios: updated.ejercicios });
      setWorkout(updated);
      setEditing(null);
      toast.success('Serie actualizada');
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }, [editing, workout]);

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

  let mejorSerie = { ejercicio: '', peso: 0, reps: 0, rm1: 0 };
  workout.ejercicios.forEach(ej => {
    ej.series.forEach(sr => {
      const rm = epley(sr.peso, sr.repeticiones);
      if (rm > mejorSerie.rm1) {
        mejorSerie = {
          ejercicio: ej.ejercicio?.nombre || '',
          peso: sr.peso,
          reps: sr.repeticiones,
          rm1: rm,
        };
      }
    });
  });

  const vol = fmtVol(volumenTotal);
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
            { icon: Clock,      value: `${workout.duracionReal}`, unit: 'min',      color: 'text-blue-500'   },
            { icon: Dumbbell,   value: vol.value,                  unit: vol.unit,   color: 'text-green-500'  },
            { icon: Target,     value: `${totalSeries}`,           unit: 'series',   color: 'text-purple-500' },
            { icon: TrendingUp, value: `${totalReps}`,             unit: 'reps',     color: 'text-orange-500' },
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

        {/* Mejor esfuerzo */}
        {mejorSerie.rm1 > 0 && (
          <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="py-3 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-widest mb-0.5">
                  Mejor esfuerzo del día
                </p>
                <p className="font-bold truncate">{mejorSerie.ejercicio}</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {mejorSerie.peso} kg × {mejorSerie.reps} reps
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                    1RM estimado: ~{mejorSerie.rm1} kg
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ejercicios */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              {workout.ejercicios.length} ejercicio{workout.ejercicios.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {workout.ejercicios.map((ej, ejIdx) => {
              const volEj = ej.series.reduce((s, sr) => s + sr.peso * sr.repeticiones, 0);
              const volEjFmt = fmtVol(volEj);
              const best1RM = Math.max(...ej.series.map(s => epley(s.peso, s.repeticiones)));
              const isOpen = expandedEx === ejIdx;

              return (
                <div key={ejIdx} className="border rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors text-left"
                    onClick={() => {
                      setEditing(null);
                      setExpandedEx(isOpen ? null : ejIdx);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {ej.ejercicio?.nombre || `Ejercicio ${ejIdx + 1}`}
                        </span>
                        {ej.ejercicio?.tier && (
                          <Badge
                            variant={ej.ejercicio.tier === 'S' ? 'success' : 'outline'}
                            className="text-[10px] h-4"
                          >
                            {ej.ejercicio.tier}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ej.series.length} series
                        {' · '}
                        <span className="font-medium">1RM ~{best1RM} kg</span>
                        {' · '}
                        {volEjFmt.value} {volEjFmt.unit} vol
                      </p>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    }
                  </button>

                  {isOpen && (
                    <div className="border-t bg-muted/30 divide-y">
                      {ej.series.map((sr, si) => {
                        const rm = epley(sr.peso, sr.repeticiones);
                        const isBest = rm === best1RM;
                        const isEditingThis = editing?.ejIdx === ejIdx && editing.serieIdx === si;

                        if (isEditingThis) {
                          return (
                            <div key={si} className="px-3 py-2 bg-primary/5 border-l-2 border-primary space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">Editando Serie {sr.numero}</span>
                                <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className={`grid gap-2 ${sr.tipo === 'TIME' ? 'grid-cols-2' : sr.tipo === 'BODYWEIGHT' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {sr.tipo === 'TIME' ? (
                                  <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Segundos</p>
                                    <Input
                                      type="number" inputMode="numeric"
                                      value={editing.tiempo}
                                      onChange={e => setEditing(prev => prev ? { ...prev, tiempo: e.target.value } : null)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <p className="text-[10px] text-muted-foreground mb-1">Reps</p>
                                      <Input
                                        type="number" inputMode="numeric"
                                        value={editing.reps}
                                        onChange={e => setEditing(prev => prev ? { ...prev, reps: e.target.value } : null)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    {sr.tipo !== 'BODYWEIGHT' && (
                                      <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Kg</p>
                                        <Input
                                          type="number" inputMode="decimal"
                                          value={editing.peso}
                                          onChange={e => setEditing(prev => prev ? { ...prev, peso: e.target.value } : null)}
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                                <div>
                                  <p className="text-[10px] text-muted-foreground mb-1">RIR</p>
                                  <Input
                                    type="number" inputMode="numeric" min="0" max="5"
                                    value={editing.rir}
                                    onChange={e => setEditing(prev => prev ? { ...prev, rir: e.target.value } : null)}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <Button
                                size="sm" className="w-full h-7 text-xs" disabled={saving}
                                onClick={saveEdit}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {saving ? 'Guardando...' : 'Guardar cambios'}
                              </Button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={si}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm group ${isBest ? 'bg-yellow-50/60 dark:bg-yellow-950/20' : ''}`}
                          >
                            <span className="text-muted-foreground w-12 shrink-0 text-xs">Serie {sr.numero}</span>
                            <span className={`font-bold w-16 ${isBest ? 'text-primary' : ''}`}>
                              {sr.tipo === 'TIME' ? `${sr.tiempoSegundos}s` : `${sr.peso} kg`}
                            </span>
                            {sr.tipo !== 'TIME' && (
                              <>
                                <span className="text-muted-foreground">×</span>
                                <span className="font-medium w-14">
                                  {sr.repeticiones} {sr.tipo === 'BODYWEIGHT' ? 'reps' : 'reps'}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-muted-foreground flex-1">RIR {sr.RIR}</span>
                            {sr.tipo !== 'TIME' && sr.tipo !== 'BODYWEIGHT' && (
                              <span className="text-xs text-muted-foreground">~{rm} kg</span>
                            )}
                            {isBest && <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                            {/* Edit button — visible on hover / focus */}
                            <button
                              onClick={() => startEdit(ejIdx, si)}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-accent transition-opacity ml-1 shrink-0"
                              title="Editar serie"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                      <div className="px-4 py-2 bg-muted/50 flex justify-between text-xs text-muted-foreground">
                        <span>Volumen total</span>
                        <span className="font-semibold">{volEjFmt.value} {volEjFmt.unit}</span>
                      </div>
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
