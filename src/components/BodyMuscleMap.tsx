import { useEffect, useState } from 'react';
import type { Somatotipo } from '@/types';
import { getWeeklySetsByMuscle, setsToColor, setsToLabel, type MuscleSetMap } from '@/utils/muscleVolumeCalculator';

interface Props {
  userId: string;
  somatotipo?: Somatotipo;
  sexo?: 'masculino' | 'femenino';
}

function getSets(map: MuscleSetMap, key: string): number {
  return map[key] ?? 0;
}

// Horizontal body width scale per somatotipo
const SOMA_SCALE_X: Record<string, number> = {
  ectomorfo: 0.78,
  mesomorfo: 1.0,
  endomorfo: 1.22,
};

export const SOMA_META: Record<string, { label: string; color: string; description: string }> = {
  ectomorfo: { label: 'Ectomorfo', color: '#60a5fa', description: 'Delgado · metabolismo rápido' },
  mesomorfo: { label: 'Mesomorfo', color: '#34d399', description: 'Atlético · gana músculo con facilidad' },
  endomorfo: { label: 'Endomorfo', color: '#fb923c', description: 'Robusto · fuerza natural alta' },
};

const LEGEND = [
  { color: '#94a3b8', label: 'Sin entrenar' },
  { color: '#60a5fa', label: '1-3 series' },
  { color: '#34d399', label: '4-7 series' },
  { color: '#fbbf24', label: '8-12 series' },
  { color: '#f87171', label: '13+ series' },
];

const MUSCLE_LABELS: Record<string, string> = {
  pecho:             'Pecho',
  espalda:           'Espalda',
  hombros:           'Hombros',
  biceps:            'Bíceps',
  triceps:           'Tríceps',
  antebrazos:        'Antebrazos',
  abdominales:       'Abdominales',
  piernas:           'Piernas',
  femorales_gluteos: 'Femorales/Glúteos',
};

// ─── Front SVG ─────────────────────────────────────────────────────────────────

