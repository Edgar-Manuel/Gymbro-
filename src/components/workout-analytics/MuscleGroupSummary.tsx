import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { WorkoutLog, ExerciseKnowledge } from '@/types';
import { calcularSetsPorGrupoMuscular } from '@/utils/progressAnalyzer';
import { AlertTriangle } from 'lucide-react';

const GRUPO_LABELS: Record<string, string> = {
  pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas',
  hombros: 'Hombros', biceps: 'Bíceps', triceps: 'Tríceps',
  abdominales: 'Core', antebrazos: 'Antebrazos',
  femorales_gluteos: 'Femorales/Glúteos'
};

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316'
];

interface Props {
  workouts: WorkoutLog[];
  exercises: ExerciseKnowledge[];
}

export default function MuscleGroupSummary({ workouts, exercises }: Props) {
  const { chartData, desequilibrio } = useMemo(() => {
    const mapa = calcularSetsPorGrupoMuscular(workouts, exercises, 4);
    const arr = Array.from(mapa.entries())
      .map(([grupo, sets]) => ({ grupo, label: GRUPO_LABELS[grupo] || grupo, sets }))
      .sort((a, b) => b.sets - a.sets);

    let desequilibrio: string | null = null;
    if (arr.length >= 2) {
      const max = arr[0];
      const min = arr[arr.length - 1];
      if (min.sets > 0 && max.sets / min.sets >= 3) {
        desequilibrio = `${max.label} tiene ${Math.round(max.sets / min.sets)}× más sets que ${min.label}`;
      }
    }
    return { chartData: arr, desequilibrio };
  }, [workouts, exercises]);

  if (chartData.length === 0) return null;

  const maxSets = Math.max(...chartData.map(d => d.sets));
  const minSets = Math.min(...chartData.map(d => d.sets));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Resumen por Grupo Muscular</CardTitle>
        <CardDescription>Sets totales en las últimas 4 semanas</CardDescription>
      </CardHeader>
      <CardContent>
        {desequilibrio && (
          <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="ml-2 text-sm">Posible desequilibrio: {desequilibrio}</span>
          </Alert>
        )}

        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v} sets`, 'Sets']} />
            <Bar dataKey="sets" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={entry.grupo}
                  fill={COLORS[i % COLORS.length]}
                  opacity={entry.sets === maxSets ? 1 : entry.sets === minSets ? 0.6 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="success">🏆 Más: {chartData[0]?.label}</Badge>
          {chartData.length > 1 && (
            <Badge variant="warning">⚠️ Menos: {chartData[chartData.length - 1]?.label}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
