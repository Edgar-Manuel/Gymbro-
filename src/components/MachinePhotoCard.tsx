import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Camera } from 'lucide-react';
import type { MachinePhoto } from '@/types';

interface MachinePhotoCardProps {
  photo: MachinePhoto;
  todasFotos: MachinePhoto[];
  ejercicioNombre: string;
  gymNombre: string;
  onVerDetalle: () => void;
  onAñadirFoto: () => void;
  onDismiss: () => void;
}

export default function MachinePhotoCard({
  photo, todasFotos, ejercicioNombre, gymNombre, onVerDetalle, onAñadirFoto, onDismiss,
}: MachinePhotoCardProps) {
  const [imgError, setImgError] = useState(false);

  const ajustesVisibles = photo.ajustes
    ? Object.entries(photo.ajustes)
        .filter(([k, v]) => v && k !== 'notasAjuste')
        .slice(0, 3)
    : [];

  const labelMap: Record<string, string> = {
    asiento: 'Asiento', respaldo: 'Respaldo', rodilleras: 'Rodilleras',
    palanca: 'Palanca', cable: 'Cable', cargaReferencia: 'Carga ref.',
  };

  return (
    <div className="rounded-lg border bg-card p-3 mb-3">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={onVerDetalle}
        >
          {!imgError ? (
            <img
              src={photo.url}
              alt={ejercicioNombre}
              className="w-20 h-20 rounded-lg object-cover border"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {todasFotos.length > 1 && (
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
              1/{todasFotos.length}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <p className="text-xs font-medium text-muted-foreground truncate">
              🏋️ Tu máquina · {gymNombre}
            </p>
            <button onClick={onDismiss} className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {ajustesVisibles.length > 0 ? (
            <ul className="space-y-0.5">
              {ajustesVisibles.map(([k, v]) => (
                <li key={k} className="text-xs text-foreground">
                  <span className="text-muted-foreground">{labelMap[k] ?? k}:</span> {v as string}
                </li>
              ))}
              {photo.ajustes && Object.entries(photo.ajustes).filter(([k, v]) => v && k !== 'notasAjuste').length > 3 && (
                <li className="text-xs text-muted-foreground">…</li>
              )}
            </ul>
          ) : photo.notas ? (
            <p className="text-xs text-muted-foreground line-clamp-2">{photo.notas.slice(0, 80)}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic">Sin ajustes anotados</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="outline" className="h-6 text-xs px-2 gap-1" onClick={onVerDetalle}>
              Ver <ChevronRight className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2 gap-1" onClick={onAñadirFoto}>
              <Camera className="w-3 h-3" /> Añadir foto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
