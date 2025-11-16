import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import type { ProgressPhoto } from '@/types';
import { Camera, Calendar, Trash2 } from 'lucide-react';

interface ProgressPhotosProps {
  userId: string;
}

export default function ProgressPhotos({ userId }: ProgressPhotosProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    peso: '',
    notas: '',
    tipo: 'frente' as const
  });

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const userPhotos = await dbHelpers.getUserPhotos(userId);
      setPhotos(userPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.peso) {
      alert('Ingresa tu peso actual');
      return;
    }

    try {
      const photo: ProgressPhoto = {
        id: `photo-${Date.now()}`,
        userId,
        fecha: new Date(),
        imageData: `https://via.placeholder.com/400x600/2563EB/FFFFFF?text=${newPhoto.tipo}`, // Placeholder
        peso: parseFloat(newPhoto.peso),
        notas: newPhoto.notas || undefined,
        tipo: newPhoto.tipo
      };

      await dbHelpers.addProgressPhoto(photo);
      await loadPhotos();
      setShowAddForm(false);
      setNewPhoto({ peso: '', notas: '', tipo: 'frente' });
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Error al agregar foto');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;

    try {
      await dbHelpers.deleteProgressPhoto(photoId);
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Fotos de Progreso</CardTitle>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Camera className="w-4 h-4 mr-2" />
              {showAddForm ? 'Cancelar' : 'Agregar Foto'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Add Photo Form */}
          {showAddForm && (
            <Card className="mb-4 bg-accent/50">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newPhoto.peso}
                      onChange={(e) => setNewPhoto({ ...newPhoto, peso: e.target.value })}
                      placeholder="70.5"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <select
                      value={newPhoto.tipo}
                      onChange={(e) => setNewPhoto({ ...newPhoto, tipo: e.target.value as typeof newPhoto.tipo })}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="frente">Frente</option>
                      <option value="lado">Lado</option>
                      <option value="espalda">Espalda</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notas (opcional)</Label>
                  <Input
                    type="text"
                    value={newPhoto.notas}
                    onChange={(e) => setNewPhoto({ ...newPhoto, notas: e.target.value })}
                    placeholder="Ej: Después de 2 meses de entrenamiento"
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleAddPhoto} className="w-full" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Guardar Foto
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Photos Grid */}
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-accent relative">
                    <img
                      src={photo.imageData}
                      alt={photo.tipo}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {photo.tipo}
                      </Badge>
                      <span className="text-sm font-semibold">{photo.peso}kg</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(photo.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    {photo.notas && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {photo.notas}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No hay fotos de progreso</p>
              <p className="text-xs text-muted-foreground">
                Documenta tu transformación tomando fotos regularmente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
