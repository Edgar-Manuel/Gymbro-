import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  ExerciseKnowledge,
  RutinaSemanal,
  WorkoutLog,
  UserStatistics
} from '@/types';

interface AppState {
  // User
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;

  // Current workout session
  activeWorkout: WorkoutLog | null;
  startWorkout: (workout: WorkoutLog) => void;
  updateActiveWorkout: (workout: WorkoutLog) => void;
  finishWorkout: () => void;

  // Active routine
  activeRoutine: RutinaSemanal | null;
  setActiveRoutine: (routine: RutinaSemanal | null) => void;

  // Statistics
  statistics: UserStatistics | null;
  setStatistics: (stats: UserStatistics | null) => void;

  // UI state
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  beastMode: boolean;
  toggleBeastMode: () => void;

  // Selected exercise (for detail view)
  selectedExercise: ExerciseKnowledge | null;
  setSelectedExercise: (exercise: ExerciseKnowledge | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Current workout session
      activeWorkout: null,
      startWorkout: (workout) => set({ activeWorkout: workout }),
      updateActiveWorkout: (workout) => set({ activeWorkout: workout }),
      finishWorkout: () => set({ activeWorkout: null }),

      // Active routine
      activeRoutine: null,
      setActiveRoutine: (routine) => set({ activeRoutine: routine }),

      // Statistics
      statistics: null,
      setStatistics: (stats) => set({ statistics: stats }),

      // UI state
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      beastMode: false,
      toggleBeastMode: () => set((state) => ({ beastMode: !state.beastMode })),

      // Selected exercise
      selectedExercise: null,
      setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),
    }),
    {
      name: 'gymbro-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isDarkMode: state.isDarkMode,
        sidebarOpen: state.sidebarOpen,
        beastMode: state.beastMode,
      }),
    }
  )
);
