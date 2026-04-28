import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkoutLog } from '@/types';
import {
  Trophy,
  TrendingUp,
  Clock,
  Dumbbell,
  Target,
  ArrowRight,
  CheckCircle2,
  Flame,
  Zap,
  Droplets,
  Activity,
} from 'lucide-react';

// ─── Mecanismos de hipertrofia ────────────────────────────────────────────────

type NivelMecanismo = 'alto' | 'medio' | 'bajo';

interface Mecanismo {
  nivel: NivelMecanismo;
  label: string;
  sublabel: string;
  descripcion: string;
  tip: string;
}

function calcularMecanismos(ejercicios: WorkoutLog['ejercicios']): {
  tension: Mecanismo;
  metabolico: Mecanismo;
  dano: Mecanismo;
} {
  const todasSeries = ejercicios.flatMap(e => e.series);
  const repsArr = todasSeries.map(s => s.repeticiones).filter(r => r > 0);
  const rirArr  = todasSeries.map(s => s.RIR).filter(r => r !== undefined && r >= 0);

  const avgReps = repsArr.length ? repsArr.reduce((a, b) => a + b, 0) / repsArr.length : 0;
  const minReps = repsArr.length ? Math.min(...repsArr) : 0;
  const maxReps = repsArr.length ? Math.max(...repsArr) : 0;
  const avgRIR  = rirArr.length  ? rirArr.reduce((a, b) => a + b, 0) / rirArr.length : 2;
  const totalSeries = todasSeries.length;

  // Tensión mecánica: reps bajas + RIR bajo (cerca del fallo con carga alta)
  const tensionScore = (minReps <= 5 ? 2 : minReps <= 7 ? 1 : 0) + (avgRIR <= 1 ? 1 : 0);
  const tensionNivel: NivelMecanismo = tensionScore >= 2 ? 'alto' : tensionScore === 1 ? 'medio' : 'bajo';

  // Estrés metabólico: reps altas (bomba), volumen moderado-alto
  const metaScore = (maxReps >= 12 ? 2 : maxReps >= 8 ? 1 : 0) + (totalSeries >= 10 ? 1 : 0);
  const metaNivel: NivelMecanismo = metaScore >= 2 ? 'alto' : metaScore === 1 ? 'medio' : 'bajo';

  // Daño muscular: rango medio 8-15 reps, variedad de ejercicios
  const variedad = ejercicios.length;
  const danoScore = (avgReps >= 7 && avgReps <= 15 ? 2 : avgReps >= 5 ? 1 : 0)
    + (variedad >= 4 ? 1 : 0);
  const danoNivel: NivelMecanismo = danoScore >= 2 ? 'alto' : danoScore === 1 ? 'medio' : 'bajo';

  const labels: Record<NivelMecanismo, { label: string; sublabel: string }> = {
    alto:  { label: 'Activado',  sublabel: 'Alto impacto' },
    medio: { label: 'Parcial',   sublabel: 'Impacto moderado' },
    bajo:  { label: 'Bajo',      sublabel: 'Poco estimulado' },
  };

  return {
    tension: {
      nivel: tensionNivel,
      ...labels[tensionNivel],
      descripcion: 'Tensión Mecánica',
      tip: tensionNivel === 'bajo'
        ? 'Prueba series de 3-6 reps con carga alta la próxima vez.'
        : tensionNivel === 'medio'
        ? 'Añade 1-2 series pesadas (≤6 reps) al inicio del entreno.'
        : 'Excelente carga mecánica. Tus fibras tipo II fueron reclutadas.',
    },
    metabolico: {
      nivel: metaNivel,
      ...labels[metaNivel],
      descripcion: 'Estrés Metabólico',
      tip: metaNivel === 'bajo'
        ? 'Incluye series de 12-15 reps para crear el "pump" anabólico.'
        : metaNivel === 'medio'
        ? 'Buen trabajo. Añade un ejercicio finalizador de altas reps.'
        : 'Acumulación de lactato óptima. Señal anabólica potente.',
    },
    dano: {
      nivel: danoNivel,
      ...labels[danoNivel],
      descripcion: 'Daño Muscular',
      tip: danoNivel === 'bajo'
        ? 'Controla más la fase excéntrica (bajada lenta, 3-4 seg).'
        : danoNivel === 'medio'
        ? 'Buena variedad. Enfócate en el rango completo de movimiento.'
        : 'Micro-roturas óptimas. Tus células satélite están activadas.',
    },
  };
}

const NIVEL_COLORS: Record<NivelMecanismo, { ring: string; bg: string; text: string; badge: string }> = {
  alto:  { ring: 'ring-green-500',  bg: 'bg-green-500/10',  text: 'text-green-500',  badge: 'bg-green-500/20 text-green-700 dark:text-green-300' },
  medio: { ring: 'ring-amber-400',  bg: 'bg-amber-400/10',  text: 'text-amber-500',  badge: 'bg-amber-400/20 text-amber-700 dark:text-amber-300' },
  bajo:  { ring: 'ring-muted',      bg: 'bg-muted/30',      text: 'text-muted-foreground', badge: 'bg-muted/50 text-muted-foreground' },
};

const MECANISMO_ICONS = {
  tension:   Zap,
  metabolico: Droplets,
  dano:      Activity,
};

