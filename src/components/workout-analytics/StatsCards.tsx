import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Dumbbell, Target, Award, Flame, Clock, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalWorkouts: number;
  volumenTotal: number;
  volumenPromedio: number;
  mejorRacha: number;
  rachaActual: number;
  consistencia: number;
  tiempoTotal: number;
}

function formatTime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getConsistencyColor(pct: number) {
  if (pct >= 75) return 'text-green-500';
  if (pct >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getConsistencyBg(pct: number) {
  if (pct >= 75) return 'bg-green-500/10';
  if (pct >= 50) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

export default function StatsCards({
  totalWorkouts, volumenTotal, volumenPromedio,
  mejorRacha, rachaActual, consistencia, tiempoTotal
}: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Entrenamientos', icon: Calendar,
      value: totalWorkouts, sub: 'sesiones completadas'
    },
    {
      title: 'Volumen Total', icon: Dumbbell,
      value: `${(volumenTotal / 1000).toFixed(1)}t`, sub: 'kilogramos movidos'
    },
    {
      title: 'Volumen Promedio', icon: Target,
      value: `${(volumenPromedio / 1000).toFixed(1)}t`, sub: 'por sesión'
    },
    {
      title: 'Mejor Racha', icon: Award,
      value: mejorRacha, sub: 'días consecutivos'
    },
    {
      title: 'Racha Actual', icon: Flame,
      value: rachaActual,
      sub: rachaActual > 0 ? '🔥 ¡Sigue así!' : 'Entrena hoy para empezar',
      highlight: rachaActual > 0
    },
    {
      title: 'Consistencia', icon: TrendingUp,
      value: `${consistencia}%`, sub: 'últimas 8 semanas',
      colorClass: getConsistencyColor(consistencia),
      bgClass: getConsistencyBg(consistencia)
    },
    {
      title: 'Tiempo Total', icon: Clock,
      value: formatTime(tiempoTotal), sub: 'entrenando'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(c => (
        <Card key={c.title} className={c.bgClass || ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${c.colorClass || ''}`}>
              {c.value}
              {c.highlight && <span className="ml-1 text-green-500 text-sm">●</span>}
            </div>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
