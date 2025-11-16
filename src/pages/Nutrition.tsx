import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, Calendar, TrendingUp, Clock, ChefHat, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DayType = 'entrenamiento' | 'descanso';

interface Comida {
  hora: string;
  nombre: string;
  ingredientes: string[];
}

const PLAN_ENTRENAMIENTO: Comida[] = [
  {
    hora: '9:30 AM',
    nombre: 'Desayuno - Gachas de avena y huevos',
    ingredientes: [
      '100g de avena',
      '250ml de leche (almendra, soja o sin lactosa)',
      '1 cda de miel',
      '1 huevo entero + 2 claras (revueltos)',
      '20g de almendras',
    ],
  },
  {
    hora: '12:30 PM',
    nombre: 'Media Mañana - Tostadas de aguacate',
    ingredientes: [
      '2 rebanadas de pan integral',
      '1/2 aguacate mediano',
      '1 lata de atún al natural (o 60g de pavo cocido)',
    ],
  },
  {
    hora: '2:00 PM',
    nombre: 'Almuerzo - Pollo con arroz y verduras',
    ingredientes: [
      '125g de pechuga de pollo',
      '150g de arroz (peso en seco)',
      '1.5 cda (20ml) de aceite de oliva',
      'Verduras salteadas (pimiento, calabacín, cebolla, champiñones)',
    ],
  },
  {
    hora: '5:00 PM',
    nombre: 'Pre-Entrenamiento - Snack de energía',
    ingredientes: [
      '2 tortitas de arroz',
      '2 cdas de mermelada',
      '1 yogur (tipo skyr o griego, sin lactosa)',
      '2 dátiles',
    ],
  },
  {
    hora: '8:00 PM',
    nombre: 'Post-Entrenamiento - Batido de recuperación',
    ingredientes: [
      '1 scoop (30g) de proteína Drasanvi ISO Whey',
      '1 plátano grande',
      '3g de Creatina Monohidrato',
      '300ml de agua o leche de almendra',
    ],
  },
  {
    hora: '11:00 PM',
    nombre: 'Cena - Pasta boloñesa',
    ingredientes: [
      '125g de carne picada de ternera (5-10% grasa)',
      '100g de pasta (peso en seco)',
      '1/2 taza de salsa de tomate',
      '30g de queso rallado (sin lactosa)',
    ],
  },
];

const PLAN_DESCANSO: Comida[] = [
  {
    hora: '9:30 AM',
    nombre: 'Desayuno - Batido denso y huevos',
    ingredientes: [
      '100g de avena',
      '250ml de leche (sin lactosa)',
      '2 cdas de crema de cacahuete (licuado todo junto)',
      '1 huevo entero + 2 claras (revueltos)',
    ],
  },
  {
    hora: '12:30 PM',
    nombre: 'Media Mañana - Bol de proteína y frutos secos',
    ingredientes: [
      '1 scoop (30g) de proteína Drasanvi ISO Whey',
      '200g de yogur (griego o skyr, sin lactosa)',
      '30g de nueces o almendras',
    ],
  },
  {
    hora: '2:00 PM',
    nombre: 'Almuerzo - Pollo asado con batata',
    ingredientes: [
      '150g de muslos de pollo (sin piel)',
      '300g de batata (camote) asada',
      '1/2 aguacate mediano',
      '1 tsp de aceite de oliva',
    ],
  },
  {
    hora: '5:00 PM',
    nombre: 'Merienda - Sándwich y fruta',
    ingredientes: [
      '2 rebanadas de pan integral',
      '100g de queso fresco batido (sin lactosa)',
      '1 cda de miel',
      '1 manzana',
    ],
  },
  {
    hora: '11:00 PM',
    nombre: 'Cena - Pavo con quinoa',
    ingredientes: [
      '150g de pechuga de pavo',
      '100g de quinoa (peso en seco)',
      '1 cda (15ml) de aceite de oliva',
      'Verduras salteadas (pimiento, champiñones)',
    ],
  },
];

