import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Pause, Square, Zap, Heart, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { dbHelpers } from '@/db';
import type { Somatotipo, CardioEquipo, CardioMomento } from '@/types';
import {
  CARDIO_RECOMENDACIONES,
  CARDIO_EQUIPO_LABELS,
  CARDIO_TIPO_LABELS,
  type CardioProtocol,
} from '@/utils/cardioData';
import { ID } from 'appwrite';
import { cn } from '@/lib/utils';

const EQUIPOS: CardioEquipo[] = ['cinta', 'bici', 'eliptica', 'remo', 'sin_equipo'];

interface Props {
  userId: string;
  workoutId?: string;
  somatotipo: Somatotipo;
  momento: CardioMomento;
}

type TimerState = 'idle' | 'running' | 'paused' | 'done';

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function CardioPanel({ userId, workoutId, somatotipo, momento }: Props) {
  const rec = CARDIO_RECOMENDACIONES[somatotipo];
  const recProtocol = rec.protocolos[0];

  const [expanded, setExpanded] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<CardioProtocol>(recProtocol);
  const [selectedEquipo, setSelectedEquipo] = useState<CardioEquipo>('cinta');
  const [completed, setCompleted] = useState(false);

  // Timer
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0); // seconds
  const [isSaving, setIsSaving] = useState(false);
  // HIIT phase tracking
  const [hiitPhase, setHiitPhase] = useState<'trabajo' | 'descanso'>('trabajo');
  const [hiitRondaActual, setHiitRondaActual] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const selectedEquipoRef = useRef(selectedEquipo);
  selectedEquipoRef.current = selectedEquipo;

  const isHiit = selectedProtocol.tipo === 'hiit';
  const totalSeconds = selectedProtocol.duracion * 60;

  // Refs to avoid stale closures in setInterval
  const elapsedRef = useRef(0);
  const phaseElapsedRef = useRef(0);
  const hiitPhaseRef = useRef<'trabajo' | 'descanso'>('trabajo');
  const protocolRef = useRef(selectedProtocol);
  protocolRef.current = selectedProtocol;
  const totalSecondsRef = useRef(totalSeconds);
  totalSecondsRef.current = totalSeconds;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const stopAndSave = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('done');
    setIsSaving(true);
    const duracionReal = Math.round(elapsedRef.current / 60);
    await dbHelpers.addCardioSession({
      id: ID.unique(),
      userId,
      workoutId,
      tipo: protocolRef.current.tipo,
      equipo: selectedEquipoRef.current,
      momento,
      duracionObjetivo: protocolRef.current.duracion,
      duracionReal,
      fecha: new Date(),
      completado: true,
    });
    setCompleted(true);
  };

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      const newElapsed = elapsedRef.current + 1;
      elapsedRef.current = newElapsed;
      setElapsed(newElapsed);

      if (newElapsed >= totalSecondsRef.current) {
        stopAndSave();
        return;
      }

      if (protocolRef.current.tipo === 'hiit') {
        const newPhaseElapsed = phaseElapsedRef.current + 1;
        const currentPhase = hiitPhaseRef.current;
        const phaseDur = currentPhase === 'trabajo'
          ? (protocolRef.current.trabajoSeg ?? 40)
          : (protocolRef.current.descansoSeg ?? 20);

        if (newPhaseElapsed >= phaseDur) {
          phaseElapsedRef.current = 0;
          const nextPhase = currentPhase === 'trabajo' ? 'descanso' : 'trabajo';
          hiitPhaseRef.current = nextPhase;
          setHiitPhase(nextPhase);
          if (nextPhase === 'trabajo') {
            setHiitRondaActual(r => r + 1);
          }
        } else {
          phaseElapsedRef.current = newPhaseElapsed;
        }
      }
    }, 1000);
  };

  const handleStart = () => {
    setTimerState('running');
    setElapsed(0);
    setHiitPhase('trabajo');
    setHiitRondaActual(1);
    elapsedRef.current = 0;
    phaseElapsedRef.current = 0;
    hiitPhaseRef.current = 'trabajo';
    startTimeRef.current = Date.now();
    startInterval();
  };

  const handlePause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pausedAtRef.current = elapsedRef.current;
    setTimerState('paused');
  };

  const handleResume = () => {
    setTimerState('running');
    startInterval();
  };

  const handleStop = () => {
    stopAndSave();
  };

  const progress = Math.min(elapsed / totalSeconds, 1);
  const circumference = 2 * Math.PI * 54;

  if (completed) {
    return (
      <div className="rounded-xl border-2 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">Cardio completado</p>
          <p className="text-xs text-muted-foreground">
            {CARDIO_TIPO_LABELS[selectedProtocol.tipo]} · {Math.round(elapsed / 60)} min · {CARDIO_EQUIPO_LABELS[selectedEquipo]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-base">Cardio recomendado</CardTitle>
            <Badge variant="outline" className="text-xs">{rec.titulo}</Badge>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Reason */}
          <p className="text-xs text-muted-foreground italic">{rec.razon}</p>

          {/* Protocol selector */}
          <div>
            <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Protocolo</p>
            <div className="grid grid-cols-2 gap-2">
              {rec.protocolos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    elapsedRef.current = 0;
                    setSelectedProtocol(p);
                    setTimerState('idle');
                    setElapsed(0);
                  }}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    selectedProtocol === p
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-border hover:border-blue-300'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {p.tipo === 'hiit' ? <Zap className="w-3.5 h-3.5 text-orange-500" /> : <Heart className="w-3.5 h-3.5 text-blue-500" />}
                    <span className="text-xs font-bold">{p.descripcion}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.beneficio}</p>
                  {p.tipo === 'hiit' && p.trabajoSeg && (
                    <p className="text-xs mt-1 font-medium text-orange-500">{p.trabajoSeg}s/{p.descansoSeg}s × {p.rondas}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment selector */}
          <div>
            <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Equipo</p>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPOS.map(eq => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquipo(eq)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                    selectedEquipo === eq
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-border hover:border-blue-300'
                  )}
                >
                  {CARDIO_EQUIPO_LABELS[eq]}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={isHiit && timerState === 'running' ? (hiitPhase === 'trabajo' ? '#f97316' : '#3b82f6') : '#3b82f6'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-mono font-bold">{fmt(elapsed)}</span>
                <span className="text-xs text-muted-foreground">{fmt(totalSeconds)}</span>
              </div>
            </div>

            {/* HIIT phase indicator */}
            {isHiit && timerState === 'running' && (
              <div className={cn(
                'px-4 py-1.5 rounded-full text-sm font-bold text-white transition-colors',
                hiitPhase === 'trabajo' ? 'bg-orange-500' : 'bg-blue-500'
              )}>
                {hiitPhase === 'trabajo' ? '¡Trabaja!' : 'Descansa'} · Ronda {hiitRondaActual}/{selectedProtocol.rondas ?? '∞'}
              </div>
            )}

            <div className="flex items-center gap-2">
              {timerState === 'idle' && (
                <Button onClick={handleStart} className="gap-2">
                  <Play className="w-4 h-4" />
                  Empezar
                </Button>
              )}
              {timerState === 'running' && (
                <>
                  <Button variant="outline" onClick={handlePause} className="gap-2">
                    <Pause className="w-4 h-4" />
                    Pausa
                  </Button>
                  <Button variant="outline" onClick={handleStop} className="gap-2 text-green-600 border-green-300">
                    <Square className="w-4 h-4" />
                    Terminar
                  </Button>
                </>
              )}
              {timerState === 'paused' && (
                <>
                  <Button onClick={handleResume} className="gap-2">
                    <Play className="w-4 h-4" />
                    Continuar
                  </Button>
                  <Button variant="outline" onClick={handleStop} className="gap-2 text-green-600 border-green-300">
                    <Square className="w-4 h-4" />
                    Terminar
                  </Button>
                </>
              )}
              {timerState === 'done' && (
                <Button onClick={handleStart} variant="outline" className="gap-2" disabled={isSaving}>
                  <Play className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Reiniciar'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
