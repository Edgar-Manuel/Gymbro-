import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SerieLog } from '@/types';
import { Pencil } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serie: SerieLog | null;
  onSave: (updated: SerieLog) => void | Promise<void>;
}

/**
 * Modal para editar una serie ya registrada (peso, reps, RIR, o tiempo
 * en sets isométricos). Muestra solo los campos relevantes según el
 * tipo de set (WEIGHT / BODYWEIGHT / TIME).
 */
export default function EditSerieDialog({ open, onOpenChange, serie, onSave }: Props) {
  const [reps, setReps] = useState('');
  const [peso, setPeso] = useState('');
  const [tiempoSegundos, setTiempoSegundos] = useState('');
  const [rir, setRir] = useState(2);

  useEffect(() => {
    if (open && serie) {
      setReps(String(serie.repeticiones ?? ''));
      setPeso(String(serie.peso ?? ''));
      setTiempoSegundos(String(serie.tiempoSegundos ?? ''));
      setRir(serie.RIR ?? 2);
    }
  }, [open, serie]);

  if (!serie) return null;

  const tipo = serie.tipo ?? 'WEIGHT';

  const handleSave = async () => {
    const updated: SerieLog = {
      ...serie,
      repeticiones: tipo === 'TIME' ? 0 : parseInt(reps || '0'),
      peso: tipo === 'WEIGHT' ? parseFloat(peso || '0') : 0,
      RIR: rir,
      tiempoSegundos: tipo === 'TIME' ? parseInt(tiempoSegundos || '0') : undefined,
    };
    await onSave(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Editar Serie {serie.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {tipo === 'TIME' ? (
            <div>
              <Label htmlFor="edit-tiempo">Duración (segundos)</Label>
              <Input
                id="edit-tiempo"
                type="number"
                inputMode="numeric"
                value={tiempoSegundos}
                onChange={(e) => setTiempoSegundos(e.target.value)}
                className="text-lg font-semibold text-center h-12"
                min="1"
              />
            </div>
          ) : (
            <div className={tipo === 'BODYWEIGHT' ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-3'}>
              <div>
                <Label htmlFor="edit-reps">Repeticiones</Label>
                <Input
                  id="edit-reps"
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="text-lg font-semibold text-center h-12"
                  min="1"
                  max="99"
                />
              </div>
              {tipo === 'WEIGHT' && (
                <div>
                  <Label htmlFor="edit-peso">Peso (kg)</Label>
                  <Input
                    id="edit-peso"
                    type="number"
                    step="0.25"
                    inputMode="decimal"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="text-lg font-semibold text-center h-12"
                    min="0"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="edit-rir">RIR</Label>
            <Select value={rir.toString()} onValueChange={(v) => setRir(parseInt(v))}>
              <SelectTrigger id="edit-rir" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">RIR 0 (fallo)</SelectItem>
                <SelectItem value="1">RIR 1</SelectItem>
                <SelectItem value="2">RIR 2</SelectItem>
                <SelectItem value="3">RIR 3</SelectItem>
                <SelectItem value="4">RIR 4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
