import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Plus, CheckCircle, X, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { dbHelpers } from '@/db';
import type { Lesion, LesionZona, LesionSeveridad } from '@/types';
import { LESION_ZONA_LABELS, INJURY_AFFECTS, REHAB_EXERCISES } from '@/utils/injuryData';
import { ID } from 'appwrite';
import { cn } from '@/lib/utils';

const SEVERIDAD_CONFIG: Record<LesionSeveridad, { label: string; card: string; dot: string; hint: string }> = {
  leve:     { label: 'Leve',     dot: 'bg-yellow-500', hint: 'Incomodidad leve. Reduce el peso un 25–30%.', card: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800' },
  moderada: { label: 'Moderada', dot: 'bg-orange-500', hint: 'Dolor notable. Reduce el peso a la mitad y evita ejercicios de alto impacto.', card: 'border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800' },
  grave:    { label: 'Grave',    dot: 'bg-red-500',    hint: 'Lesión seria. Salta los ejercicios que afecten a esta zona y céntrate en rehabilitación.', card: 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800' },
};

const ZONA_GROUPS = [
  { group: 'Hombros / Brazos', zonas: ['hombro_derecho', 'hombro_izquierdo', 'codo_derecho', 'codo_izquierdo', 'muneca_derecha', 'muneca_izquierda'] as LesionZona[] },
  { group: 'Espalda / Cuello', zonas: ['lumbar', 'cervical'] as LesionZona[] },
  { group: 'Cadera / Piernas', zonas: ['cadera', 'rodilla_derecha', 'rodilla_izquierda', 'tobillo_derecho', 'tobillo_izquierdo'] as LesionZona[] },
];

export default function InjuryPanel({ userId }: { userId: string }) {
  const [injuries, setInjuries] = useState<Lesion[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecovered, setShowRecovered] = useState(false);
  const [expandedRehab, setExpandedRehab] = useState<string | null>(null);

  // Form state
  const [newZona, setNewZona] = useState<LesionZona>('hombro_derecho');
  const [newSeveridad, setNewSeveridad] = useState<LesionSeveridad>('moderada');
  const [newFecha, setNewFecha] = useState(new Date().toISOString().split('T')[0]);
  const [newNotas, setNewNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const all = await dbHelpers.getAllInjuries(userId);
    setInjuries(all);
  };

  useEffect(() => { load(); }, [userId]);

  const activeInjuries = injuries.filter(l => l.activa);
  const recoveredInjuries = injuries.filter(l => !l.activa);

  const handleAdd = async () => {
    if (!newFecha) return;
    setSaving(true);
    try {
      const lesion: Lesion = {
        id: ID.unique(),
        userId,
        zona: newZona,
        severidad: newSeveridad,
        fechaInicio: new Date(newFecha),
        activa: true,
        dolorActual: newSeveridad === 'grave' ? 8 : newSeveridad === 'moderada' ? 5 : 3,
        notas: newNotas || undefined,
      };
      await dbHelpers.addInjury(lesion);
      await load();
      setShowAddModal(false);
      setNewNotas('');
    } finally {
      setSaving(false);
    }
  };

  const handlePain = async (id: string, dolor: number) => {
    await dbHelpers.updateInjuryPain(id, dolor);
    setInjuries(prev => prev.map(l => l.id === id ? { ...l, dolorActual: dolor } : l));
  };

  const handleRecover = async (id: string) => {
    await dbHelpers.markInjuryRecovered(id);
    await load();
  };

  const daysSince = (d: Date) =>
    Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <CardTitle>Mis Lesiones</CardTitle>
              {activeInjuries.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {activeInjuries.length} activa{activeInjuries.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Añadir
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {activeInjuries.length === 0 && (
            <div className="text-center py-5 text-muted-foreground">
              <Heart className="w-8 h-8 mx-auto mb-2 text-green-500/60" />
              <p className="text-sm font-medium">Sin lesiones activas</p>
              <p className="text-xs mt-0.5 opacity-70">¡Sigue entrenando con cuidado!</p>
            </div>
          )}

          {activeInjuries.map(lesion => {
            const cfg = SEVERIDAD_CONFIG[lesion.severidad];
            const affected = INJURY_AFFECTS[lesion.zona];
            const rehab = REHAB_EXERCISES[lesion.zona];
            const dias = daysSince(lesion.fechaInicio);
            const isRehabOpen = expandedRehab === lesion.id;

            return (
              <div key={lesion.id} className={cn('rounded-xl border-2 p-4 space-y-3', cfg.card)}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />
                      <span className="font-semibold">{LESION_ZONA_LABELS[lesion.zona]}</span>
                      <Badge variant="outline" className="text-xs capitalize">{cfg.label}</Badge>
                    </div>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      Desde {new Date(lesion.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {dias} días
                    </p>
                  </div>
                </div>

                {/* Muscles affected */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Músculos afectados en el entreno:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {affected.map(m => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 capitalize font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hint */}
                <p className="text-xs text-muted-foreground italic">{cfg.hint}</p>

                {/* Pain slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Dolor actual</span>
                    <span className="font-bold">{lesion.dolorActual ?? 5}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={lesion.dolorActual ?? 5}
                    onChange={e => handlePain(lesion.id, parseInt(e.target.value))}
                    className="w-full h-2 accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>Sin dolor</span>
                    <span>Insoportable</span>
                  </div>
                </div>

                {lesion.notas && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-current pl-2">{lesion.notas}</p>
                )}

                {/* Rehab toggle */}
                <button
                  className="flex items-center gap-1.5 text-xs font-medium w-full text-left py-1"
                  onClick={() => setExpandedRehab(isRehabOpen ? null : lesion.id)}
                >
                  <Heart className="w-3.5 h-3.5" />
                  {rehab.length} ejercicios de rehabilitación
                  {isRehabOpen ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>

                {isRehabOpen && (
                  <div className="space-y-2 pt-1 border-t border-current/20">
                    {rehab.map((ex, i) => (
                      <div key={i} className="bg-white/40 dark:bg-black/20 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">{ex.nombre}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">{ex.series}×{ex.reps}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{ex.musculo}</p>
                        <p className="text-xs opacity-80">{ex.notas}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleRecover(lesion.id)}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Marcar como recuperado
                </Button>
              </div>
            );
          })}

          {/* Recovered */}
          {recoveredInjuries.length > 0 && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground w-full justify-center pt-1"
              onClick={() => setShowRecovered(!showRecovered)}
            >
              {showRecovered ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {recoveredInjuries.length} lesión{recoveredInjuries.length > 1 ? 'es' : ''} recuperada{recoveredInjuries.length > 1 ? 's' : ''}
            </button>
          )}

          {showRecovered && recoveredInjuries.map(lesion => (
            <div key={lesion.id} className="rounded-xl border p-3 flex items-center gap-3 bg-muted/30">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{LESION_ZONA_LABELS[lesion.zona]}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(lesion.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {lesion.fechaFin && ` → ${new Date(lesion.fechaFin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
              </div>
              <Badge variant="outline" className="text-xs capitalize shrink-0">{lesion.severidad}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Injury Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Nueva Lesión</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Zona afectada</Label>
                <Select value={newZona} onValueChange={v => setNewZona(v as LesionZona)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ZONA_GROUPS.map(({ group, zonas }) => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          {group}
                        </div>
                        {zonas.map(zona => (
                          <SelectItem key={zona} value={zona}>{LESION_ZONA_LABELS[zona]}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Severidad</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['leve', 'moderada', 'grave'] as LesionSeveridad[]).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setNewSeveridad(sev)}
                      className={cn(
                        'p-2.5 rounded-xl border-2 text-xs font-semibold capitalize transition-all',
                        newSeveridad === sev
                          ? SEVERIDAD_CONFIG[sev].card + ' border-current'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <span className={cn('block w-2 h-2 rounded-full mx-auto mb-1', SEVERIDAD_CONFIG[sev].dot)} />
                      {SEVERIDAD_CONFIG[sev].label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 italic">
                  {SEVERIDAD_CONFIG[newSeveridad].hint}
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">¿Cuándo ocurrió?</Label>
                <Input
                  type="date"
                  value={newFecha}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setNewFecha(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Notas (opcional)</Label>
                <Input
                  placeholder="Ej: Al hacer press de banca noté un chasquido..."
                  value={newNotas}
                  onChange={e => setNewNotas(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="bg-muted/60 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">Músculos que afecta en el gym:</p>
                <div className="flex flex-wrap gap-1.5">
                  {INJURY_AFFECTS[newZona].map(m => (
                    <Badge key={m} variant="secondary" className="text-xs capitalize">{m}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleAdd} disabled={saving || !newFecha}>
                {saving ? 'Guardando...' : 'Registrar lesión'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
