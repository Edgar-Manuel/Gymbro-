import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, CheckCircle2, ChevronLeft, Loader2, RotateCcw } from 'lucide-react';
import { validarImagen, comprimirImagen } from '@/utils/imageUtils';
import type { MachineAjustes, MachinePhoto } from '@/types';

type Tipo = MachinePhoto['tipo'];
type Paso = 'foto' | 'ajustes' | 'confirmacion';

const TIPOS: { value: Tipo; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'ajustes', label: 'Ajustes' },
  { value: 'posicion', label: 'Posición' },
  { value: 'referencia', label: 'Referencia' },
  { value: 'pantalla', label: 'Pantalla' },
];

const AJUSTE_FIELDS: { key: keyof MachineAjustes; label: string; placeholder: string }[] = [
  { key: 'asiento', label: 'Asiento', placeholder: 'ej. posición 3' },
  { key: 'respaldo', label: 'Respaldo', placeholder: 'ej. inclinación 2' },
  { key: 'rodilleras', label: 'Rodilleras', placeholder: 'ej. ajuste bajo' },
  { key: 'palanca', label: 'Palanca', placeholder: 'ej. agarre medio' },
  { key: 'cable', label: 'Cable', placeholder: 'ej. polea alta' },
  { key: 'cargaReferencia', label: 'Carga ref.', placeholder: 'ej. 40 kg' },
];

interface MachinePhotoCaptureProps {
  open: boolean;
  ejercicioId: string;
  ejercicioNombre: string;
  gymId: string;
  gymNombre: string;
  onGuardar: (data: { url: string; tipo: Tipo; ajustes: MachineAjustes; notas: string }) => Promise<void>;
  onClose: () => void;
}

export default function MachinePhotoCapture({
  open, ejercicioId: _ejercicioId, ejercicioNombre, gymId: _gymId, gymNombre,
  onGuardar, onClose,
}: MachinePhotoCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paso, setPaso] = useState<Paso>('foto');
  const [preview, setPreview] = useState<string>('');
  const [tipo, setTipo] = useState<Tipo>('general');
  const [ajustes, setAjustes] = useState<MachineAjustes>({});
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const resetState = () => {
    setPaso('foto');
    setPreview('');
    setTipo('general');
    setAjustes({});
    setNotas('');
    setError('');
    setGuardando(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const validacion = validarImagen(file);
    if (!validacion.valida) {
      setError(validacion.error ?? 'Imagen no válida');
      return;
    }

    try {
      const comprimida = await comprimirImagen(file);
      setPreview(comprimida);
      setPaso('ajustes');
    } catch {
      setError('Error al procesar la imagen. Inténtalo de nuevo.');
    }
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleGuardar = async () => {
    if (!preview) return;
    setGuardando(true);
    try {
      await onGuardar({ url: preview, tipo, ajustes, notas });
      setPaso('confirmacion');
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            {paso === 'ajustes' && (
              <button onClick={() => setPaso('foto')} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <SheetTitle className="text-base flex-1">
              {paso === 'foto' && 'Fotografiar máquina'}
              {paso === 'ajustes' && 'Ajustes y notas'}
              {paso === 'confirmacion' && '¡Guardado!'}
            </SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground">{ejercicioNombre} · {gymNombre}</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* ── PASO 1: foto ─────────────────────────────────────── */}
          {paso === 'foto' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                className="w-40 h-40 rounded-2xl border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/60 hover:bg-muted/20 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="w-12 h-12 text-muted-foreground/60" />
                <span className="text-sm text-muted-foreground text-center px-4">
                  Toca para fotografiar
                </span>
              </div>

              {/* Selector de tipo */}
              <div className="w-full">
                <Label className="text-xs text-muted-foreground mb-2 block">Tipo de foto</Label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTipo(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        tipo === t.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Haz una foto de la máquina con los ajustes que usas. La verás automáticamente la próxima vez.
              </p>
            </div>
          )}

          {/* ── PASO 2: ajustes ──────────────────────────────────── */}
          {paso === 'ajustes' && (
            <div className="space-y-5">
              {/* Preview */}
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => { setPreview(''); setPaso('foto'); }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tipo chip selector */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Tipo de foto</Label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTipo(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        tipo === t.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ajustes grid */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Ajustes de la máquina (opcional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AJUSTE_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <Label className="text-xs mb-1 block">{label}</Label>
                      <Input
                        value={ajustes[key] ?? ''}
                        onChange={e => setAjustes(prev => ({ ...prev, [key]: e.target.value || undefined }))}
                        placeholder={placeholder}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Notas adicionales</Label>
                <Textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Observaciones, trucos, advertencias..."
                  className="text-sm resize-none"
                  rows={3}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {/* ── PASO 3: confirmación ─────────────────────────────── */}
          {paso === 'confirmacion' && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">¡Foto guardada!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                La verás automáticamente la próxima vez que hagas{' '}
                <span className="font-medium text-foreground">{ejercicioNombre}</span> en este gym.
              </p>
              {preview && (
                <img
                  src={preview}
                  alt={ejercicioNombre}
                  className="w-32 h-32 object-cover rounded-xl border shadow-sm"
                />
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-4 pb-6 pt-3 border-t bg-background">
          {paso === 'ajustes' && (
            <Button
              className="w-full"
              onClick={handleGuardar}
              disabled={guardando || !preview}
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar foto
            </Button>
          )}
          {paso === 'confirmacion' && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { resetState(); }}>
                <Camera className="w-4 h-4 mr-2" /> Añadir otra
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Listo
              </Button>
            </div>
          )}
          {paso === 'foto' && (
            <Button variant="ghost" className="w-full" onClick={handleClose}>
              Cancelar
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
