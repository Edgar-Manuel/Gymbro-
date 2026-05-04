import { useMemo } from 'react';
import type { RutinaSemanal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const GRUPO_LABELS: Record<string, string> = {
  pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas',
  hombros: 'Hombros', biceps: 'Bíceps', triceps: 'Tríceps',
  abdominales: 'Core', antebrazos: 'Antebrazos',
  femorales_gluteos: 'Femorales/Glúteos',
};

const GRUPOS_OBJETIVO = ['pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps'];

const PUSH = new Set(['pecho', 'hombros', 'triceps']);
const PULL = new Set(['espalda', 'biceps']);
const UPPER = new Set(['pecho', 'espalda', 'hombros', 'biceps', 'triceps']);
const LOWER = new Set(['piernas', 'femorales_gluteos']);

interface Props {
  rutina: RutinaSemanal;
}

/**
 * Estadísticas resumidas de una rutina generada:
 * - Distribución de ejercicios por grupo muscular (con conteo)
 * - Volumen estimado total (sets × reps medios)
 * - Balance empuje/tirón y superior/inferior
 * - Avisos: grupos no entrenados
 */
export default function RoutineStats({ rutina }: Props) {
  const stats = useMemo(() => {
    const distribucion = new Map<string, number>();
    let setsTotales = 0;
    let setsPush = 0;
    let setsPull = 0;
    let setsUpper = 0;
    let setsLower = 0;
    let estimacionRepsTotales = 0;

    const dias = rutina.dias ?? rutina.diasRutina ?? [];

    for (const dia of dias) {
      for (const ej of dia.ejercicios ?? []) {
        const grupo = ej.ejercicio?.grupoMuscular;
        if (!grupo) continue;
        const sets = ej.seriesObjetivo ?? 0;
        const reps = Array.isArray(ej.repsObjetivo)
          ? (ej.repsObjetivo[0] + ej.repsObjetivo[1]) / 2
          : ej.repsObjetivo;
        distribucion.set(grupo, (distribucion.get(grupo) ?? 0) + sets);
        setsTotales += sets;
        estimacionRepsTotales += sets * reps;
        if (PUSH.has(grupo)) setsPush += sets;
        if (PULL.has(grupo)) setsPull += sets;
        if (UPPER.has(grupo)) setsUpper += sets;
        if (LOWER.has(grupo)) setsLower += sets;
      }
    }

    // Grupos objetivo NO presentes
    const noEntrenados = GRUPOS_OBJETIVO.filter(g => !distribucion.has(g));

    const distribucionOrdenada = Array.from(distribucion.entries())
      .map(([grupo, sets]) => ({ grupo, label: GRUPO_LABELS[grupo] ?? grupo, sets }))
      .sort((a, b) => b.sets - a.sets);

    return {
      distribucion: distribucionOrdenada,
      setsTotales,
      estimacionRepsTotales,
      setsPush,
      setsPull,
      setsUpper,
      setsLower,
      noEntrenados,
      diasCount: dias.filter(d => (d.ejercicios?.length ?? 0) > 0).length,
    };
  }, [rutina]);

  if (stats.distribucion.length === 0) return null;

  const totalSets = stats.setsTotales;
  const balancePushPull = stats.setsPull > 0 ? stats.setsPush / stats.setsPull : 0;
  const balanceUpperLower = stats.setsLower > 0 ? stats.setsUpper / stats.setsLower : 0;

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">Estadísticas de la rutina</h4>
        </div>

        {/* Avisos */}
        {stats.noEntrenados.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium">Grupos no entrenados: </span>
              {stats.noEntrenados.map(g => GRUPO_LABELS[g] ?? g).join(', ')}
            </div>
          </div>
        )}

        {/* Distribución */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Distribución de sets por grupo muscular</p>
          <div className="space-y-1.5">
            {stats.distribucion.map(({ grupo, label, sets }) => {
              const pct = totalSets > 0 ? (sets / totalSets) * 100 : 0;
              return (
                <div key={grupo} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 truncate">{label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right tabular-nums text-muted-foreground">{sets} sets</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance + Volumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
          <div>
            <p className="text-[10px] text-muted-foreground">Sets/semana</p>
            <p className="text-sm font-semibold">{stats.setsTotales}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Reps/semana</p>
            <p className="text-sm font-semibold">{Math.round(stats.estimacionRepsTotales)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Empuje/Tirón</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              {balancePushPull.toFixed(2)}
              <BalanceIcon ratio={balancePushPull} />
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Sup/Inf</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              {balanceUpperLower.toFixed(2)}
              <BalanceIcon ratio={balanceUpperLower} />
            </p>
          </div>
        </div>

        {/* Hint si hay desbalance */}
        {stats.setsPull > 0 && (balancePushPull > 1.5 || balancePushPull < 0.67) && (
          <Badge variant="outline" className="text-[10px]">
            ⚠ Desbalance empuje/tirón {balancePushPull > 1.5 ? '— exceso de empuje' : '— exceso de tirón'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function BalanceIcon({ ratio }: { ratio: number }) {
  if (ratio > 1.3) return <ArrowUp className="w-3 h-3 text-orange-500" />;
  if (ratio < 0.77) return <ArrowDown className="w-3 h-3 text-orange-500" />;
  return null;
}
