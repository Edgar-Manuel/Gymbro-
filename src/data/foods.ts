export interface FoodItem {
  id: string;
  nombre: string;
  categoria: 'proteina' | 'carbohidrato' | 'grasa' | 'verdura' | 'fruta' | 'lacteo' | 'suplemento';
  kcal: number;    // por 100g
  carbs: number;   // g por 100g
  proteina: number; // g por 100g
  grasa: number;   // g por 100g
  emoji: string;
}

export const FOODS_DB: FoodItem[] = [
  // ─── Proteínas ───────────────────────────────────────────────────────────────
  { id: 'pollo-pechuga',   nombre: 'Pechuga de pollo',     categoria: 'proteina',     kcal: 165, carbs: 0,    proteina: 31.0, grasa: 3.6, emoji: '🍗' },
  { id: 'pavo-pechuga',    nombre: 'Pechuga de pavo',      categoria: 'proteina',     kcal: 135, carbs: 0,    proteina: 30.0, grasa: 1.0, emoji: '🦃' },
  { id: 'salmon',          nombre: 'Salmón',               categoria: 'proteina',     kcal: 208, carbs: 0,    proteina: 20.0, grasa: 13.0, emoji: '🐟' },
  { id: 'atun-agua',       nombre: 'Atún en agua (lata)',  categoria: 'proteina',     kcal: 116, carbs: 0,    proteina: 26.0, grasa: 1.0, emoji: '🐠' },
  { id: 'merluza',         nombre: 'Merluza',              categoria: 'proteina',     kcal: 78,  carbs: 0,    proteina: 17.0, grasa: 0.7, emoji: '🐡' },
  { id: 'bacalao',         nombre: 'Bacalao',              categoria: 'proteina',     kcal: 105, carbs: 0,    proteina: 23.0, grasa: 0.9, emoji: '🐟' },
  { id: 'ternera-filete',  nombre: 'Ternera (filete)',     categoria: 'proteina',     kcal: 250, carbs: 0,    proteina: 26.0, grasa: 16.0, emoji: '🥩' },
  { id: 'cerdo-lomo',      nombre: 'Lomo de cerdo',        categoria: 'proteina',     kcal: 143, carbs: 0,    proteina: 22.0, grasa: 5.9, emoji: '🥩' },
  { id: 'jamon-serrano',   nombre: 'Jamón serrano',        categoria: 'proteina',     kcal: 241, carbs: 0,    proteina: 30.0, grasa: 14.0, emoji: '🥩' },
  { id: 'huevo-entero',    nombre: 'Huevo entero',         categoria: 'proteina',     kcal: 155, carbs: 1.1,  proteina: 13.0, grasa: 11.0, emoji: '🥚' },
  { id: 'clara-huevo',     nombre: 'Clara de huevo',       categoria: 'proteina',     kcal: 52,  carbs: 0.7,  proteina: 11.0, grasa: 0.2, emoji: '🥚' },
  { id: 'proteina-whey',   nombre: 'Proteína Whey',        categoria: 'suplemento',   kcal: 400, carbs: 10.0, proteina: 80.0, grasa: 5.0, emoji: '🧉' },
  // ─── Carbohidratos ───────────────────────────────────────────────────────────
  { id: 'arroz-blanco',    nombre: 'Arroz blanco cocido',  categoria: 'carbohidrato', kcal: 130, carbs: 28.0, proteina: 2.7,  grasa: 0.3, emoji: '🍚' },
  { id: 'arroz-integral',  nombre: 'Arroz integral cocido',categoria: 'carbohidrato', kcal: 111, carbs: 23.0, proteina: 2.6,  grasa: 0.9, emoji: '🍚' },
  { id: 'avena',           nombre: 'Avena (cruda)',        categoria: 'carbohidrato', kcal: 389, carbs: 66.0, proteina: 17.0, grasa: 7.0, emoji: '🥣' },
  { id: 'pasta-cocida',    nombre: 'Pasta cocida',         categoria: 'carbohidrato', kcal: 131, carbs: 25.0, proteina: 5.0,  grasa: 1.1, emoji: '🍝' },
  { id: 'pan-integral',    nombre: 'Pan integral',         categoria: 'carbohidrato', kcal: 247, carbs: 41.0, proteina: 13.0, grasa: 3.4, emoji: '🍞' },
  { id: 'boniato',         nombre: 'Boniato cocido',       categoria: 'carbohidrato', kcal: 86,  carbs: 20.0, proteina: 1.6,  grasa: 0.1, emoji: '🍠' },
  { id: 'patata',          nombre: 'Patata cocida',        categoria: 'carbohidrato', kcal: 77,  carbs: 17.0, proteina: 2.0,  grasa: 0.1, emoji: '🥔' },
  { id: 'quinoa-cocida',   nombre: 'Quinoa cocida',        categoria: 'carbohidrato', kcal: 120, carbs: 22.0, proteina: 4.4,  grasa: 1.9, emoji: '🌾' },
  { id: 'lentejas',        nombre: 'Lentejas cocidas',     categoria: 'carbohidrato', kcal: 116, carbs: 20.0, proteina: 9.0,  grasa: 0.4, emoji: '🫘' },
  { id: 'garbanzos',       nombre: 'Garbanzos cocidos',    categoria: 'carbohidrato', kcal: 164, carbs: 27.0, proteina: 9.0,  grasa: 2.6, emoji: '🫘' },
  { id: 'miel',            nombre: 'Miel',                 categoria: 'carbohidrato', kcal: 304, carbs: 82.0, proteina: 0.3,  grasa: 0.0, emoji: '🍯' },
  { id: 'platano',         nombre: 'Plátano',              categoria: 'fruta',        kcal: 89,  carbs: 23.0, proteina: 1.1,  grasa: 0.3, emoji: '🍌' },
  { id: 'manzana',         nombre: 'Manzana',              categoria: 'fruta',        kcal: 52,  carbs: 14.0, proteina: 0.3,  grasa: 0.2, emoji: '🍎' },
  { id: 'naranja',         nombre: 'Naranja',              categoria: 'fruta',        kcal: 47,  carbs: 12.0, proteina: 0.9,  grasa: 0.1, emoji: '🍊' },
  { id: 'fresa',           nombre: 'Fresas',               categoria: 'fruta',        kcal: 32,  carbs: 7.7,  proteina: 0.7,  grasa: 0.3, emoji: '🍓' },
  { id: 'arandanos',       nombre: 'Arándanos',            categoria: 'fruta',        kcal: 57,  carbs: 14.0, proteina: 0.7,  grasa: 0.3, emoji: '🫐' },
  { id: 'pera',            nombre: 'Pera',                 categoria: 'fruta',        kcal: 57,  carbs: 15.0, proteina: 0.4,  grasa: 0.1, emoji: '🍐' },
  // ─── Grasas ──────────────────────────────────────────────────────────────────
  { id: 'aguacate',        nombre: 'Aguacate',             categoria: 'grasa',        kcal: 160, carbs: 9.0,  proteina: 2.0,  grasa: 15.0, emoji: '🥑' },
  { id: 'aceite-oliva',    nombre: 'Aceite de oliva',      categoria: 'grasa',        kcal: 884, carbs: 0,    proteina: 0.0,  grasa: 100.0, emoji: '🫒' },
  { id: 'almendras',       nombre: 'Almendras',            categoria: 'grasa',        kcal: 579, carbs: 22.0, proteina: 21.0, grasa: 50.0, emoji: '🌰' },
  { id: 'nueces',          nombre: 'Nueces',               categoria: 'grasa',        kcal: 654, carbs: 14.0, proteina: 15.0, grasa: 65.0, emoji: '🌰' },
  { id: 'mantequilla-pb',  nombre: 'Mantequilla cacahuete',categoria: 'grasa',        kcal: 588, carbs: 20.0, proteina: 25.0, grasa: 50.0, emoji: '🥜' },
  { id: 'semillas-chia',   nombre: 'Semillas de chía',     categoria: 'grasa',        kcal: 486, carbs: 42.0, proteina: 17.0, grasa: 31.0, emoji: '🌱' },
  { id: 'semillas-lino',   nombre: 'Semillas de lino',     categoria: 'grasa',        kcal: 534, carbs: 29.0, proteina: 18.0, grasa: 42.0, emoji: '🌱' },
  // ─── Lácteos ─────────────────────────────────────────────────────────────────
  { id: 'yogur-griego',    nombre: 'Yogur griego',         categoria: 'lacteo',       kcal: 100, carbs: 4.0,  proteina: 10.0, grasa: 5.0, emoji: '🥛' },
  { id: 'yogur-0',         nombre: 'Yogur 0% grasa',       categoria: 'lacteo',       kcal: 57,  carbs: 6.0,  proteina: 8.0,  grasa: 0.2, emoji: '🥛' },
  { id: 'cottage',         nombre: 'Queso cottage',        categoria: 'lacteo',       kcal: 98,  carbs: 3.4,  proteina: 11.0, grasa: 4.3, emoji: '🧀' },
  { id: 'mozzarella',      nombre: 'Mozzarella',           categoria: 'lacteo',       kcal: 280, carbs: 2.2,  proteina: 28.0, grasa: 17.0, emoji: '🧀' },
  { id: 'queso-curado',    nombre: 'Queso curado',         categoria: 'lacteo',       kcal: 402, carbs: 1.3,  proteina: 25.0, grasa: 33.0, emoji: '🧀' },
  { id: 'leche-entera',    nombre: 'Leche entera',         categoria: 'lacteo',       kcal: 61,  carbs: 4.8,  proteina: 3.2,  grasa: 3.3, emoji: '🥛' },
  { id: 'leche-desnatada', nombre: 'Leche desnatada',      categoria: 'lacteo',       kcal: 35,  carbs: 5.0,  proteina: 3.4,  grasa: 0.1, emoji: '🥛' },
  { id: 'requesón',        nombre: 'Requesón',             categoria: 'lacteo',       kcal: 108, carbs: 3.0,  proteina: 12.0, grasa: 5.5, emoji: '🧀' },
  // ─── Verduras ────────────────────────────────────────────────────────────────
  { id: 'brocoli',         nombre: 'Brócoli',              categoria: 'verdura',      kcal: 34,  carbs: 7.0,  proteina: 2.8,  grasa: 0.4, emoji: '🥦' },
  { id: 'espinacas',       nombre: 'Espinacas',            categoria: 'verdura',      kcal: 23,  carbs: 3.6,  proteina: 2.9,  grasa: 0.4, emoji: '🥬' },
  { id: 'pepino',          nombre: 'Pepino',               categoria: 'verdura',      kcal: 16,  carbs: 3.6,  proteina: 0.7,  grasa: 0.1, emoji: '🥒' },
  { id: 'zanahoria',       nombre: 'Zanahoria',            categoria: 'verdura',      kcal: 41,  carbs: 10.0, proteina: 0.9,  grasa: 0.2, emoji: '🥕' },
  { id: 'tomate',          nombre: 'Tomate',               categoria: 'verdura',      kcal: 18,  carbs: 3.9,  proteina: 0.9,  grasa: 0.2, emoji: '🍅' },
  { id: 'lechuga',         nombre: 'Lechuga',              categoria: 'verdura',      kcal: 15,  carbs: 2.9,  proteina: 1.4,  grasa: 0.2, emoji: '🥬' },
  { id: 'pimiento',        nombre: 'Pimiento',             categoria: 'verdura',      kcal: 31,  carbs: 6.0,  proteina: 1.0,  grasa: 0.3, emoji: '🫑' },
  { id: 'champiñones',     nombre: 'Champiñones',          categoria: 'verdura',      kcal: 22,  carbs: 3.3,  proteina: 3.1,  grasa: 0.3, emoji: '🍄' },
  { id: 'esparragos',      nombre: 'Espárragos',           categoria: 'verdura',      kcal: 20,  carbs: 3.9,  proteina: 2.2,  grasa: 0.1, emoji: '🥦' },
];

export function calcularMacrosAlimento(food: FoodItem, gramos: number) {
  const f = gramos / 100;
  return {
    kcal:     Math.round(food.kcal     * f),
    proteina: Math.round(food.proteina * f * 10) / 10,
    carbs:    Math.round(food.carbs    * f * 10) / 10,
    grasa:    Math.round(food.grasa    * f * 10) / 10,
  };
}
