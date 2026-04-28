import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Cadencias predefinidas: [excéntrico, pausa abajo, concéntrico, pausa arriba]
const CADENCIAS = [
  { label: '4-1-2-0', desc: 'Hipertrofia estándar', valores: [4, 1, 2, 0] },
  { label: '3-1-1-0', desc: 'Fuerza-hipertrofia',   valores: [3, 1, 1, 0] },
  { label: '5-0-1-0', desc: 'Énfasis excéntrico',   valores: [5, 0, 1, 0] },
  { label: '2-0-2-0', desc: 'Rápido controlado',    valores: [2, 0, 2, 0] },
];

const FASE_LABELS = ['↓ Baja', '⏸ Pausa', '↑ Sube', '⏸ Arriba'];
const FASE_COLORS = [
  'text-blue-400',
  'text-amber-400',
  'text-green-400',
  'text-amber-400',
];

interface TUTTimerProps {
  onComplete?: () => void;
}

export default function TUTTimer({ onComplete }: TUTTimerProps) {
  const [open, setOpen] = useState(false);
  const [cadenciaIdx, setCadenciaIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [fase, setFase] = useState(0);          // 0-3
  const [countdown, setCountdown] = useState(0);
  const [rep, setRep] = useState(1);
  const [totalReps, setTotalReps] = useState(8);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cadencia = CADENCIAS[cadenciaIdx].valores;

  const stop = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setRunning(false);
    setFase(0);
    setRep(1);
    setCountdown(cadencia[0]);
  }, [cadencia]);

  const start = useCallback(() => {
    setFase(0);
    setCountdown(cadencia[0]);
    setRep(1);
    setRunning(true);
  }, [cadencia]);

  // Tick cada 1s
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1;
        // Avanzar fase
        setFase(f => {
          const nextFase = (f + 1) % 4;
          // Saltar fases con duración 0
          const dur = cadencia[nextFase];
          if (dur === 0) {
            const skipFase = (nextFase + 1) % 4;
            // Si volvemos a fase 0, es una nueva rep
            if (nextFase === 0 || skipFase === 0) {
              setRep(r => {
                const nextR = r + 1;
                if (nextR > totalReps) {
                  stop();
                  onComplete?.();
                  return r;
                }
                return nextR;
              });
              setCountdown(cadencia[0]);
              return 0;
            }
            setCountdown(cadencia[skipFase]);
            return skipFase;
          }
          // Si volvemos a fase 0 es nueva rep
          if (nextFase === 0) {
            setRep(r => {
              const nextR = r + 1;
              if (nextR > totalReps) {
                stop();
                onComplete?.();
                return r;
              }
              return nextR;
            });
          }
          setCountdown(cadencia[nextFase]);
          return nextFase;
        });
        return 0;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running, cadencia, totalReps, stop, onComplete]);

  // Reset countdown when cadence changes
  useEffect(() => {
    if (!running) setCountdown(cadencia[0]);
  }, [cadenciaIdx, running, cadencia]);

  const durTotal = cadencia.reduce((a, b) => a + b, 0);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Timer className="w-3.5 h-3.5" />
        Cadencia TUT
        <ChevronDown className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Tiempo Bajo Tensión</span>
        </div>
        <button onClick={() => { stop(); setOpen(false); }} className="text-muted-foreground hover:text-foreground">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Selector de cadencia */}
      <div className="grid grid-cols-2 gap-1.5">
        {CADENCIAS.map((c, i) => (
          <button
            key={c.label}
            disabled={running}
            onClick={() => setCadenciaIdx(i)}
            className={`rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
              cadenciaIdx === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
            } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="font-bold font-mono">{c.label}</span>
            <span className="block text-[10px] opacity-80">{c.desc}</span>
          </button>
        ))}
      </div>

      {/* Contador de reps */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Reps:</span>
        <div className="flex items-center gap-1">
          <button disabled={running} onClick={() => setTotalReps(r => Math.max(1, r - 1))}
            className="w-6 h-6 rounded bg-muted text-xs font-bold disabled:opacity-40">−</button>
          <span className="w-8 text-center font-bold text-sm">{totalReps}</span>
          <button disabled={running} onClick={() => setTotalReps(r => Math.min(30, r + 1))}
            className="w-6 h-6 rounded bg-muted text-xs font-bold disabled:opacity-40">+</button>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          ~{durTotal * totalReps}s total
        </span>
      </div>

      {/* Visor principal */}
      {running ? (
        <div className="rounded-xl bg-muted/50 p-4 text-center space-y-1">
          <p className={`text-4xl font-black tabular-nums ${FASE_COLORS[fase]}`}>
            {countdown}s
          </p>
          <p className={`text-base font-bold ${FASE_COLORS[fase]}`}>
            {FASE_LABELS[fase]}
          </p>
          <p className="text-xs text-muted-foreground">
            Rep {rep} / {totalReps}
          </p>
          {/* Mini barra de fase */}
          <div className="flex gap-1 mt-2">
            {CADENCIAS[cadenciaIdx].valores.map((dur, i) => dur > 0 && (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all ${i === fase ? FASE_COLORS[i].replace('text-', 'bg-') : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Cadencia <span className="font-mono font-bold text-foreground">{CADENCIAS[cadenciaIdx].label}</span>
            {' · '}{CADENCIAS[cadenciaIdx].desc}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Excentrico · Pausa · Concéntrico · Pausa
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        {!running ? (
          <Button size="sm" className="flex-1" onClick={start}>
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Iniciar cadencia
          </Button>
        ) : (
          <Button size="sm" variant="destructive" className="flex-1" onClick={stop}>
            <Square className="w-3.5 h-3.5 mr-1.5" />
            Parar
          </Button>
        )}
      </div>
    </div>
  );
}
