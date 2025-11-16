import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PersonalRecord } from '@/types';
import { Trophy, TrendingUp, Zap, X } from 'lucide-react';

interface PRCelebrationProps {
  pr: PersonalRecord;
  onClose: () => void;
}

export default function PRCelebration({ pr, onClose }: PRCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (pr.tipo) {
      case 'peso_maximo':
        return <Trophy className="w-16 h-16 text-yellow-500" />;
      case 'volumen_total':
        return <TrendingUp className="w-16 h-16 text-blue-500" />;
      case 'one_rep_max':
        return <Zap className="w-16 h-16 text-purple-500" />;
      case 'reps_maximas':
        return <Zap className="w-16 h-16 text-orange-500" />;
      default:
        return <Trophy className="w-16 h-16 text-primary" />;
    }
  };

  const getTitulo = () => {
    switch (pr.tipo) {
      case 'peso_maximo':
        return '¡NUEVO PESO MÁXIMO!';
      case 'volumen_total':
        return '¡RÉCORD DE VOLUMEN!';
      case 'one_rep_max':
        return '¡NUEVO 1RM ESTIMADO!';
      case 'reps_maximas':
        return '¡MÁS REPETICIONES!';
      default:
        return '¡NUEVO RÉCORD PERSONAL!';
    }
  };

  const getDescripcion = () => {
    const mejora = pr.anterior
      ? ` (+${(pr.valor - pr.anterior.valor).toFixed(1)})`
      : '';

    switch (pr.tipo) {
      case 'peso_maximo':
        return `${pr.valor}kg × ${pr.reps} reps${mejora}`;
      case 'volumen_total':
        return `${pr.valor.toFixed(0)}kg de volumen total${mejora}`;
      case 'one_rep_max':
        return `${pr.valor.toFixed(1)}kg 1RM estimado${mejora}`;
      case 'reps_maximas':
        return `${pr.valor} repeticiones${mejora}`;
      default:
        return `${pr.valor}`;
    }
  };

  const getMensajeMotivacional = () => {
    const mensajes = [
      '¡Sigue así, bestia! 💪',
      '¡Eso es progreso real!',
      '¡Imparable!',
      '¡A por más! 🔥',
      '¡Cada día más fuerte!',
      '¡Leyenda!',
      '¡Beast Mode Activado! 🦍'
    ];
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#FBBF24', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6'][
                  Math.floor(Math.random() * 5)
                ]
              }}
            />
          </div>
        ))}
      </div>

      {/* Main card */}
      <Card
        className={`max-w-md w-full border-primary shadow-2xl transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            {/* Icon with pulse animation */}
            <div className="animate-bounce">{getIcon()}</div>

            <div>
              <Badge variant="default" className="mb-2 text-sm px-3 py-1">
                Personal Record
              </Badge>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {getTitulo()}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Exercise name */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-1">{pr.ejercicioNombre}</h3>
            <p className="text-2xl font-extrabold text-primary">{getDescripcion()}</p>
          </div>

          {/* Previous record comparison */}
          {pr.anterior && (
            <div className="bg-accent/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Récord anterior:{' '}
                <span className="font-semibold text-foreground">
                  {pr.anterior.valor.toFixed(1)}
                  {pr.tipo === 'peso_maximo' && 'kg'}
                  {pr.tipo === 'volumen_total' && 'kg'}
                  {pr.tipo === 'one_rep_max' && 'kg'}
                  {pr.tipo === 'reps_maximas' && ' reps'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {new Date(pr.anterior.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          )}

          {/* Motivational message */}
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{getMensajeMotivacional()}</p>
          </div>

          {/* Action button */}
          <Button onClick={onClose} size="lg" className="w-full">
            <Trophy className="w-4 h-4 mr-2" />
            ¡A por el siguiente!
          </Button>
        </CardContent>
      </Card>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
