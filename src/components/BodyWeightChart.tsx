import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { BodyMeasurement, BodyGoal } from '@/types';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target } from 'lucide-react';
import { calculateDelta, movingAverage, readField } from '@/utils/bodyCalculations';
import {
  getGoalForMetric, withUpdatedGoal, withoutGoal, calculateGoalProgress,
} from '@/utils/bodyGoals';
import BodyGoalDialog from './BodyGoalDialog';
import BodyGoalProgress from './BodyGoalProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// ─── Configuración ───────────────────────────────────────────────────────────
type MetricKey =
  | 'peso' | 'grasaCorporal' | 'cintura' | 'cadera' | 'pecho'
  | 'brazoDerecho' | 'brazoIzquierdo'
  | 'musloDerecho' | 'musloIzquierdo'
  | 'pantorrillaDerecha' | 'pantorrillaIzquierda';

type MetricDef = {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  lowerIsBetter: boolean;
};

const METRICS: MetricDef[] = [
  { key: 'peso',                label: 'Peso',                unit: 'kg', color: 'hsl(var(--primary))',     lowerIsBetter: false },
  { key: 'grasaCorporal',       label: '% Grasa',             unit: '%',  color: 'hsl(var(--destructive))', lowerIsBetter: true },
  { key: 'cintura',             label: 'Cintura',             unit: 'cm', color: '#f97316',                 lowerIsBetter: true },
  { key: 'cadera',              label: 'Cadera',              unit: 'cm', color: '#a855f7',                 lowerIsBetter: false },
  { key: 'pecho',               label: 'Pecho',               unit: 'cm', color: '#06b6d4',                 lowerIsBetter: false },
  { key: 'brazoDerecho',        label: 'Brazo derecho',       unit: 'cm', color: '#10b981',                 lowerIsBetter: false },
  { key: 'brazoIzquierdo',      label: 'Brazo izquierdo',     unit: 'cm', color: '#059669',                 lowerIsBetter: false },
  { key: 'musloDerecho',        label: 'Muslo derecho',       unit: 'cm', color: '#eab308',                 lowerIsBetter: false },
  { key: 'musloIzquierdo',      label: 'Muslo izquierdo',     unit: 'cm', color: '#ca8a04',                 lowerIsBetter: false },
  { key: 'pantorrillaDerecha',  label: 'Pantorrilla derecha', unit: 'cm', color: '#3b82f6',                 lowerIsBetter: false },
  { key: 'pantorrillaIzquierda',label: 'Pantorrilla izquierda', unit: 'cm', color: '#2563eb',               lowerIsBetter: false },
];

type RangeDef = { key: string; label: string; days: number };
const RANGES: RangeDef[] = [
  { key: '1w',  label: '1S',  days: 7 },
  { key: '1m',  label: '1M',  days: 30 },
  { key: '3m',  label: '3M',  days: 90 },
  { key: '6m',  label: '6M',  days: 180 },
  { key: '1y',  label: '1A',  days: 365 },
  { key: 'all', label: 'Todo', days: Number.POSITIVE_INFINITY },
];

interface BodyWeightChartProps {
  refreshTrigger?: number;
}

interface ChartPoint {
  ts: number;
  fechaCorta: string;
  fechaLarga: string;
  value: number | null;
  trend: number | null;
}

