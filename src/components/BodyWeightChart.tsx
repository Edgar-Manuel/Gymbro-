import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { BodyMeasurement } from '@/types';
import { TrendingDown, TrendingUp, Weight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChartDataPoint {
  fecha: string;
  peso: number;
  grasaCorporal?: number;
  timestamp: number;
}

export default function BodyWeightChart() {
  const { currentUser } = useAppStore();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      // Cargar últimas 30 mediciones
      const data = await dbHelpers.getBodyMeasurements(currentUser.id, 30);
      setMeasurements(data.reverse()); // Más antiguo primero

      // Preparar datos para el gráfico
      const chartPoints: ChartDataPoint[] = data.map(m => ({
        fecha: new Date(m.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        peso: m.peso,
        grasaCorporal: m.grasaCorporal,
        timestamp: new Date(m.fecha).getTime()
      }));

      setChartData(chartPoints);
    } catch (error) {
      console.error('Error cargando datos de peso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando datos...</p>
        </CardContent>
      </Card>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="w-5 h-5" />
            Evolución de Peso Corporal
          </CardTitle>
          <CardDescription>No hay datos suficientes para mostrar el gráfico</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Registra al menos 2 mediciones para ver tu evolución
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const pesoActual = measurements[measurements.length - 1].peso;
  const pesoInicial = measurements[0].peso;
  const cambioTotal = pesoActual - pesoInicial;
  const cambioPorcentaje = ((cambioTotal / pesoInicial) * 100).toFixed(1);

  // Calcular peso promedio
  const pesoPromedio = measurements.reduce((sum, m) => sum + m.peso, 0) / measurements.length;

  // Calcular peso máximo y mínimo
  const pesoMaximo = Math.max(...measurements.map(m => m.peso));
  const pesoMinimo = Math.min(...measurements.map(m => m.peso));

  // Calcular tendencia (últimos 7 días vs anteriores)
  const ultimasMediciones = measurements.slice(-7);
  const medicionesAnteriores = measurements.slice(-14, -7);

  let tendencia: 'subiendo' | 'bajando' | 'estable' = 'estable';
  if (ultimasMediciones.length > 0 && medicionesAnteriores.length > 0) {
    const promedioUltimo = ultimasMediciones.reduce((sum, m) => sum + m.peso, 0) / ultimasMediciones.length;
    const promedioAnterior = medicionesAnteriores.reduce((sum, m) => sum + m.peso, 0) / medicionesAnteriores.length;

    if (promedioUltimo > promedioAnterior + 0.3) tendencia = 'subiendo';
    else if (promedioUltimo < promedioAnterior - 0.3) tendencia = 'bajando';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="w-5 h-5" />
          Evolución de Peso Corporal
        </CardTitle>
        <CardDescription>
          Tracking de los últimos {measurements.length} registros
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <p className="text-xs text-muted-foreground mb-1">Peso Actual</p>
            <p className="text-xl font-bold text-blue-600">{pesoActual}kg</p>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Cambio Total</p>
            <div className="flex items-center gap-1">
              <p className={`text-xl font-bold ${cambioTotal > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {cambioTotal > 0 ? '+' : ''}{cambioTotal.toFixed(1)}kg
              </p>
              {cambioTotal !== 0 && (
                cambioTotal > 0 ?
                  <TrendingUp className="w-4 h-4 text-orange-600" /> :
                  <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {cambioPorcentaje}%
            </p>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Rango</p>
            <p className="text-sm font-semibold">
              {pesoMinimo}kg - {pesoMaximo}kg
            </p>
            <p className="text-xs text-muted-foreground">
              Δ {(pesoMaximo - pesoMinimo).toFixed(1)}kg
            </p>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Tendencia</p>
            <div className="flex items-center gap-2">
              {tendencia === 'subiendo' && (
                <>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <Badge variant="default" className="bg-orange-500">Subiendo</Badge>
                </>
              )}
              {tendencia === 'bajando' && (
                <>
                  <TrendingDown className="w-5 h-5 text-green-500" />
                  <Badge variant="success">Bajando</Badge>
                </>
              )}
              {tendencia === 'estable' && (
                <>
                  <div className="w-5 h-0.5 bg-gray-400" />
                  <Badge variant="outline">Estable</Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />

              {/* Línea de peso promedio */}
              <ReferenceLine
                y={pesoPromedio}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{
                  value: `Promedio: ${pesoPromedio.toFixed(1)}kg`,
                  position: 'right',
                  style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }
                }}
              />

              {/* Línea de peso */}
              <Line
                type="monotone"
                dataKey="peso"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Línea de grasa corporal si existe */}
              {chartData.some(d => d.grasaCorporal) && (
                <Line
                  type="monotone"
                  dataKey="grasaCorporal"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))', r: 3 }}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-primary rounded" />
            <span className="text-muted-foreground">Peso corporal</span>
          </div>
          {chartData.some(d => d.grasaCorporal) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-destructive rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--destructive)) 0px, hsl(var(--destructive)) 5px, transparent 5px, transparent 10px)' }} />
              <span className="text-muted-foreground">Grasa corporal (%)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-muted-foreground rounded opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--muted-foreground)) 0px, hsl(var(--muted-foreground)) 5px, transparent 5px, transparent 10px)' }} />
            <span className="text-muted-foreground">Promedio</span>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Weight className="w-4 h-4" />
            Análisis
          </h4>
          <ul className="space-y-1 text-sm">
            {cambioTotal > 0 && (
              <li className="text-orange-700 dark:text-orange-300">
                • Has ganado {Math.abs(cambioTotal).toFixed(1)}kg desde tu primera medición
              </li>
            )}
            {cambioTotal < 0 && (
              <li className="text-green-700 dark:text-green-300">
                • Has perdido {Math.abs(cambioTotal).toFixed(1)}kg desde tu primera medición
              </li>
            )}
            {cambioTotal === 0 && (
              <li className="text-muted-foreground">
                • Tu peso se ha mantenido estable
              </li>
            )}

            {tendencia === 'subiendo' && (
              <li className="text-muted-foreground">
                • Tendencia reciente: peso en aumento
              </li>
            )}
            {tendencia === 'bajando' && (
              <li className="text-muted-foreground">
                • Tendencia reciente: peso en descenso
              </li>
            )}

            <li className="text-muted-foreground">
              • Variación total: {(pesoMaximo - pesoMinimo).toFixed(1)}kg
            </li>

            {measurements.length >= 7 && (
              <li className="text-blue-600 dark:text-blue-400">
                • Excelente consistencia en el seguimiento
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
