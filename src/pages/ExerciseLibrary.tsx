import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dbHelpers } from '@/db';
import type { ExerciseKnowledge } from '@/types';
import { GrupoMuscular, type Tier } from '@/types';
import { Search, X } from 'lucide-react';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<ExerciseKnowledge[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseKnowledge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<GrupoMuscular | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseKnowledge | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedMuscleGroup, selectedTier]);

  const loadExercises = async () => {
    const allExercises = await dbHelpers.getAllExercises();
    // Ordenar por tier (S > A > B > C > F) y luego por nombre
    const sorted = allExercises.sort((a, b) => {
      const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'F': 4 };
      if (a.tier !== b.tier) {
        return tierOrder[a.tier] - tierOrder[b.tier];
      }
      return a.nombre.localeCompare(b.nombre);
    });
    setExercises(sorted);
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.grupoMuscular.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por grupo muscular
    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => ex.grupoMuscular === selectedMuscleGroup);
    }

    // Filtrar por tier
    if (selectedTier) {
      filtered = filtered.filter(ex => ex.tier === selectedTier);
    }

    setFilteredExercises(filtered);
  };

  const getTierColor = (tier: Tier): "success" | "default" | "secondary" | "warning" | "destructive" => {
    switch (tier) {
      case 'S': return 'success';
      case 'A': return 'default';
      case 'B': return 'secondary';
      case 'C': return 'warning';
      case 'F': return 'destructive';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroup(null);
    setSelectedTier(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Biblioteca de Ejercicios</h1>
        <p className="text-muted-foreground">
          Explora {exercises.length} ejercicios con técnica detallada y clasificación por efectividad
        </p>
      </div>

      {/* Búsqueda y filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros de grupo muscular */}
        <div>
          <p className="text-sm font-medium mb-2">Grupo Muscular</p>
          <div className="flex gap-2 flex-wrap">
            {Object.values(GrupoMuscular).map((grupo) => (
              <Badge
                key={grupo}
                variant={selectedMuscleGroup === grupo ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedMuscleGroup(
                  selectedMuscleGroup === grupo ? null : grupo
                )}
              >
                {grupo}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filtros de tier */}
        <div>
          <p className="text-sm font-medium mb-2">Clasificación (Tier)</p>
          <div className="flex gap-2">
            {(['S', 'A', 'B', 'C', 'F'] as Tier[]).map((tier) => (
              <Badge
                key={tier}
                variant={selectedTier === tier ? getTierColor(tier) : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
              >
                Tier {tier}
              </Badge>
            ))}
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(searchQuery || selectedMuscleGroup || selectedTier) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Grid de ejercicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg line-clamp-2">
                  {exercise.nombre}
                </CardTitle>
                <Badge variant={getTierColor(exercise.tier)}>
                  {exercise.tier}
                </Badge>
              </div>
              <CardDescription>
                {exercise.grupoMuscular} • {exercise.categoria}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {exercise.equipamiento.slice(0, 2).map((eq) => (
                    <Badge key={eq} variant="outline" className="text-xs">
                      {eq}
                    </Badge>
                  ))}
                  {exercise.equipamiento.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{exercise.equipamiento.length - 2}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {exercise.tecnica.consejosClave[0]}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron ejercicios con los filtros seleccionados
          </p>
        </div>
      )}

      {/* Modal de detalle de ejercicio */}
      {selectedExercise && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedExercise(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {selectedExercise.nombre}
                  </CardTitle>
                  <CardDescription>
                    {selectedExercise.grupoMuscular} • {selectedExercise.categoria} • Nivel {selectedExercise.dificultad}
                  </CardDescription>
                </div>
                <Badge variant={getTierColor(selectedExercise.tier)} className="text-lg px-3 py-1">
                  Tier {selectedExercise.tier}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Músculos trabajados */}
              <div>
                <h3 className="font-semibold mb-2">Músculos Trabajados</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.enfoqueMuscular.map((musculo) => (
                    <Badge key={musculo} variant="secondary">
                      {musculo}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Equipamiento */}
              <div>
                <h3 className="font-semibold mb-2">Equipamiento Necesario</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.equipamiento.map((eq) => (
                    <Badge key={eq} variant="outline">
                      {eq}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Técnica */}
              <div>
                <h3 className="font-semibold mb-2">Técnica de Ejecución</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Posición Inicial:
                    </p>
                    <p className="text-sm">{selectedExercise.tecnica.posicionInicial}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Ejecución:
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedExercise.tecnica.ejecucion.map((paso, idx) => (
                        <li key={idx} className="text-sm">{paso}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Consejos clave */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Consejos Clave</h3>
                <ul className="space-y-1">
                  {selectedExercise.tecnica.consejosClave.map((consejo, idx) => (
                    <li key={idx} className="text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{consejo}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Errores comunes */}
              {selectedExercise.tecnica.erroresComunes.length > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-destructive">Errores Comunes a Evitar</h3>
                  <ul className="space-y-1">
                    {selectedExercise.tecnica.erroresComunes.map((error, idx) => (
                      <li key={idx} className="text-sm flex items-start">
                        <span className="mr-2">✗</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variantes */}
              {selectedExercise.variantes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Variantes</h3>
                  <div className="space-y-2">
                    {selectedExercise.variantes.map((variante, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm">{variante.nombre}</p>
                          <Badge variant={getTierColor(variante.tier)} className="text-xs">
                            {variante.tier}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{variante.cuando}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setSelectedExercise(null)}
                className="w-full"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
