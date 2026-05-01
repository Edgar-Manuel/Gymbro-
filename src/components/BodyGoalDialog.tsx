import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { BodyGoal } from '@/types';
import { Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BodyGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricKey: string;
  metricLabel: string;
  metricUnit: string;
  currentValue?: number;          // valor actual de la métrica
  existingGoal?: BodyGoal;
  onSave: (goal: BodyGoal) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export default function BodyGoalDialog({
  open, onOpenChange, metricKey, metricLabel, metricUnit,
  currentValue, existingGoal, onSave, onDelete,
}: BodyGoalDialogProps) {
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setTarget(existingGoal ? String(existingGoal.target) : '');
      setDeadline(existingGoal?.deadline ?? '');
      setError(null);
    }
  }, [open, existingGoal]);

  const handleSave = async () => {
    const t = parseFloat(target);
    if (isNaN(t) || t <= 0) {
      setError('Introduce un valor objetivo válido');
      return;
    }
    if (currentValue != null && Math.abs(currentValue - t) < 0.01) {
      setError('El objetivo coincide con tu valor actual');
      return;
    }
    if (deadline && new Date(deadline + 'T23:59:59').getTime() < Date.now()) {
      setError('La fecha límite no puede ser pasada');
      return;
    }

    const goal: BodyGoal = {
      metric: metricKey,
      target: t,
      deadline: deadline || undefined,
      startValue: existingGoal?.startValue ?? currentValue,
      createdAt: existingGoal?.createdAt ?? new Date().toISOString(),
    };
    await onSave(goal);
    toast.success(existingGoal ? 'Objetivo actualizado' : 'Objetivo creado');
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete();
    toast.success('Objetivo borrado');
    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {existingGoal ? 'Editar objetivo' : 'Nuevo objetivo'}: {metricLabel}
          </DialogTitle>
          <DialogDescription>
            {currentValue != null
              ? <>Tu valor actual es <strong>{currentValue} {metricUnit}</strong>. ¿A dónde quieres llegar?</>
              : <>Define el valor que quieres alcanzar.</>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="target">Objetivo ({metricUnit}) *</Label>
            <Input
              id="target"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={target}
              onChange={(e) => { setTarget(e.target.value); setError(null); }}
              placeholder={currentValue != null ? String(currentValue) : '75'}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="deadline">Fecha límite (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => { setDeadline(e.target.value); setError(null); }}
              min={new Date().toISOString().slice(0, 10)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si la fijas, calcularemos el ritmo necesario por semana.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          {existingGoal && onDelete && (
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive hover:text-destructive sm:mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Borrar objetivo
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      title="¿Borrar este objetivo?"
      description="Perderás el progreso registrado contra esta meta."
      confirmLabel="Borrar"
      onConfirm={handleDelete}
    />
    </>
  );
}
