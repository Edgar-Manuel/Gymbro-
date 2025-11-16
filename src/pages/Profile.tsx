import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Scale, Ruler, Calendar, TrendingUp, Target, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dbHelpers } from '@/db';

export default function Profile() {
  const { currentUser, setCurrentUser, isDarkMode, toggleDarkMode } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Forzar re-render
  const [formData, setFormData] = useState({
    nombre: currentUser?.nombre || '',
    peso: currentUser?.peso || 0,
    altura: currentUser?.altura || 0,
    edad: currentUser?.edad || 0,
  });

  // Sincronizar formData cuando cambia currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        nombre: currentUser.nombre,
        peso: currentUser.peso,
        altura: currentUser.altura,
        edad: currentUser.edad,
      });
    }
  }, [currentUser, refreshKey]);

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const updatedUser = {
        ...currentUser,
        nombre: formData.nombre,
        peso: Number(formData.peso),
        altura: Number(formData.altura),
        edad: Number(formData.edad),
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
        peso: currentUser.peso,
        altura: currentUser.altura,
        edad: currentUser.edad,
      });
    }
    setIsEditing(false);
  };

  // Calcular métricas
  const calcularIMC = () => {
    if (!formData.peso || !formData.altura) return 0;
    const alturaMetros = formData.altura / 100;
    return (formData.peso / (alturaMetros * alturaMetros)).toFixed(1);
  };

  const calcularTDEE = () => {
    if (!formData.peso || !formData.altura || !formData.edad) return 0;
    // Fórmula Mifflin-St Jeor para hombres (asumiendo hombre por el perfil)
    const bmr = 10 * formData.peso + 6.25 * formData.altura - 5 * formData.edad + 5;
    // Factor de actividad moderada (4 días de entreno)
    const tdee = bmr * 1.55;
    return Math.round(tdee);
  };

  const clasificarIMC = (imc: number) => {
    if (imc < 18.5) return { texto: 'Bajo peso', color: 'text-yellow-600' };
    if (imc < 25) return { texto: 'Peso normal', color: 'text-green-600' };
    if (imc < 30) return { texto: 'Sobrepeso', color: 'text-orange-600' };
    return { texto: 'Obesidad', color: 'text-red-600' };
  };

  const imc = parseFloat(calcularIMC());
  const clasificacion = clasificarIMC(imc);
  const tdee = calcularTDEE();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground text-lg">
          Gestiona tu información personal y preferencias
        </p>
      </div>

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
        </CardContent>
      </Card>

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
            <div className="text-3xl font-bold mb-1">{imc}</div>
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

      {/* Objetivos */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <CardTitle>Objetivos de Hipertrofia</CardTitle>
          </div>
          <CardDescription>Basado en tu perfil de ectomorfo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Calorías Objetivo (días entreno)</span>
            <span className="font-bold text-lg">{tdee + 450} kcal</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Calorías Objetivo (días descanso)</span>
            <span className="font-bold text-lg">{tdee + 250} kcal</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Proteína diaria</span>
            <span className="font-bold text-lg">{Math.round(formData.peso * 2)}g</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>Ganancia de peso objetivo</span>
            <span className="font-bold text-lg">0.25-0.5 kg/semana</span>
          </div>
        </CardContent>
      </Card>

      {/* Información de Perfil */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tu Perfil de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div>
              <p className="font-semibold">Tipo Corporal: Ectomorfo</p>
              <p className="text-muted-foreground">
                Metabolismo rápido, dificultad para ganar peso. Necesitas superávit calórico constante.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <div>
              <p className="font-semibold">Frecuencia: 4 días/semana</p>
              <p className="text-muted-foreground">
                Entrenamiento de fuerza con progresión RIR. Descanso activo 3 días.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <div>
              <p className="font-semibold">Restricciones: Intolerancia a lactosa</p>
              <p className="text-muted-foreground">
                Plan nutricional adaptado con productos sin lactosa y proteína ISO Whey con DigeZyme.
              </p>
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
