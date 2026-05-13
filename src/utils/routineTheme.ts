// Color themes for routine identification
// Each theme provides gradient classes for the workout session header + accent colors

export interface RoutineTheme {
  /** Gradient applied to the workout session sticky header */
  headerGradient: string;
  /** Solid color for buttons/badges using this theme */
  accentBg: string;
  /** Text color that works on the header gradient */
  accentText: string;
  /** Light tint for inner cards (bg-*) */
  cardTint: string;
  /** Border color for highlighted elements */
  borderColor: string;
  /** Emoji or short label shown in the header */
  badge: string;
}

const THEMES: Record<string, RoutineTheme> = {
  cbum: {
    headerGradient: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-600',
    cardTint: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-400',
    badge: '🏆 CBum',
  },
  'fullw-3': {
    headerGradient: 'bg-gradient-to-r from-sky-500 to-blue-600',
    accentBg: 'bg-sky-500',
    accentText: 'text-sky-600',
    cardTint: 'bg-sky-50 dark:bg-sky-950/20',
    borderColor: 'border-sky-400',
    badge: '💪 Full W 3d',
  },
  'fullw-4': {
    headerGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600',
    accentBg: 'bg-indigo-500',
    accentText: 'text-indigo-600',
    cardTint: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-400',
    badge: '🔷 Full W 4d',
  },
  'fullw-5': {
    headerGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-600',
    cardTint: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-400',
    badge: '🟢 Full W 5d',
  },
  default: {
    headerGradient: 'bg-gradient-to-r from-blue-500 to-blue-700',
    accentBg: 'bg-blue-500',
    accentText: 'text-blue-600',
    cardTint: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-400',
    badge: '🏋️ Entreno',
  },
};

export function getRoutineTheme(routineId?: string): RoutineTheme {
  if (!routineId) return THEMES.default;
  if (routineId.startsWith('cbum')) return THEMES.cbum;
  if (routineId.startsWith('fullw-3')) return THEMES['fullw-3'];
  if (routineId.startsWith('fullw-4')) return THEMES['fullw-4'];
  if (routineId.startsWith('fullw-5')) return THEMES['fullw-5'];
  // User-generated routines: derive a stable color from the id hash
  const colors: RoutineTheme[] = [
    {
      headerGradient: 'bg-gradient-to-r from-rose-500 to-pink-600',
      accentBg: 'bg-rose-500', accentText: 'text-rose-600',
      cardTint: 'bg-rose-50 dark:bg-rose-950/20', borderColor: 'border-rose-400', badge: '🔴 Rutina',
    },
    {
      headerGradient: 'bg-gradient-to-r from-purple-500 to-fuchsia-600',
      accentBg: 'bg-purple-500', accentText: 'text-purple-600',
      cardTint: 'bg-purple-50 dark:bg-purple-950/20', borderColor: 'border-purple-400', badge: '💜 Rutina',
    },
    {
      headerGradient: 'bg-gradient-to-r from-orange-500 to-red-500',
      accentBg: 'bg-orange-500', accentText: 'text-orange-600',
      cardTint: 'bg-orange-50 dark:bg-orange-950/20', borderColor: 'border-orange-400', badge: '🟠 Rutina',
    },
  ];
  const hash = routineId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
