import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Plus, Loader2, CheckCircle, ChevronRight, Map, X } from 'lucide-react';
import MapPicker from '@/components/MapPicker';
import { useGymContext } from '@/hooks/useGymContext';
import type { GymInfo } from '@/hooks/useGymContext';

interface GymSelectorProps {
  open: boolean;
  /** If true, the user MUST select a gym to continue (no cancel button) */
  required?: boolean;
  onSelect: (gymId: string, gymNombre: string) => void;
  onClose: () => void;
}

type View = 'list' | 'create' | 'map';

export default function GymSelector({ open, required = false, onSelect, onClose }: GymSelectorProps) {
  const { gymActual, gymsConocidos, detectandoGym, detectarGymPorUbicacion, crearNuevoGym } = useGymContext();
  const [view, setView] = useState<View>('list');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [creando, setCreando] = useState(false);
  const [detectMsg, setDetectMsg] = useState('');
  const [autoDetecting, setAutoDetecting] = useState(false);

  // Auto-detect GPS on open if required
  useEffect(() => {
    if (!open) return;
    setView('list');
    setDetectMsg('');

    if (gymsConocidos.length > 0) {
      setAutoDetecting(true);
      detectarGymPorUbicacion().then(found => {
        if (found) {
          setDetectMsg(`✓ ${found.gymNombre} detectado`);
          onSelect(found.gymId, found.gymNombre);
        }
      }).finally(() => setAutoDetecting(false));
    }
  }, [open]);

  const handleDetectar = async () => {
    setDetectMsg('');
    const found = await detectarGymPorUbicacion();
    if (found) {
      setDetectMsg(`✓ Gym detectado: ${found.gymNombre}`);
      onSelect(found.gymId, found.gymNombre);
    } else {
      setDetectMsg('No se encontró ningún gym conocido cerca. Puedes crearlo.');
    }
  };

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      const info = await crearNuevoGym(nuevoNombre.trim(), coords ?? undefined);
      onSelect(info.gymId, info.gymNombre);
      setNuevoNombre('');
      setCoords(null);
      setView('list');
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
    <Sheet open={open} onOpenChange={v => { if (!v && !required) onClose(); }}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <button onClick={() => setView('list')} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
            <SheetTitle className="flex items-center gap-2 text-base flex-1">
              <Building2 className="w-4 h-4" />
              {view === 'list' && '¿En qué gym entrenas hoy?'}
              {view === 'create' && 'Añadir nuevo gym'}
              {view === 'map' && 'Ubicación del gym'}
            </SheetTitle>
            {!required && view === 'list' && (
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* ── VISTA LISTA ─────────────────────────────────── */}
          {view === 'list' && (
            <>
              {/* Auto-detecting banner */}
              {autoDetecting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/40">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Detectando gym cercano…
                </div>
              )}

              {detectMsg && (
                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                  detectMsg.startsWith('✓')
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                    : 'bg-muted/40 text-muted-foreground'
                }`}>
                  {detectMsg.startsWith('✓') && <CheckCircle className="w-4 h-4 shrink-0" />}
                  {detectMsg}
                </div>
              )}

              {/* Known gyms */}
              {sorted.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Mis gyms</Label>
                  {sorted.map(g => (
                    <GymRow
                      key={g.gymId}
                      gym={g}
                      isActual={gymActual?.gymId === g.gymId}
                      onSelect={() => onSelect(g.gymId, g.gymNombre)}
                    />
                  ))}
                </div>
              )}

              {/* GPS detect button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleDetectar}
                disabled={detectandoGym || autoDetecting}
              >
                {detectandoGym ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Detectar gym por GPS
              </Button>

              {/* Add new gym */}
              <button
                onClick={() => setView('create')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-muted-foreground/40 hover:border-primary/50 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plus className="w-4 h-4" />
                  Añadir nuevo gym
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          )}

          {/* ── VISTA CREAR ─────────────────────────────────── */}
          {view === 'create' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1.5 block">Nombre del gym</Label>
                <Input
                  placeholder="Ej: Holmes Place Diagonal"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCrear()}
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Ubicación (opcional)</Label>
                  <button
                    onClick={() => setView('map')}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Map className="w-3 h-3" />
                    {coords ? 'Cambiar en mapa' : 'Abrir mapa'}
                  </button>
                </div>

                {coords ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="text-xs text-green-700 dark:text-green-300">
                      <p className="font-medium">Ubicación marcada</p>
                      <p className="text-[10px] opacity-70">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
                    </div>
                    <button
                      onClick={() => setCoords(null)}
                      className="ml-auto text-green-600 hover:text-green-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setView('map')}
                    className="w-full h-20 rounded-lg border border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-muted/10 transition-colors"
                  >
                    <Map className="w-5 h-5 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">Toca para marcar en mapa</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                La ubicación permite detectar automáticamente este gym cuando estés cerca.
              </p>
            </div>
          )}

          {/* ── VISTA MAPA ──────────────────────────────────── */}
          {view === 'map' && (
            <div className="space-y-3">
              <MapPicker
                lat={coords?.lat}
                lng={coords?.lng}
                onChange={(lat, lng) => setCoords({ lat, lng })}
              />
              <p className="text-xs text-muted-foreground text-center">
                Mueve el pin a la entrada del gym. Usa "Mi ubicación" si estás allí ahora.
              </p>
              <Button
                className="w-full"
                onClick={() => setView('create')}
                disabled={!coords}
              >
                {coords ? 'Confirmar ubicación' : 'Marca el gym en el mapa primero'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {view === 'create' && (
          <div className="px-4 pb-6 pt-3 border-t bg-background shrink-0">
            <Button
              className="w-full"
              onClick={handleCrear}
              disabled={!nuevoNombre.trim() || creando}
            >
              {creando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Guardar gym
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function GymRow({ gym, isActual, onSelect }: { gym: GymInfo; isActual: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
        isActual
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActual ? 'bg-primary/15' : 'bg-muted'}`}>
          <Building2 className={`w-4 h-4 ${isActual ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className={`font-medium text-sm ${isActual ? 'text-primary' : ''}`}>{gym.gymNombre}</p>
          <p className="text-xs text-muted-foreground">
            {gym.count != null && gym.count > 0 ? `${gym.count} fotos guardadas` : 'Sin fotos aún'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isActual && <Badge variant="secondary" className="text-[10px]">Último</Badge>}
        {gym.lat != null && <MapPin className="w-3 h-3 text-green-500" />}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}
