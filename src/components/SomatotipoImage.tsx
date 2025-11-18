import type { Somatotipo } from '@/types';

interface SomatotipoImageProps {
  somatotipo: Somatotipo;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Siluetas SVG 3D de los tres somatotipos
const EctomorfoSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 200" className={className}>
    <defs>
      {/* Gradientes para efecto 3D */}
      <linearGradient id="ecto-skin" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#6BA3E8" stopOpacity="1" />
        <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="ecto-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3A7BC8" />
        <stop offset="100%" stopColor="#2D5F9E" />
      </linearGradient>
      <radialGradient id="ecto-highlight" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#8EC5FF" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#6BA3E8" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Sombra base */}
    <ellipse cx="50" cy="185" rx="18" ry="4" fill="#000" opacity="0.15" />

    {/* Cabeza */}
    <ellipse cx="50" cy="18" rx="11" ry="13" fill="url(#ecto-skin)" />
    <ellipse cx="47" cy="15" rx="6" ry="7" fill="url(#ecto-highlight)" />

    {/* Cuello */}
    <rect x="46" y="29" width="8" height="10" fill="url(#ecto-shadow)" />

    {/* Trapecio */}
    <path d="M 46 35 Q 40 38 32 42 L 34 45 Q 42 42 46 40 Z" fill="url(#ecto-shadow)" />
    <path d="M 54 35 Q 60 38 68 42 L 66 45 Q 58 42 54 40 Z" fill="url(#ecto-shadow)" />

    {/* Hombros estrechos */}
    <ellipse cx="30" cy="44" rx="6" ry="5" fill="url(#ecto-skin)" />
    <ellipse cx="70" cy="44" rx="6" ry="5" fill="url(#ecto-skin)" />

    {/* Pectorales pequeños */}
    <path d="M 36 46 Q 43 48 50 47 Q 50 54 43 56 Q 36 54 36 46 Z" fill="url(#ecto-skin)" />
    <path d="M 64 46 Q 57 48 50 47 Q 50 54 57 56 Q 64 54 64 46 Z" fill="url(#ecto-skin)" />
    <ellipse cx="43" cy="51" rx="4" ry="3" fill="url(#ecto-highlight)" opacity="0.5" />
    <ellipse cx="57" cy="51" rx="4" ry="3" fill="url(#ecto-highlight)" opacity="0.5" />

    {/* Torso delgado */}
    <path d="M 36 56 Q 34 75 36 98 L 42 98 Q 40 75 40 56 Z" fill="url(#ecto-shadow)" />
    <path d="M 64 56 Q 66 75 64 98 L 58 98 Q 60 75 60 56 Z" fill="url(#ecto-shadow)" />

    {/* Abdomen estrecho */}
    <path d="M 40 56 L 42 98 Q 50 100 58 98 L 60 56 Q 50 58 40 56 Z" fill="url(#ecto-skin)" />
    {/* Línea alba */}
    <line x1="50" y1="58" x2="50" y2="95" stroke="#4A90D9" strokeWidth="0.8" opacity="0.4" />
    {/* Abdominales sutiles */}
    <ellipse cx="46" cy="68" rx="4" ry="3" fill="url(#ecto-highlight)" opacity="0.3" />
    <ellipse cx="54" cy="68" rx="4" ry="3" fill="url(#ecto-highlight)" opacity="0.3" />
    <ellipse cx="46" cy="80" rx="4" ry="3" fill="url(#ecto-highlight)" opacity="0.3" />
    <ellipse cx="54" cy="80" rx="4" ry="3" fill="url(#ecto-highlight)" opacity="0.3" />

    {/* Caderas estrechas */}
    <path d="M 38 98 Q 36 106 38 114 L 50 116 L 62 114 Q 64 106 62 98 Z" fill="url(#ecto-skin)" />

