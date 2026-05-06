import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CBUM_ROUTINE, CBUM_PRINCIPLES, CBUM_NUTRITION } from '@/data/cbumRoutine';
import type { FullWRoutine } from '@/data/fullwRoutines';
import {
  ChevronDown, ChevronUp, Trophy, Calendar, Clock, ArrowRight,
  Dumbbell, Sparkles, Salad, Brain, Moon,
} from 'lucide-react';

interface Props {
  onUseRoutine: (rutina: FullWRoutine) => void;
}

export default function CbumRoutineView({ onUseRoutine }: Props) {
  const [openDay, setOpenDay] = useState<number | null>(0);
  const rutina = CBUM_ROUTINE;

  const totalEjercicios = rutina.plan.reduce((s, d) => s + d.ejercicios.length, 0);

  return (
    <div className="space-y-4">
      {/* Header dorado */}
      <Card className="border-amber-300 dark:border-amber-700/40 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-5 h-5 text-amber-500" />
                CBum — Classic Physique
              </CardTitle>
              <CardDescription>
                Chris Bumstead · 6× Mr. Olympia · Split de 8 días
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-500/90 text-white shrink-0">
              Avanzado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-background/70 rounded-lg p-2">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <p className="font-bold text-sm">{rutina.dias}</p>
              <p className="text-[10px] text-muted-foreground">días/ciclo</p>
            </div>
            <div className="bg-background/70 rounded-lg p-2">
              <Dumbbell className="w-4 h-4 mx-auto mb-1 text-orange-500" />
              <p className="font-bold text-sm">{totalEjercicios}</p>
              <p className="text-[10px] text-muted-foreground">ejercicios</p>
            </div>
            <div className="bg-background/70 rounded-lg p-2">
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
              <p className="font-bold text-sm">2</p>
              <p className="text-[10px] text-muted-foreground">series efect.</p>
            </div>
            <div className="bg-background/70 rounded-lg p-2">
              <Clock className="w-4 h-4 mx-auto mb-1 text-amber-600" />
              <p className="font-bold text-sm">75-90</p>
              <p className="text-[10px] text-muted-foreground">min/sesión</p>
            </div>
          </div>

          <div className="bg-background/70 border rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <strong className="text-foreground">Distribución:</strong> {rutina.distribucion}
          </div>
        </CardContent>
      </Card>

      {/* Filosofía */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-600" />
            Filosofía CBum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CBUM_PRINCIPLES.map((p, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-amber-500 font-bold shrink-0">·</span>
              <div>
                <strong className="text-foreground">{p.titulo}.</strong>{' '}
                <span className="text-muted-foreground">{p.descripcion}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Días */}
      {rutina.plan.map((dia, idx) => {
        const isRest = dia.ejercicios.length === 0;
        const isOpen = openDay === idx;
        return (
          <Card
            key={idx}
            className={`${isOpen ? 'ring-1 ring-amber-400/60' : ''} ${isRest ? 'opacity-70' : ''}`}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => !isRest && setOpenDay(isOpen ? null : idx)}
              disabled={isRest}
            >
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      {isRest && <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
                      {dia.nombre}
                    </CardTitle>
                    {!isRest && dia.grupos.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {dia.grupos.map(g => (
                          <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isRest ? (
                      <Badge variant="secondary" className="text-[10px]">Descanso</Badge>
                    ) : (
                      <>
                        <Badge variant="secondary" className="text-[10px]">{dia.ejercicios.length} ej.</Badge>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </button>

            {isOpen && !isRest && (
              <CardContent className="pt-0 space-y-2">
                {dia.ejercicios.map((ej, ei) => (
                  <div key={ei} className="bg-muted/40 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{ei + 1}. {ej.nombre}</p>
                        {ej.notas && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            ✦ {ej.notas}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 items-end">
                        <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                          {ej.series} × {ej.reps}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                          {ej.descanso}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Nutrición */}
      <Card className="border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Salad className="w-4 h-4 text-green-600" />
            Nutrición CBum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          <p>
            <strong>Off-season:</strong> hasta {CBUM_NUTRITION.caloriasOff.toLocaleString()} kcal/día.{' '}
            <strong>Prep:</strong> {CBUM_NUTRITION.caloriasPrep.toLocaleString()} kcal.
          </p>
          <p>
            <strong>Proteína:</strong> {CBUM_NUTRITION.proteinas}.
          </p>
          <p className="text-muted-foreground">
            <strong>Fuentes:</strong> {CBUM_NUTRITION.fuentes.join(', ')}.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center px-4 italic">
        Esta rutina es de un atleta profesional. Adáptala a tu nivel — empieza con 1 serie efectiva si eres
        intermedio y sube cuando domines la técnica.
      </div>

      {/* CTA principal */}
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        onClick={() => onUseRoutine(rutina)}
      >
        <Trophy className="w-4 h-4 mr-2" />
        Usar la rutina de CBum
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
