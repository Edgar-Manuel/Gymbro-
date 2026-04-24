import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, ChefHat, AlertCircle, Info, Pill, UtensilsCrossed } from 'lucide-react';
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

// ─── Diet Templates ───────────────────────────────────────────────────────────

interface Meal { nombre: string; descripcion: string; prot: number; carbs: number; grasas: number; kcal: number; }
interface DayPlan { dia: string; comidas: { desayuno: Meal; comida: Meal; merienda: Meal; cena: Meal; } }

const TEMPLATES: Record<string, { etiqueta: string; color: string; emoji: string; descripcion: string; dias: DayPlan[] }> = {
  hipertrofia: {
    etiqueta: 'Hipertrofia',
    color: 'border-purple-500/40 bg-purple-50 dark:bg-purple-950/20',
    emoji: '💪',
    descripcion: 'Alto en proteínas y carbohidratos para maximizar la ganancia muscular.',
    dias: [
      { dia: 'Lunes', comidas: { desayuno: { nombre: 'Avena con plátano y proteína', descripcion: '80g avena + 1 plátano + 30g proteína en polvo', prot: 38, carbs: 82, grasas: 8, kcal: 556 }, merienda: { nombre: 'Greek yogurt con miel', descripcion: '250g yogur griego + 15g miel + 30g nueces', prot: 22, carbs: 28, grasas: 18, kcal: 358 }, comida: { nombre: 'Arroz con pollo y verduras', descripcion: '150g arroz cocido + 200g pechuga + 150g brócoli', prot: 52, carbs: 65, grasas: 6, kcal: 522 }, cena: { nombre: 'Salmón con boniato', descripcion: '180g salmón + 200g boniato + 100g espinacas', prot: 40, carbs: 44, grasas: 14, kcal: 466 } } },
      { dia: 'Martes', comidas: { desayuno: { nombre: 'Tortitas de avena', descripcion: '3 huevos + 80g avena + 1 plátano', prot: 30, carbs: 75, grasas: 12, kcal: 532 }, merienda: { nombre: 'Pan con pavo y aguacate', descripcion: '2 rebanadas pan integral + 80g pavo + ½ aguacate', prot: 24, carbs: 34, grasas: 12, kcal: 340 }, comida: { nombre: 'Pasta con ternera', descripcion: '160g pasta cocida + 180g ternera + tomate', prot: 48, carbs: 72, grasas: 10, kcal: 578 }, cena: { nombre: 'Merluza con quinoa', descripcion: '200g merluza + 120g quinoa cocida + ensalada', prot: 44, carbs: 38, grasas: 5, kcal: 373 } } },
      { dia: 'Miércoles', comidas: { desayuno: { nombre: 'Tostadas con huevos revueltos', descripcion: '3 huevos + 2 tostadas integrales + aguacate', prot: 26, carbs: 36, grasas: 18, kcal: 410 }, merienda: { nombre: 'Batido de proteína', descripcion: '1 scoop proteína + 300ml leche + 1 plátano', prot: 36, carbs: 46, grasas: 6, kcal: 386 }, comida: { nombre: 'Lentejas con arroz', descripcion: '200g lentejas cocidas + 100g arroz + verduras', prot: 28, carbs: 80, grasas: 4, kcal: 464 }, cena: { nombre: 'Pollo al horno con patatas', descripcion: '200g muslo de pollo + 200g patatas + ensalada', prot: 40, carbs: 38, grasas: 14, kcal: 434 } } },
      { dia: 'Jueves', comidas: { desayuno: { nombre: 'Bowl de açaí proteico', descripcion: '150g açaí + 30g proteína + 50g granola + frutas', prot: 34, carbs: 68, grasas: 8, kcal: 480 }, merienda: { nombre: 'Requesón con frutos rojos', descripcion: '200g requesón + 100g frutos rojos + 20g almendras', prot: 28, carbs: 18, grasas: 14, kcal: 306 }, comida: { nombre: 'Pechuga con arroz integral', descripcion: '220g pechuga + 150g arroz integral + espárragos', prot: 54, carbs: 58, grasas: 6, kcal: 506 }, cena: { nombre: 'Atún con pasta integral', descripcion: '2 latas atún + 140g pasta integral + tomate cherry', prot: 46, carbs: 58, grasas: 6, kcal: 474 } } },
      { dia: 'Viernes', comidas: { desayuno: { nombre: 'Avena nocturna', descripcion: '80g avena + 200ml leche + 1 manzana + canela', prot: 18, carbs: 80, grasas: 8, kcal: 464 }, merienda: { nombre: 'Tarta de arroz con proteína', descripcion: '2 tortitas de arroz + 30g proteína en polvo + mantequilla de cacahuete', prot: 32, carbs: 40, grasas: 12, kcal: 392 }, comida: { nombre: 'Sopa de pollo con fideos', descripcion: '200g pollo + 100g fideos + zanahoria + apio', prot: 44, carbs: 52, grasas: 8, kcal: 456 }, cena: { nombre: 'Revuelto de huevos con jamón', descripcion: '4 huevos + 80g jamón + 2 tostadas', prot: 40, carbs: 34, grasas: 20, kcal: 476 } } },
      { dia: 'Sábado', comidas: { desayuno: { nombre: 'Pancakes proteicos', descripcion: '3 huevos + 60g harina avena + fruta + miel', prot: 28, carbs: 60, grasas: 12, kcal: 464 }, merienda: { nombre: 'Queso cottage con piña', descripcion: '200g cottage + 100g piña + 20g semillas chía', prot: 24, carbs: 22, grasas: 6, kcal: 238 }, comida: { nombre: 'Hamburguesa de ternera con boniato', descripcion: '200g ternera + 200g boniato frito + lechuga', prot: 46, carbs: 44, grasas: 18, kcal: 522 }, cena: { nombre: 'Pizza proteica casera', descripcion: 'Base integral + pollo + verduras + queso mozzarella', prot: 42, carbs: 54, grasas: 14, kcal: 514 } } },
      { dia: 'Domingo', comidas: { desayuno: { nombre: 'Brunch de huevos benedictinos', descripcion: '3 huevos + salmón + aguacate + pan integral', prot: 34, carbs: 30, grasas: 22, kcal: 454 }, merienda: { nombre: 'Smoothie verde proteico', descripcion: '30g proteína + espinacas + manzana + jengibre', prot: 32, carbs: 28, grasas: 4, kcal: 276 }, comida: { nombre: 'Cocido de pollo y garbanzos', descripcion: '180g pollo + 200g garbanzos + verduras', prot: 48, carbs: 54, grasas: 8, kcal: 480 }, cena: { nombre: 'Filete de res con ensalada', descripcion: '200g filete + ensalada grande + aceite oliva', prot: 46, carbs: 12, grasas: 18, kcal: 394 } } },
    ],
  },
  perdida_grasa: {
    etiqueta: 'Pérdida de Grasa',
    color: 'border-green-500/40 bg-green-50 dark:bg-green-950/20',
    emoji: '🔥',
    descripcion: 'Déficit calórico con alto aporte proteico para preservar la masa muscular.',
    dias: [
      { dia: 'Lunes', comidas: { desayuno: { nombre: 'Claras con avena', descripcion: '5 claras + 50g avena + arándanos', prot: 30, carbs: 42, grasas: 4, kcal: 324 }, merienda: { nombre: 'Manzana con almendras', descripcion: '1 manzana + 20g almendras', prot: 4, carbs: 28, grasas: 10, kcal: 218 }, comida: { nombre: 'Ensalada de pollo', descripcion: '200g pechuga + hojas verdes + pepino + vinagreta', prot: 46, carbs: 8, grasas: 8, kcal: 288 }, cena: { nombre: 'Merluza al vapor', descripcion: '200g merluza + 200g brócoli + limón', prot: 40, carbs: 12, grasas: 4, kcal: 240 } } },
      { dia: 'Martes', comidas: { desayuno: { nombre: 'Yogur griego con semillas', descripcion: '200g yogur griego 0% + 10g chía + frutos rojos', prot: 20, carbs: 18, grasas: 4, kcal: 188 }, merienda: { nombre: 'Pepino con hummus', descripcion: '1 pepino + 50g hummus', prot: 6, carbs: 14, grasas: 6, kcal: 134 }, comida: { nombre: 'Atún con arroz integral', descripcion: '2 latas atún + 80g arroz integral + tomate', prot: 40, carbs: 36, grasas: 4, kcal: 340 }, cena: { nombre: 'Pavo con espárragos', descripcion: '180g pavo + espárragos + champiñones', prot: 38, carbs: 8, grasas: 4, kcal: 220 } } },
      { dia: 'Miércoles', comidas: { desayuno: { nombre: 'Tortilla de claras', descripcion: '5 claras + 1 yema + espinacas + tomate', prot: 24, carbs: 6, grasas: 6, kcal: 174 }, merienda: { nombre: 'Proteína con agua', descripcion: '1 scoop proteína + agua + hielo', prot: 25, carbs: 4, grasas: 2, kcal: 134 }, comida: { nombre: 'Salmón con verduras', descripcion: '150g salmón + 200g calabacín + 100g zanahoria', prot: 36, carbs: 14, grasas: 12, kcal: 308 }, cena: { nombre: 'Sopa de verduras con pechuga', descripcion: '150g pechuga + caldo verduras + todas las verduras', prot: 34, carbs: 16, grasas: 4, kcal: 236 } } },
      { dia: 'Jueves', comidas: { desayuno: { nombre: 'Copos de avena con proteína', descripcion: '40g avena + 20g proteína + leche desnatada', prot: 28, carbs: 44, grasas: 4, kcal: 324 }, merienda: { nombre: 'Naranja + requesón', descripcion: '1 naranja + 150g requesón light', prot: 16, carbs: 22, grasas: 2, kcal: 170 }, comida: { nombre: 'Lentejas light', descripcion: '150g lentejas cocidas + verduras sin aceite', prot: 18, carbs: 30, grasas: 2, kcal: 210 }, cena: { nombre: 'Dorada al horno', descripcion: '200g dorada + 150g judías verdes + ajo', prot: 40, carbs: 8, grasas: 6, kcal: 246 } } },
      { dia: 'Viernes', comidas: { desayuno: { nombre: 'Batido verde proteico', descripcion: '25g proteína + espinacas + pepino + limón', prot: 26, carbs: 8, grasas: 2, kcal: 154 }, merienda: { nombre: 'Rollitos de pavo', descripcion: '80g pavo en lonchas + lechuga + mostaza', prot: 18, carbs: 4, grasas: 2, kcal: 106 }, comida: { nombre: 'Bowl de pollo y quinoa', descripcion: '180g pollo + 80g quinoa + aguacate + limón', prot: 44, carbs: 34, grasas: 10, kcal: 406 }, cena: { nombre: 'Sepia a la plancha', descripcion: '200g sepia + 150g pisto de verduras', prot: 32, carbs: 10, grasas: 4, kcal: 204 } } },
      { dia: 'Sábado', comidas: { desayuno: { nombre: 'Tostadas con huevo', descripcion: '2 tostadas integrales + 2 huevos + tomate', prot: 20, carbs: 30, grasas: 10, kcal: 290 }, merienda: { nombre: 'Fruta con proteína', descripcion: '1 pera + 25g proteína en agua', prot: 26, carbs: 24, grasas: 2, kcal: 218 }, comida: { nombre: 'Ensalada completa', descripcion: 'Lechuga + atún + huevo + aceitunas + vinagreta', prot: 32, carbs: 10, grasas: 12, kcal: 280 }, cena: { nombre: 'Filete a la plancha', descripcion: '180g solomillo + ensalada verde', prot: 40, carbs: 6, grasas: 10, kcal: 274 } } },
      { dia: 'Domingo', comidas: { desayuno: { nombre: 'Desayuno libre saludable', descripcion: 'Fruta + yogur + granola sin azúcar', prot: 14, carbs: 44, grasas: 8, kcal: 308 }, merienda: { nombre: 'Celery con mantequilla de cacahuete', descripcion: '3 tallos apio + 15g mantequilla cacahuete', prot: 6, carbs: 8, grasas: 10, kcal: 146 }, comida: { nombre: 'Pollo asado con verduras', descripcion: '200g pollo + 200g pisto + patata pequeña', prot: 42, carbs: 30, grasas: 8, kcal: 364 }, cena: { nombre: 'Gazpacho con jamón', descripcion: '300ml gazpacho + 60g jamón ibérico', prot: 18, carbs: 12, grasas: 6, kcal: 174 } } },
    ],
  },
  fuerza: {
    etiqueta: 'Fuerza',
    color: 'border-orange-500/40 bg-orange-50 dark:bg-orange-950/20',
    emoji: '🏋️',
    descripcion: 'Enfocado en soportar altas cargas. Más grasas saludables y carbohidratos de calidad.',
    dias: [
      { dia: 'Lunes', comidas: { desayuno: { nombre: 'Huevos con bacon y pan', descripcion: '3 huevos + 2 lonchas bacon + 2 rebanadas pan integral', prot: 32, carbs: 36, grasas: 22, kcal: 474 }, merienda: { nombre: 'Frutos secos mix', descripcion: '40g mix nueces, almendras, anacardos', prot: 8, carbs: 12, grasas: 22, kcal: 280 }, comida: { nombre: 'Carne con patatas', descripcion: '250g carne res + 250g patatas + aceite oliva', prot: 52, carbs: 48, grasas: 20, kcal: 588 }, cena: { nombre: 'Salmón con arroz', descripcion: '200g salmón + 150g arroz + aguacate', prot: 46, carbs: 50, grasas: 20, kcal: 566 } } },
      { dia: 'Martes', comidas: { desayuno: { nombre: 'Batido de plátano y creatina', descripcion: '2 plátanos + 30g proteína + creatina + leche entera', prot: 36, carbs: 70, grasas: 8, kcal: 500 }, merienda: { nombre: 'Sandwich de pavo', descripcion: '2 rebanadas pan + 100g pavo + queso + aguacate', prot: 28, carbs: 36, grasas: 16, kcal: 400 }, comida: { nombre: 'Cerdo con boniato', descripcion: '220g lomo cerdo + 250g boniato + brócoli', prot: 46, carbs: 56, grasas: 12, kcal: 520 }, cena: { nombre: 'Pasta con carne', descripcion: '180g pasta + 150g carne picada + salsa tomate', prot: 40, carbs: 72, grasas: 14, kcal: 578 } } },
      { dia: 'Miércoles', comidas: { desayuno: { nombre: 'Avena con mantequilla de cacahuete', descripcion: '100g avena + 30g PB + 1 plátano + leche', prot: 28, carbs: 88, grasas: 18, kcal: 628 }, merienda: { nombre: 'Queso y fruta', descripcion: '80g queso curado + 1 manzana', prot: 18, carbs: 26, grasas: 18, kcal: 338 }, comida: { nombre: 'Arroz con cordero', descripcion: '200g cordero + 160g arroz + especias', prot: 44, carbs: 62, grasas: 22, kcal: 622 }, cena: { nombre: 'Tortilla española', descripcion: '4 huevos + 200g patatas + aceite + cebolla', prot: 28, carbs: 42, grasas: 24, kcal: 498 } } },
      { dia: 'Jueves', comidas: { desayuno: { nombre: 'Tostadas con aguacate y huevos', descripcion: '2 tostadas + 1 aguacate + 3 huevos + sal', prot: 26, carbs: 38, grasas: 26, kcal: 490 }, merienda: { nombre: 'Leche con galletas avena', descripcion: '300ml leche entera + 4 galletas avena caseras', prot: 14, carbs: 48, grasas: 12, kcal: 356 }, comida: { nombre: 'Pollo entero con guarnición', descripcion: '250g muslo+contramuslo + 200g patatas + 100g zanahoria', prot: 48, carbs: 44, grasas: 18, kcal: 538 }, cena: { nombre: 'Bacalao con garbanzos', descripcion: '180g bacalao + 200g garbanzos + espinacas', prot: 48, carbs: 42, grasas: 8, kcal: 436 } } },
      { dia: 'Viernes', comidas: { desayuno: { nombre: 'Porridge de avena', descripcion: '100g avena + 300ml leche + 1 plátano + miel', prot: 22, carbs: 90, grasas: 10, kcal: 538 }, merienda: { nombre: 'Batido post-entreno', descripcion: '40g proteína + 200ml leche + 1 plátano + hielo', prot: 44, carbs: 50, grasas: 6, kcal: 434 }, comida: { nombre: 'Filete de atún con arroz', descripcion: '200g atún fresco + 160g arroz + tomate cherry', prot: 54, carbs: 62, grasas: 6, kcal: 514 }, cena: { nombre: 'Hamburguesa casera', descripcion: '200g ternera + pan + queso + lechuga + tomate', prot: 46, carbs: 46, grasas: 22, kcal: 570 } } },
      { dia: 'Sábado', comidas: { desayuno: { nombre: 'Desayuno completo', descripcion: '3 huevos + jamón + pan + zumo naranja natural', prot: 30, carbs: 42, grasas: 16, kcal: 436 }, merienda: { nombre: 'Proteína de arroz con leche', descripcion: '30g proteína + 250ml leche + arroz con leche', prot: 34, carbs: 52, grasas: 8, kcal: 420 }, comida: { nombre: 'Paella de pollo', descripcion: '180g pollo + 160g arroz paella + verduras + azafrán', prot: 44, carbs: 70, grasas: 10, kcal: 554 }, cena: { nombre: 'Cena libre moderada', descripcion: 'Comida social · mantén proteína alta', prot: 35, carbs: 50, grasas: 20, kcal: 520 } } },
      { dia: 'Domingo', comidas: { desayuno: { nombre: 'Waffles proteicos', descripcion: '60g harina avena + 3 huevos + 20g proteína + frutas', prot: 38, carbs: 60, grasas: 14, kcal: 534 }, merienda: { nombre: 'Quark con miel y nueces', descripcion: '200g quark + 20g miel + 30g nueces', prot: 22, carbs: 28, grasas: 18, kcal: 362 }, comida: { nombre: 'Asado de res dominical', descripcion: '250g roast beef + 200g patatas + ensalada', prot: 54, carbs: 38, grasas: 20, kcal: 554 }, cena: { nombre: 'Huevos rancheros', descripcion: '3 huevos + frijoles + tomate + tortilla + aguacate', prot: 28, carbs: 44, grasas: 18, kcal: 450 } } },
    ],
  },
};