function MecanismoCard({ tipo, data }: { tipo: keyof typeof MECANISMO_ICONS; data: Mecanismo }) {
  const Icon = MECANISMO_ICONS[tipo];
  const c = NIVEL_COLORS[data.nivel];
  return (
    <div className={`rounded-xl p-4 ring-1 ${c.ring} ${c.bg} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${c.text}`} />
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
          {data.label}
        </span>
      </div>
      <p className="font-bold text-sm leading-tight">{data.descripcion}</p>
      <p className="text-xs text-muted-foreground leading-snug">{data.tip}</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function WorkoutSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    const workoutData = location.state?.workout as WorkoutLog;
    if (!workoutData) { navigate('/'); return; }
    setWorkout(workoutData);
  }, [location, navigate]);

  if (!workout) return null;

  const volumenTotal = workout.ejercicios.reduce((total, ej) =>
    total + ej.series.reduce((sum, s) => sum + s.peso * s.repeticiones, 0), 0);
  const totalSeries = workout.ejercicios.reduce((t, ej) => t + ej.series.length, 0);
  const totalReps   = workout.ejercicios.reduce((t, ej) =>
    t + ej.series.reduce((sum, s) => sum + s.repeticiones, 0), 0);

  let serieMaxima = { ejercicio: '', peso: 0, reps: 0 };
  workout.ejercicios.forEach(ej => ej.series.forEach(s => {
    if (s.peso > serieMaxima.peso) serieMaxima = { ejercicio: ej.ejercicio?.nombre || 'Ejercicio', peso: s.peso, reps: s.repeticiones };
  }));

  const mecanismos = calcularMecanismos(workout.ejercicios);

  // Nivel global: cuántos mecanismos en "alto"
  const altos = Object.values(mecanismos).filter(m => m.nivel === 'alto').length;
  const sesionLabel = altos === 3 ? '🔱 Sesión Perfecta' : altos === 2 ? '⚡ Gran sesión' : altos === 1 ? '💪 Sesión sólida' : '📈 Sesión completada';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-8">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 text-center">
        <div className="container mx-auto max-w-4xl">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">¡Entrenamiento Completado!</h1>
          <p className="text-lg opacity-90">{workout.diaRutina}</p>
          <p className="mt-2 text-sm opacity-75">{sesionLabel}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-4 space-y-5">

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold">{workout.duracionReal}</p>
            <p className="text-sm text-muted-foreground">minutos</p>
          </CardContent></Card>

          <Card><CardContent className="pt-6 text-center">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold">{volumenTotal.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">kg totales</p>
          </CardContent></Card>

          <Card><CardContent className="pt-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold">{totalSeries}</p>
            <p className="text-sm text-muted-foreground">series</p>
          </CardContent></Card>

          <Card><CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold">{totalReps}</p>
            <p className="text-sm text-muted-foreground">repeticiones</p>
          </CardContent></Card>
        </div>

        {/* ── Mecanismos de hipertrofia ─────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Mecanismos de Hipertrofia</CardTitle>
                <CardDescription className="mt-1">
                  El músculo crece activando estos 3 estímulos biológicos
                </CardDescription>
              </div>
              <span className="text-2xl">{altos === 3 ? '🔱' : altos >= 2 ? '⚡' : '💪'}</span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MecanismoCard tipo="tension"   data={mecanismos.tension} />
            <MecanismoCard tipo="metabolico" data={mecanismos.metabolico} />
            <MecanismoCard tipo="dano"      data={mecanismos.dano} />
          </CardContent>
          {altos < 3 && (
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
                💡 <strong>Para maximizar ganancias</strong> combina series pesadas (3-6 reps) con series de bombeo (10-15 reps) y controla la bajada lenta. Activar los 3 mecanismos en cada sesión acelera la hipertrofia.
              </p>
            </div>
          )}
        </Card>

        {/* Serie más pesada */}
        {serieMaxima.peso > 0 && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-lg">Serie Más Pesada</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{serieMaxima.ejercicio}</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {serieMaxima.peso}kg × {serieMaxima.reps} reps
              </p>
            </CardContent>
          </Card>
        )}

        {/* Desglose por ejercicio */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose del Entrenamiento</CardTitle>
            <CardDescription>{workout.ejercicios.length} ejercicios completados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workout.ejercicios.map((ej, index) => {
              const volEj = ej.series.reduce((sum, s) => sum + s.peso * s.repeticiones, 0);
              const pesoMax = Math.max(...ej.series.map(s => s.peso));
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{ej.ejercicio?.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ej.series.length} series • {volEj.toLocaleString()}kg total
                      </p>
                    </div>
                    <Badge variant={ej.ejercicio?.tier === 'S' ? 'success' : 'default'}>
                      Tier {ej.ejercicio?.tier}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {ej.series.map((serie, sIndex) => (
                      <div key={sIndex} className="flex items-center justify-between text-sm bg-accent/30 p-2 rounded">
                        <span className="text-muted-foreground">Serie {serie.numero}</span>
                        <div className="font-medium">
                          <span className={serie.peso === pesoMax ? 'text-primary font-bold' : ''}>
                            {serie.peso}kg
                          </span>
                          {' × '}{serie.repeticiones} reps{' • '}
                          <span className="text-muted-foreground">RIR {serie.RIR}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recuperación */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Ventana de Crecimiento: 24-48h</CardTitle>
            </div>
            <CardDescription>
              El músculo NO crece en el gym — crece ahora, mientras descansas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">🥩</span>
              <span><strong>Proteína</strong> — 30-40g en las próximas 2h para iniciar la síntesis proteica</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">⚡</span>
              <span><strong>Calorías</strong> — No te quedes en déficit hoy, el crecimiento necesita energía</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">😴</span>
              <span><strong>Sueño</strong> — 7-9h esta noche: la hormona de crecimiento se libera en fase profunda</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">💧</span>
              <span><strong>Hidratación</strong> — 500ml ahora, las células musculares absorben agua para recuperarse</span>
            </p>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" variant="outline" onClick={() => navigate('/progress')} className="h-14">
            <TrendingUp className="w-5 h-5 mr-2" />
            Ver Progreso
          </Button>
          <Button size="lg" onClick={() => navigate('/')} className="h-14">
            Volver al Inicio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
