import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FULLW_ROUTINES, PROGRESION_SEMANAL } from '@/data/fullwRoutines';
import type { FullWRoutine } from '@/data/fullwRoutines';
import { ChevronDown, ChevronUp, Dumbbell, Calendar, TrendingUp, Clock, ArrowRight } from 'lucide-react';

interface Props {
  onUseRoutine: (rutina: FullWRoutine) => void;
}

export default function FullWRoutineView({ onUseRoutine }: Props) {
  const [dias, setDias] = useState<number>(4);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [semana, setSemana] = useState<number>(1);

  const rutina: FullWRoutine = FULLW_ROUTINES[dias];
  const progSemana = PROGRESION_SEMANAL[semana - 1];

  return (
    <div className="space-y-4">
      {/* Selector días + semana */}
      <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="w-4 h-4 text-purple-600" />
            Full W — Templates Oficiales
          </CardTitle>
          <CardDescription>
            Low Volume · High Intensity · Progresión 8 semanas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Días / semana</p>
              <Select value={dias.toString()} onValueChange={v => { setDias(parseInt(v)); setOpenDay(0); }}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 días — Push/Pull/Legs</SelectItem>
                  <SelectItem value="4">4 días — Upper/Lower ×2</SelectItem>
                  <SelectItem value="5">5 días — PPL + Upper/Lower</SelectItem>
                  <SelectItem value="6">6 días — PPL ×2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Semana actual</p>
              <Select value={semana.toString()} onValueChange={v => setSemana(parseInt(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRESION_SEMANAL.map(s => (
                    <SelectItem key={s.semana} value={s.semana.toString()}>
                      {s.label} — {s.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-background/70 rounded-lg p-2">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <p className="font-bold text-sm">{rutina.dias}</p>
              <p className="text-xs text-muted-foreground">días/sem</p>
            </div>
            <div className="bg-background/70 rounded-lg p-2">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="font-bold text-sm">8</p>
              <p className="text-xs text-muted-foreground">semanas</p>
            </div>
            <div className="bg-background/70 rounded-lg p-2">
              <Clock className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <p className="font-bold text-sm">60-75</p>
              <p className="text-xs text-muted-foreground">min/sesión</p>
            </div>
          </div>

          {/* Semana banner */}
          <div className="bg-background/70 border rounded-lg px-3 py-2 flex items-center gap-2">
            <Badge variant="default" className="text-xs">{progSemana.label}</Badge>
            <span className="text-sm">{progSemana.descripcion}</span>
          </div>

          <p className="text-xs text-muted-foreground">{rutina.distribucion}</p>
        </CardContent>
      </Card>

      {/* Días */}
      {rutina.plan.map((dia, idx) => {
        const isOpen = openDay === idx;
        return (
          <Card key={idx} className={isOpen ? 'ring-1 ring-primary/40' : ''}>
            <button
              className="w-full text-left"
              onClick={() => setOpenDay(isOpen ? null : idx)}
            >
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">{dia.nombre}</CardTitle>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {dia.grupos.map(g => (
                        <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{dia.ejercicios.length} ejercicios</Badge>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </button>

            {isOpen && (
              <CardContent className="pt-0 space-y-2">
                {dia.ejercicios.map((ej, ei) => (
                  <div key={ei} className="bg-muted/40 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ei + 1}. {ej.nombre}</p>
                        {ej.notas && (
                          <p className="text-xs text-muted-foreground mt-0.5">{ej.notas}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">{ej.series} × {ej.reps}</Badge>
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">{ej.descanso}</Badge>
                      </div>
                    </div>
                    {ej.calentamiento && (
                      <p className="text-xs text-yellow-600 mt-1">⚡ Incluye serie de calentamiento</p>
                    )}
                  </div>
                ))}

                {/* Progresión nota */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>{progSemana.label}:</strong> {progSemana.descripcion}. En compuestos sube 2.5 kg cuando completes todas las reps con buena técnica.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Principios Full W */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Principios Full W</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>• <strong>2 series efectivas</strong> al fallo técnico (RIR 0-1) valen más que 5 series mediocres</p>
          <p>• <strong>2-3 min de descanso</strong> en compuestos, 1-2 min en aislamientos</p>
          <p>• <strong>Progresión doble</strong>: primero sube reps hasta el tope, luego añade peso</p>
          <p>• <strong>Deload S4</strong>: reduce el 20% del peso — obligatorio para seguir progresando</p>
          <p>• <strong>Técnica &gt; Peso</strong>: nunca sacrifiques forma por kilos</p>
        </CardContent>
      </Card>

      {/* CTA principal */}
      <Button
        size="lg"
        className="w-full"
        onClick={() => onUseRoutine(rutina)}
      >
        Usar esta Rutina Full W
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
