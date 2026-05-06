import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Plus, Loader2, CheckCircle } from 'lucide-react';
import { useGymContext } from '@/hooks/useGymContext';

interface GymSelectorProps {
  open: boolean;
  onSelect: (gymId: string, gymNombre: string) => void;
  onClose: () => void;
}

export default function GymSelector({ open, onSelect, onClose }: GymSelectorProps) {
  const { gymActual, gymsConocidos, detectandoGym, detectarGymPorUbicacion, crearNuevoGym } = useGymContext();
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);
  const [detectMsg, setDetectMsg] = useState('');

  const handleDetectar = async () => {
    setDetectMsg('');
    const found = await detectarGymPorUbicacion();
    if (found) {
      setDetectMsg(`✓ Gym detectado: ${found.gymNombre}`);
      onSelect(found.gymId, found.gymNombre);
    } else {
      setDetectMsg('No se encontró ningún gym conocido cerca.');
    }
  };

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      const info = await crearNuevoGym(nuevoNombre.trim());
      onSelect(info.gymId, info.gymNombre);
      setNuevoNombre('');
    } finally {
      setCreando(false);
    }
  };

  const sorted = [...gymsConocidos].sort((a, b) => {
    if (gymActual && a.gymId === gymActual.gymId) return -1;
    if (gymActual && b.gymId === gymActual.gymId) return 1;
    return (b.count ?? 0) - (a.count ?? 0);
  });

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            ¿En qué gym entrenas hoy?
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {sorted.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Mis gyms</Label>
              <div className="mt-2 space-y-2">
                {sorted.map(g => (
                  <button
                    key={g.gymId}
                    onClick={() => onSelect(g.gymId, g.gymNombre)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{g.gymNombre}</p>
                        {g.count != null && (
                          <p className="text-xs text-muted-foreground">{g.count} máquinas guardadas</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {gymActual?.gymId === g.gymId && (
                        <Badge variant="secondary" className="text-xs">Actual</Badge>
                      )}
                      {g.lat != null && (
                        <MapPin className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nuevo gym</Label>
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Ej: Holmes Place Diagonal"
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCrear()}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleDetectar}
                  disabled={detectandoGym}
                >
                  {detectandoGym ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  Detectar ubicación
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 flex-1"
                  onClick={handleCrear}
                  disabled={!nuevoNombre.trim() || creando}
                >
                  {creando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Guardar gym
                </Button>
              </div>
              {detectMsg && (
                <p className={`text-xs flex items-center gap-1 ${detectMsg.startsWith('✓') ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {detectMsg.startsWith('✓') && <CheckCircle className="w-3 h-3" />}
                  {detectMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