function FrontBody({
  sets,
  somatotipo = 'mesomorfo',
  sexo = 'masculino',
}: {
  sets: MuscleSetMap;
  somatotipo?: Somatotipo;
  sexo?: 'masculino' | 'femenino';
}) {
  const c = (key: string) => setsToColor(getSets(sets, key));
  const skin = '#c9a987';
  const skinDark = '#b08d6e';
  const sx = SOMA_SCALE_X[somatotipo] ?? 1;
  const isFemale = sexo === 'femenino';

  return (
    <svg
      viewBox="0 0 120 300"
      className="w-full h-full"
      style={{ transform: `scaleX(${sx})`, transformOrigin: '50% 0%' }}
    >
      <defs>
        <radialGradient id="bmm-f-head" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#e0b890" />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
      </defs>

      {/* Head */}
      <ellipse cx="60" cy="17" rx="14" ry="16" fill="url(#bmm-f-head)" />
      <path d="M 55,32 L 65,32 L 65,40 L 55,40 Z" fill={skinDark} />
      <path d="M 55,37 Q 47,38 42,40 L 44,44 Q 50,42 56,41 Z" fill={skinDark} />
      <path d="M 65,37 Q 73,38 78,40 L 76,44 Q 70,42 64,41 Z" fill={skinDark} />

      {/* Shoulders */}
      <path d="M 43,38 C 30,35 19,46 22,58 C 25,70 40,72 47,62 C 51,54 50,43 43,38 Z"
        fill={c('hombros')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 77,38 C 90,35 101,46 98,58 C 95,70 80,72 73,62 C 69,54 70,43 77,38 Z"
        fill={c('hombros')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Chest — male flat pecs / female rounded */}
      {isFemale ? (
        <>
          <path d="M 46,44 C 43,52 41,68 45,78 C 49,84 58,84 60,80 C 56,70 55,53 60,44 Z"
            fill={c('pecho')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <path d="M 74,44 C 77,52 79,68 75,78 C 71,84 62,84 60,80 C 64,70 65,53 60,44 Z"
            fill={c('pecho')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        </>
      ) : (
        <>
          <path d="M 46,42 C 46,42 60,39 60,39 L 60,77 C 54,81 43,78 41,70 Z"
            fill={c('pecho')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <path d="M 74,42 C 74,42 60,39 60,39 L 60,77 C 66,81 77,78 79,70 Z"
            fill={c('pecho')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        </>
      )}

      {/* Biceps */}
      <path d="M 25,60 C 19,68 17,86 20,100 C 22,110 34,113 40,105 C 45,95 44,71 40,62 Z"
        fill={c('biceps')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 95,60 C 101,68 103,86 100,100 C 98,110 86,113 80,105 C 75,95 76,71 80,62 Z"
        fill={c('biceps')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Forearms */}
      <path d="M 20,102 C 14,112 13,130 16,143 C 18,152 29,154 35,146 C 40,136 39,115 35,104 Z"
        fill={c('antebrazos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 100,102 C 106,112 107,130 104,143 C 102,152 91,154 85,146 C 80,136 81,115 85,104 Z"
        fill={c('antebrazos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="23" cy="153" rx="6" ry="7" fill={skin} />
      <ellipse cx="97" cy="153" rx="6" ry="7" fill={skin} />

      {/* Abs */}
      <path d="M 43,77 C 41,86 40,130 43,144 C 46,152 74,152 77,144 C 80,130 79,86 77,77 C 71,74 49,74 43,77 Z"
        fill={c('abdominales')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="60" y1="79" x2="60" y2="142" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
      <line x1="46" y1="96" x2="74" y2="96" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />
      <line x1="45" y1="112" x2="75" y2="112" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />
      <line x1="45" y1="128" x2="75" y2="128" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" />

      {/* Hip connector — wider for female */}
      {isFemale ? (
        <path d="M 37,144 C 34,153 32,164 35,173 L 85,173 C 88,164 86,153 83,144 Z" fill={skinDark} />
      ) : (
        <path d="M 41,144 C 39,153 38,164 40,173 L 80,173 C 82,164 81,153 79,144 Z" fill={skinDark} />
      )}

      {/* Quads */}
      <path d="M 40,171 C 33,181 31,223 35,251 C 37,262 51,264 57,255 C 62,243 61,185 57,173 Z"
        fill={c('piernas')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 80,171 C 87,181 89,223 85,251 C 83,262 69,264 63,255 C 58,243 59,185 63,173 Z"
        fill={c('piernas')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Knee caps */}
      <ellipse cx="47" cy="253" rx="9" ry="6" fill={skinDark} opacity="0.7" />
      <ellipse cx="73" cy="253" rx="9" ry="6" fill={skinDark} opacity="0.7" />

      {/* Shins */}
      <path d="M 39,259 C 36,270 36,288 40,296 C 43,300 52,300 56,296 C 60,288 59,269 56,259 Z"
        fill={c('piernas')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 81,259 C 84,270 84,288 80,296 C 77,300 68,300 64,296 C 60,288 61,269 64,259 Z"
        fill={c('piernas')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Feet */}
      <ellipse cx="47" cy="298" rx="10" ry="4" fill={skinDark} />
      <ellipse cx="73" cy="298" rx="10" ry="4" fill={skinDark} />
    </svg>
  );
}

// ─── Back SVG ──────────────────────────────────────────────────────────────────

function BackBody({
  sets,
  somatotipo = 'mesomorfo',
  sexo = 'masculino',
}: {
  sets: MuscleSetMap;
  somatotipo?: Somatotipo;
  sexo?: 'masculino' | 'femenino';
}) {
  const c = (key: string) => setsToColor(getSets(sets, key));
  const skin = '#c9a987';
  const skinDark = '#b08d6e';
  const sx = SOMA_SCALE_X[somatotipo] ?? 1;
  const isFemale = sexo === 'femenino';

  return (
    <svg
      viewBox="0 0 120 300"
      className="w-full h-full"
      style={{ transform: `scaleX(${sx})`, transformOrigin: '50% 0%' }}
    >
      <defs>
        <radialGradient id="bmm-b-head" cx="60%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#e0b890" />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
      </defs>

      {/* Head */}
      <ellipse cx="60" cy="17" rx="14" ry="16" fill="url(#bmm-b-head)" />
      <path d="M 55,32 L 65,32 L 65,40 L 55,40 Z" fill={skinDark} />

      {/* Shoulders rear */}
      <path d="M 43,38 C 30,35 19,46 22,58 C 25,70 40,72 47,62 C 51,54 50,43 43,38 Z"
        fill={c('hombros')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 77,38 C 90,35 101,46 98,58 C 95,70 80,72 73,62 C 69,54 70,43 77,38 Z"
        fill={c('hombros')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Back — traps + lats */}
      <path d="M 46,38 C 46,38 60,35 60,35 C 60,35 74,38 74,38 L 76,66 C 70,63 60,62 50,63 Z"
        fill={c('espalda')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 41,64 C 36,75 35,115 40,140 L 80,140 C 85,115 84,75 79,64 C 72,61 48,61 41,64 Z"
        fill={c('espalda')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="60" y1="66" x2="60" y2="138" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />

      {/* Triceps */}
      <path d="M 25,60 C 19,68 17,86 20,100 C 22,110 34,113 40,105 C 45,95 44,71 40,62 Z"
        fill={c('triceps')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 95,60 C 101,68 103,86 100,100 C 98,110 86,113 80,105 C 75,95 76,71 80,62 Z"
        fill={c('triceps')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Forearms */}
      <path d="M 20,102 C 14,112 13,130 16,143 C 18,152 29,154 35,146 C 40,136 39,115 35,104 Z"
        fill={c('antebrazos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 100,102 C 106,112 107,130 104,143 C 102,152 91,154 85,146 C 80,136 81,115 85,104 Z"
        fill={c('antebrazos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="23" cy="153" rx="6" ry="7" fill={skin} />
      <ellipse cx="97" cy="153" rx="6" ry="7" fill={skin} />

      {/* Glutes — wider for female */}
      {isFemale ? (
        <>
          <path d="M 36,140 C 32,150 32,167 36,174 L 84,174 C 88,167 88,150 84,140 Z"
            fill={c('femorales_gluteos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <line x1="60" y1="141" x2="60" y2="173" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
          <path d="M 38,167 Q 60,174 82,167" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" fill="none" />
        </>
      ) : (
        <>
          <path d="M 39,140 C 36,150 36,167 40,174 L 80,174 C 84,167 84,150 81,140 Z"
            fill={c('femorales_gluteos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <line x1="60" y1="141" x2="60" y2="173" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
          <path d="M 42,167 Q 60,172 78,167" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" fill="none" />
        </>
      )}

      {/* Hamstrings */}
      <path d="M 40,172 C 33,182 31,224 35,252 C 37,263 51,265 57,256 C 62,244 61,186 57,174 Z"
        fill={c('femorales_gluteos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 80,172 C 87,182 89,224 85,252 C 83,263 69,265 63,256 C 58,244 59,186 63,174 Z"
        fill={c('femorales_gluteos')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Knees back */}
      <ellipse cx="47" cy="254" rx="9" ry="6" fill={skinDark} opacity="0.7" />
      <ellipse cx="73" cy="254" rx="9" ry="6" fill={skinDark} opacity="0.7" />

      {/* Calves */}
      <path d="M 37,259 C 33,270 34,286 38,295 C 41,299 51,300 56,296 C 60,287 60,268 56,258 Z"
        fill={c('piernas')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <path d="M 83,259 C 87,270 86,286 82,295 C 79,299 69,300 64,296 C 60,287 60,268 64,258 Z"
        fill={c('piernas')} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

      {/* Feet */}
      <ellipse cx="47" cy="298" rx="10" ry="4" fill={skinDark} />
      <ellipse cx="73" cy="298" rx="10" ry="4" fill={skinDark} />
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function BodyMuscleMap({ userId, somatotipo = 'mesomorfo', sexo = 'masculino' }: Props) {
  const [sets, setSets] = useState<MuscleSetMap>({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    getWeeklySetsByMuscle(userId).then((data) => {
      setSets(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Cargando datos de la semana...
      </div>
    );
  }

  const meta = SOMA_META[somatotipo];

  return (
    <div className="space-y-4">
      {/* Somatotipo badge */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-sm text-muted-foreground">{meta.description}</span>
        <span className="ml-auto text-xs text-muted-foreground capitalize">{sexo}</span>
      </div>

      {/* Body diagrams */}
      <div className="grid grid-cols-2 gap-2" onMouseLeave={() => setTooltip(null)}>
        <div className="space-y-1">
          <p className="text-xs text-center text-muted-foreground font-medium tracking-wide uppercase">Frontal</p>
          <div className="h-72 flex items-center justify-center overflow-hidden">
            <FrontBody sets={sets} somatotipo={somatotipo} sexo={sexo} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-center text-muted-foreground font-medium tracking-wide uppercase">Posterior</p>
          <div className="h-72 flex items-center justify-center overflow-hidden">
            <BackBody sets={sets} somatotipo={somatotipo} sexo={sexo} />
          </div>
        </div>
      </div>

      {/* Muscle stats grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {Object.entries(MUSCLE_LABELS).map(([key, label]) => {
          const n = getSets(sets, key);
          const color = setsToColor(n);
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 bg-muted/50 cursor-default"
              onMouseEnter={() => setTooltip(`${label}: ${n} series — ${setsToLabel(n)}`)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs truncate">{label}</span>
              <span className="text-xs font-bold ml-auto tabular-nums">{n}</span>
            </div>
          );
        })}
      </div>

      {tooltip && (
        <p className="text-xs text-center text-muted-foreground">{tooltip}</p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Basado en los últimos 7 días · {sexo === 'femenino' ? 'silueta femenina' : 'silueta masculina'}
      </p>
    </div>
  );
}
