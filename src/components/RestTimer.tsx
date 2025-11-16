import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestTimerProps {
  duration: number; // duración en segundos
  onComplete?: () => void;
  onClose?: () => void;
  autoStart?: boolean;
  className?: string;
}

export default function RestTimer({
  duration,
  onComplete,
  onClose,
  autoStart = true,
  className
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompleted(true);
          onComplete?.();

          // Vibración si está disponible
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  const handlePlayPause = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setHasCompleted(false);
  }, [duration]);

  const handleSkip = useCallback(() => {
    setTimeLeft(0);
    setIsRunning(false);
    setHasCompleted(true);
    onComplete?.();
  }, [onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <Card className={cn(
      "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 shadow-lg z-50",
      hasCompleted && "border-primary",
      className
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {hasCompleted ? '¡Descanso Completo!' : 'Descansando'}
            </span>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Timer Display */}
        <div className={cn(
          "text-center mb-3",
          hasCompleted && "text-primary"
        )}>
          <div className="text-5xl font-bold tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          {hasCompleted && (
            <p className="text-sm mt-1 text-muted-foreground">
              ¡A por la siguiente serie!
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-4" />

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePlayPause}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Reanudar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {!hasCompleted && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleSkip}
            >
              Saltar
            </Button>
          )}
        </div>

        {/* Quick adjust */}
        {!hasCompleted && !isRunning && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setTimeLeft(prev => Math.max(0, prev - 15));
              }}
            >
              -15s
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setTimeLeft(prev => prev + 15);
              }}
            >
              +15s
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