export default function Nutrition() {
  const [selectedDay, setSelectedDay] = useState<DayType>('entrenamiento');

  const planActual = selectedDay === 'entrenamiento' ? PLAN_ENTRENAMIENTO : PLAN_DESCANSO;
  const macros = selectedDay === 'entrenamiento'
    ? { calorias: 3020, proteina: 148, carbohidratos: 406, grasa: 100 }
    : { calorias: 2810, proteina: 150, carbohidratos: 330, grasa: 100 };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Plan Nutricional dietAI</h1>
        <p className="text-muted-foreground text-lg">
          Plan personalizado para hipertrofia - Ectomorfo 68.5kg, 178cm
        </p>
      </div>

      {/* Información importante */}
      <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Tu Perfil Nutricional</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>TDEE:</strong> ~2,550-2,600 kcal (mantenimiento)</p>
          <p>• <strong>Objetivo:</strong> Superávit calórico para hipertrofia</p>
          <p>• <strong>Tipo corporal:</strong> Ectomorfo (hard gainer - metabolismo rápido)</p>
          <p>• <strong>Intolerancia:</strong> Lactosa (plan adaptado con productos sin lactosa)</p>
          <p>• <strong>Suplementos:</strong> ISO Whey con DigeZyme (compatible) + Creatina 3g/día</p>
        </CardContent>
      </Card>

      {/* Selector de tipo de día */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedDay === 'entrenamiento' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setSelectedDay('entrenamiento')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Días de Entrenamiento (4 días)
        </Button>
        <Button
          variant={selectedDay === 'descanso' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setSelectedDay('descanso')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Días de Descanso (3 días)
        </Button>
      </div>

      {/* Macros del día */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Calorías</CardDescription>
            <CardTitle className="text-2xl">{macros.calorias}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Proteína</CardDescription>
            <CardTitle className="text-2xl">{macros.proteina}g</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Carbohidratos</CardDescription>
            <CardTitle className="text-2xl">{macros.carbohidratos}g</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Grasa</CardDescription>
            <CardTitle className="text-2xl">{macros.grasa}g</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Plan de comidas */}
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="w-6 h-6" />
          Plan de Comidas
        </h2>

        {planActual.map((comida, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline">{comida.hora}</Badge>
                  </div>
                  <CardTitle className="text-lg">{comida.nombre}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {comida.ingredientes.map((ingrediente, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{ingrediente}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suplementación */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Suplementación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">Proteína: Drasanvi ISO Whey (Aislado CFM)</p>
            <p className="text-muted-foreground">
              • Contiene DigeZyme con lactasa - compatible con intolerancia a lactosa<br />
              • 1 scoop (30g) post-entrenamiento en días de entreno<br />
              • 1 scoop en media mañana en días de descanso
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Creatina Monohidrato: 3g diarios</p>
            <p className="text-muted-foreground">
              • Añadir al batido post-entrenamiento<br />
              • Mejora fuerza, potencia y recuperación
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm">
              <strong>Nota:</strong> Si experimentas molestias con la proteína ISO Whey, considera cambiar a proteína vegana (guisante, arroz) o de carne (hidrolizado de ternera).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de compra */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Lista de la Compra Semanal
          </CardTitle>
          <CardDescription>Todo lo que necesitas para 7 días (4 entreno + 3 descanso)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-bold mb-2">Proteínas y Huevos</h3>
              <ul className="space-y-1">
                <li>• Pechuga de pollo: 500g</li>
                <li>• Carne picada de ternera (5-10%): 500g</li>
                <li>• Muslos de pollo (sin piel): 450g</li>
                <li>• Pechuga de pavo: 450g</li>
                <li>• Pavo cocido (fiambre): 60g</li>
                <li>• Huevos: 1 docena</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Lácteos (SIN LACTOSA)</h3>
              <ul className="space-y-1">
                <li>• Leche (almendra, soja o sin lactosa): 2.5L</li>
                <li>• Yogur (griego, skyr): 1.2kg</li>
                <li>• Queso rallado: 120g</li>
                <li>• Queso fresco batido: 300g</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Cereales y Carbohidratos</h3>
              <ul className="space-y-1">
                <li>• Avena en copos: 700g</li>
                <li>• Arroz: 600g</li>
                <li>• Pasta: 400g</li>
                <li>• Quinoa: 300g</li>
                <li>• Pan integral: 1 paquete (14 rebanadas)</li>
                <li>• Tortitas de arroz: 1 paquete (8 unidades)</li>
                <li>• Batata: 900g</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Frutas y Verduras</h3>
              <ul className="space-y-1">
                <li>• Plátanos: 4 unidades</li>
                <li>• Aguacates: 4 medianos</li>
                <li>• Dátiles: 1 paquete (~8)</li>
                <li>• Manzanas: 3 unidades</li>
                <li>• Verduras variadas para saltear</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Grasas y Frutos Secos</h3>
              <ul className="space-y-1">
                <li>• Aceite de oliva virgen extra: 1 botella</li>
                <li>• Almendras: 100g</li>
                <li>• Nueces: 100g</li>
                <li>• Crema de cacahuete: 1 bote</li>
                <li>• Miel: 1 bote</li>
                <li>• Mermelada: 1 bote</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consejos */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos de Seguimiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>📊 <strong>Pésate semanalmente:</strong> Objetivo de ganancia 0.25-0.5kg por semana</p>
          <p>⚖️ <strong>Si NO subes de peso en 2 semanas:</strong> Añade 300 kcal (75g más de carbohidratos o 1 cda aceite extra)</p>
          <p>📈 <strong>Si subes más de 0.5kg/semana:</strong> Reduce ligeramente las porciones</p>
          <p>💪 <strong>Consistencia &gt; Perfección:</strong> Cumple el 80-90% del plan y verás resultados</p>
          <p className="text-muted-foreground mt-4">
            ⚠️ Este plan es una guía basada en tu perfil. Consulta con un nutricionista profesional para ajustes personalizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
