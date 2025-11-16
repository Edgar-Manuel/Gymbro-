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
import { Dumbbell, Target, Calendar, Clock, Sparkles, ArrowRight, Check } from 'lucide-react';

export default function RoutineGenerator() {
  const navigate = useNavigate();
  const { currentUser, setActiveRoutine } = useAppStore();

  const [exercises, setExercises] = useState<ExerciseKnowledge[]>([]);
  const [generatedRoutine, setGeneratedRoutine] = useState<RutinaSemanal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Configuración personalizable
  const [diasDisponibles, setDiasDisponibles] = useState(currentUser?.diasDisponibles || 4);
  const [objetivo, setObjetivo] = useState(currentUser?.objetivo || 'hipertrofia');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const allExercises = await dbHelpers.getAllExercises();
    setExercises(allExercises);
  };

  const handleGenerate = async () => {
    if (!currentUser) return;

    setIsGenerating(true);

    // Simular un pequeño delay para dar feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));

    // Actualizar perfil del usuario con las nuevas preferencias
    const updatedUser = {
      ...currentUser,
      diasDisponibles,
      objetivo: objetivo as typeof currentUser.objetivo
    };

    const rutina = generarRutinaPersonalizada(updatedUser, exercises);
    setGeneratedRoutine(rutina);
    setIsGenerating(false);
  };

  const handleSaveRoutine = async () => {
    if (!generatedRoutine || !currentUser) return;

    try {
      await dbHelpers.createRoutine(generatedRoutine);
      setActiveRoutine(generatedRoutine);

      // Navegar al dashboard
      navigate('/');
    } catch (error) {
      console.error('Error guardando rutina:', error);
    }
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
      {!generatedRoutine ? (
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
                  <div>Tiempo/sesión: <span className="text-foreground font-medium">{currentUser.tiempoSesion} min</span></div>
                  <div className="col-span-2">
                    Equipamiento: <span className="text-foreground font-medium">{currentUser.equipamiento.join(', ')}</span>
                  </div>
                  {currentUser.lesiones.length > 0 && (
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
                    Generar Rutina Personalizada
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Beneficios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Selección inteligente de ejercicios</p>
                  <p className="text-sm text-muted-foreground">
                    Prioriza ejercicios tier S y A basados en evidencia científica
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Personalización total</p>
                  <p className="text-sm text-muted-foreground">
                    Adapta ejercicios según tu equipamiento y evita lesiones
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Balance muscular</p>
                  <p className="text-sm text-muted-foreground">
                    Incluye tirones verticales y horizontales para desarrollo completo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Volumen optimizado</p>
                  <p className="text-sm text-muted-foreground">
                    Series y reps ajustadas según tu objetivo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Vista previa de rutina generada
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
              Generar Otra
            </Button>
            <Button
              onClick={handleSaveRoutine}
              size="lg"
              className="flex-1"
            >
              Guardar y Comenzar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
