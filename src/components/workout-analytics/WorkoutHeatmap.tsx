import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { WorkoutLog } from '@/types';
import { subWeeks, startOfWeek, format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeatmapProps {
  workouts: WorkoutLog[];
}

export default function WorkoutHeatmap({ workouts }: HeatmapProps) {
  const data = useMemo(() => {
    const ahora = new Date();
    const weeks: { label: string; days: { date: Date; count: number; nombres: string[] }[] }[] = [];

    for (let w = 7; w >= 0; w--) {
      const weekStart = startOfWeek(subWeeks(ahora, w), { weekStartsOn: 1 });
      const label = w === 0 ? 'Esta sem.' : w === 1 ? 'Hace 1' : `Hace ${w}`;
      const days: { date: Date; count: number; nombres: string[] }[] = [];

      for (let d = 0; d < 7; d++) {
        const day = addDays(weekStart, d);
        const dayStr = format(day, 'yyyy-MM-dd');
        const matching = workouts.filter(wk => format(new Date(wk.fecha), 'yyyy-MM-dd') === dayStr);
        days.push({
          date: day,
          count: matching.length,
          nombres: matching.map(m => m.diaRutina || 'Entrenamiento libre')
        });
      }
      weeks.push({ label, days });
    }
    return weeks;
  }, [workouts]);

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function getCellColor(count: number) {
    if (count === 0) return 'bg-muted/50';
    if (count === 1) return 'bg-blue-300 dark:bg-blue-700';
    if (count === 2) return 'bg-blue-500 dark:bg-blue-500';
    return 'bg-blue-700 dark:bg-blue-300';
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Frecuencia Semanal</CardTitle>
        <CardDescription>Últimas 8 semanas de entrenamiento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}>
            {/* Day headers */}
            <div />
            {dayLabels.map(d => (
              <div key={d} className="text-xs text-muted-foreground text-center w-8">{d}</div>
            ))}
            {/* Weeks */}
            {data.map((week, wi) => (
              <>
                <div key={`label-${wi}`} className="text-xs text-muted-foreground pr-2 flex items-center whitespace-nowrap">
                  {week.label}
                </div>
                {week.days.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`w-8 h-8 rounded-sm ${getCellColor(day.count)} transition-colors cursor-default flex items-center justify-center`}
                    title={`${format(day.date, 'EEEE dd MMM', { locale: es })}: ${day.count === 0 ? 'Descanso' : day.nombres.join(', ')}`}
                  >
                    {day.count > 0 && (
                      <span className="text-[10px] font-bold text-white">{day.count}</span>
                    )}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span>Menos</span>
          <div className="w-4 h-4 rounded-sm bg-muted/50" />
          <div className="w-4 h-4 rounded-sm bg-blue-300 dark:bg-blue-700" />
          <div className="w-4 h-4 rounded-sm bg-blue-500" />
          <div className="w-4 h-4 rounded-sm bg-blue-700 dark:bg-blue-300" />
          <span>Más</span>
        </div>
      </CardContent>
    </Card>
  );
}
