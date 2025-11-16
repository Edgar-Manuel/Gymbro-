import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import type { ExerciseKnowledge } from '@/types';
import { Search, Plus, X } from 'lucide-react';

interface QuickAddExerciseProps {
  onAdd: (ejercicio: ExerciseKnowledge) => void;
  onClose: () => void;
}

export default function QuickAddExercise({ onAdd, onClose }: QuickAddExerciseProps) {
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<ExerciseKnowledge[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseKnowledge[]>([]);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = exercises.filter(ex =>
        ex.nombre.toLowerCase().includes(search.toLowerCase()) ||
        ex.grupoMuscular.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredExercises(filtered.slice(0, 10));
    } else {
      setFilteredExercises(exercises.slice(0, 10));
    }
  }, [search, exercises]);

  const loadExercises = async () => {
    try {
      const allExercises = await dbHelpers.getAllExercises();
      setExercises(allExercises);
      setFilteredExercises(allExercises.slice(0, 10));
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleAdd = (ejercicio: ExerciseKnowledge) => {
    onAdd(ejercicio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Agregar Ejercicio Rápido</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ejercicio..."
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {filteredExercises.map((ejercicio) => (
              <Card
                key={ejercicio.id}
                className="hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleAdd(ejercicio)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ejercicio.nombre}</h3>
                        <Badge variant={ejercicio.tier === 'S' ? 'default' : 'secondary'} className="text-xs">
                          {ejercicio.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ejercicio.grupoMuscular} • {ejercicio.categoria}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron ejercicios</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
