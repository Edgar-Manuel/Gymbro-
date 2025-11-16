import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VolumeLandmark } from '@/types';
import { TrendingUp, Target, Award } from 'lucide-react';

interface VolumeLandmarkCelebrationProps {
  landmark: VolumeLandmark;
  onClose: () => void;
}

export default function VolumeLandmarkCelebration({ landmark, onClose }: VolumeLandmarkCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (landmark.tipo) {
      case 'total':
        return <Award className="w-16 h-16 text-yellow-500" />;
      case 'mensual':
        return <TrendingUp className="w-16 h-16 text-blue-500" />;
      case 'semanal':
        return <Target className="w-16 h-16 text-green-500" />;
      case 'por_ejercicio':
        return <Award className="w-16 h-16 text-purple-500" />;
      default:
        return <Award className="w-16 h-16 text-primary" />;
    }
  };

  const getTitulo = () => {
    switch (landmark.tipo) {
      case 'total':
        return '¡HITO TOTAL ALCANZADO!';
      case 'mensual':
        return '¡RÉCORD MENSUAL!';
      case 'semanal':
        return '¡RÉCORD SEMANAL!';
      case 'por_ejercicio':
        return '¡HITO POR EJERCICIO!';
      default:
        return '¡NUEVO HITO!';
    }
  };

  const formatearVolumen = (kg: number) => {
    if (kg >= 1000000) {
      return `${(kg / 1000000).toFixed(1)}M kg`;
    }
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(0)}K kg`;
    }
    return `${kg.toFixed(0)} kg`;
  };

  const getMensajesMotivacionales = () => {
    const mensajes = [
      '¡Imparable! 🦍',
      '¡Sigue rompiendo límites!',
      '¡Leyenda en construcción! 💪',
      '¡Cada kg cuenta!',
      '¡Progreso real!',
      '¡A por más!',
      '¡Beast Mode activado! 🔥'
    ];
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Fireworks effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#FBBF24', '#EF4444', '#3B82F6', '#10B981'][
                  Math.floor(Math.random() * 4)
                ]
              }}
            />
          </div>
        ))}
      </div>

      {/* Main card */}
      <Card
        className={`max-w-md w-full border-yellow-500 shadow-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <CardHeader>
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            {/* Icon */}
            <div className="animate-bounce">{getIcon()}</div>

            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {getTitulo()}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Volume achievement */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Has alcanzado:</p>
            <p className="text-5xl font-black text-yellow-600 dark:text-yellow-400">
              {formatearVolumen(landmark.umbral)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{landmark.mensaje}</p>
          </div>

          {/* Stats summary */}
          <div className="bg-accent/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{formatearVolumen(landmark.umbral)}</p>
                <p className="text-xs text-muted-foreground">Volumen acumulado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {landmark.tipo === 'total' ? '🏆' : landmark.tipo === 'mensual' ? '📅' : '⏰'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{landmark.tipo}</p>
              </div>
            </div>
          </div>

          {/* Motivational message */}
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{getMensajesMotivacionales()}</p>
          </div>

          {/* Action button */}
          <Button onClick={onClose} size="lg" className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            ¡Continuar aplastando!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