export default function Nutrition() {
  const { currentUser } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<DayType>('entrenamiento');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [templateDayIdx, setTemplateDayIdx] = useState(0);

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

      {/* Plantillas de Dieta Semanal */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-green-500" />
            <CardTitle>Plantillas de Dieta Semanal</CardTitle>
          </div>
          <CardDescription>
            Planes de comida semanales completos adaptados a diferentes objetivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <button
                key={key}
                onClick={() => { setActiveTemplate(activeTemplate === key ? null : key); setTemplateDayIdx(0); }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${activeTemplate === key ? tpl.color + ' scale-[1.02]' : 'border-border hover:border-primary/40'}`}
              >
                <div className="text-2xl mb-1">{tpl.emoji}</div>
                <div className="font-bold text-sm">{tpl.etiqueta}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.descripcion}</div>
              </button>
            ))}
          </div>

          {/* Template detail */}
          {activeTemplate && (() => {
            const tpl = TEMPLATES[activeTemplate];
            const day = tpl.dias[templateDayIdx];
            const meals = [
              { key: 'desayuno', label: 'Desayuno', emoji: '🌅' },
              { key: 'comida',   label: 'Comida',   emoji: '🍽️' },
              { key: 'merienda', label: 'Merienda', emoji: '🍎' },
              { key: 'cena',     label: 'Cena',     emoji: '🌙' },
            ] as const;
            const dayTotal = (['desayuno', 'comida', 'merienda', 'cena'] as const).reduce((t, k) => ({
              prot: t.prot + day.comidas[k].prot,
              carbs: t.carbs + day.comidas[k].carbs,
              grasas: t.grasas + day.comidas[k].grasas,
              kcal: t.kcal + day.comidas[k].kcal,
            }), { prot: 0, carbs: 0, grasas: 0, kcal: 0 });

            return (
              <div className={`rounded-xl border p-4 space-y-4 ${tpl.color}`}>
                {/* Day navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setTemplateDayIdx(i => Math.max(0, i - 1))}
                    disabled={templateDayIdx === 0}
                    className="px-3 py-1 rounded-lg border text-sm disabled:opacity-30 hover:bg-background transition-colors"
                  >
                    ← Anterior
                  </button>
                  <div className="text-center">
                    <div className="font-bold">{day.dia}</div>
                    <div className="text-xs text-muted-foreground">{templateDayIdx + 1} / 7</div>
                  </div>
                  <button
                    onClick={() => setTemplateDayIdx(i => Math.min(6, i + 1))}
                    disabled={templateDayIdx === 6}
                    className="px-3 py-1 rounded-lg border text-sm disabled:opacity-30 hover:bg-background transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>

                {/* Day total macros */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Calorías', val: `${dayTotal.kcal}`, unit: 'kcal', color: 'text-orange-500' },
                    { label: 'Proteína', val: `${dayTotal.prot}g`, unit: '', color: 'text-blue-500' },
                    { label: 'Carbos', val: `${dayTotal.carbs}g`, unit: '', color: 'text-yellow-500' },
                    { label: 'Grasas', val: `${dayTotal.grasas}g`, unit: '', color: 'text-green-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-background/60 rounded-lg p-2">
                      <div className={`font-bold text-sm ${s.color}`}>{s.val}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Meals */}
                <div className="space-y-2">
                  {meals.map(m => {
                    const meal = day.comidas[m.key];
                    return (
                      <div key={m.key} className="bg-background/70 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{m.emoji}</span>
                            <span className="font-semibold text-sm">{m.label}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{meal.kcal} kcal</Badge>
                            <Badge variant="secondary" className="text-xs">{meal.prot}g P</Badge>
                          </div>
                        </div>
                        <p className="font-medium text-sm">{meal.nombre}</p>
                        <p className="text-xs text-muted-foreground">{meal.descripcion}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Day dots */}
                <div className="flex justify-center gap-1.5">
                  {tpl.dias.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTemplateDayIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === templateDayIdx ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
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
