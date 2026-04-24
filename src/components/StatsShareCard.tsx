import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, X } from 'lucide-react';

interface Props {
  nombre: string;
  semanaNum: number;
  entrenamientos: number;
  volumenKg: number;
  racha: number;
  musculosTop: string[];
  onClose: () => void;
}

export default function StatsShareCard({
  nombre,
  semanaNum,
  entrenamientos,
  volumenKg,
  racha,
  musculosTop,
  onClose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    draw();
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = 540;
    const H = 960;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d0d1a');
    bg.addColorStop(0.5, '#130a24');
    bg.addColorStop(1, '#0d1a0d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative glow circles
    const drawGlow = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    drawGlow(W * 0.15, H * 0.15, 220, 'rgba(168,85,247,0.15)');
    drawGlow(W * 0.85, H * 0.75, 200, 'rgba(34,197,94,0.12)');

    // Header bar
    ctx.fillStyle = 'rgba(168,85,247,0.1)';
    ctx.beginPath();
    ctx.roundRect(24, 24, W - 48, 72, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,85,247,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // App name
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GymBro', 44, 68);

    // Semana label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Semana ${semanaNum}`, W - 44, 68);

    // User name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.fillText(nombre, W / 2, 190);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('mi semana en el gym', W / 2, 225);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 255);
    ctx.lineTo(W - 60, 255);
    ctx.stroke();

    // Stat cards
    const stats = [
      { label: 'Entrenamientos', value: String(entrenamientos), icon: '🏋️', color: '#a855f7' },
      { label: 'Volumen total', value: volumenKg >= 1000 ? `${(volumenKg / 1000).toFixed(1)}t` : `${volumenKg}kg`, icon: '📦', color: '#22c55e' },
      { label: 'Racha actual', value: `${racha} días`, icon: '🔥', color: '#f97316' },
    ];

    stats.forEach((s, i) => {
      const x = 44 + i * ((W - 88) / 3 + 8);
      const y = 275;
      const w = (W - 88) / 3;
      const h = 160;

      // Card bg
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 16);
      ctx.fill();
      ctx.strokeStyle = `${s.color}40`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon
      ctx.font = '36px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, x + w / 2, y + 52);

      // Value
      ctx.fillStyle = s.color;
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText(s.value, x + w / 2, y + 96);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '13px system-ui, sans-serif';
      const words = s.label.split(' ');
      words.forEach((word, wi) => ctx.fillText(word, x + w / 2, y + 117 + wi * 16));
    });

    // Muscle groups section
    if (musculosTop.length > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.roundRect(44, 468, W - 88, 180, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MÚSCULOS TRABAJADOS ESTA SEMANA', 64, 498);

      ctx.textAlign = 'center';
      const colors = ['#a855f7', '#22c55e', '#f97316', '#3b82f6', '#ec4899'];
      musculosTop.slice(0, 5).forEach((m, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const bx = 80 + col * 130;
        const by = 510 + row * 44;
        const bw = 118;

        ctx.fillStyle = `${colors[i]}25`;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, 30, 8);
        ctx.fill();
        ctx.strokeStyle = `${colors[i]}60`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = colors[i];
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText(m, bx + bw / 2, by + 20);
      });
    }

    // Quote / motivation
    const quotes = [
      'El éxito es la suma de pequeños esfuerzos',
      'No pares cuando estés cansado, para cuando estés listo',
      'El cuerpo consigue lo que la mente cree',
      'Disciplina > Motivación',
    ];
    const quote = quotes[semanaNum % quotes.length];
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = 'italic 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const maxW = W - 120;
    const words2 = quote.split(' ');
    let line = '';
    let qy = 690;
    for (const word of words2) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(`"${line}"`, W / 2, qy);
        line = word;
        qy += 24;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line === quote ? `"${line}"` : line, W / 2, qy);

    // Bottom brand bar
    ctx.fillStyle = 'rgba(168,85,247,0.12)';
    ctx.beginPath();
    ctx.roundRect(24, H - 88, W - 48, 64, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,85,247,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('gymbro.app  •  Tu compañero de entrenamiento', W / 2, H - 48);
  };

  const getBlob = (): Promise<Blob> =>
    new Promise((res, rej) => {
      const canvas = canvasRef.current;
      if (!canvas) return rej();
      canvas.toBlob(blob => (blob ? res(blob) : rej()), 'image/png');
    });

  const handleDownload = async () => {
    const blob = await getBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymbro-semana-${semanaNum}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      const blob = await getBlob();
      const file = new File([blob], `gymbro-semana-${semanaNum}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Mi semana en GymBro' });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <p className="text-white/50 text-xs uppercase tracking-widest">Tu semana en imagen</p>

      <canvas
        ref={canvasRef}
        className="rounded-2xl shadow-2xl"
        style={{ maxHeight: '65vh', width: 'auto' }}
      />

      <div className="flex gap-3 w-full max-w-xs">
        <Button onClick={handleShare} className="flex-1 gap-2">
          <Share2 className="w-4 h-4" />
          Compartir
        </Button>
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