    {/* Piernas largas y delgadas */}
    <path d="M 38 114 Q 35 140 34 168 Q 36 172 40 174 L 46 174 Q 48 170 47 166 Q 45 140 44 116 Z" fill="url(#ecto-skin)" />
    <path d="M 62 114 Q 65 140 66 168 Q 64 172 60 174 L 54 174 Q 52 170 53 166 Q 55 140 56 116 Z" fill="url(#ecto-skin)" />
    {/* Rodillas */}
    <ellipse cx="41" cy="145" rx="4" ry="5" fill="url(#ecto-highlight)" opacity="0.3" />
    <ellipse cx="59" cy="145" rx="4" ry="5" fill="url(#ecto-highlight)" opacity="0.3" />
    {/* Cuádriceps */}
    <path d="M 40 120 Q 38 130 40 140" stroke="url(#ecto-shadow)" strokeWidth="1" fill="none" opacity="0.4" />
    <path d="M 60 120 Q 62 130 60 140" stroke="url(#ecto-shadow)" strokeWidth="1" fill="none" opacity="0.4" />

    {/* Pies */}
    <ellipse cx="40" cy="177" rx="7" ry="3" fill="url(#ecto-shadow)" />
    <ellipse cx="60" cy="177" rx="7" ry="3" fill="url(#ecto-shadow)" />

    {/* Brazos delgados */}
    <path d="M 26 44 Q 20 58 16 78 Q 18 84 22 86 L 28 84 Q 26 65 28 48 Z" fill="url(#ecto-skin)" />
    <path d="M 74 44 Q 80 58 84 78 Q 82 84 78 86 L 72 84 Q 74 65 72 48 Z" fill="url(#ecto-skin)" />
    {/* Bíceps sutiles */}
    <ellipse cx="23" cy="60" rx="3" ry="5" fill="url(#ecto-highlight)" opacity="0.3" />
    <ellipse cx="77" cy="60" rx="3" ry="5" fill="url(#ecto-highlight)" opacity="0.3" />

    {/* Antebrazos */}
    <path d="M 18 78 Q 16 85 18 92" stroke="url(#ecto-shadow)" strokeWidth="0.5" fill="none" opacity="0.5" />
    <path d="M 82 78 Q 84 85 82 92" stroke="url(#ecto-shadow)" strokeWidth="0.5" fill="none" opacity="0.5" />

    {/* Manos */}
    <ellipse cx="20" cy="89" rx="4" ry="5" fill="url(#ecto-skin)" />
    <ellipse cx="80" cy="89" rx="4" ry="5" fill="url(#ecto-skin)" />
  </svg>
);

const MesomorfoSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 200" className={className}>
    <defs>
      {/* Gradientes para efecto 3D */}
      <linearGradient id="meso-skin" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E8B57" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#3CB371" stopOpacity="1" />
        <stop offset="100%" stopColor="#2E8B57" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="meso-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#228B22" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <radialGradient id="meso-highlight" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#90EE90" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#3CB371" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="meso-muscle" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50" />
        <stop offset="100%" stopColor="#2E7D32" />
      </linearGradient>
    </defs>

    {/* Sombra base */}
    <ellipse cx="50" cy="185" rx="22" ry="5" fill="#000" opacity="0.15" />

    {/* Cabeza */}
    <ellipse cx="50" cy="18" rx="12" ry="14" fill="url(#meso-skin)" />
    <ellipse cx="46" cy="14" rx="6" ry="7" fill="url(#meso-highlight)" />

    {/* Cuello musculoso */}
    <rect x="43" y="30" width="14" height="9" fill="url(#meso-shadow)" rx="2" />

    {/* Trapecio desarrollado */}
    <path d="M 43 34 Q 35 38 24 44 L 28 48 Q 38 44 43 40 Z" fill="url(#meso-muscle)" />
    <path d="M 57 34 Q 65 38 76 44 L 72 48 Q 62 44 57 40 Z" fill="url(#meso-muscle)" />

    {/* Hombros anchos y redondeados (deltoides) */}
    <ellipse cx="24" cy="46" rx="9" ry="8" fill="url(#meso-skin)" />
    <ellipse cx="76" cy="46" rx="9" ry="8" fill="url(#meso-skin)" />
    <ellipse cx="22" cy="44" rx="4" ry="4" fill="url(#meso-highlight)" opacity="0.5" />
    <ellipse cx="78" cy="44" rx="4" ry="4" fill="url(#meso-highlight)" opacity="0.5" />

    {/* Pectorales definidos */}
    <path d="M 28 50 Q 38 52 50 50 Q 50 62 38 64 Q 28 60 28 50 Z" fill="url(#meso-skin)" />
    <path d="M 72 50 Q 62 52 50 50 Q 50 62 62 64 Q 72 60 72 50 Z" fill="url(#meso-skin)" />
    {/* Highlight pectorales */}
    <ellipse cx="38" cy="55" rx="6" ry="4" fill="url(#meso-highlight)" opacity="0.5" />
    <ellipse cx="62" cy="55" rx="6" ry="4" fill="url(#meso-highlight)" opacity="0.5" />
    {/* Línea de separación pectoral */}
    <path d="M 50 50 Q 48 56 50 62" stroke="#2E7D32" strokeWidth="0.8" fill="none" opacity="0.5" />

    {/* Torso en V - serratos */}
    <path d="M 28 60 Q 30 75 34 98 L 40 98 Q 36 75 34 60 Z" fill="url(#meso-shadow)" />
    <path d="M 72 60 Q 70 75 66 98 L 60 98 Q 64 75 66 60 Z" fill="url(#meso-shadow)" />
    {/* Líneas serratos */}
    <path d="M 32 65 L 38 68" stroke="#1B5E20" strokeWidth="0.6" opacity="0.4" />
    <path d="M 33 70 L 38 73" stroke="#1B5E20" strokeWidth="0.6" opacity="0.4" />
    <path d="M 68 65 L 62 68" stroke="#1B5E20" strokeWidth="0.6" opacity="0.4" />
    <path d="M 67 70 L 62 73" stroke="#1B5E20" strokeWidth="0.6" opacity="0.4" />

    {/* Abdomen definido (six-pack) */}
    <path d="M 38 62 L 40 98 Q 50 100 60 98 L 62 62 Q 50 65 38 62 Z" fill="url(#meso-skin)" />
    {/* Línea alba central */}
    <line x1="50" y1="64" x2="50" y2="95" stroke="#228B22" strokeWidth="1" opacity="0.5" />
    {/* Abdominales */}
    <ellipse cx="44" cy="70" rx="5" ry="4" fill="url(#meso-highlight)" opacity="0.4" />
    <ellipse cx="56" cy="70" rx="5" ry="4" fill="url(#meso-highlight)" opacity="0.4" />
    <ellipse cx="44" cy="80" rx="5" ry="4" fill="url(#meso-highlight)" opacity="0.4" />
    <ellipse cx="56" cy="80" rx="5" ry="4" fill="url(#meso-highlight)" opacity="0.4" />
    <ellipse cx="44" cy="90" rx="5" ry="3" fill="url(#meso-highlight)" opacity="0.3" />
    <ellipse cx="56" cy="90" rx="5" ry="3" fill="url(#meso-highlight)" opacity="0.3" />
    {/* Líneas horizontales abs */}
    <path d="M 42 75 Q 50 76 58 75" stroke="#228B22" strokeWidth="0.6" fill="none" opacity="0.4" />
    <path d="M 43 85 Q 50 86 57 85" stroke="#228B22" strokeWidth="0.6" fill="none" opacity="0.4" />

    {/* Caderas/oblicuos */}
    <path d="M 36 98 Q 34 108 38 118 L 50 120 L 62 118 Q 66 108 64 98 Z" fill="url(#meso-skin)" />
    {/* V-cut */}
    <path d="M 42 92 Q 44 100 46 108" stroke="#228B22" strokeWidth="0.6" fill="none" opacity="0.4" />
    <path d="M 58 92 Q 56 100 54 108" stroke="#228B22" strokeWidth="0.6" fill="none" opacity="0.4" />

    {/* Piernas musculosas */}
    <path d="M 38 118 Q 32 138 32 162 Q 34 170 40 174 L 48 174 Q 50 168 49 162 Q 46 138 44 120 Z" fill="url(#meso-skin)" />
    <path d="M 62 118 Q 68 138 68 162 Q 66 170 60 174 L 52 174 Q 50 168 51 162 Q 54 138 56 120 Z" fill="url(#meso-skin)" />
    {/* Cuádriceps */}
    <ellipse cx="40" cy="135" rx="6" ry="10" fill="url(#meso-highlight)" opacity="0.3" />
    <ellipse cx="60" cy="135" rx="6" ry="10" fill="url(#meso-highlight)" opacity="0.3" />
    {/* Separación cuádriceps */}
    <path d="M 42 125 Q 40 135 42 148" stroke="#228B22" strokeWidth="0.6" fill="none" opacity="0.4" />
    <path d="M 58 125 Q 60 135 58 148" stroke="#228B22" strokeWidth="0.6" fill="none" opacity="0.4" />
    {/* Rodillas */}
    <ellipse cx="41" cy="152" rx="4" ry="4" fill="url(#meso-highlight)" opacity="0.3" />
    <ellipse cx="59" cy="152" rx="4" ry="4" fill="url(#meso-highlight)" opacity="0.3" />
    {/* Gemelos */}
    <ellipse cx="38" cy="162" rx="4" ry="6" fill="url(#meso-highlight)" opacity="0.25" />
    <ellipse cx="62" cy="162" rx="4" ry="6" fill="url(#meso-highlight)" opacity="0.25" />

    {/* Pies */}
    <ellipse cx="44" cy="177" rx="8" ry="3" fill="url(#meso-shadow)" />
    <ellipse cx="56" cy="177" rx="8" ry="3" fill="url(#meso-shadow)" />

    {/* Brazos musculosos */}
    <path d="M 18 46 Q 12 60 10 78 Q 14 86 20 88 L 28 86 Q 24 68 26 52 Z" fill="url(#meso-skin)" />
    <path d="M 82 46 Q 88 60 90 78 Q 86 86 80 88 L 72 86 Q 76 68 74 52 Z" fill="url(#meso-skin)" />
    {/* Bíceps desarrollados */}
    <ellipse cx="20" cy="62" rx="6" ry="9" fill="url(#meso-highlight)" opacity="0.4" />
    <ellipse cx="80" cy="62" rx="6" ry="9" fill="url(#meso-highlight)" opacity="0.4" />
    {/* Tríceps */}
    <ellipse cx="24" cy="65" rx="4" ry="7" fill="url(#meso-shadow)" opacity="0.3" />
    <ellipse cx="76" cy="65" rx="4" ry="7" fill="url(#meso-shadow)" opacity="0.3" />
    {/* Separación bíceps/tríceps */}
    <path d="M 22 55 Q 20 65 22 75" stroke="#1B5E20" strokeWidth="0.5" fill="none" opacity="0.4" />
    <path d="M 78 55 Q 80 65 78 75" stroke="#1B5E20" strokeWidth="0.5" fill="none" opacity="0.4" />

    {/* Antebrazos */}
    <path d="M 14 80 Q 12 88 16 94" stroke="url(#meso-shadow)" strokeWidth="1" fill="none" opacity="0.4" />
    <path d="M 86 80 Q 88 88 84 94" stroke="url(#meso-shadow)" strokeWidth="1" fill="none" opacity="0.4" />

    {/* Manos */}
    <ellipse cx="18" cy="91" rx="5" ry="6" fill="url(#meso-skin)" />
    <ellipse cx="82" cy="91" rx="5" ry="6" fill="url(#meso-skin)" />
  </svg>
);

const EndomorfoSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 200" className={className}>
    <defs>
      {/* Gradientes para efecto 3D */}
      <linearGradient id="endo-skin" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D2691E" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#E8923A" stopOpacity="1" />
        <stop offset="100%" stopColor="#D2691E" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="endo-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8651A" />
        <stop offset="100%" stopColor="#8B4513" />
      </linearGradient>
      <radialGradient id="endo-highlight" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#FFB366" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#E8923A" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="endo-belly" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F5A952" />
        <stop offset="100%" stopColor="#D2691E" />
      </radialGradient>
    </defs>

    {/* Sombra base más grande */}
    <ellipse cx="50" cy="185" rx="26" ry="6" fill="#000" opacity="0.15" />

    {/* Cabeza */}
    <ellipse cx="50" cy="18" rx="13" ry="14" fill="url(#endo-skin)" />
    <ellipse cx="46" cy="14" rx="6" ry="7" fill="url(#endo-highlight)" />

    {/* Cuello grueso */}
    <rect x="40" y="30" width="20" height="9" fill="url(#endo-shadow)" rx="3" />

    {/* Trapecio ancho */}
    <path d="M 40 34 Q 32 38 20 46 L 24 50 Q 34 44 40 40 Z" fill="url(#endo-shadow)" />
    <path d="M 60 34 Q 68 38 80 46 L 76 50 Q 66 44 60 40 Z" fill="url(#endo-shadow)" />

    {/* Hombros anchos pero redondeados */}
    <ellipse cx="20" cy="48" rx="10" ry="9" fill="url(#endo-skin)" />
    <ellipse cx="80" cy="48" rx="10" ry="9" fill="url(#endo-skin)" />
    <ellipse cx="18" cy="46" rx="4" ry="4" fill="url(#endo-highlight)" opacity="0.4" />
    <ellipse cx="82" cy="46" rx="4" ry="4" fill="url(#endo-highlight)" opacity="0.4" />

    {/* Pecho amplio */}
    <path d="M 24 52 Q 37 55 50 52 Q 50 66 37 68 Q 24 64 24 52 Z" fill="url(#endo-skin)" />
    <path d="M 76 52 Q 63 55 50 52 Q 50 66 63 68 Q 76 64 76 52 Z" fill="url(#endo-skin)" />
    <ellipse cx="37" cy="58" rx="7" ry="5" fill="url(#endo-highlight)" opacity="0.4" />
    <ellipse cx="63" cy="58" rx="7" ry="5" fill="url(#endo-highlight)" opacity="0.4" />

    {/* Laterales anchos */}
    <path d="M 24 64 Q 22 82 24 105 L 32 105 Q 28 82 28 64 Z" fill="url(#endo-shadow)" />
    <path d="M 76 64 Q 78 82 76 105 L 68 105 Q 72 82 72 64 Z" fill="url(#endo-shadow)" />

    {/* Abdomen redondeado prominente */}
    <path d="M 28 64 Q 24 85 30 105 Q 50 112 70 105 Q 76 85 72 64 Q 50 70 28 64 Z" fill="url(#endo-belly)" />
    {/* Highlight central del abdomen */}
    <ellipse cx="50" cy="82" rx="12" ry="14" fill="url(#endo-highlight)" opacity="0.3" />
    {/* Línea alba */}
    <line x1="50" y1="66" x2="50" y2="100" stroke="#B8651A" strokeWidth="0.8" opacity="0.3" />
    {/* Curva inferior del abdomen */}
    <path d="M 38 95 Q 50 102 62 95" stroke="#8B4513" strokeWidth="0.6" fill="none" opacity="0.3" />

    {/* Caderas anchas */}
    <path d="M 28 105 Q 24 116 30 128 L 50 132 L 70 128 Q 76 116 72 105 Z" fill="url(#endo-skin)" />

    {/* Piernas gruesas */}
    <path d="M 30 128 Q 24 150 26 165 Q 30 172 36 175 L 48 175 Q 52 170 50 162 Q 46 145 44 130 Z" fill="url(#endo-skin)" />
    <path d="M 70 128 Q 76 150 74 165 Q 70 172 64 175 L 52 175 Q 48 170 50 162 Q 54 145 56 130 Z" fill="url(#endo-skin)" />
    {/* Muslos grandes */}
    <ellipse cx="38" cy="142" rx="8" ry="12" fill="url(#endo-highlight)" opacity="0.3" />
    <ellipse cx="62" cy="142" rx="8" ry="12" fill="url(#endo-highlight)" opacity="0.3" />
    {/* Rodillas */}
    <ellipse cx="40" cy="156" rx="5" ry="5" fill="url(#endo-highlight)" opacity="0.25" />
    <ellipse cx="60" cy="156" rx="5" ry="5" fill="url(#endo-highlight)" opacity="0.25" />
    {/* Separación interior muslo */}
    <path d="M 44 130 Q 46 145 44 158" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M 56 130 Q 54 145 56 158" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.3" />

    {/* Pies */}
    <ellipse cx="42" cy="178" rx="9" ry="4" fill="url(#endo-shadow)" />
    <ellipse cx="58" cy="178" rx="9" ry="4" fill="url(#endo-shadow)" />

    {/* Brazos gruesos */}
    <path d="M 14 48 Q 8 64 8 82 Q 12 90 18 92 L 28 90 Q 24 72 24 54 Z" fill="url(#endo-skin)" />
    <path d="M 86 48 Q 92 64 92 82 Q 88 90 82 92 L 72 90 Q 76 72 76 54 Z" fill="url(#endo-skin)" />
    {/* Bíceps */}
    <ellipse cx="18" cy="66" rx="7" ry="10" fill="url(#endo-highlight)" opacity="0.3" />
    <ellipse cx="82" cy="66" rx="7" ry="10" fill="url(#endo-highlight)" opacity="0.3" />
    {/* Antebrazos */}
    <path d="M 12 84 Q 10 90 14 96" stroke="url(#endo-shadow)" strokeWidth="0.8" fill="none" opacity="0.4" />
    <path d="M 88 84 Q 90 90 86 96" stroke="url(#endo-shadow)" strokeWidth="0.8" fill="none" opacity="0.4" />

    {/* Manos */}
    <ellipse cx="16" cy="94" rx="6" ry="6" fill="url(#endo-skin)" />
    <ellipse cx="84" cy="94" rx="6" ry="6" fill="url(#endo-skin)" />
  </svg>
);

