import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DiaRutina } from '@/types';
import { Calendar, Dumbbell, ArrowRight } from 'lucide-react';

interface DaySelectorProps {
  dias: DiaRutina[];
  onSelectDay: (dia: DiaRutina) => void;
  selectedDayId?: string;
}

export default function DaySelector({ dias, onSelectDay, selectedDayId }: DaySelectorProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Selecciona tu Entrenamiento</h1>
        <p className="text-muted-foreground text-lg">
          Elige el día de rutina que vas a entrenar hoy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dias.map((dia) => {
          const isSelected = dia.id === selectedDayId;

          return (
            <Card
              key={dia.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'border-primary border-2 bg-primary/5' : ''
              }`}
              onClick={() => onSelectDay(dia)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{dia.nombre}</CardTitle>
                    <CardDescription className="text-base">
                      {dia.gruposMusculares.join(' • ')}
                    </CardDescription>
                  </div>
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Resumen */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      <span className="font-medium">{dia.ejercicios.length}</span>
                      <span className="text-muted-foreground">ejercicios</span>
                    </div>
                    <div>
                      <span className="font-medium">
                        {dia.ejercicios.reduce((total, ej) => total + ej.seriesObjetivo, 0)}
                      </span>
                      <span className="text-muted-foreground"> series totales</span>
                    </div>
                  </div>

                  {/* Lista de ejercicios */}
                  <div className="space-y-1">
                    {dia.ejercicios.slice(0, 3).map((ej, index) => (
                      <div key={index} className="text-sm flex items-center justify-between">
                        <span className="truncate">{ej.ejercicio?.nombre}</span>
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {ej.seriesObjetivo}×
                        </Badge>
                      </div>
                    ))}
                    {dia.ejercicios.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{dia.ejercicios.length - 3} ejercicios más
                      </p>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <Button
                    className="w-full mt-2"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDay(dia);
                    }}
                  >
                    {isSelected ? 'Día Seleccionado' : 'Seleccionar Día'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
