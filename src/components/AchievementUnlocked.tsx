import { useEffect, useState } from 'react';
import type { EarnedAchievement } from '@/utils/achievementChecker';

interface Props {
  achievements: EarnedAchievement[];
  onClose: () => void;
}

export default function AchievementUnlocked({ achievements, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const current = achievements[index];

  useEffect(() => {
    setVisible(true);
  }, [index]);

  const handleNext = () => {
    if (index < achievements.length - 1) {
      setVisible(false);
      setTimeout(() => setIndex(i => i + 1), 200);
    } else {
      onClose();
    }
  };

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleNext}
    >
      {/* Confetti-like particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              backgroundColor: ['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa'][i % 5],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.6 + Math.random() * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative bg-card border-2 border-yellow-400 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl shadow-yellow-500/20 transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Badge glow */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-yellow-400/20 flex items-center justify-center border-4 border-yellow-400 shadow-lg shadow-yellow-400/40">
          <span className="text-4xl">{current.icono}</span>
        </div>

        <div className="mt-10 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-500">
            ¡Logro desbloqueado!
          </p>
          <h2 className="text-2xl font-bold">{current.nombre}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {current.descripcion}
          </p>
        </div>

        <button
          onClick={handleNext}
          className="mt-6 w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-sm transition-colors"
        >
          {index < achievements.length - 1
            ? `Siguiente (${index + 1}/${achievements.length})`
            : '¡A por más! →'}
        </button>

        {achievements.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {achievements.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-4 bg-yellow-400' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