const sizeClasses = {
  sm: 'w-16 h-32',
  md: 'w-24 h-48',
  lg: 'w-32 h-64',
};

const somatotipoLabels = {
  ectomorfo: 'Ectomorfo',
  mesomorfo: 'Mesomorfo',
  endomorfo: 'Endomorfo',
};

const labelColors = {
  ectomorfo: 'text-blue-500 dark:text-blue-400',
  mesomorfo: 'text-green-500 dark:text-green-400',
  endomorfo: 'text-orange-500 dark:text-orange-400',
};

export default function SomatotipoImage({
  somatotipo,
  className = '',
  size = 'md',
  showLabel = false
}: SomatotipoImageProps) {
  const sizeClass = sizeClasses[size];
  const combinedClass = `${sizeClass} ${className}`;

  return (
    <div className="flex flex-col items-center">
      {somatotipo === 'ectomorfo' && <EctomorfoSVG className={combinedClass} />}
      {somatotipo === 'mesomorfo' && <MesomorfoSVG className={combinedClass} />}
      {somatotipo === 'endomorfo' && <EndomorfoSVG className={combinedClass} />}
      {showLabel && (
        <span className={`mt-2 text-sm font-medium ${labelColors[somatotipo]}`}>
          {somatotipoLabels[somatotipo]}
        </span>
      )}
    </div>
  );
}

// Componente para mostrar los 3 somatotipos comparados
export function SomatotipoComparison({
  selected,
  onSelect,
  size = 'sm'
}: {
  selected?: Somatotipo;
  onSelect?: (tipo: Somatotipo) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const tipos: Somatotipo[] = ['ectomorfo', 'mesomorfo', 'endomorfo'];

  return (
    <div className="flex justify-center gap-4">
      {tipos.map((tipo) => (
        <button
          key={tipo}
          onClick={() => onSelect?.(tipo)}
          className={`p-2 rounded-lg transition-all ${
            selected === tipo
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'hover:bg-muted'
          } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!onSelect}
        >
          <SomatotipoImage
            somatotipo={tipo}
            size={size}
            showLabel
          />
        </button>
      ))}
    </div>
  );
}
