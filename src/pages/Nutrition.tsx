import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, ChefHat, AlertCircle, Info, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import {
  calcularPlanNutricional,
  PERFILES_SOMATOTIPO,
  getTimingRecomendado,
  getSuplementosRecomendados,
  calcularTDEE,
  calcularBMR
} from '@/utils/nutritionCalculator';
import type { Somatotipo, Objetivo } from '@/types';
import SomatotipoImage from '@/components/SomatotipoImage';

type DayType = 'entrenamiento' | 'descanso';

export default function Nutrition() {
  const { currentUser } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<DayType>('entrenamiento');

  // Obtener datos del usuario o usar valores por defecto
  const peso = currentUser?.peso || currentUser?.pesoActual || 70;
  const altura = currentUser?.altura || 175;
  const edad = currentUser?.edad || 25;
  const sexo = currentUser?.sexo || 'masculino';
  const somatotipo: Somatotipo = currentUser?.somatotipo || 'mesomorfo';
  const objetivo: Objetivo = currentUser?.objetivo || 'hipertrofia';
  const objetivoCalorico = currentUser?.objetivoCalorico || 'superavit';

  // Calcular plan nutricional
  const factorActividadEntreno = 1.55; // Moderado
  const factorActividadDescanso = 1.375; // Ligero

  const planEntreno = calcularPlanNutricional(
    peso, altura, edad, sexo,
    somatotipo, objetivo, objetivoCalorico,
    factorActividadEntreno
  );

  const planDescanso = calcularPlanNutricional(
    peso, altura, edad, sexo,
    somatotipo, objetivo, objetivoCalorico,
    factorActividadDescanso
  );

  const planActual = selectedDay === 'entrenamiento' ? planEntreno : planDescanso;
  const perfilSomatotipo = PERFILES_SOMATOTIPO[somatotipo];
  const timingRecomendado = getTimingRecomendado(somatotipo);
  const suplementos = getSuplementosRecomendados(somatotipo, objetivo);

  // Calcular TDEE base para mostrar
  const bmr = calcularBMR(peso, altura, edad, sexo);
  const tdee = calcularTDEE(bmr, 1.55);

  // Nombre formateado del somatotipo
  const somatotipoCapitalizado = somatotipo.charAt(0).toUpperCase() + somatotipo.slice(1);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Plan Nutricional Personalizado</h1>
        <p className="text-muted-foreground text-lg">
          Plan adaptado para {somatotipoCapitalizado} - {currentUser?.nombre || 'Usuario'} ({peso}kg, {altura}cm)
        </p>
      </div>

      {/* Informacion del perfil nutricional */}
      <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Tu Perfil Nutricional</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Imagen del somatotipo */}
            <div className="flex-shrink-0">
              <SomatotipoImage somatotipo={somatotipo} size="md" showLabel />
            </div>
            {/* Info */}
            <div className="space-y-2 text-sm flex-1">
              <p>• <strong>TDEE (mantenimiento):</strong> ~{tdee} kcal</p>
              <p>• <strong>Objetivo:</strong> {objetivo.charAt(0).toUpperCase() + objetivo.slice(1).replace('_', ' ')}</p>
              <p>• <strong>Tipo corporal:</strong> {somatotipoCapitalizado} - {perfilSomatotipo.descripcion}</p>
              <p>• <strong>Ajuste calorico:</strong> {planActual.descripcionPlan}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selector de tipo de dia */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedDay === 'entrenamiento' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setSelectedDay('entrenamiento')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Dias de Entrenamiento
        </Button>
        <Button
          variant={selectedDay === 'descanso' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setSelectedDay('descanso')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Dias de Descanso
        </Button>
      </div>

      {/* Macros del dia */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Calorias</CardDescription>
            <CardTitle className="text-2xl">{planActual.calorias}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Proteina</CardDescription>
            <CardTitle className="text-2xl">{planActual.proteina}g</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Carbohidratos</CardDescription>
            <CardTitle className="text-2xl">{planActual.carbohidratos}g</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Grasa</CardDescription>
            <CardTitle className="text-2xl">{planActual.grasa}g</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Timing de comidas recomendado */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle>Distribucion de Comidas Recomendada</CardTitle>
          </div>
          <CardDescription>{timingRecomendado.descripcion}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {timingRecomendado.horarios.map((hora, index) => (
              <div key={index} className="text-center p-3 bg-muted rounded-lg">
                <Badge variant="outline" className="mb-2">{hora}</Badge>
                <p className="text-sm font-medium">Comida {index + 1}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Tip:</strong> {somatotipo === 'ectomorfo'
              ? 'Come incluso cuando no tengas hambre para mantener el superavit.'
              : somatotipo === 'endomorfo'
              ? 'Concentra los carbohidratos alrededor del entrenamiento.'
              : 'Manten horarios consistentes para optimizar tu metabolismo.'}
          </p>
        </CardContent>
      </Card>

      {/* Recomendaciones especificas del somatotipo */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <CardTitle>Guia para {somatotipoCapitalizado}</CardTitle>
          </div>
          <CardDescription>Recomendaciones nutricionales especificas para tu tipo de cuerpo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-green-600">Lo que debes priorizar:</h3>
            <ul className="space-y-1 text-sm">
              {perfilSomatotipo.recomendacionesGenerales.slice(0, 3).map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-orange-600">Desafios a tener en cuenta:</h3>
            <ul className="space-y-1 text-sm">
              {perfilSomatotipo.desafios.slice(0, 3).map((des, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">!</span>
                  <span>{des}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consejos especificos por somatotipo */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Distribucion de macros para {somatotipoCapitalizado}:</h3>
            {somatotipo === 'ectomorfo' && (
              <div className="text-sm space-y-1">
                <p>• <strong>Carbohidratos altos (50-55%):</strong> Tu metabolismo rapido necesita mucho combustible</p>
                <p>• <strong>Proteina moderada (2g/kg):</strong> Suficiente para sintesis muscular</p>
                <p>• <strong>Grasas saludables (25%):</strong> Añaden calorias sin llenar demasiado</p>
                <p className="mt-2 text-muted-foreground">Alimentos caloricos densos: frutos secos, aguacate, aceite de oliva, platano, batidos</p>
              </div>
            )}
            {somatotipo === 'mesomorfo' && (
              <div className="text-sm space-y-1">
                <p>• <strong>Carbohidratos moderados (40-45%):</strong> Ajustar segun volumen o definicion</p>
                <p>• <strong>Proteina alta (2.2g/kg):</strong> Aprovecha tu capacidad de construccion muscular</p>
                <p>• <strong>Grasas equilibradas (28-32%):</strong> Para hormonas y energia</p>
                <p className="mt-2 text-muted-foreground">Tienes flexibilidad - experimenta y ajusta segun resultados</p>
              </div>
            )}
            {somatotipo === 'endomorfo' && (
              <div className="text-sm space-y-1">
                <p>• <strong>Carbohidratos bajos (25-35%):</strong> Solo peri-entreno y complejos</p>
                <p>• <strong>Proteina muy alta (2.4-2.8g/kg):</strong> Saciedad y preservacion muscular</p>
                <p>• <strong>Grasas moderadas-altas (35-40%):</strong> Energia alternativa a carbohidratos</p>
                <p className="mt-2 text-muted-foreground">Prioriza: verduras, proteinas magras, grasas saludables. Evita: azucares, harinas refinadas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suplementacion recomendada */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Suplementacion Recomendada
          </CardTitle>
          <CardDescription>Suplementos utiles para tu somatotipo y objetivo</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {suplementos.map((sup, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{sup}</span>
              </li>
            ))}
          </ul>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900 mt-4">
            <p className="text-sm">
              <strong>Nota:</strong> Los suplementos son opcionales y complementan una buena alimentacion. Consulta con un profesional antes de comenzar cualquier suplementacion.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consejos de seguimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Consejos de Seguimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {somatotipo === 'ectomorfo' && (
            <>
              <p>📊 <strong>Pesate semanalmente:</strong> Objetivo de ganancia 0.25-0.5kg por semana</p>
              <p>⚖️ <strong>Si NO subes de peso en 2 semanas:</strong> Añade 300 kcal (principalmente carbohidratos)</p>
              <p>🍽️ <strong>Si te cuesta comer tanto:</strong> Usa batidos hipercaloricos y alimentos densos</p>
              <p>💪 <strong>Entrena pesado pero breve:</strong> Sesiones de 45-60 min maximo</p>
            </>
          )}
          {somatotipo === 'mesomorfo' && (
            <>
              <p>📊 <strong>Pesate semanalmente:</strong> Objetivo de ganancia 0.3-0.5kg por semana en volumen</p>
              <p>⚖️ <strong>Ajusta segun resultado:</strong> Tu cuerpo responde rapido, observa y adapta</p>
              <p>🔄 <strong>Alterna fases:</strong> Puedes alternar volumen/definicion mas frecuentemente</p>
              <p>💪 <strong>Entrena con variedad:</strong> Tu cuerpo se adapta rapido, cambia estimulos</p>
            </>
          )}
          {somatotipo === 'endomorfo' && (
            <>
              <p>📊 <strong>Pesate semanalmente:</strong> Objetivo maximo de ganancia 0.3kg por semana</p>
              <p>⚖️ <strong>Si ganas mas de 0.5kg/semana:</strong> Reduce 200-300 kcal (de carbohidratos)</p>
              <p>🚶 <strong>Mantente activo:</strong> Añade cardio LISS en dias de descanso (caminatas)</p>
              <p>💪 <strong>Entrena con intensidad:</strong> Circuitos y superseries para quemar mas</p>
            </>
          )}
          <p className="text-muted-foreground mt-4">
            ⚠️ Este plan es una guia personalizada basada en tu perfil. Para ajustes mas especificos, consulta con un nutricionista deportivo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