// ─── Tooltip personalizado ───────────────────────────────────────────────────
type TooltipPayload = { value: number; payload: ChartPoint; dataKey: string };
function CustomTooltip({ active, payload, metric }: { active?: boolean; payload?: TooltipPayload[]; metric: MetricDef }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  if (point.value == null) return null;
  return (
    <div className="bg-popover border rounded-md p-2 shadow-md text-xs">
      <p className="font-medium mb-1">{point.fechaLarga}</p>
      <p>
        <span style={{ color: metric.color }}>●</span>{' '}
        {metric.label}: <strong>{point.value.toFixed(1)} {metric.unit}</strong>
      </p>
      {point.trend != null && (
        <p className="text-muted-foreground">
          <span className="text-muted-foreground/70">●</span>{' '}
          Media 7d: <strong>{point.trend.toFixed(1)} {metric.unit}</strong>
        </p>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function BodyWeightChart({ refreshTrigger = 0 }: BodyWeightChartProps) {
  const { currentUser, setCurrentUser } = useAppStore();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricKey, setMetricKey] = useState<MetricKey>('peso');
  const [rangeKey, setRangeKey] = useState<string>('3m');
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const goal = currentUser ? getGoalForMetric(currentUser, metricKey) : undefined;

  const persistUserChange = async (updated: typeof currentUser) => {
    if (!updated) return;
    setCurrentUser(updated);
    try {
      await dbHelpers.updateUser(updated);
    } catch (err) {
      console.error('Error guardando objetivo:', err);
      toast.error('No se pudo guardar el objetivo');
    }
  };

  const handleSaveGoal = async (g: BodyGoal) => {
    if (!currentUser) return;
    await persistUserChange(withUpdatedGoal(currentUser, g));
  };

  const handleDeleteGoal = async () => {
    if (!currentUser) return;
    await persistUserChange(withoutGoal(currentUser, metricKey));
  };

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      try {
        const data = await dbHelpers.getBodyMeasurements(currentUser.id, 200);
        // De más antiguo a más reciente (orden que recharts espera en X)
        setMeasurements([...data].reverse());
      } catch (error) {
        console.error('Error cargando datos de peso:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser, refreshTrigger]);

  const metric = useMemo(() => METRICS.find(m => m.key === metricKey)!, [metricKey]);
  const range = useMemo(() => RANGES.find(r => r.key === rangeKey)!, [rangeKey]);

  // Filtra mediciones al rango activo y construye los puntos del chart
  const chartData = useMemo<ChartPoint[]>(() => {
    if (!measurements.length) return [];
    const cutoff = range.days === Number.POSITIVE_INFINITY
      ? -Infinity
      : Date.now() - range.days * 24 * 60 * 60 * 1000;

    const filtered = measurements.filter(m => new Date(m.fecha).getTime() >= cutoff);
    const values = filtered.map(m => readField(m, metric.key) ?? null);
    const trend = movingAverage(values, 7);

    return filtered.map((m, i) => ({
      ts: new Date(m.fecha).getTime(),
      fechaCorta: new Date(m.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      fechaLarga: new Date(m.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }),
      value: values[i],
      trend: trend[i],
    }));
  }, [measurements, metric, range]);

  // Estadísticas resumen del rango actual
  const stats = useMemo(() => {
    const valid = chartData.filter(p => p.value != null) as (ChartPoint & { value: number })[];
    if (!valid.length) return null;
    const first = valid[0].value;
    const last = valid[valid.length - 1].value;
    const min = Math.min(...valid.map(p => p.value));
    const max = Math.max(...valid.map(p => p.value));
    const delta = calculateDelta(last, first);
    return { first, last, min, max, delta, count: valid.length };
  }, [chartData]);

  // ─── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Evolución corporal
          </CardTitle>
          <CardDescription>Registra al menos 2 mediciones para ver tu evolución</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const noDataInRange = !stats || stats.count < 2;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Evolución corporal
            </CardTitle>
            <CardDescription>
              {stats ? `${stats.count} registros en este rango` : 'Sin datos en este rango'}
            </CardDescription>
          </div>

          {/* Selectores: métrica + rango + objetivo */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={metricKey} onValueChange={(v) => setMetricKey(v as MetricKey)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m.key} value={m.key} className="text-xs">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-md border bg-muted p-0.5">
              {RANGES.map(r => (
                <Button
                  key={r.key}
                  variant={r.key === rangeKey ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setRangeKey(r.key)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <Button
              variant={goal ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setGoalDialogOpen(true)}
            >
              <Target className="w-3.5 h-3.5 mr-1.5" />
              {goal ? `Meta: ${goal.target} ${metric.unit}` : 'Definir objetivo'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* KPI principal */}
        {stats && !noDataInRange && (
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="text-3xl font-bold leading-none" style={{ color: metric.color }}>
                {stats.last.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
              </p>
            </div>
            <DeltaSummary delta={stats.delta} unit={metric.unit} lowerIsBetter={metric.lowerIsBetter} rangeLabel={range.label} />
          </div>
        )}

        {/* Gráfico */}
        {noDataInRange ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground border rounded-md bg-muted/30">
            Necesitas al menos 2 registros con {metric.label.toLowerCase()} en este rango
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="fechaCorta" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip metric={metric} />} />

                {stats && (
                  <ReferenceLine
                    y={(stats.min + stats.max) / 2}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 4"
                    strokeOpacity={0.4}
                  />
                )}

                {/* Línea del objetivo */}
                {goal && (
                  <ReferenceLine
                    y={goal.target}
                    stroke="hsl(var(--primary))"
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    label={{
                      value: `🎯 ${goal.target}${metric.unit}`,
                      position: 'right',
                      style: { fontSize: 10, fill: 'hsl(var(--primary))' },
                    }}
                  />
                )}

                {/* Media móvil 7d */}
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />

                {/* Línea principal */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metric.color}
                  strokeWidth={2.5}
                  dot={{ fill: metric.color, r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Leyenda */}
        {!noDataInRange && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs mt-3">
            <LegendItem color={metric.color} label={metric.label} />
            <LegendItem color="hsl(var(--muted-foreground))" label="Media móvil 7 días" dashed />
            {goal && <LegendItem color="hsl(var(--primary))" label="Objetivo" dashed />}
          </div>
        )}

        {/* Bloque de progreso del objetivo */}
        {goal && stats && (
          <BodyGoalProgress
            goal={goal}
            progress={calculateGoalProgress(goal, stats.last, measurements.slice().reverse())}
            metricLabel={metric.label}
            metricUnit={metric.unit}
            currentValue={stats.last}
            onEdit={() => setGoalDialogOpen(true)}
          />
        )}
      </CardContent>

      {/* Dialog de objetivo */}
      <BodyGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        metricKey={metricKey}
        metricLabel={metric.label}
        metricUnit={metric.unit}
        currentValue={stats?.last}
        existingGoal={goal}
        onSave={handleSaveGoal}
        onDelete={goal ? handleDeleteGoal : undefined}
      />
    </Card>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────
function DeltaSummary({
  delta, unit, lowerIsBetter, rangeLabel,
}: {
  delta: ReturnType<typeof calculateDelta>;
  unit: string;
  lowerIsBetter: boolean;
  rangeLabel: string;
}) {
  if (!delta) return null;
  const Icon = delta.direction === 'up' ? TrendingUp : delta.direction === 'down' ? TrendingDown : Minus;
  const positive = delta.direction === 'flat'
    ? null
    : lowerIsBetter ? delta.direction === 'down' : delta.direction === 'up';
  const cls = positive === null
    ? 'text-muted-foreground'
    : positive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400';
  return (
    <div className="text-right">
      <p className="text-xs text-muted-foreground">en {rangeLabel}</p>
      <p className={`text-base font-semibold inline-flex items-center gap-1 ${cls}`}>
        <Icon className="w-4 h-4" />
        {delta.abs > 0 ? '+' : ''}{delta.abs.toFixed(1)} {unit}
      </p>
    </div>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className="inline-block w-6 h-[2px]"
        style={{
          background: dashed
            ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 8px)`
            : color,
        }}
      />
      {label}
    </div>
  );
}
