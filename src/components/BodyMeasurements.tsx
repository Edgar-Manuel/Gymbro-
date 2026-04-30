import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { BodyMeasurement } from '@/types';
import { Scale, Ruler, TrendingUp, TrendingDown, Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { RANGES } from '@/utils/bodyCalculations';

interface BodyMeasurementsProps {
  onUpdate?: () => void;
}

type FormData = {
  fecha: string;        // YYYY-MM-DD
  peso: string;
  grasaCorporal: string;
  pecho: string;
  cintura: string;
  cadera: string;
  brazoDerecho: string;
  brazoIzquierdo: string;
  musloDerecho: string;
  musloIzquierdo: string;
  pantorrillaDerecha: string;
  pantorrillaIzquierda: string;
  notas: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const emptyForm: FormData = {
  fecha: todayISO(),
  peso: '', grasaCorporal: '',
  pecho: '', cintura: '', cadera: '',
  brazoDerecho: '', brazoIzquierdo: '',
  musloDerecho: '', musloIzquierdo: '',
  pantorrillaDerecha: '', pantorrillaIzquierda: '',
  notas: '',
};

const readMeasurementField = (m: BodyMeasurement, k: string): number | undefined =>
  (m as any)[k] ?? (m.medidas as any)?.[k];

const measurementToFormData = (m: BodyMeasurement, fechaOverride?: string): FormData => {
  const num = (v: number | undefined) => (v != null ? String(v) : '');
  return {
    fecha: fechaOverride ?? new Date(m.fecha).toISOString().slice(0, 10),
    peso: num(m.peso),
    grasaCorporal: num(m.grasaCorporal),
    pecho: num(readMeasurementField(m, 'pecho')),
    cintura: num(readMeasurementField(m, 'cintura')),
    cadera: num(readMeasurementField(m, 'cadera')),
    brazoDerecho: num(readMeasurementField(m, 'brazoDerecho')),
    brazoIzquierdo: num(readMeasurementField(m, 'brazoIzquierdo')),
    musloDerecho: num(readMeasurementField(m, 'musloDerecho')),
    musloIzquierdo: num(readMeasurementField(m, 'musloIzquierdo')),
    pantorrillaDerecha: num(readMeasurementField(m, 'pantorrillaDerecha')),
    pantorrillaIzquierda: num(readMeasurementField(m, 'pantorrillaIzquierda')),
    notas: m.notas ?? '',
  };
};

const validateForm = (f: FormData): FormErrors => {
  const errs: FormErrors = {};
  if (!f.fecha) errs.fecha = 'Fecha requerida';
  const peso = parseFloat(f.peso);
  if (!f.peso || isNaN(peso) || peso < RANGES.peso.min || peso > RANGES.peso.max) {
    errs.peso = `Peso entre ${RANGES.peso.min} y ${RANGES.peso.max} kg`;
  }
  if (f.grasaCorporal) {
    const g = parseFloat(f.grasaCorporal);
    if (isNaN(g) || g < RANGES.grasaCorporal.min || g > RANGES.grasaCorporal.max) {
      errs.grasaCorporal = `Grasa entre ${RANGES.grasaCorporal.min} y ${RANGES.grasaCorporal.max}%`;
    }
  }
  const medidaKeys: (keyof FormData)[] = [
    'pecho', 'cintura', 'cadera',
    'brazoDerecho', 'brazoIzquierdo',
    'musloDerecho', 'musloIzquierdo',
    'pantorrillaDerecha', 'pantorrillaIzquierda',
  ];
  for (const k of medidaKeys) {
    const val = f[k];
    if (!val) continue;
    const n = parseFloat(val as string);
    if (isNaN(n) || n < RANGES.medida.min || n > RANGES.medida.max) {
      errs[k] = `Entre ${RANGES.medida.min} y ${RANGES.medida.max} cm`;
    }
  }
  return errs;
};

type NumberFieldProps = {
  field: keyof FormData;
  label: string;
  placeholder: string;
  value: string;
  onChange: (k: keyof FormData, v: string) => void;
  error?: string;
  required?: boolean;
  compact?: boolean;
  type?: string;
  step?: string;
};

function NumberField({
  field, label, placeholder, value, onChange, error, required, compact, type = 'number', step = '0.1',
}: NumberFieldProps) {
  return (
    <div>
      <Label htmlFor={field} className={compact ? 'text-xs' : ''}>{label}</Label>
      <Input
        id={field}
        type={type}
        step={step}
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export default function BodyMeasurements({ onUpdate }: BodyMeasurementsProps) {
  const { currentUser } = useAppStore();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  useEffect(() => {
    if (!currentUser) return;
    // Al montar: 1) pull desde Appwrite (si online) 2) leer locales
    (async () => {
      setSyncing(true);
      const upserted = await dbHelpers.pullBodyMeasurements(currentUser.id);
      setSyncing(false);
      await loadMeasurements();
      // Si el pull trajo datos nuevos, notificar para refrescar el chart
      if (upserted > 0) onUpdate?.();
    })();

    // Re-pull al volver online
    const handleOnline = async () => {
      setSyncing(true);
      const upserted = await dbHelpers.pullBodyMeasurements(currentUser.id);
      setSyncing(false);
      await loadMeasurements();
      if (upserted > 0) onUpdate?.();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadMeasurements = async () => {
    if (!currentUser) return;
    try {
      const data = await dbHelpers.getBodyMeasurements(currentUser.id, 10);
      setMeasurements(data);
    } catch (error) {
      console.error('Error cargando mediciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentUser || syncing) return;
    setSyncing(true);
    const upserted = await dbHelpers.pullBodyMeasurements(currentUser.id);
    await loadMeasurements();
    setSyncing(false);
    if (upserted > 0) onUpdate?.();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
  };

  const startEdit = (m: BodyMeasurement) => {
    setEditingId(m.id);
    setForm(measurementToFormData(m));
    setErrors({});
    setShowForm(true);
  };

  /**
   * Abre el form en modo crear con los valores de la última medición pre-rellenados
   * (sin notas, fecha = hoy). Reduce fricción para registros frecuentes.
   */
  const openCreate = () => {
    const last = measurements[0];
    if (last) {
      setForm({ ...measurementToFormData(last, todayISO()), notas: '' });
    } else {
      setForm({ ...emptyForm, fecha: todayISO() });
    }
    setErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (m: BodyMeasurement) => {
    if (!currentUser) return;
    const fechaStr = new Date(m.fecha).toLocaleDateString('es-ES');
    if (!window.confirm(`¿Borrar la medición del ${fechaStr} (${m.peso} kg)? Esta acción no se puede deshacer.`)) return;
    try {
      await dbHelpers.deleteBodyMeasurement(m.id);
      await loadMeasurements();
      onUpdate?.();
    } catch (error) {
      console.error('Error borrando medición:', error);
      alert('No se pudo borrar la medición. Inténtalo de nuevo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const num = (s: string) => (s ? parseFloat(s) : undefined);
    const medidasObj = {
      pecho: num(form.pecho),
      cintura: num(form.cintura),
      cadera: num(form.cadera),
      brazoDerecho: num(form.brazoDerecho),
      brazoIzquierdo: num(form.brazoIzquierdo),
      musloDerecho: num(form.musloDerecho),
      musloIzquierdo: num(form.musloIzquierdo),
      pantorrillaDerecha: num(form.pantorrillaDerecha),
      pantorrillaIzquierda: num(form.pantorrillaIzquierda),
    };

    const isEditing = !!editingId;
    // Mediodía local para evitar saltos de día por zona horaria
    const fecha = new Date(form.fecha + 'T12:00:00');

    const measurement: BodyMeasurement = {
      id: editingId ?? `measurement-${Date.now()}`,
      userId: currentUser.id,
      fecha,
      peso: parseFloat(form.peso),
      grasaCorporal: num(form.grasaCorporal),
      ...medidasObj,
      medidas: medidasObj,
      notas: form.notas || undefined,
    };

    try {
      if (isEditing) {
        await dbHelpers.updateBodyMeasurement(measurement);
      } else {
        await dbHelpers.addBodyMeasurement(measurement);
      }
      await loadMeasurements();
      resetForm();
      setShowForm(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error guardando medición:', error);
      alert(isEditing ? 'Error al actualizar la medición' : 'Error al guardar la medición');
    }
  };

  const getChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const diff = current - previous;
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
      isNegative: diff < 0
    };
  };

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando mediciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Mediciones Corporales
              </CardTitle>
              <CardDescription>Tracking de peso y medidas corporales</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                disabled={syncing}
                title="Sincronizar con la nube"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => {
                  if (showForm) {
                    resetForm();
                    setShowForm(false);
                  } else {
                    openCreate();
                  }
                }}
                variant={showForm ? 'outline' : 'default'}
              >
                {showForm ? 'Cancelar' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Medición
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-accent/20" noValidate>
              {editingId && (
                <div className="flex items-center gap-2 p-2 rounded bg-primary/10 text-sm">
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                  <span>Editando medición existente</span>
                </div>
              )}

              {/* Fecha + Peso + Grasa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberField
                  field="fecha"
                  label="Fecha *"
                  type="date"
                  step={undefined}
                  placeholder=""
                  value={form.fecha}
                  onChange={setField}
                  error={errors.fecha}
                />
                <NumberField
                  field="peso"
                  label="Peso (kg) *"
                  placeholder="70.5"
                  value={form.peso}
                  onChange={setField}
                  error={errors.peso}
                  required
                />
                <NumberField
                  field="grasaCorporal"
                  label="Grasa Corporal (%)"
                  placeholder="15.0"
                  value={form.grasaCorporal}
                  onChange={setField}
                  error={errors.grasaCorporal}
                />
              </div>

              {/* Medidas */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Medidas (cm)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {([
                    ['pecho', 'Pecho', '100'],
                    ['cintura', 'Cintura', '80'],
                    ['cadera', 'Cadera', '95'],
                    ['brazoDerecho', 'Brazo Derecho', '35'],
                    ['brazoIzquierdo', 'Brazo Izquierdo', '35'],
                    ['musloDerecho', 'Muslo Derecho', '55'],
                    ['musloIzquierdo', 'Muslo Izquierdo', '55'],
                    ['pantorrillaDerecha', 'Pantorrilla Derecha', '37'],
                    ['pantorrillaIzquierda', 'Pantorrilla Izquierda', '37'],
                  ] as const).map(([k, lbl, ph]) => (
                    <NumberField
                      key={k}
                      field={k}
                      label={lbl}
                      placeholder={ph}
                      value={form[k]}
                      onChange={setField}
                      error={errors[k]}
                      compact
                    />
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={form.notas}
                  onChange={(e) => setField('notas', e.target.value)}
                  placeholder="Cualquier observación..."
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingId ? 'Actualizar Medición' : 'Guardar Medición'}
              </Button>
            </form>
          )}

          {/* Última medición */}
          {latestMeasurement && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Última Medición</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEdit(latestMeasurement)}
                      title="Editar medición"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(latestMeasurement)}
                      title="Borrar medición"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(latestMeasurement.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {/* Peso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-sm text-muted-foreground mb-1">Peso Corporal</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{latestMeasurement.peso}kg</p>
                      {previousMeasurement && (() => {
                        const change = getChange(latestMeasurement.peso, previousMeasurement.peso);
                        if (change) {
                          return (
                            <Badge variant={change.isPositive ? 'default' : 'success'} className="flex items-center gap-1">
                              {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {change.value.toFixed(1)}kg
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {latestMeasurement.grasaCorporal && (
                    <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <p className="text-sm text-muted-foreground mb-1">Grasa Corporal</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">{latestMeasurement.grasaCorporal}%</p>
                        {previousMeasurement?.grasaCorporal && (() => {
                          const change = getChange(latestMeasurement.grasaCorporal!, previousMeasurement.grasaCorporal);
                          if (change) {
                            return (
                              <Badge variant={change.isNegative ? 'success' : 'default'} className="flex items-center gap-1">
                                {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {change.value.toFixed(1)}%
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Medidas */}
                {latestMeasurement.medidas && Object.values(latestMeasurement.medidas).some(Boolean) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Medidas Corporales</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {latestMeasurement.medidas?.pecho && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Pecho:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.pecho}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.cintura && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Cintura:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.cintura}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.cadera && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Cadera:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.cadera}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.brazoDerecho && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Brazo D:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.brazoDerecho}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.brazoIzquierdo && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Brazo I:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.brazoIzquierdo}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.musloDerecho && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Muslo D:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.musloDerecho}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.musloIzquierdo && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Muslo I:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.musloIzquierdo}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.pantorrillaDerecha && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Pantorrilla D:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.pantorrillaDerecha}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas?.pantorrillaIzquierda && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Pantorrilla I:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas?.pantorrillaIzquierda}cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {latestMeasurement.notas && (
                  <div className="mt-3 p-3 bg-accent/30 rounded-lg">
                    <p className="text-sm"><span className="font-medium">Notas:</span> {latestMeasurement.notas}</p>
                  </div>
                )}
              </div>

              {/* Historial */}
              {measurements.length > 1 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Historial</h4>
                  <div className="space-y-2">
                    {measurements.slice(1, 5).map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{m.peso}kg</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(m.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.grasaCorporal && (
                            <Badge variant="outline">{m.grasaCorporal}% grasa</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEdit(m)}
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(m)}
                            title="Borrar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!latestMeasurement && !showForm && (
            <div className="text-center py-8">
              <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Aún no has registrado ninguna medición</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primera Medición
                </Button>
                <Button onClick={handleRefresh} variant="outline" disabled={syncing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando…' : 'Sincronizar desde la nube'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                ¿Registraste mediciones en otro dispositivo? Pulsa "Sincronizar".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
