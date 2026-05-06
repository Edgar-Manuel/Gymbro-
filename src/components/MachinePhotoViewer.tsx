import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import type { MachinePhoto } from '@/types';

const TIPO_LABELS: Record<string, string> = {
  general: 'General', ajustes: 'Ajustes', posicion: 'Posición', referencia: 'Referencia', pantalla: 'Pantalla',
};

const AJUSTE_LABELS: Record<string, { label: string; icon: string }> = {
  asiento: { label: 'Asiento', icon: '🪑' },
  respaldo: { label: 'Respaldo', icon: '🔧' },
  rodilleras: { label: 'Rodilleras', icon: '🦵' },
  palanca: { label: 'Palanca', icon: '⚙️' },
  cable: { label: 'Cable', icon: '🔗' },
  cargaReferencia: { label: 'Carga ref.', icon: '⚖️' },
};

interface MachinePhotoViewerProps {
  open: boolean;
  fotos: MachinePhoto[];
  ejercicioNombre: string;
  gymNombre: string;
  onEditar: (photo: MachinePhoto) => void;
  onEliminar: (id: string) => void;
  onAñadirFoto: () => void;
  onClose: () => void;
}

export default function MachinePhotoViewer({
  open, fotos, ejercicioNombre, gymNombre, onEditar, onEliminar, onAñadirFoto, onClose,
}: MachinePhotoViewerProps) {
  const [idx, setIdx] = useState(0);
  const foto = fotos[Math.min(idx, fotos.length - 1)];
  if (!foto) return null;

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(fotos.length - 1, i + 1));

  const ajustesEntries = foto.ajustes
    ? Object.entries(foto.ajustes).filter(([k, v]) => v && k !== 'notasAjuste')
    : [];

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="h-[88vh] overflow-y-auto p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-base">{ejercicioNombre}</SheetTitle>
          <Badge variant="outline" className="w-fit text-xs">{gymNombre}</Badge>
        </SheetHeader>

        {/* Carrusel */}
        <div className="relative bg-black aspect-[4/3] mx-4 rounded-xl overflow-hidden">
          <img src={foto.url} alt={ejercicioNombre} className="w-full h-full object-contain" />
          <Badge className="absolute top-2 left-2 text-[10px]">{TIPO_LABELS[foto.tipo] ?? foto.tipo}</Badge>
          {fotos.length > 1 && (
            <>
              <button onClick={prev} disabled={idx === 0} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button onClick={next} disabled={idx === fotos.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30">
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {fotos.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-4 py-3 space-y-4">
          {/* Ajustes */}
          {ajustesEntries.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Ajustes</p>
              <div className="grid grid-cols-2 gap-2">
                {ajustesEntries.map(([k, v]) => {
                  const info = AJUSTE_LABELS[k];
                  return (
                    <div key={k} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                      <span>{info?.icon ?? '•'}</span>
                      <div>
                        <p className="text-xs text-muted-foreground">{info?.label ?? k}</p>
                        <p className="font-medium text-sm leading-tight">{v as string}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {foto.ajustes?.notasAjuste && (
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Notas de ajuste</p>
              <p>{foto.ajustes.notasAjuste}</p>
            </div>
          )}

          {foto.notas && (
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Notas generales</p>
              <p>{foto.notas}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Guardada el {new Date(foto.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {/* Acciones */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onAñadirFoto}>
              <Plus className="w-4 h-4" /> Añadir foto
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEditar(foto)}>
              <Pencil className="w-4 h-4" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
                  <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onEliminar(foto.id); onClose(); }} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Thumbnails historial */}
          {fotos.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Historial</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {fotos.map((f, i) => (
                  <button key={f.id} onClick={() => setIdx(i)} className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-primary' : 'border-transparent'}`}>
                    <img src={f.url} alt="" className="w-14 h-14 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
