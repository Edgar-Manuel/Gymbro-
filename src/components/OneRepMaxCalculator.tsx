import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { calcularOneRepMaxCompleto } from '@/utils/gymCalculators';
import { TrendingUp } from 'lucide-react';

interface OneRepMaxCalculatorProps {
  initialPeso?: number;
  initialReps?: number;
  compact?: boolean;
}

export default function OneRepMaxCalculator({
  initialPeso,
  initialReps,
  compact = false
}: OneRepMaxCalculatorProps) {
  const [peso, setPeso] = useState(initialPeso?.toString() || '');
  const [reps, setReps] = useState(initialReps?.toString() || '');
  const [resultado, setResultado] = useState<ReturnType<typeof calcularOneRepMaxCompleto> | null>(null);

  const calcular = () => {
    const pesoNum = parseFloat(peso);
    const repsNum = parseInt(reps);

    if (isNaN(pesoNum) || isNaN(repsNum) || pesoNum <= 0 || repsNum <= 0 || repsNum > 20) {
      alert('Por favor ingresa valores válidos (reps entre 1-20)');
      return;
    }

    const result = calcularOneRepMaxCompleto(pesoNum, repsNum);
    setResultado(result);
  };

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <CardTitle className="text-base">Calculadora 1RM</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Peso (kg)</Label>
            <Input
              type="number"
              step="0.25"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="100"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Repeticiones</Label>
            <Input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8"
              className="mt-1"
            />
          </div>
        </div>

        <Button onClick={calcular} className="w-full">
          Calcular 1RM
        </Button>

        {/* Resultado */}
        {resultado && (
          <div className="space-y-3 border-t pt-3">
            {/* 1RM Estimado */}
            <div className="bg-background p-4 rounded-lg text-center border-2 border-green-500/50">
              <p className="text-xs text-muted-foreground mb-1">1RM Estimado</p>
              <p className="text-4xl font-black text-green-600">
                {resultado.oneRepMax}kg
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ({resultado.reps} reps @ {resultado.peso}kg)
              </p>
            </div>

            {/* Tabla de porcentajes */}
            {!compact && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Porcentajes del 1RM:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {resultado.porcentajes.slice(0, 8).map((pct) => (
                    <div
                      key={pct.porcentaje}
                      className="flex items-center justify-between bg-accent/50 p-2 rounded text-sm"
                    >
                      <Badge variant="outline" className="text-xs">
                        {pct.porcentaje}%
                      </Badge>
                      <span className="font-semibold">{pct.peso}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-xs">
              <p className="font-medium mb-1">💡 Guía de intensidad:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>90-95%:</strong> Fuerza máxima (1-3 reps)</li>
                <li>• <strong>80-85%:</strong> Hipertrofia (6-8 reps)</li>
                <li>• <strong>65-75%:</strong> Resistencia (12-15 reps)</li>
              </ul>
            </div>
          </div>
        )}

        {!resultado && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Ingresa peso y reps para calcular tu 1RM
          </p>
        )}
      </CardContent>
    </Card>
  );
}
