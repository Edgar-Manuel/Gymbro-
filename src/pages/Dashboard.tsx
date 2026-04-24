import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { RutinaSemanal, WorkoutLog, ProgressPhoto } from '@/types';
import { Dumbbell, TrendingUp, Award, Flame, ChevronRight, Trophy, Calendar, Plus, Share2, Camera, RefreshCw } from 'lucide-react';
import StatsShareCard from '@/components/StatsShareCard';
import { ID } from 'appwrite';

// ─── Weekly Timeline ──────────────────────────────────────────────────────────

function WeeklyTimeline({ workouts, routine }: { workouts: WorkoutLog[]; routine: RutinaSemanal | null }) {
  const today = new Date();
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const dayMs = 24 * 60 * 60 * 1000;

  // Get Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const week = days.map((label, i) => {
    const date = new Date(monday.getTime() + i * dayMs);
    const dateStr = date.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;
    const trained = workouts.some(w => new Date(w.fecha).toDateString() === dateStr);

    // Map routine day to calendar position
    const routineDay = routine?.dias?.[i % (routine.dias.length || 1)];

    return { label, date, isToday, isPast, trained, routineDay };
  });

  return (
    <div className="flex gap-1.5 justify-between mt-4">
      {week.map(({ label, isToday, isPast, trained, routineDay }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
            {label}
          </span>
          <div
            className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
              isToday
                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                : trained
                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                : isPast
                ? 'bg-muted/50 text-muted-foreground/50'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {trained ? '✓' : isToday ? '→' : '·'}
          </div>
          {routineDay && (
            <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full text-center">
              {routineDay.nombre.split(' ')[0]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, statistics, setStatistics, setActiveRoutine: setStoreRoutine } = useAppStore();
  const [activeRoutine, setActiveRoutine] = useState<RutinaSemanal | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    try {
      const routine = await dbHelpers.getActiveRoutine(currentUser.id);
      setActiveRoutine(routine || null);
      setStoreRoutine(routine || null);

      const stats = await dbHelpers.getUserStatistics(currentUser.id);
      if (stats) setStatistics(stats);

      const workouts = await dbHelpers.getWorkoutsByUser(currentUser.id, 10);
      setRecentWorkouts(workouts);

      const ach = await dbHelpers.getUserAchievements(currentUser.id);
      setAchievements(ach.slice(0, 3));
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [currentUser]);

  const handleQuickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const photo: ProgressPhoto = {
        id: ID.unique(),
        userId: currentUser.id,
        fecha: new Date(),
        tipo: 'frontal',
        url: ev.target?.result as string,
        peso: currentUser.pesoActual || currentUser.peso,
      };
      await dbHelpers.addProgressPhoto(photo);
      setPhotoSaved(true);
      setTimeout(() => setPhotoSaved(false), 2500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getNextWorkoutDay = () => {
    if (!activeRoutine?.dias?.length) return null;
    if (!recentWorkouts.length) return activeRoutine.dias[0];

    const ultimo = recentWorkouts[0];
    const idx = activeRoutine.dias.findIndex(
      d => d.id === ultimo.diaRutinaId || d.nombre === ultimo.diaRutina
    );
    return activeRoutine.dias[idx !== -1 ? (idx + 1) % activeRoutine.dias.length : 0];
  };

  const nextDay = getNextWorkoutDay();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Dumbbell className="w-10 h-10 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-5">

      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-3xl font-bold">{currentUser?.nombre || 'Atleta'} 👋</h1>
      </div>

      {/* Stats rápidas */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-muted-foreground">Esta semana</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5"
          onClick={() => setShowShareCard(true)}
        >
          <Share2 className="w-3 h-3" />
          Compartir
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-orange-500/40 bg-gradient-to-br from-orange-50 dark:from-orange-950/20">
          <CardContent className="pt-4 pb-3 px-3 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-600">{statistics?.rachaActual ?? 0}</div>
            <p className="text-xs text-muted-foreground">Racha actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-3 text-center">
            <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{statistics?.totalEntrenamientos ?? 0}</div>
            <p className="text-xs text-muted-foreground">Entrenos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-3 text-center">
            <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {statistics?.volumenEsteMes
                ? `${(statistics.volumenEsteMes / 1000).toFixed(1)}t`
                : '0t'}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Entrenamiento de hoy */}
      <Card className="border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>
                {nextDay ? nextDay.nombre : 'Sin rutina activa'}
              </CardTitle>
              <CardDescription>
                {nextDay
                  ? `${nextDay.ejercicios.length} ejercicios · ~${nextDay.duracionEstimada} min`
                  : 'Genera una rutina para empezar'}
              </CardDescription>
            </div>
            <Dumbbell className="w-8 h-8 text-primary/60 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextDay ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {nextDay.grupos?.map((g) => (
                  <Badge key={g} variant="secondary" className="capitalize">{g}</Badge>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/workout-session')} size="lg" className="w-full">
                  Comenzar Entrenamiento
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/routine-generator')} 
                  className="w-full text-muted-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cambiar o generar nueva rutina
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={() => navigate('/routine-generator')} size="lg" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Generar Rutina Personalizada
            </Button>
          )}

          {/* Timeline semanal */}
          <WeeklyTimeline workouts={recentWorkouts} routine={activeRoutine} />
        </CardContent>
      </Card>

      {/* Logros recientes */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-base">Logros recientes</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="text-xs">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span className="text-2xl">{a.icono}</span>
                <div>
                  <p className="text-sm font-medium">{a.nombre ?? a.titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.descripcion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Entrenamientos recientes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Entrenamientos recientes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-2">
              {recentWorkouts.slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/workout/${w.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{w.diaRutina}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.fecha).toLocaleDateString('es-ES', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={w.completado ? 'success' : 'secondary'} className="text-xs">
                      {w.completado ? '✓' : '…'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{w.duracionReal}min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aún no hay entrenamientos registrados</p>
              <Button onClick={() => navigate('/workout-session')} variant="outline" size="sm">
                Empezar ahora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/exercises')}
        >
          <CardHeader className="py-4">
            <CardTitle className="text-sm">Ejercicios</CardTitle>
            <CardDescription className="text-xs">Biblioteca completa</CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/progress')}
        >
          <CardHeader className="py-4">
            <CardTitle className="text-sm">Progreso</CardTitle>
            <CardDescription className="text-xs">Estadísticas y evolución</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* FAB - Foto de progreso rápida */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleQuickPhoto}
      />
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center transition-transform active:scale-95 hover:opacity-90"
        title="Foto de progreso rápida"
      >
        <Camera className="w-6 h-6 text-primary-foreground" />
      </button>
      {photoSaved && (
        <div className="fixed bottom-36 right-4 z-50 bg-green-500 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-in slide-in-from-right">
          ✓ Foto guardada
        </div>
      )}

      {/* Tarjeta compartible */}
      {showShareCard && (() => {
        const now = new Date();
        const semanaNum = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000));
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const weekWorkouts = recentWorkouts.filter(w => new Date(w.fecha) >= monday);
        const weekVolume = weekWorkouts.reduce((t, w) =>
          t + w.ejercicios.reduce((s, e) =>
            s + e.series.reduce((r, sr) => r + sr.peso * sr.repeticiones, 0), 0), 0);
        const muscleCount: Record<string, number> = {};
        weekWorkouts.forEach(w =>
          w.ejercicios.forEach(e => {
            const m = e.ejercicio?.grupoMuscular;
            if (m) muscleCount[m] = (muscleCount[m] || 0) + 1;
          })
        );
        const musculosTop = Object.entries(muscleCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([m]) => m);

        return (
          <StatsShareCard
            nombre={currentUser?.nombre || 'Atleta'}
            semanaNum={semanaNum}
            entrenamientos={weekWorkouts.length}
            volumenKg={Math.round(weekVolume)}
            racha={statistics?.rachaActual ?? 0}
            musculosTop={musculosTop}
            onClose={() => setShowShareCard(false)}
          />
        );
      })()}
    </div>
  );
}
