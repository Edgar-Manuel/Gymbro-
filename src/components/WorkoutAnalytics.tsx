import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import type { WorkoutLog, ExerciseKnowledge } from '@/types';
import { calcularEstadisticasGenerales, detectarNecesidadDeload } from '@/utils/progressAnalyzer';
import { AlertTriangle, Dumbbell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import StatsCards from './workout-analytics/StatsCards';
import MuscleGroupSummary from './workout-analytics/MuscleGroupSummary';
import ExerciseAnalysis from './workout-analytics/ExerciseAnalysis';
import WorkoutHeatmap from './WorkoutHeatmap';
import RecentWorkoutsList from './workout-analytics/RecentWorkoutsList';

interface Props {
  workouts: WorkoutLog[];
  exercises: ExerciseKnowledge[];
}

export default function WorkoutAnalytics({ workouts, exercises }: Props) {
  const navigate = useNavigate();
  const [deloadDismissed, setDeloadDismissed] = useState(() => {
    try { return sessionStorage.getItem('deload-dismissed') === 'true'; } catch { return false; }
  });

  const stats = useMemo(() => calcularEstadisticasGenerales(workouts), [workouts]);
  const deload = useMemo(() => detectarNecesidadDeload(workouts), [workouts]);

  const dismissDeload = () => {
    setDeloadDismissed(true);
    try { sessionStorage.setItem('deload-dismissed', 'true'); } catch { /* noop */ }
  };

  // ─── Empty states ─────────────────────────────────
  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-bold mb-2">¡Hora de entrenar! 💪</h3>
          <p className="text-muted-foreground mb-4">
            Completa tu primer entrenamiento para desbloquear tus estadísticas, gráficos y análisis de progreso.
          </p>
          <button
            onClick={() => navigate('/workout')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Empezar a entrenar
          </button>
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 1) {
    return (
      <>
        <StatsCards
          totalWorkouts={workouts.length}
          volumenTotal={stats.volumenTotalMovido}
          volumenPromedio={stats.volumenPromedioPorSesion}
          mejorRacha={stats.mejorRacha}
          rachaActual={stats.rachaActual}
          consistencia={stats.consistenciaSemanas}
          tiempoTotal={stats.tiempoTotalMinutos}
        />
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              🎉 ¡Buen comienzo! Con más sesiones verás tus gráficos, análisis de progreso y 1RM estimado.
            </p>
          </CardContent>
        </Card>
        <div className="mt-6">
          <RecentWorkoutsList workouts={workouts} />
        </div>
      </>
    );
  }

  // ─── Full view ─────────────────────────────────────
  return (
    <>
      {/* Deload banner */}
      {deload.necesitaDeload && !deloadDismissed && (
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-yellow-700 dark:text-yellow-400">Posible necesidad de Deload</p>
            <p className="text-sm text-muted-foreground">{deload.razon}</p>
          </div>
          <button onClick={dismissDeload} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <StatsCards
        totalWorkouts={workouts.length}
        volumenTotal={stats.volumenTotalMovido}
        volumenPromedio={stats.volumenPromedioPorSesion}
        mejorRacha={stats.mejorRacha}
        rachaActual={stats.rachaActual}
        consistencia={stats.consistenciaSemanas}
        tiempoTotal={stats.tiempoTotalMinutos}
      />

      <WorkoutHeatmap workouts={workouts} />

      <MuscleGroupSummary workouts={workouts} exercises={exercises} />

      <ExerciseAnalysis workouts={workouts} exercises={exercises} />

      <RecentWorkoutsList workouts={workouts} />
    </>
  );
}
