import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Bar, Cell
} from 'recharts';
import {
  TrendingUp, Target, Dumbbell, Lightbulb,
  ArrowUp, ArrowDown, Minus, Search, Zap, BarChart3
} from 'lucide-react';
import type { WorkoutLog, ExerciseKnowledge, ProgressAnalysis, ProgressDataPoint } from '@/types';
import { analizarProgresoEjercicio, generarDatosGrafico } from '@/utils/progressAnalyzer';
import { subMonths } from 'date-fns';

type TimeRange = '1M' | '3M' | '6M' | '1A' | 'Todo';

interface Props {
  workouts: WorkoutLog[];
  exercises: ExerciseKnowledge[];
}

export default function ExerciseAnalysis({ workouts, exercises }: Props) {
  const [selectedId, setSelectedId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('Todo');
  const [showDropdown, setShowDropdown] = useState(false);

  // Ejercicios realizados
  const ejerciciosDisponibles = useMemo(() => {
    const ids = new Set<string>();
    workouts.forEach(w => w.ejercicios.forEach(e => ids.add(e.ejercicioId)));
    return exercises.filter(e => ids.has(e.id));
  }, [workouts, exercises]);

  // Auto-select first
  useMemo(() => {
    if (!selectedId && ejerciciosDisponibles.length > 0) {
      setSelectedId(ejerciciosDisponibles[0].id);
    }
  }, [ejerciciosDisponibles, selectedId]);

  const selectedExercise = exercises.find(e => e.id === selectedId);

  const analysis: ProgressAnalysis | null = useMemo(() => {
    if (!selectedId || !selectedExercise) return null;
    return analizarProgresoEjercicio(selectedId, workouts, selectedExercise);
  }, [selectedId, workouts, selectedExercise]);

  const { chartData } = useMemo(() => {
    let desdeRango: Date | undefined;
    const ahora = new Date();
    if (timeRange === '1M') desdeRango = subMonths(ahora, 1);
    else if (timeRange === '3M') desdeRango = subMonths(ahora, 3);
    else if (timeRange === '6M') desdeRango = subMonths(ahora, 6);
    else if (timeRange === '1A') desdeRango = subMonths(ahora, 12);
    const data = selectedId ? generarDatosGrafico(selectedId, workouts, desdeRango) : [];
    return { chartData: data };
  }, [selectedId, workouts, timeRange]);

  // Moving average for volume chart
  const volumeWithMA = useMemo(() => {
    return chartData.map((d, i) => {
      const window = chartData.slice(Math.max(0, i - 6), i + 1);
      const avg = window.reduce((s, p) => s + p.volumenTotal, 0) / window.length;
      const globalAvg = chartData.reduce((s, p) => s + p.volumenTotal, 0) / chartData.length;
      return { ...d, mediaMovil: Math.round(avg), aboveAvg: d.volumenTotal >= globalAvg };
    });
  }, [chartData]);

  const max1RM = chartData.length > 0 ? Math.max(...chartData.map(d => d.estimated1RM)) : 0;

  const filtered = ejerciciosDisponibles.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecomIcon = (r: string) => {
    if (r === 'subir_peso') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (r === 'subir_reps') return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (r === 'deload') return <ArrowDown className="w-4 h-4 text-orange-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getRecomColor = (r: string) => {
    if (r === 'subir_peso') return 'success' as const;
    if (r === 'subir_reps') return 'default' as const;
    if (r === 'deload') return 'warning' as const;
    return 'secondary' as const;
  };

  if (ejerciciosDisponibles.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center text-muted-foreground">
          Tus entrenamientos no tienen ejercicios registrados aún.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Exercise Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analizar Ejercicio Específico</CardTitle>
          <CardDescription>Busca y selecciona un ejercicio para ver tu progresión</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search combobox */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                className="w-full pl-10 pr-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              {showDropdown && filtered.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
                  {filtered.map(ex => (
                    <button
                      key={ex.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${ex.id === selectedId ? 'bg-accent font-medium' : ''}`}
                      onMouseDown={() => { setSelectedId(ex.id); setSearchTerm(ex.nombre); setShowDropdown(false); }}
                    >
                      {ex.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Time range */}
            <div className="flex gap-1">
              {(['1M', '3M', '6M', '1A', 'Todo'] as TimeRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${timeRange === r ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Panel */}
      {analysis && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>{analysis.nombre}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={getRecomColor(analysis.recomendacion)}>
                  <span className="flex items-center gap-1">
                    {getRecomIcon(analysis.recomendacion)}
                    {analysis.recomendacion.replace('_', ' ').toUpperCase()}
                  </span>
                </Badge>
                <Badge variant="outline">{analysis.sesionesTotales} sesiones</Badge>
                <Badge variant="outline">{analysis.frecuenciaSemanal}×/sem</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Volume */}
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Dumbbell className="w-4 h-4" /> Volumen Semanal
                </h4>
                <div className="text-lg font-bold">{analysis.volumenTotal.semanaActual.toFixed(0)} kg</div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Anterior: {analysis.volumenTotal.semanaAnterior.toFixed(0)} kg</span>
                  <span className={analysis.volumenTotal.cambio > 0 ? 'text-green-500' : analysis.volumenTotal.cambio < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                    ({analysis.volumenTotal.cambio > 0 ? '+' : ''}{analysis.volumenTotal.cambio.toFixed(1)}%)
                  </span>
                </div>
              </div>
              {/* Max Weight */}
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" /> Peso Máximo
                </h4>
                <div className="text-lg font-bold">{analysis.pesoMaximo.actual.toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">
                  Hace 4 sem: {analysis.pesoMaximo.hace4Semanas.toFixed(1)} kg
                  <span className={analysis.pesoMaximo.cambio > 0 ? ' text-green-500' : ''}>
                    {' '}({analysis.pesoMaximo.cambio > 0 ? '+' : ''}{analysis.pesoMaximo.cambio.toFixed(1)} kg)
                  </span>
                </div>
              </div>
              {/* 1RM */}
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" /> 1RM Estimado
                </h4>
                <div className="text-lg font-bold text-primary">{analysis.estimacion1RM.actual} kg</div>
                <div className="text-xs text-muted-foreground">
                  Inicio: {analysis.estimacion1RM.hace4Semanas} kg
                  <span className={analysis.estimacion1RM.cambio > 0 ? ' text-green-500' : ''}>
                    {' '}({analysis.estimacion1RM.cambio > 0 ? '+' : ''}{analysis.estimacion1RM.cambio.toFixed(1)}%)
                  </span>
                </div>
              </div>
              {/* Intensity */}
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4" /> Intensidad
                </h4>
                <div className="text-lg font-bold">
                  {analysis.intensidadPromedio ? `${analysis.intensidadPromedio}%` : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">del 1RM estimado</div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-primary/10 p-4 rounded-lg flex gap-3">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Próximo Objetivo:</p>
                <p className="text-sm">{analysis.proximoObjetivo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chart 1: Weight + 1RM */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolución de Peso Máximo</CardTitle>
              <CardDescription>Peso real vs 1RM estimado (Epley)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" interval={chartData.length > 20 ? Math.floor(chartData.length / 10) : 0} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as ProgressDataPoint;
                      return (
                        <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                          <p className="font-medium mb-1">{d.semana}</p>
                          <p>Peso: <strong>{d.pesoMaximo} kg</strong></p>
                          <p>1RM est.: <strong>{d.estimated1RM} kg</strong></p>
                          <p className="text-muted-foreground">{d.numSeries} series</p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  {max1RM > 0 && (
                    <ReferenceLine y={max1RM} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '🏆 PR', position: 'right', fill: '#f59e0b' }} />
                  )}
                  <Line type="monotone" dataKey="pesoMaximo" stroke="#3b82f6" strokeWidth={2} name="Peso Máximo (kg)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="estimated1RM" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 5" name="1RM Estimado (kg)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Volume with moving average */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Volumen por Sesión</CardTitle>
              <CardDescription>kg × reps con media móvil (7 sesiones)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={volumeWithMA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" interval={volumeWithMA.length > 20 ? Math.floor(volumeWithMA.length / 10) : 0} />
                  <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                          <p className="font-medium mb-1">{d.semana}</p>
                          <p>Volumen: <strong>{d.volumenTotal} kg</strong></p>
                          <p>Media móvil: <strong>{d.mediaMovil} kg</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="volumenTotal" name="Volumen (kg)" radius={[4, 4, 0, 0]}>
                    {volumeWithMA.map((entry, i) => (
                      <Cell key={i} fill={entry.aboveAvg ? '#10b981' : '#ef4444'} opacity={0.8} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="mediaMovil" stroke="#f59e0b" strokeWidth={2} dot={false} name="Media Móvil" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Reps promedio */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Reps Promedio por Sesión</CardTitle>
              <CardDescription>Útil para detectar progresión en repeticiones a peso constante</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" interval={chartData.length > 20 ? Math.floor(chartData.length / 10) : 0} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as ProgressDataPoint;
                      return (
                        <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                          <p className="font-medium mb-1">{d.semana}</p>
                          <p>Reps promedio: <strong>{d.repeticionesPromedio}</strong></p>
                          <p className="text-muted-foreground">{d.numSeries} series</p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="repeticionesPromedio"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#8b5cf6' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
