import { useAppStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Scale, TrendingUp, Target, Moon, Sun, Info, CheckCircle, Cloud, CloudOff, Mail, Flame, Camera, Bell, BellOff, X, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import BodyMuscleMap from '@/components/BodyMuscleMap';
import InjuryPanel from '@/components/InjuryPanel';
import { useState, useEffect, useRef } from 'react';
import { dbHelpers } from '@/db';
import type { Somatotipo, ProgressPhoto } from '@/types';
import { notificationManager } from '@/utils/notificationManager';
import { ID } from 'appwrite';
import { PERFILES_SOMATOTIPO, calcularPlanNutricional } from '@/utils/nutritionCalculator';

export default function Profile() {
  const { currentUser, setCurrentUser, isDarkMode, toggleDarkMode } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Progress photos
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<ProgressPhoto['tipo']>('frontal');

  // Notifications
  const [notifSettings, setNotifSettings] = useState(notificationManager.getSettings());
  const [notifPermission, setNotifPermission] = useState(notificationManager.getPermission());
  const [formData, setFormData] = useState({
    nombre: currentUser?.nombre || '',
    peso: currentUser?.peso || 0,
    altura: currentUser?.altura || 0,
    edad: currentUser?.edad || 0,
    sexo: currentUser?.sexo || 'masculino' as 'masculino' | 'femenino',
    somatotipo: currentUser?.somatotipo || 'mesomorfo' as Somatotipo,
    nivel: currentUser?.nivel || 'principiante' as 'principiante' | 'intermedio' | 'avanzado',
  });

  // Sincronizar formData cuando cambia currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        nombre: currentUser.nombre,
        peso: currentUser.peso || currentUser.pesoActual,
        altura: currentUser.altura,
        edad: currentUser.edad,
        sexo: currentUser.sexo || 'masculino',
        somatotipo: currentUser.somatotipo || 'mesomorfo',
        nivel: currentUser.nivel || 'principiante',
      });
    }
  }, [currentUser, refreshKey]);

  useEffect(() => {
    if (currentUser) {
      dbHelpers.getProgressPhotos(currentUser.id).then(p =>
        setPhotos(p.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()))
      );
    }
  }, [currentUser]);

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSavePhoto = async () => {
    if (!currentUser || !pendingPhotoUrl) return;
    const photo: ProgressPhoto = {
      id: ID.unique(),
      userId: currentUser.id,
      fecha: new Date(),
      tipo: photoType,
      url: pendingPhotoUrl,
      peso: currentUser.pesoActual || currentUser.peso,
    };
    await dbHelpers.addProgressPhoto(photo);
    setPhotos(prev => [photo, ...prev]);
    setPendingPhotoUrl(null);
  };

  const handleDeletePhoto = async (id: string) => {
    await dbHelpers.deleteProgressPhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  const handleToggleNotifications = async () => {
    if (notifSettings.enabled) {
      notificationManager.disable();
      setNotifSettings(notificationManager.getSettings());
    } else {
      const ok = await notificationManager.enable(notifSettings.reminderHour, notifSettings.reminderMinute);
      if (ok) {
        setNotifSettings(notificationManager.getSettings());
        setNotifPermission(notificationManager.getPermission());
      } else {
        alert('Permiso de notificaciones denegado. Actívalo desde la configuración del navegador.');
      }
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const updatedUser = {
        ...currentUser,
        nombre: formData.nombre,
        peso: Number(formData.peso),
        pesoActual: Number(formData.peso),
        altura: Number(formData.altura),
        edad: Number(formData.edad),
        sexo: formData.sexo,
        somatotipo: formData.somatotipo,
        nivel: formData.nivel,
      };

      console.log('Guardando usuario:', updatedUser);

      // Actualizar en la base de datos
      await dbHelpers.updateUser(updatedUser);

      // Actualizar en el store
      setCurrentUser(updatedUser);

      // Forzar actualización del estado local
      setFormData({
        nombre: updatedUser.nombre,
        peso: updatedUser.peso,
        altura: updatedUser.altura,
        edad: updatedUser.edad,
        sexo: updatedUser.sexo || 'masculino',
        somatotipo: updatedUser.somatotipo || 'mesomorfo',
        nivel: updatedUser.nivel || 'principiante',
      });

      setIsEditing(false);
      setRefreshKey(prev => prev + 1); // Forzar re-render de métricas
      console.log('Usuario guardado correctamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al guardar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        nombre: currentUser.nombre,
        peso: currentUser.peso || currentUser.pesoActual,
        altura: currentUser.altura,
        edad: currentUser.edad,
        sexo: currentUser.sexo || 'masculino',
        somatotipo: currentUser.somatotipo || 'mesomorfo',
        nivel: currentUser.nivel || 'principiante',
      });
    }
    setIsEditing(false);
  };

  // Calcular métricas
  const calcularIMC = (): number => {
    if (!formData.peso || !formData.altura) return 0;
    const alturaMetros = formData.altura / 100;
    return formData.peso / (alturaMetros * alturaMetros);
  };

  const calcularTDEE = () => {
    if (!formData.peso || !formData.altura || !formData.edad) return 0;
    // Fórmula Mifflin-St Jeor
    let bmr: number;
    if (formData.sexo === 'masculino') {
      bmr = 10 * formData.peso + 6.25 * formData.altura - 5 * formData.edad + 5;
    } else {
      bmr = 10 * formData.peso + 6.25 * formData.altura - 5 * formData.edad - 161;
    }
    // Factor de actividad moderada (4 días de entreno)
    const tdee = bmr * 1.55;
    return Math.round(tdee);
  };

  // Calcular plan nutricional usando el nuevo sistema
  const planNutricional = calcularPlanNutricional(
    formData.peso,
    formData.altura,
    formData.edad,
    formData.sexo,
    formData.somatotipo,
    currentUser?.objetivo || 'hipertrofia',
    currentUser?.objetivoCalorico || 'superavit',
    1.55
  );

  const perfilSomatotipo = PERFILES_SOMATOTIPO[formData.somatotipo];

  const clasificarIMC = (imc: number) => {
    if (imc < 18.5) return { texto: 'Bajo peso', color: 'text-yellow-600' };
    if (imc < 25) return { texto: 'Peso normal', color: 'text-green-600' };
    if (imc < 30) return { texto: 'Sobrepeso', color: 'text-orange-600' };
    return { texto: 'Obesidad', color: 'text-red-600' };
  };

  const imc = calcularIMC();
  const clasificacion = clasificarIMC(imc);
  const tdee = calcularTDEE();

  // Obtener información de autenticación de Appwrite
  const { user: authUser, isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground text-lg">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Estado de la Cuenta */}
      <Card className={`mb-6 ${isAuthenticated ? 'border-green-500/50' : 'border-orange-500/50'}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Cloud className="w-5 h-5 text-green-500" />
            ) : (
              <CloudOff className="w-5 h-5 text-orange-500" />
            )}
            <CardTitle>Estado de la Cuenta</CardTitle>
          </div>
          <CardDescription>
            {isAuthenticated
              ? 'Cuenta sincronizada con la nube - tus datos están respaldados'
              : 'Modo local - los datos solo se guardan en este dispositivo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated && authUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">{authUser.email}</p>
                  <p className="text-sm text-muted-foreground">Email de la cuenta</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{authUser.name}</p>
                  <p className="text-sm text-muted-foreground">Nombre de usuario</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-center">
              <CloudOff className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="font-medium">Sin cuenta registrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Regístrate para sincronizar tus datos en la nube
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Personal */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <CardTitle>Información Personal</CardTitle>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                value={formData.altura}
                onChange={(e) => setFormData({ ...formData, altura: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edad">Edad (años)</Label>
              <Input
                id="edad"
                type="number"
                value={formData.edad}
                onChange={(e) => setFormData({ ...formData, edad: parseInt(e.target.value) })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <Select
                value={formData.sexo}
                onValueChange={(value) => setFormData({ ...formData, sexo: value as 'masculino' | 'femenino' })}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="somatotipo">Tipo de Cuerpo</Label>
              <Select
                value={formData.somatotipo}
                onValueChange={(value) => setFormData({ ...formData, somatotipo: value as Somatotipo })}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tipo de cuerpo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ectomorfo">Ectomorfo - Delgado, rápido</SelectItem>
                  <SelectItem value="mesomorfo">Mesomorfo - Atlético</SelectItem>
                  <SelectItem value="endomorfo">Endomorfo - Robusto, lento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nivel">Nivel de Experiencia</Label>
              <Select
                value={formData.nivel}
                onValueChange={(value) => setFormData({ ...formData, nivel: value as 'principiante' | 'intermedio' | 'avanzado' })}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principiante">Principiante (0-1 años)</SelectItem>
                  <SelectItem value="intermedio">Intermedio (1-3 años)</SelectItem>
                  <SelectItem value="avanzado">Avanzado (+3 años)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesiones */}
      {currentUser && <InjuryPanel userId={currentUser.id} />}

      {/* Métricas calculadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg">Índice de Masa Corporal</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{imc.toFixed(1)}</div>
            <p className={`text-sm font-semibold ${clasificacion.color}`}>
              {clasificacion.texto}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg">TDEE Estimado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{tdee}</div>
            <p className="text-sm text-muted-foreground">kcal / día (mantenimiento)</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Muscular + Somatotipo unificado */}
      {currentUser && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <CardTitle>Mapa Muscular Semanal</CardTitle>
            </div>
            <CardDescription>
              Volumen de entrenamiento por grupo muscular · silueta según tu tipo de cuerpo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BodyMuscleMap
              userId={currentUser.id}
              somatotipo={formData.somatotipo}
              sexo={formData.sexo}
            />
          </CardContent>
        </Card>
      )}

      {/* Fotos de progreso */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-500" />
              <CardTitle>Fotos de Progreso</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => photoInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
              Nueva foto
            </Button>
          </div>
          <CardDescription>Documenta tu transformación física con el tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelected}
          />

          {/* Pending photo picker */}
          {pendingPhotoUrl && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl p-5 w-full max-w-sm space-y-4">
                <h3 className="font-bold text-center">Guardar foto de progreso</h3>
                <img src={pendingPhotoUrl} alt="preview" className="w-full rounded-xl object-cover max-h-64" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tipo de foto:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['frontal', 'lateral', 'trasera', 'frente', 'espalda', 'lado_derecho'] as ProgressPhoto['tipo'][]).map(t => (
                      <button
                        key={t}
                        onClick={() => setPhotoType(t)}
                        className={`py-1.5 rounded-lg text-sm border transition-all ${photoType === t ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border'}`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setPendingPhotoUrl(null)}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleSavePhoto}>Guardar</Button>
                </div>
              </div>
            </div>
          )}

          {/* Lightbox */}
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
              <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedPhoto(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
                <img src={selectedPhoto.url} alt={selectedPhoto.tipo} className="w-full rounded-xl object-contain max-h-[70vh]" />
                <div className="mt-3 flex items-center justify-between text-white/70 text-sm">
                  <span>{selectedPhoto.tipo.replace('_', ' ')} · {new Date(selectedPhoto.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {selectedPhoto.peso && <span>{selectedPhoto.peso} kg</span>}
                  <button onClick={() => handleDeletePhoto(selectedPhoto.id)} className="text-red-400 hover:text-red-300 ml-3">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  <Button variant="ghost" size="icon" className="text-white/60" onClick={() => {
                    const idx = photos.findIndex(p => p.id === selectedPhoto.id);
                    if (idx > 0) setSelectedPhoto(photos[idx - 1]);
                  }}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white/60" onClick={() => {
                    const idx = photos.findIndex(p => p.id === selectedPhoto.id);
                    if (idx < photos.length - 1) setSelectedPhoto(photos[idx + 1]);
                  }}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.url} alt={photo.tipo} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <span className="text-white text-[10px] font-medium capitalize">
                      {new Date(photo.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Sin fotos aún</p>
              <p className="text-xs text-muted-foreground/60">Toma tu primera foto de progreso</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <CardTitle>Objetivos Nutricionales</CardTitle>
          </div>
          <CardDescription>
            Basado en tu perfil de {formData.somatotipo} - {planNutricional.descripcionPlan}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Calorías Objetivo</span>
            <span className="font-bold text-lg">{planNutricional.calorias} kcal</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Proteína diaria</span>
            <span className="font-bold text-lg">{planNutricional.proteina}g</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Carbohidratos diarios</span>
            <span className="font-bold text-lg">{planNutricional.carbohidratos}g</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Grasas diarias</span>
            <span className="font-bold text-lg">{planNutricional.grasa}g</span>
          </div>
        </CardContent>
      </Card>

      {/* Tu Tipo de Cuerpo — características del somatotipo */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <CardTitle>Tu Tipo de Cuerpo: {formData.somatotipo.charAt(0).toUpperCase() + formData.somatotipo.slice(1)}</CardTitle>
          </div>
          <CardDescription>{perfilSomatotipo.descripcion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Características:</p>
            <ul className="space-y-1">
              {perfilSomatotipo.caracteristicas.slice(0, 3).map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2 text-green-600">Fortalezas:</p>
            <ul className="space-y-1">
              {perfilSomatotipo.fortalezas.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">+</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2 text-orange-600">Desafíos:</p>
            <ul className="space-y-1">
              {perfilSomatotipo.desafios.slice(0, 3).map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">!</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="font-semibold mb-2">Recomendaciones Clave:</p>
            <ul className="space-y-1">
              {perfilSomatotipo.recomendacionesGenerales.slice(0, 4).map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias de la App */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-semibold">Modo Oscuro</p>
                <p className="text-sm text-muted-foreground">
                  {isDarkMode ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleDarkMode}>
              {isDarkMode ? 'Desactivar' : 'Activar'}
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifSettings.enabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <p className="font-semibold">Recordatorios de Entrenamiento</p>
                  <p className="text-sm text-muted-foreground">
                    {!notificationManager.isSupported()
                      ? 'No disponible en este navegador'
                      : notifPermission === 'denied'
                      ? 'Permiso denegado — actívalo en el navegador'
                      : notifSettings.enabled
                      ? `Activo · ${String(notifSettings.reminderHour).padStart(2, '0')}:${String(notifSettings.reminderMinute).padStart(2, '0')}`
                      : 'Recibe un aviso si no has entrenado'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!notificationManager.isSupported() || notifPermission === 'denied'}
                onClick={handleToggleNotifications}
              >
                {notifSettings.enabled ? 'Desactivar' : 'Activar'}
              </Button>
            </div>

            {notifSettings.enabled && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24 shrink-0">Hora del aviso:</label>
                <input
                  type="time"
                  className="border rounded-lg px-3 py-1.5 text-sm bg-background"
                  value={`${String(notifSettings.reminderHour).padStart(2, '0')}:${String(notifSettings.reminderMinute).padStart(2, '0')}`}
                  onChange={e => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    notificationManager.updateTime(h, m);
                    setNotifSettings(notificationManager.getSettings());
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guía de Instalación PWA */}
      <Card className="mt-6 border-primary/20 bg-primary/5 dark:bg-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <CardTitle>Instalar App en tu Móvil</CardTitle>
          </div>
          <CardDescription>Instala GymBro en tu pantalla de inicio para una experiencia a pantalla completa y sin conexión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {/* iOS Instructions */}
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2">
              🍎 iPhone (iOS)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground ml-1">
              <li>Abre esta página exclusivamente desde el navegador <strong>Safari</strong>.</li>
              <li>Toca el botón de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba, abajo al centro).</li>
              <li>Desliza hacia abajo en el menú y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</li>
              <li>Toca <strong>"Añadir"</strong> en la esquina superior derecha.</li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2">
              🤖 Android
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground ml-1">
              <li>Abre esta página desde <strong>Google Chrome</strong>.</li>
              <li>Toca el botón de menú (los <strong>tres puntitos</strong> arriba a la derecha).</li>
              <li>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> o "Instalar aplicación".</li>
              <li>Toca <strong>"Añadir"</strong> o "Instalar" y confirma.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
