import type { BodyMeasurement, UserProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  calculateBMI,
  getBMICategory,
  calculateLeanMass,
  calculateFatMass,
  calculateWaistHipRatio,
  getWaistHipRiskCategory,
  calculateWaistHeightRatio,
  getWaistHeightRiskCategory,
  calculateDelta,
  calculateTrend,
  readField,
} from '@/utils/bodyCalculations';
import { TrendingUp, TrendingDown, Minus, Activity, Ruler, Scale, Flame, Droplet } from 'lucide-react';

const colorToBadgeClass: Record<string, string> = {
  green: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
};

function DeltaPill({ abs, suffix, lowerIsBetter = false }: { abs: number; suffix: string; lowerIsBetter?: boolean }) {
  const direction = Math.abs(abs) < 0.01 ? 'flat' : abs > 0 ? 'up' : 'down';
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  // up = malo cuando lowerIsBetter (peso, grasa, cintura). Si subes peso pero quieres bajar = rojo.
  const isPositiveOutcome =
    direction === 'flat'
      ? null
      : lowerIsBetter
        ? direction === 'down'
        : direction === 'up';
  const cls =
    isPositiveOutcome === null ? 'text-muted-foreground'
      : isPositiveOutcome ? 'text-green-600 dark:text-green-400'
        : 'text-orange-600 dark:text-orange-400';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" />
      {abs > 0 ? '+' : ''}{abs.toFixed(1)}{suffix}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  badge,
  delta,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  unit?: string;
  badge?: { label: string; color: string };
  delta?: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </div>
          {badge && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorToBadgeClass[badge.color] ?? ''}`}>
              {badge.label}
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold leading-none">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        <div className="flex items-center justify-between mt-1.5 min-h-[18px]">
          {delta || <span />}
          {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  measurements: BodyMeasurement[];
  user: UserProfile;
}

/**
 * Renderiza tarjetas con métricas calculadas a partir de la última medición:
 * IMC, masa magra/grasa, ratios cintura/cadera y cintura/altura, y tendencias
 * temporales de peso (7d/30d/90d).
 */
export default function BodyMetricsCards({ measurements, user }: Props) {
  if (!measurements.length) return null;
  const latest = measurements[0];
  const prev = measurements[1];

  const bmi = calculateBMI(latest.peso, user.altura);
  const bmiCat = getBMICategory(bmi);
  const leanMass = calculateLeanMass(latest.peso, latest.grasaCorporal);
  const fatMass = calculateFatMass(latest.peso, latest.grasaCorporal);

  const cintura = readField(latest, 'cintura');
  const cadera = readField(latest, 'cadera');
  const whr = calculateWaistHipRatio(cintura, cadera);
  const whrCat = getWaistHipRiskCategory(whr, user.sexo);
  const whtr = calculateWaistHeightRatio(cintura, user.altura);
  const whtrCat = getWaistHeightRiskCategory(whtr);

  // Deltas vs medición anterior
  const pesoDelta = calculateDelta(latest.peso, prev?.peso);
  const grasaDelta = calculateDelta(latest.grasaCorporal, prev?.grasaCorporal);

  // Tendencias temporales para peso
  const trend7 = calculateTrend(measurements, 'peso', 7);
  const trend30 = calculateTrend(measurements, 'peso', 30);
  const trend90 = calculateTrend(measurements, 'peso', 90);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5" />
        Métricas calculadas
      </h4>

      {/* Fila 1: IMC + masa grasa + masa magra */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          icon={Scale}
          label="IMC"
          value={bmi != null ? bmi.toFixed(1) : '—'}
          badge={bmiCat ? { label: bmiCat.label, color: bmiCat.color } : undefined}
          hint={bmiCat?.range}
        />
        {fatMass != null && (
          <MetricCard
            icon={Droplet}
            label="Masa grasa"
            value={fatMass.toFixed(1)}
            unit="kg"
            hint={`${latest.grasaCorporal?.toFixed(1)}%`}
          />
        )}
        {leanMass != null && (
          <MetricCard
            icon={Flame}
            label="Masa magra"
            value={leanMass.toFixed(1)}
            unit="kg"
          />
        )}
      </div>

      {/* Fila 2: Ratios de salud */}
      {(whr != null || whtr != null) && (
        <div className="grid grid-cols-2 gap-3">
          {whr != null && (
            <MetricCard
              icon={Ruler}
              label="Cintura / Cadera"
              value={whr.toFixed(2)}
              badge={whrCat ? { label: whrCat.label, color: whrCat.color } : undefined}
            />
          )}
          {whtr != null && (
            <MetricCard
              icon={Ruler}
              label="Cintura / Altura"
              value={whtr.toFixed(2)}
              badge={whtrCat ? { label: whtrCat.label, color: whtrCat.color } : undefined}
            />
          )}
        </div>
      )}

      {/* Fila 3: Cambios y tendencias del peso */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Cambios de peso
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <TrendCol label="Anterior" delta={pesoDelta?.abs} />
            <TrendCol label="7 días" delta={trend7?.abs} />
            <TrendCol label="30 días" delta={trend30?.abs} />
            <TrendCol label="90 días" delta={trend90?.abs} />
          </div>
          {grasaDelta != null && (
            <div className="mt-2 pt-2 border-t flex items-center justify-between text-sm">
              <span className="text-xs text-muted-foreground">Grasa vs anterior</span>
              <DeltaPill abs={grasaDelta.abs} suffix="%" lowerIsBetter />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrendCol({ label, delta }: { label: string; delta?: number }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {delta != null
        ? <DeltaPill abs={delta} suffix="kg" lowerIsBetter />
        : <span className="text-xs text-muted-foreground/60">—</span>}
    </div>
  );
}
