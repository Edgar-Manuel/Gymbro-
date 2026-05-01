import type { BodyGoal } from '@/types';
import type { GoalProgress } from '@/utils/bodyGoals';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Pencil, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  goal: BodyGoal;
  progress: GoalProgress;
  metricLabel: string;
  metricUnit: string;
  currentValue: number;
  onEdit: () => void;
}

export default function BodyGoalProgress({
  goal, progress, metricLabel, metricUnit, currentValue, onEdit,
}: Props) {
  const { percent, remaining, daysToDeadline, paceRequired, paceCurrent, isReached, direction } = progress;

  // Mensaje principal
  const remainingAbs = Math.abs(remaining);
  const verb = direction === 'down' ? 'bajar' : direction === 'up' ? 'subir' : 'mantener';

  // Comparación de ritmo
  let paceVerdict: { label: string; color: string } | null = null;
  if (paceRequired != null && paceCurrent != null && !isReached) {
    // Convierte a "magnitud absoluta hacia el target"
    const requiredMag = Math.abs(paceRequired);
    const currentMag = direction === 'down'
      ? -paceCurrent  // si bajas peso, paceCurrent negativo → magnitud positiva
      : paceCurrent;  // si subes peso, paceCurrent positivo

    if (currentMag >= requiredMag * 0.9) {
      paceVerdict = { label: '✓ Vas en buen ritmo', color: 'text-green-600 dark:text-green-400' };
    } else if (currentMag > 0) {
      paceVerdict = { label: '⚠ Ritmo insuficiente', color: 'text-orange-600 dark:text-orange-400' };
    } else {
      paceVerdict = { label: '✗ Ritmo opuesto al objetivo', color: 'text-destructive' };
    }
  }

  return (
    <div className="mt-4 p-3 border rounded-lg bg-primary/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Objetivo: {goal.target} {metricUnit}
          </span>
          {isReached && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Alcanzado
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onEdit}>
          <Pencil className="w-3 h-3 mr-1" />
          Editar
        </Button>
      </div>

      <Progress value={percent} className="h-2" />

      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>
          {goal.startValue != null && (
            <>{goal.startValue} {metricUnit} → </>
          )}
          <strong className="text-foreground">{currentValue.toFixed(1)} {metricUnit}</strong>
        </span>
        <span>{percent.toFixed(0)}%</span>
      </div>

      {!isReached && (
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Falta:</span>
            <strong className="text-foreground">
              {verb} {remainingAbs.toFixed(1)} {metricUnit}
            </strong>
          </div>

          {goal.deadline && daysToDeadline != null && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {daysToDeadline > 0 ? (
                <>
                  <span className="text-muted-foreground">
                    {daysToDeadline} {daysToDeadline === 1 ? 'día' : 'días'} hasta el {new Date(goal.deadline).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  Fecha límite vencida hace {Math.abs(daysToDeadline)} {Math.abs(daysToDeadline) === 1 ? 'día' : 'días'}
                </span>
              )}
            </div>
          )}

          {paceRequired != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Ritmo necesario:</span>
              <strong className="text-foreground">
                {paceRequired > 0 ? '+' : ''}{paceRequired.toFixed(2)} {metricUnit}/sem
              </strong>
            </div>
          )}

          {paceCurrent != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Tu ritmo actual:</span>
              <strong className="text-foreground">
                {paceCurrent > 0 ? '+' : ''}{paceCurrent.toFixed(2)} {metricUnit}/sem
              </strong>
              {paceVerdict && <span className={`ml-1 ${paceVerdict.color}`}>{paceVerdict.label}</span>}
            </div>
          )}
        </div>
      )}

      {!metricLabel.includes('%') && (
        <span className="sr-only">{metricLabel}</span>
      )}
    </div>
  );
}
