import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Building2, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import type { MachinePhoto } from '@/types';
import MachinePhotoViewer from '@/components/MachinePhotoViewer';
import MachinePhotoCapture from '@/components/MachinePhotoCapture';

interface GymGroup {
  gymId: string;
  gymNombre: string;
  count: number;
}

interface EjercicioGroup {
  ejercicioId: string;
  ejercicioNombre: string;
  fotos: MachinePhoto[];
  fotoActiva: MachinePhoto | undefined;
}

export default function GymMachineLibrary() {
  const { currentUser } = useAppStore();
  const [gyms, setGyms] = useState<GymGroup[]>([]);
  const [gymSeleccionado, setGymSeleccionado] = useState<GymGroup | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioGroup[]>([]);
  const [cargando, setCargando] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFotos, setViewerFotos] = useState<MachinePhoto[]>([]);
  const [viewerEjercicio, setViewerEjercicio] = useState('');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureEjercicioId, setCaptureEjercicioId] = useState('');
  const [captureEjercicioNombre, setCaptureEjercicioNombre] = useState('');

  const cargarGyms = useCallback(async () => {
    if (!currentUser) return;
    setCargando(true);
    try {
      const data = await dbHelpers.getAllGyms(currentUser.id);
      setGyms(data);
      if (data.length === 1) setGymSeleccionado(data[0]);
    } finally {
      setCargando(false);
    }
  }, [currentUser]);

  useEffect(() => { cargarGyms(); }, [cargarGyms]);

  const cargarEjercicios = useCallback(async (gym: GymGroup) => {
    if (!currentUser) return;
    setCargando(true);
    try {
      const fotos = await dbHelpers.getMachinePhotos(currentUser.id, undefined, gym.gymId);
      const map = new Map<string, EjercicioGroup>();
      for (const f of fotos) {
        if (!map.has(f.ejercicioId)) {
          map.set(f.ejercicioId, {
            ejercicioId: f.ejercicioId,
            ejercicioNombre: f.ejercicioNombre,
            fotos: [],
            fotoActiva: undefined,
          });
        }
        map.get(f.ejercicioId)!.fotos.push(f);
      }
      for (const g of map.values()) {
        g.fotoActiva = g.fotos.find(f => f.esActiva) ?? g.fotos[0];
      }
      setEjercicios([...map.values()].sort((a, b) => a.ejercicioNombre.localeCompare(b.ejercicioNombre)));
    } finally {
      setCargando(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (gymSeleccionado) cargarEjercicios(gymSeleccionado);
    else setEjercicios([]);
  }, [gymSeleccionado, cargarEjercicios]);

  const handleEliminar = async (id: string) => {
    await dbHelpers.deleteMachinePhoto(id);
    if (gymSeleccionado) cargarEjercicios(gymSeleccionado);
    cargarGyms();
  };

  const handleGuardarCaptura = async (data: { url: string; tipo: MachinePhoto['tipo']; ajustes: MachinePhoto['ajustes']; notas: string }) => {
    if (!currentUser || !gymSeleccionado) return;
    const photo: MachinePhoto = {
      id: `mp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: currentUser.id,
      ejercicioId: captureEjercicioId,
      ejercicioNombre: captureEjercicioNombre,
      gymId: gymSeleccionado.gymId,
      gymNombre: gymSeleccionado.gymNombre,
      url: data.url,
      tipo: data.tipo,
      ajustes: data.ajustes,
      notas: data.notas || undefined,
      fecha: new Date(),
      esActiva: true,
      syncStatus: 'pending_create',
      lastUpdated: Date.now(),
    };
    await dbHelpers.addMachinePhoto(photo);
    if (gymSeleccionado) cargarEjercicios(gymSeleccionado);
  };

  if (cargando && gyms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6" /> Guía de Máquinas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tus configuraciones personales por gym y ejercicio
        </p>
      </div>

      {/* Sin datos */}
      {gyms.length === 0 && !cargando && (
        <div className="text-center py-16 space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Aún no tienes fotos de máquinas guardadas.</p>
          <p className="text-sm text-muted-foreground">
            La próxima vez que hagas un ejercicio con maquinaria, podrás fotografiar y guardar los ajustes.
          </p>
        </div>
      )}

      {/* Selector de gym si hay más de uno */}
      {gyms.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Gimnasios</p>
          <div className="grid gap-2">
            {gyms.map(g => (
              <button
                key={g.gymId}
                onClick={() => setGymSeleccionado(gymSeleccionado?.gymId === g.gymId ? null : g)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  gymSeleccionado?.gymId === g.gymId
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 bg-background'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{g.gymNombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{g.count} máquina{g.count !== 1 ? 's' : ''}</Badge>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${gymSeleccionado?.gymId === g.gymId ? 'rotate-90' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de ejercicios del gym seleccionado */}
      {gymSeleccionado && (
        <div className="space-y-3">
          {gyms.length > 1 && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {gymSeleccionado.gymNombre}
            </p>
          )}
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : ejercicios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay fotos en este gym todavía.
            </p>
          ) : (
            ejercicios.map(ej => (
              <div
                key={ej.ejercicioId}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary/40 transition-all"
              >
                {/* Thumbnail */}
                <button
                  className="shrink-0"
                  onClick={() => {
                    setViewerFotos(ej.fotos);
                    setViewerEjercicio(ej.ejercicioNombre);
                    setViewerOpen(true);
                  }}
                >
                  {ej.fotoActiva ? (
                    <img
                      src={ej.fotoActiva.url}
                      alt={ej.ejercicioNombre}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ej.ejercicioNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {ej.fotos.length} foto{ej.fotos.length !== 1 ? 's' : ''}
                  </p>
                  {ej.fotoActiva?.ajustes && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(ej.fotoActiva.ajustes)
                        .filter(([k, v]) => v && k !== 'notasAjuste')
                        .slice(0, 2)
                        .map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                            {v as string}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setCaptureEjercicioId(ej.ejercicioId);
                      setCaptureEjercicioNombre(ej.ejercicioNombre);
                      setCaptureOpen(true);
                    }}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (ej.fotoActiva) handleEliminar(ej.fotoActiva.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Viewer */}
      <MachinePhotoViewer
        open={viewerOpen}
        fotos={viewerFotos}
        ejercicioNombre={viewerEjercicio}
        gymNombre={gymSeleccionado?.gymNombre ?? ''}
        onEditar={() => {}}
        onEliminar={handleEliminar}
        onAñadirFoto={() => {
          setViewerOpen(false);
          const found = ejercicios.find(e => e.ejercicioNombre === viewerEjercicio);
          if (found) {
            setCaptureEjercicioId(found.ejercicioId);
            setCaptureEjercicioNombre(found.ejercicioNombre);
            setCaptureOpen(true);
          }
        }}
        onClose={() => setViewerOpen(false)}
      />

      {/* Capture */}
      {gymSeleccionado && (
        <MachinePhotoCapture
          open={captureOpen}
          ejercicioId={captureEjercicioId}
          ejercicioNombre={captureEjercicioNombre}
          gymId={gymSeleccionado.gymId}
          gymNombre={gymSeleccionado.gymNombre}
          onGuardar={handleGuardarCaptura}
          onClose={() => setCaptureOpen(false)}
        />
      )}
    </div>
  );
}
