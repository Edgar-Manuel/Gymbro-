import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Scale, TrendingUp, Target, Moon, Sun, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dbHelpers } from '@/db';
import type { Somatotipo } from '@/types';
import { PERFILES_SOMATOTIPO, calcularPlanNutricional } from '@/utils/nutritionCalculator';
import SomatotipoImage from '@/components/SomatotipoImage';

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
    sexo: currentUser?.sexo || 'masculino' as 'masculino' | 'femenino',
    somatotipo: currentUser?.somatotipo || 'mesomorfo' as Somatotipo,
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
        sexo: formData.sexo,
        somatotipo: formData.somatotipo,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="somatotipo">Tipo de Cuerpo (Somatotipo)</Label>
              <Select
                value={formData.somatotipo}
                onValueChange={(value) => setFormData({ ...formData, somatotipo: value as Somatotipo })}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu tipo de cuerpo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ectomorfo">Ectomorfo - Delgado, metabolismo rápido</SelectItem>
                  <SelectItem value="mesomorfo">Mesomorfo - Atlético, gana músculo fácil</SelectItem>
                  <SelectItem value="endomorfo">Endomorfo - Robusto, metabolismo lento</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Información de Perfil - Somatotipo */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <CardTitle>Tu Tipo de Cuerpo: {formData.somatotipo.charAt(0).toUpperCase() + formData.somatotipo.slice(1)}</CardTitle>
          </div>
          <CardDescription>{perfilSomatotipo.descripcion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Imagen del somatotipo */}
          <div className="flex justify-center py-4">
            <SomatotipoImage somatotipo={formData.somatotipo} size="lg" />
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
