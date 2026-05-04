import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkoutLog } from '@/types';
import { Activity } from 'lucide-react';

interface WorkoutHeatmapProps {
  workouts: WorkoutLog[];
  /** Fecha final del rango (default: hoy). Se muestran las 53 semanas previas. */
  endDate?: Date;
  loading?: boolean;
  /** Si true se renderiza sin Card (para componer dentro de otro card). */
  compact?: boolean;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const intensityClass = (count: number) =>
  count === 0 ? 'bg-muted/40'
  : count === 1 ? 'bg-primary/25'
  : count === 2 ? 'bg-primary/55'
  : 'bg-primary';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkoutHeatmap({ workouts, endDate, loading, compact }: WorkoutHeatmapProps) {
  const data = useMemo(() => {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Mapa fechaISO → nº de workouts ese día
    const counts = new Map<string, number>();
    for (const w of workouts) {
      const d = new Date(w.fecha);
      const k = dateKey(d);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }

    // El grid es 53 columnas (semanas) × 7 filas (Lun-Dom).
    // La última columna debe contener el día de "end". Calcula el lunes de
    // la semana de "end" y retrocede 52 semanas para arrancar.
    const dayMs = 24 * 60 * 60 * 1000;
    const endMondayOffset = (end.getDay() + 6) % 7;  // 0=Lun
    const lastWeekStart = new Date(end);
    lastWeekStart.setHours(0, 0, 0, 0);
    lastWeekStart.setDate(lastWeekStart.getDate() - endMondayOffset);

    const start = new Date(lastWeekStart);
    start.setDate(start.getDate() - 52 * 7);

    const columns: Array<{
      days: Array<{ date: Date; count: number; isFuture: boolean }>;
      firstOfMonth?: number;
    }> = [];

    let totalDaysActive = 0;
    let totalSessions = 0;
    let lastMonth = -1;

    for (let w = 0; w < 53; w++) {
      const days: Array<{ date: Date; count: number; isFuture: boolean }> = [];
      let firstOfMonth: number | undefined;
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getTime() + (w * 7 + d) * dayMs);
        const isFuture = date.getTime() > end.getTime();
        const count = isFuture ? 0 : (counts.get(dateKey(date)) ?? 0);
        if (count > 0) {
          totalDaysActive++;
          totalSessions += count;
        }
        if (d === 0 && date.getMonth() !== lastMonth) {
          firstOfMonth = date.getMonth();
          lastMonth = date.getMonth();
        }
        days.push({ date, count, isFuture });
      }
      columns.push({ days, firstOfMonth });
    }

    return { columns, totalDaysActive, totalSessions };
  }, [workouts, endDate]);

  if (loading) {
    const inner = <Skeleton className="h-[140px] rounded-md" />;
    if (compact) return inner;
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4" />
            Actividad anual
          </CardTitle>
        </CardHeader>
        <CardContent>{inner}</CardContent>
      </Card>
    );
  }

  const grid = (
    <>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[2px] min-w-fit">
          {/* Columna de labels de día (Lun..Dom) */}
          <div className="flex flex-col gap-[2px] mt-[18px] mr-1 shrink-0">
            {DAY_LABELS.map(l => (
              <div key={l} className="h-[14px] text-[9px] text-muted-foreground leading-[14px] text-right w-3">
                {l}
              </div>
            ))}
          </div>

          {/* Columnas de semanas */}
          <div className="flex gap-[2px]">
            {data.columns.map((col, i) => (
              <div key={i} className="flex flex-col gap-[2px]">
                {/* Slot de label de mes (solo si esta semana es la primera del mes) */}
                <div className="h-[16px] text-[9px] text-muted-foreground leading-[16px]">
                  {col.firstOfMonth !== undefined ? MONTH_LABELS[col.firstOfMonth] : ''}
                </div>
                {col.days.map((d, di) => (
                  <div
                    key={di}
                    className={`w-[14px] h-[14px] rounded-[2px] ${
                      d.isFuture ? 'bg-transparent' : intensityClass(d.count)
                    } transition-opacity hover:opacity-80`}
                    title={d.isFuture ? '' : (() => {
                      const fechaStr = d.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                      const counts = d.count === 0 ? 'sin entrenamientos'
                        : d.count === 1 ? '1 entrenamiento'
                          : `${d.count} entrenamientos`;
                      return `${fechaStr} — ${counts}`;
                    })()}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">{data.totalDaysActive}</strong> días activos
          <span className="mx-1">·</span>
          <strong className="text-foreground">{data.totalSessions}</strong> {data.totalSessions === 1 ? 'entrenamiento' : 'entrenamientos'} en el último año
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px]">Menos</span>
          <span className="w-3 h-3 rounded-[2px] bg-muted/40" />
          <span className="w-3 h-3 rounded-[2px] bg-primary/25" />
          <span className="w-3 h-3 rounded-[2px] bg-primary/55" />
          <span className="w-3 h-3 rounded-[2px] bg-primary" />
          <span className="text-[10px]">Más</span>
        </div>
      </div>
    </>
  );

  if (compact) return <div>{grid}</div>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-4 h-4" />
          Actividad anual
        </CardTitle>
      </CardHeader>
      <CardContent>{grid}</CardContent>
    </Card>
  );
}
