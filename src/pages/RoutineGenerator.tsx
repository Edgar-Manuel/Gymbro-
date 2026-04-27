import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import { generarRutinaPersonalizada, obtenerResumenRutina, SPLITS_CONFIG } from '@/utils/routineGenerator';
import type { RutinaSemanal, ExerciseKnowledge } from '@/types';
import type { FullWRoutine } from '@/data/fullwRoutines';
import { Dumbbell, Target, Calendar, Clock, Sparkles, ArrowRight, Check } from 'lucide-react';
import ShareRoutineButton from '@/components/ShareRoutineButton';
import FullWRoutineView from '@/components/training/FullWRoutineView';
import { fullWToRutinaSemanal } from '@/utils/fullwConverter';

type ModoEntrenamiento = 'basico' | 'fullw';

export default function RoutineGenerator() {
  const navigate = useNavigate();
  const { currentUser, setActiveRoutine } = useAppStore();

  const [modo, setModo] = useState<ModoEntrenamiento>('basico');
  const [exercises, setExercises] = useState<ExerciseKnowledge[]>([]);
  const [generatedRoutine, setGeneratedRoutine] = useState<RutinaSemanal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastTrainedGroups, setLastTrainedGroups] = useState<string[]>([]);

  // Configuración personalizable
  const [diasDisponibles, setDiasDisponibles] = useState(currentUser?.diasDisponibles || 4);
  const [objetivo, setObjetivo] = useState(currentUser?.objetivo || 'hipertrofia');

  const loadExercises = async () => {
    const allExercises = await dbHelpers.getAllExercises();
    setExercises(allExercises);

    // Cargar el último entreno para evitar repetir grupos musculares
    try {
      const logs = await dbHelpers.getWorkoutsByUser(currentUser?.id || '', 3);
      const completed = logs.filter(l => l.completado);
      if (completed.length > 0) {
        const lastLog = completed[0];
        const groups = (lastLog.ejercicios ?? []).flatMap(e =>
          e.ejercicio?.grupoMuscular ? [e.ejercicio.grupoMuscular] : []
        );
        setLastTrainedGroups([...new Set(groups)]);
      }
    } catch { /* sin historial, no pasa nada */ }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleGenerate = async () => {
    if (!currentUser) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedUser = {
      ...currentUser,
      diasDisponibles,
      objetivo: objetivo as typeof currentUser.objetivo
    };

    const rutina = generarRutinaPersonalizada(
      updatedUser,
      exercises,
      lastTrainedGroups as import('@/types').GrupoMuscular[]
    );
    setGeneratedRoutine(rutina);
    setIsGenerating(false);
  };

  const handleSaveRoutine = async () => {
    if (!generatedRoutine || !currentUser) return;

    try {
      await dbHelpers.createRoutine(generatedRoutine);
      setActiveRoutine(generatedRoutine);
      navigate('/');
    } catch (error) {
      console.error('Error guardando rutina:', error);
    }
  };

  // Convierte la plantilla Full W a RutinaSemanal y la manda a la vista de previsualización
  const handleUseFullW = (fullwRutina: FullWRoutine) => {
    if (!currentUser) return;
    const rutinaSemanal = fullWToRutinaSemanal(fullwRutina, currentUser.id);
    setGeneratedRoutine(rutinaSemanal);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Perfil No Encontrado</CardTitle>
            <CardDescription>
              Necesitas configurar tu perfil primero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/profile')}>
              Ir a Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const splitPreview = SPLITS_CONFIG[diasDisponibles as keyof typeof SPLITS_CONFIG];
  const resumen = generatedRoutine ? obtenerResumenRutina(generatedRoutine) : null;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">

      {/* ── Selector de modo ── */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setModo('basico')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            modo === 'basico'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1.5" />
          Básico IA
        </button>
        <button
          onClick={() => setModo('fullw')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            modo === 'fullw'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Dumbbell className="w-4 h-4 inline mr-1.5" />
          Full W
        </button>
      </div>

      {/* ── Modo Full W: selector de plantilla ── */}
      {modo === 'fullw' && !generatedRoutine && <FullWRoutineView onUseRoutine={handleUseFullW} />}

      {/* ── Modo Básico IA: formulario ── */}
      {modo === 'basico' && !generatedRoutine && (
        // Formulario de generación
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Generador de Rutinas
            </h1>
            <p className="text-muted-foreground">
              Crea una rutina personalizada basada en ciencia y experiencia
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configuración de tu Rutina</CardTitle>
              <CardDescription>
                Ajusta estos parámetros para generar tu rutina ideal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Días disponibles */}
              <div className="space-y-2">
                <Label htmlFor="dias" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Días por semana
                </Label>
                <Select
                  value={diasDisponibles.toString()}
                  onValueChange={(value) => setDiasDisponibles(parseInt(value))}
                >
                  <SelectTrigger id="dias">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 días (Empuje/Tirón/Pierna)</SelectItem>
                    <SelectItem value="4">4 días (Upper/Lower)</SelectItem>
                    <SelectItem value="5">5 días (Bro Split)</SelectItem>
                    <SelectItem value="6">6 días (Push/Pull/Legs 2x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="objetivo" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objetivo principal
                </Label>
                <Select value={objetivo} onValueChange={(val) => setObjetivo(val as typeof objetivo)}>
                  <SelectTrigger id="objetivo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuerza">Fuerza (4-6 reps, descansos largos)</SelectItem>
                    <SelectItem value="hipertrofia">Hipertrofia (8-12 reps)</SelectItem>
                    <SelectItem value="resistencia">Resistencia (12-15 reps)</SelectItem>
                    <SelectItem value="perdida_grasa">Pérdida de Grasa (10-15 reps, descansos cortos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview del split */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Vista previa del split
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {splitPreview.map((dia, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border bg-accent/50 text-sm"
                    >
                      <span className="font-medium">Día {idx + 1}:</span> {dia.nombre}
                      {dia.grupos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dia.grupos.map(g => (
                            <Badge key={g} variant="outline" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Información del perfil */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Tu perfil:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Nivel: <span className="text-foreground font-medium">{currentUser.nivel}</span></div>
                  <div>Tiempo/sesión: <span className="text-foreground font-medium">{currentUser.tiempoSesion || 60} min</span></div>
                  <div className="col-span-2">
                    Equipamiento: <span className="text-foreground font-medium">{Array.isArray(currentUser.equipamiento) ? currentUser.equipamiento.join(', ') : 'No especificado'}</span>
                  </div>
                  {currentUser.lesiones && currentUser.lesiones.length > 0 && (
                    <div className="col-span-2 text-destructive">
                      Lesiones: {currentUser.lesiones.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                size="lg"
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Generando tu rutina...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Rutina con IA (10x)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Beneficios - Updated for 10x */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Motor Inteligente 10x
              </CardTitle>
              <CardDescription>
                Esta no es una plantilla genérica. La IA de GymBro analiza tu perfil completo:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Adaptación Biológica ({currentUser.somatotipo})</p>
                  <p className="text-sm text-muted-foreground">
                    Ajustamos el volumen (series/reps) y los tiempos de descanso específicamente para metabolismos {currentUser.somatotipo}s.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Escalado por Experiencia ({currentUser.nivel})</p>
                  <p className="text-sm text-muted-foreground">
                    Seleccionamos la cantidad exacta de ejercicios por grupo muscular para no sobreentrenar ni quedarte corto según tu nivel.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Anti-Estancamiento (Shuffle Dinámico)</p>
                  <p className="text-sm text-muted-foreground">
                    Incluso si generas la misma rutina dos veces, la IA mezclará ejercicios del mismo Tier para darte variedad sin perder eficacia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Previsualización (ambos modos) ── */}
      {generatedRoutine && (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Check className="w-8 h-8 text-primary" />
              Tu Rutina Está Lista
            </h1>
            <p className="text-muted-foreground">
              Revisa los detalles y guarda tu rutina personalizada
            </p>
          </div>

          {/* Resumen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{generatedRoutine.nombre}</CardTitle>
              <CardDescription>{generatedRoutine.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 border border-primary/20 text-primary-foreground p-3 rounded-lg mb-6 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold text-primary">Días recomendados para entrenar: </span>
                  <span className="text-foreground font-medium">
                    {diasDisponibles === 3 ? 'Lunes, Miércoles y Viernes' : 
                     diasDisponibles === 4 ? 'Lunes, Martes, Jueves y Viernes' :
                     diasDisponibles === 5 ? 'Lunes a Viernes (Descanso fines de semana)' :
                     'Lunes a Sábado (Descanso Domingo)'}
                  </span>
                </div>
              </div>
              {resumen && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <Calendar className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{resumen.totalDias}</p>
                    <p className="text-xs text-muted-foreground">días/semana</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <Dumbbell className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{resumen.totalEjercicios}</p>
                    <p className="text-xs text-muted-foreground">ejercicios</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{resumen.duracionPromedio}</p>
                    <p className="text-xs text-muted-foreground">min promedio</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <Sparkles className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{resumen.ejerciciosTierS}</p>
                    <p className="text-xs text-muted-foreground">tier S</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desglose por días */}
          <div className="space-y-4 mb-6">
            {generatedRoutine.dias.map((dia) => (
              <Card key={dia.orden}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Día {dia.orden}: {dia.nombre}</CardTitle>
                      <CardDescription>
                        {dia.ejercicios.length} ejercicios • ~{dia.duracionEstimada} min
                      </CardDescription>
                    </div>
                    <Badge variant={dia.ejercicios.length > 0 ? 'default' : 'secondary'}>
                      {dia.ejercicios.length > 0 ? 'Activo' : 'Descanso'}
                    </Badge>
                  </div>
                </CardHeader>
                {dia.ejercicios.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      {dia.ejercicios.map((ej, idx) => (
                        <div
                          key={ej.ejercicioId}
                          className="p-3 rounded-lg border bg-accent/30 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{idx + 1}. {ej.ejercicio?.nombre}</span>
                              <Badge variant={
                                ej.ejercicio?.tier === 'S' ? 'success' :
                                  ej.ejercicio?.tier === 'A' ? 'default' :
                                    'secondary'
                              } className="text-xs">
                                {ej.ejercicio?.tier}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {ej.seriesObjetivo} series × {Array.isArray(ej.repsObjetivo)
                                ? `${ej.repsObjetivo[0]}-${ej.repsObjetivo[1]}`
                                : ej.repsObjetivo} reps
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setGeneratedRoutine(null)}
              className="flex-1"
            >
              {modo === 'fullw' ? 'Elegir otra plantilla' : 'Generar Otra'}
            </Button>
            <Button
              onClick={handleSaveRoutine}
              size="lg"
              className="flex-1"
            >
              Guardar y Comenzar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {generatedRoutine && currentUser && (
              <ShareRoutineButton
                rutina={generatedRoutine}
                userName={currentUser.nombre}
                size="default"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
