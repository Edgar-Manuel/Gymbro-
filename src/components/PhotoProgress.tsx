import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { dbHelpers } from '@/db';
import { useAppStore } from '@/store';
import type { ProgressPhoto } from '@/types';
import { Camera, Image as ImageIcon, Trash2, Calendar, Weight } from 'lucide-react';

const PHOTO_TYPES = [
  { value: 'frente', label: 'Frente' },
  { value: 'espalda', label: 'Espalda' },
  { value: 'lado_derecho', label: 'Lado Derecho' },
  { value: 'lado_izquierdo', label: 'Lado Izquierdo' }
] as const;

export default function PhotoProgress() {
  const { currentUser } = useAppStore();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedType, setSelectedType] = useState<string>('frente');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
  }, [currentUser]);

  const loadPhotos = async () => {
    if (!currentUser) return;

    try {
      const allPhotos = await dbHelpers.getProgressPhotos(currentUser.id);
      setPhotos(allPhotos);
    } catch (error) {
      console.error('Error cargando fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB');
      return;
    }

    try {
      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Obtener peso actual del usuario
        const latestMeasurement = await dbHelpers.getLatestBodyMeasurement(currentUser.id);

        const newPhoto: ProgressPhoto = {
          id: `photo-${Date.now()}`,
          userId: currentUser.id,
          fecha: new Date(),
          tipo: selectedType as any,
          url: base64String,
          peso: latestMeasurement?.peso
        };

        await dbHelpers.addProgressPhoto(newPhoto);
        await loadPhotos();

        // Limpiar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error guardando foto:', error);
      alert('Error al guardar la foto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta foto?')) return;

    try {
      await dbHelpers.deleteProgressPhoto(id);
      await loadPhotos();
    } catch (error) {
      console.error('Error eliminando foto:', error);
      alert('Error al eliminar la foto');
    }
  };

  const getPhotosByType = (type: string) => {
    return photos.filter(p => p.tipo === type).sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando fotos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotos de Progreso
              </CardTitle>
              <CardDescription>Documenta tu transformación visual</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Upload section */}
          <div className="mb-6 p-4 border rounded-lg bg-accent/20">
            <div className="space-y-4">
              <div>
                <Label htmlFor="photoType">Tipo de Foto</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="photoType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Tomar/Subir Foto
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Máximo 5MB • JPG, PNG, WEBP
              </p>
            </div>
          </div>

          {/* Photo Grid by Type */}
          <div className="space-y-6">
            {PHOTO_TYPES.map(type => {
              const typePhotos = getPhotosByType(type.value);

              if (typePhotos.length === 0) return null;

              return (
                <div key={type.value}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {type.label}
                    <Badge variant="outline">{typePhotos.length}</Badge>
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {typePhotos.slice(0, 6).map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-border bg-muted">
                          <img
                            src={photo.url}
                            alt={`${type.label} - ${new Date(photo.fecha).toLocaleDateString()}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Overlay con info */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(photo.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-white text-xs">
                              <Calendar className="w-3 h-3" />
                              {new Date(photo.fecha).toLocaleDateString('es-ES')}
                            </div>
                            {photo.peso && (
                              <div className="flex items-center gap-1 text-white text-xs">
                                <Weight className="w-3 h-3" />
                                {photo.peso}kg
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {typePhotos.length > 6 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      +{typePhotos.length - 6} fotos más
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {photos.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">Aún no has subido ninguna foto</p>
              <p className="text-sm text-muted-foreground mb-6">
                Documenta tu progreso con fotos desde diferentes ángulos
              </p>
              <div className="bg-primary/10 p-4 rounded-lg max-w-md mx-auto">
                <h5 className="font-medium mb-2">Consejos para mejores fotos:</h5>
                <ul className="text-sm text-left space-y-1">
                  <li>• Usa la misma iluminación cada vez</li>
                  <li>• Toma fotos a la misma hora del día</li>
                  <li>• Usa ropa ajustada o similar</li>
                  <li>• Mantén la misma pose y distancia</li>
                  <li>• Toma fotos cada 2-4 semanas</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparación (si hay al menos 2 fotos del mismo tipo) */}
      {PHOTO_TYPES.some(type => getPhotosByType(type.value).length >= 2) && (
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Progreso</CardTitle>
            <CardDescription>Antes y después</CardDescription>
          </CardHeader>
          <CardContent>
            {PHOTO_TYPES.map(type => {
              const typePhotos = getPhotosByType(type.value);
              if (typePhotos.length < 2) return null;

              const latest = typePhotos[0];
              const oldest = typePhotos[typePhotos.length - 1];

              return (
                <div key={type.value} className="mb-6 last:mb-0">
                  <h4 className="font-semibold mb-3">{type.label}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Antes */}
                    <div>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-border bg-muted mb-2">
                        <img
                          src={oldest.url}
                          alt="Antes"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">Antes</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(oldest.fecha).toLocaleDateString('es-ES')}
                        </p>
                        {oldest.peso && (
                          <p className="text-sm font-semibold">{oldest.peso}kg</p>
                        )}
                      </div>
                    </div>

                    {/* Después */}
                    <div>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary bg-muted mb-2">
                        <img
                          src={latest.url}
                          alt="Después"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <Badge>Ahora</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(latest.fecha).toLocaleDateString('es-ES')}
                        </p>
                        {latest.peso && (
                          <p className="text-sm font-semibold">{latest.peso}kg</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {oldest.peso && latest.peso && (
                    <div className="mt-3 p-3 bg-accent/30 rounded-lg text-center">
                      <p className="text-sm">
                        Cambio de peso:{' '}
                        <span className={`font-bold ${latest.peso - oldest.peso > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                          {latest.peso - oldest.peso > 0 ? '+' : ''}
                          {(latest.peso - oldest.peso).toFixed(1)}kg
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
