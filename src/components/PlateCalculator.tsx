import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calcularDiscos } from '@/utils/gymCalculators';
import { Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';

interface PlateCalculatorProps {
  pesoObjetivo?: number;
  compact?: boolean;
}

export default function PlateCalculator({ pesoObjetivo, compact = false }: PlateCalculatorProps) {
  const [peso, setPeso] = useState(pesoObjetivo?.toString() || '');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [calculation, setCalculation] = useState<ReturnType<typeof calcularDiscos> | null>(null);

  useEffect(() => {
    if (pesoObjetivo) {
      setPeso(pesoObjetivo.toString());
      calcular(pesoObjetivo);
    }
  }, [pesoObjetivo]);

  const calcular = (targetPeso?: number) => {
    const pesoNum = targetPeso || parseFloat(peso);
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setCalculation(null);
      return;
    }

    const result = calcularDiscos(pesoNum);
    setCalculation(result);
  };

  const handlePesoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPeso(value);
    if (value) {
      calcular(parseFloat(value));
    } else {
      setCalculation(null);
    }
  };

  if (compact && !isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="w-full"
      >
        <Dumbbell className="w-4 h-4 mr-2" />
        Ver discos a cargar
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <Card className="border-purple-500/30 bg-purple-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-base">Calculadora de Discos</CardTitle>
          </div>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Input for weight */}
        {!pesoObjetivo && (
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.25"
              value={peso}
              onChange={handlePesoChange}
              placeholder="Peso objetivo (kg)"
              className="flex-1"
            />
            <Button onClick={() => calcular()} size="default">
              Calcular
            </Button>
          </div>
        )}

        {/* Result */}
        {calculation && (
          <div className="space-y-3">
            {/* Status */}
            {!calculation.posible && calculation.error && (
              <div className="bg-destructive/10 border border-destructive/30 p-2 rounded text-sm">
                {calculation.error}
              </div>
            )}

            {calculation.posible && (
              <>
                {/* Summary */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Peso total:</span>
                  <Badge variant="default" className="text-base">
                    {calculation.pesoTotal}kg
                  </Badge>
                </div>

                {/* Barbell visualization */}
                <div className="bg-background p-4 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-3 text-center">
                    Por cada lado de la barra:
                  </p>

                  {calculation.discosPorLado.length === 0 ? (
                    <div className="text-center">
                      <p className="text-sm font-medium">Solo barra</p>
                      <p className="text-xs text-muted-foreground">
                        {calculation.pesoBarraSola}kg
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Visual representation of plates */}
                      <div className="flex items-center justify-center gap-1">
                        {/* Left side plates */}
                        <div className="flex items-center gap-0.5">
                          {calculation.discosPorLado.map((disco, idx) => (
                            <div key={`left-${idx}`}>
                              {Array.from({ length: disco.cantidad }).map((_, i) => (
                                <div
                                  key={i}
                                  className="inline-block rounded-sm"
                                  style={{
                                    backgroundColor: disco.color,
                                    width: `${Math.max(20, disco.peso * 2)}px`,
                                    height: '60px',
                                    marginLeft: i > 0 ? '-8px' : '0',
                                    border: '2px solid rgba(0,0,0,0.2)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                  title={`${disco.peso}kg`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* Barbell */}
                        <div
                          className="bg-gray-600 mx-2"
                          style={{
                            width: '60px',
                            height: '12px',
                            borderRadius: '2px'
                          }}
                        />

                        {/* Right side plates (mirrored) */}
                        <div className="flex items-center gap-0.5 flex-row-reverse">
                          {calculation.discosPorLado.map((disco, idx) => (
                            <div key={`right-${idx}`} className="flex flex-row-reverse">
                              {Array.from({ length: disco.cantidad }).map((_, i) => (
                                <div
                                  key={i}
                                  className="inline-block rounded-sm"
                                  style={{
                                    backgroundColor: disco.color,
                                    width: `${Math.max(20, disco.peso * 2)}px`,
                                    height: '60px',
                                    marginRight: i > 0 ? '-8px' : '0',
                                    border: '2px solid rgba(0,0,0,0.2)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                  title={`${disco.peso}kg`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* List of plates */}
                      <div className="border-t pt-2 mt-3">
                        <p className="text-xs font-medium mb-2">Discos por lado:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {calculation.discosPorLado.map((disco, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className="w-4 h-4 rounded-sm border border-black/20"
                                style={{ backgroundColor: disco.color }}
                              />
                              <span className="font-medium">{disco.cantidad}x</span>
                              <span className="text-muted-foreground">{disco.peso}kg</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional info */}
                <div className="text-xs text-muted-foreground text-center">
                  Barra: {calculation.pesoBarraSola}kg + {calculation.pesoACargar}kg en discos
                </div>
              </>
            )}
          </div>
        )}

        {!calculation && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ingresa un peso para ver qué discos cargar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
