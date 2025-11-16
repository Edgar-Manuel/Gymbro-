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
import { Scale, Ruler, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

export default function BodyMeasurements() {
  const { currentUser } = useAppStore();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [peso, setPeso] = useState('');
  const [grasaCorporal, setGrasaCorporal] = useState('');
  const [pecho, setPecho] = useState('');
  const [cintura, setCintura] = useState('');
  const [cadera, setCadera] = useState('');
  const [brazoDerecho, setBrazoDerecho] = useState('');
  const [brazoIzquierdo, setBrazoIzquierdo] = useState('');
  const [musloDerecho, setMusloDerecho] = useState('');
  const [musloIzquierdo, setMusloIzquierdo] = useState('');
  const [pantorrillaDerecha, setPantorrillaDerecha] = useState('');
  const [pantorrillaIzquierda, setPantorrillaIzquierda] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    loadMeasurements();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !peso) return;

    const newMeasurement: BodyMeasurement = {
      id: `measurement-${Date.now()}`,
      userId: currentUser.id,
      fecha: new Date(),
      peso: parseFloat(peso),
      grasaCorporal: grasaCorporal ? parseFloat(grasaCorporal) : undefined,
      medidas: {
        pecho: pecho ? parseFloat(pecho) : undefined,
        cintura: cintura ? parseFloat(cintura) : undefined,
        cadera: cadera ? parseFloat(cadera) : undefined,
        brazoDerecho: brazoDerecho ? parseFloat(brazoDerecho) : undefined,
        brazoIzquierdo: brazoIzquierdo ? parseFloat(brazoIzquierdo) : undefined,
        musloDerecho: musloDerecho ? parseFloat(musloDerecho) : undefined,
        musloIzquierdo: musloIzquierdo ? parseFloat(musloIzquierdo) : undefined,
        pantorrillaDerecha: pantorrillaDerecha ? parseFloat(pantorrillaDerecha) : undefined,
        pantorrillaIzquierda: pantorrillaIzquierda ? parseFloat(pantorrillaIzquierda) : undefined,
      },
      notas: notas || undefined
    };

    try {
      await dbHelpers.addBodyMeasurement(newMeasurement);
      await loadMeasurements();

      // Limpiar formulario
      setPeso('');
      setGrasaCorporal('');
      setPecho('');
      setCintura('');
      setCadera('');
      setBrazoDerecho('');
      setBrazoIzquierdo('');
      setMusloDerecho('');
      setMusloIzquierdo('');
      setPantorrillaDerecha('');
      setPantorrillaIzquierda('');
      setNotas('');
      setShowForm(false);
    } catch (error) {
      console.error('Error guardando medición:', error);
      alert('Error al guardar la medición');
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
            <Button
              onClick={() => setShowForm(!showForm)}
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
        </CardHeader>

        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-accent/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="peso">Peso (kg) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    required
                    placeholder="70.5"
                  />
                </div>

                <div>
                  <Label htmlFor="grasa">Grasa Corporal (%)</Label>
                  <Input
                    id="grasa"
                    type="number"
                    step="0.1"
                    value={grasaCorporal}
                    onChange={(e) => setGrasaCorporal(e.target.value)}
                    placeholder="15.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Medidas (cm)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="pecho" className="text-xs">Pecho</Label>
                    <Input
                      id="pecho"
                      type="number"
                      step="0.1"
                      value={pecho}
                      onChange={(e) => setPecho(e.target.value)}
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cintura" className="text-xs">Cintura</Label>
                    <Input
                      id="cintura"
                      type="number"
                      step="0.1"
                      value={cintura}
                      onChange={(e) => setCintura(e.target.value)}
                      placeholder="80"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cadera" className="text-xs">Cadera</Label>
                    <Input
                      id="cadera"
                      type="number"
                      step="0.1"
                      value={cadera}
                      onChange={(e) => setCadera(e.target.value)}
                      placeholder="95"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brazoDerecho" className="text-xs">Brazo Derecho</Label>
                    <Input
                      id="brazoDerecho"
                      type="number"
                      step="0.1"
                      value={brazoDerecho}
                      onChange={(e) => setBrazoDerecho(e.target.value)}
                      placeholder="35"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brazoIzquierdo" className="text-xs">Brazo Izquierdo</Label>
                    <Input
                      id="brazoIzquierdo"
                      type="number"
                      step="0.1"
                      value={brazoIzquierdo}
                      onChange={(e) => setBrazoIzquierdo(e.target.value)}
                      placeholder="35"
                    />
                  </div>

                  <div>
                    <Label htmlFor="musloDerecho" className="text-xs">Muslo Derecho</Label>
                    <Input
                      id="musloDerecho"
                      type="number"
                      step="0.1"
                      value={musloDerecho}
                      onChange={(e) => setMusloDerecho(e.target.value)}
                      placeholder="55"
                    />
                  </div>

                  <div>
                    <Label htmlFor="musloIzquierdo" className="text-xs">Muslo Izquierdo</Label>
                    <Input
                      id="musloIzquierdo"
                      type="number"
                      step="0.1"
                      value={musloIzquierdo}
                      onChange={(e) => setMusloIzquierdo(e.target.value)}
                      placeholder="55"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pantorrillaDerecha" className="text-xs">Pantorrilla Derecha</Label>
                    <Input
                      id="pantorrillaDerecha"
                      type="number"
                      step="0.1"
                      value={pantorrillaDerecha}
                      onChange={(e) => setPantorrillaDerecha(e.target.value)}
                      placeholder="37"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pantorrillaIzquierda" className="text-xs">Pantorrilla Izquierda</Label>
                    <Input
                      id="pantorrillaIzquierda"
                      type="number"
                      step="0.1"
                      value={pantorrillaIzquierda}
                      onChange={(e) => setPantorrillaIzquierda(e.target.value)}
                      placeholder="37"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Cualquier observación..."
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full">
                Guardar Medición
              </Button>
            </form>
          )}

          {/* Última medición */}
          {latestMeasurement && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Última Medición</h4>
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
                {Object.keys(latestMeasurement.medidas).some(key => latestMeasurement.medidas[key as keyof typeof latestMeasurement.medidas]) && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Medidas Corporales</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {latestMeasurement.medidas.pecho && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Pecho:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.pecho}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.cintura && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Cintura:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.cintura}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.cadera && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Cadera:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.cadera}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.brazoDerecho && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Brazo D:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.brazoDerecho}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.brazoIzquierdo && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Brazo I:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.brazoIzquierdo}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.musloDerecho && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Muslo D:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.musloDerecho}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.musloIzquierdo && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Muslo I:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.musloIzquierdo}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.pantorrillaDerecha && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Pantorrilla D:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.pantorrillaDerecha}cm</span>
                        </div>
                      )}
                      {latestMeasurement.medidas.pantorrillaIzquierda && (
                        <div className="p-2 border rounded text-sm">
                          <span className="text-muted-foreground">Pantorrilla I:</span>
                          <span className="font-semibold ml-2">{latestMeasurement.medidas.pantorrillaIzquierda}cm</span>
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
                        <div>
                          <p className="font-medium">{m.peso}kg</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(m.fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        {m.grasaCorporal && (
                          <Badge variant="outline">{m.grasaCorporal}% grasa</Badge>
                        )}
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
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primera Medición
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
