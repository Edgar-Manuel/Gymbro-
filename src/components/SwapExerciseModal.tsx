import { useEffect, useState } from 'react';
import { dbHelpers } from '@/db';
import type { EjercicioEnRutina, ExerciseKnowledge, Tier } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Dumbbell, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  ejercicioActual: EjercicioEnRutina;
  onSwap: (nuevo: EjercicioEnRutina) => void;
}

const TIER_ORDER: Tier[] = ['S', 'A', 'B', 'C', 'F'];

function tierDistance(a: Tier, b: Tier): number {
  return Math.abs(TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b));
}

const tierColors: Record<Tier, string> = {
  S: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  B: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  C: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  F: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const equipLabel: Record<string, string> = {
  barra: 'Barra',
  mancuerna: 'Mancuernas',
  polea: 'Polea',
  peso_corporal: 'Peso corporal',
  maquina: 'Máquina',
};

export default function SwapExerciseModal({ open, onClose, ejercicioActual, onSwap }: Props) {
  const [alternatives, setAlternatives] = useState<ExerciseKnowledge[]>([]);
  const [loading, setLoading] = useState(false);

  const currentEx = ejercicioActual.ejercicio;

  useEffect(() => {
    if (!open || !currentEx) return;

    setLoading(true);
    dbHelpers.getExercisesByMuscleGroup(currentEx.grupoMuscular).then((all) => {
      const filtered = all
        .filter((ex) => ex.id !== currentEx.id)
        .sort((a, b) => {
          // Priorizar mismo tier primero, luego compuestos, luego distancia de tier
          const tierDiffA = tierDistance(a.tier, currentEx.tier);
          const tierDiffB = tierDistance(b.tier, currentEx.tier);
          if (tierDiffA !== tierDiffB) return tierDiffA - tierDiffB;
          if (a.categoria === 'compuesto' && b.categoria !== 'compuesto') return -1;
          if (b.categoria === 'compuesto' && a.categoria !== 'compuesto') return 1;
          return 0;
        })
        .slice(0, 6);
      setAlternatives(filtered);
      setLoading(false);
    });
  }, [open, currentEx]);

  const handleSelect = (ex: ExerciseKnowledge) => {
    onSwap({
      ...ejercicioActual,
      ejercicioId: ex.id,
      ejercicio: ex,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Máquina ocupada
          </DialogTitle>
          <DialogDescription>
            Sustitutos para <strong>{currentEx?.nombre}</strong> — mismo músculo, similar intensidad
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : alternatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Dumbbell className="w-8 h-8" />
              <p className="text-sm">No hay sustitutos disponibles</p>
            </div>
          ) : (
            alternatives.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight capitalize group-hover:text-primary transition-colors">
                      {ex.nombre}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ex.equipamiento.map((eq) => (
                        <span
                          key={eq}
                          className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {equipLabel[eq] || eq}
                        </span>
                      ))}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                        {ex.categoria}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${tierColors[ex.tier]}`}>
                    Tier {ex.tier}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
