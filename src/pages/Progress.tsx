import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import type { WorkoutLog, ExerciseKnowledge } from '@/types';
import BodyMeasurements from '@/components/BodyMeasurements';
import PhotoProgress from '@/components/PhotoProgress';
import WorkoutCalendar from '@/components/WorkoutCalendar';
import BodyWeightChart from '@/components/BodyWeightChart';
import WorkoutAnalytics from '@/components/WorkoutAnalytics';

export default function Progress() {
  const { currentUser } = useAppStore();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<ExerciseKnowledge[]>([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const loadData = async () => {
    if (!currentUser) return;

    const [allWorkouts, allExercises] = await Promise.all([
      dbHelpers.getWorkoutsByUser(currentUser.id),
      dbHelpers.getAllExercises()
    ]);

    setWorkouts(allWorkouts);
    setExercises(allExercises);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Análisis de Progreso</h1>
        <p className="text-muted-foreground">
          Visualiza tu evolución y recibe recomendaciones personalizadas
        </p>
      </div>

      <Tabs defaultValue="entrenamientos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="entrenamientos">Entrenamientos</TabsTrigger>
          <TabsTrigger value="corporal">Peso & Medidas</TabsTrigger>
          <TabsTrigger value="fotos">Fotos</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
        </TabsList>

        {/* Tab: Entrenamientos — delegated to WorkoutAnalytics */}
        <TabsContent value="entrenamientos">
          <WorkoutAnalytics workouts={workouts} exercises={exercises} />
        </TabsContent>

        {/* Tab: Peso & Medidas */}
        <TabsContent value="corporal" className="space-y-6">
          <BodyWeightChart refreshTrigger={statsRefreshKey} />
          <BodyMeasurements onUpdate={() => setStatsRefreshKey(prev => prev + 1)} />
        </TabsContent>

        {/* Tab: Fotos */}
        <TabsContent value="fotos">
          <PhotoProgress />
        </TabsContent>

        {/* Tab: Calendario */}
        <TabsContent value="calendario">
          <WorkoutCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
