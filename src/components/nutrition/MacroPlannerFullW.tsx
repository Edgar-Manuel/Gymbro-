import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calcularMacrosFullW } from '@/utils/nutritionCalculator';
import { FOODS_DB, calcularMacrosAlimento } from '@/data/foods';
import type { FoodItem } from '@/data/foods';
import type { ObjetivoCalorico } from '@/types';
import { Utensils, Plus, X, Search, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets } from 'lucide-react';

interface MealEntry { id: string; food: FoodItem; gramos: number; }
interface MealSlot  { id: string; nombre: string; emoji: string; hora: string; entries: MealEntry[]; }

const SLOTS_DEFAULT: MealSlot[] = [
  { id: 's1', nombre: 'Desayuno',      emoji: '🌅', hora: '08:00', entries: [] },
  { id: 's2', nombre: 'Media mañana',  emoji: '🍎', hora: '11:00', entries: [] },
  { id: 's3', nombre: 'Comida',        emoji: '🍽️', hora: '14:00', entries: [] },
  { id: 's4', nombre: 'Merienda',      emoji: '🥤', hora: '17:00', entries: [] },
  { id: 's5', nombre: 'Cena',          emoji: '🌙', hora: '20:30', entries: [] },
  { id: 's6', nombre: 'Pre-cama',      emoji: '😴', hora: '22:30', entries: [] },
];

interface Props {
  peso: number;
  altura: number;
  edad: number;
  sexo: 'masculino' | 'femenino';
  objetivoCalorico: ObjetivoCalorico;
  factorActividad: number;
}

export default function MacroPlannerFullW({ peso, altura, edad, sexo, objetivoCalorico, factorActividad }: Props) {
  const target = useMemo(
    () => calcularMacrosFullW(peso, altura, edad, sexo, objetivoCalorico, factorActividad),
    [peso, altura, edad, sexo, objetivoCalorico, factorActividad]
  );

  const [slots, setSlots] = useState<MealSlot[]>(SLOTS_DEFAULT);
  const [openSlot, setOpenSlot]   = useState<string | null>(null);
  const [addingTo, setAddingTo]   = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<FoodItem | null>(null);
  const [grams, setGrams]         = useState('100');

  const filtered = useMemo(() =>
    search.length < 1
      ? FOODS_DB.slice(0, 12)
      : FOODS_DB.filter(f => f.nombre.toLowerCase().includes(search.toLowerCase())).slice(0, 12),
    [search]
  );

  const totals = useMemo(() => {
    let kcal = 0, prot = 0, carbs = 0, fat = 0;
    for (const slot of slots) {
      for (const e of slot.entries) {
        const m = calcularMacrosAlimento(e.food, e.gramos);
        kcal  += m.kcal;
        prot  += m.proteina;
        carbs += m.carbs;
        fat   += m.grasa;
      }
    }
    return { kcal: Math.round(kcal), prot: Math.round(prot * 10) / 10, carbs: Math.round(carbs * 10) / 10, fat: Math.round(fat * 10) / 10 };
  }, [slots]);

  function addEntry() {
    if (!selected || !addingTo) return;
    const g = parseFloat(grams);
    if (!g || g <= 0) return;
    setSlots(prev => prev.map(s =>
      s.id !== addingTo ? s : {
        ...s,
        entries: [...s.entries, { id: `${Date.now()}`, food: selected, gramos: g }]
      }
    ));
    setSelected(null); setSearch(''); setGrams('100'); setAddingTo(null);
  }

  function removeEntry(slotId: string, entryId: string) {
    setSlots(prev => prev.map(s =>
      s.id !== slotId ? s : { ...s, entries: s.entries.filter(e => e.id !== entryId) }
    ));
  }

  const pct = (val: number, max: number) => Math.min(100, max > 0 ? Math.round((val / max) * 100) : 0);
  const color = (p: number) => p >= 100 ? 'bg-green-500' : p >= 75 ? 'bg-blue-500' : p >= 40 ? 'bg-yellow-500' : 'bg-muted-foreground/30';

  const macroRows = [
    { label: 'Calorías',      val: totals.kcal,  target: target.calorias,  unit: 'kcal', icon: <Flame   className="w-4 h-4 text-orange-500" />, color: 'text-orange-500' },
    { label: 'Proteína',      val: totals.prot,  target: target.proteina,  unit: 'g',    icon: <Beef    className="w-4 h-4 text-blue-500"   />, color: 'text-blue-500'   },
    { label: 'Carbohidratos', val: totals.carbs, target: target.carbs,     unit: 'g',    icon: <Wheat   className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-500' },
    { label: 'Grasas',        val: totals.fat,   target: target.grasa,     unit: 'g',    icon: <Droplets className="w-4 h-4 text-green-500" />, color: 'text-green-500'  },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Targets Full W */}
      <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="w-4 h-4 text-blue-600" />
            Objetivos Full W — {peso}kg
            <Badge variant="outline" className="text-xs ml-auto">
              {objetivoCalorico === 'superavit' ? '+300 kcal' : objetivoCalorico === 'deficit' ? '-300 kcal' : 'Mantenimiento'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { l: 'Calorías',  v: target.calorias, u: 'kcal', c: 'text-orange-500' },
              { l: 'Proteína',  v: target.proteina, u: 'g',    c: 'text-blue-500'   },
              { l: 'Carbos',    v: target.carbs,    u: 'g',    c: 'text-yellow-500' },
              { l: 'Grasas',    v: target.grasa,    u: 'g',    c: 'text-green-500'  },
            ].map(m => (
              <div key={m.l} className="text-center bg-background/70 rounded-lg p-2">
                <div className={`font-bold text-lg ${m.c}`}>{m.v}<span className="text-xs font-normal ml-0.5">{m.u}</span></div>
                <div className="text-xs text-muted-foreground">{m.l}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Proteína 2g/kg · Grasa 0.8g/kg · Carbos = resto · Fórmula Full W</p>

          {/* Progress bars */}
          <div className="space-y-2 mt-3">
            {macroRows.map(r => {
              const p = pct(r.val, r.target);
              return (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1">{r.icon}{r.label}</span>
                    <span className={r.color}>{r.val} / {r.target} {r.unit} <span className="text-muted-foreground">({p}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color(p)}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Planner */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Planificador Diario — 6 Comidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {slots.map(slot => {
            const slotTotals = slot.entries.reduce((acc, e) => {
              const m = calcularMacrosAlimento(e.food, e.gramos);
              return { kcal: acc.kcal + m.kcal, prot: acc.prot + m.proteina };
            }, { kcal: 0, prot: 0 });
            const isOpen = openSlot === slot.id;

            return (
              <div key={slot.id} className="border rounded-xl overflow-hidden">
                {/* Slot header */}
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => setOpenSlot(isOpen ? null : slot.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{slot.emoji}</span>
                    <div>
                      <span className="font-medium text-sm">{slot.nombre}</span>
                      <span className="text-xs text-muted-foreground ml-2">{slot.hora}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {slot.entries.length > 0 && (
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-xs">{Math.round(slotTotals.kcal)} kcal</Badge>
                        <Badge variant="secondary" className="text-xs">{Math.round(slotTotals.prot * 10) / 10}g P</Badge>
                      </div>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t bg-muted/20">
                    {/* Entries */}
                    {slot.entries.map(e => {
                      const m = calcularMacrosAlimento(e.food, e.gramos);
                      return (
                        <div key={e.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 mt-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{e.food.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{e.food.nombre}</p>
                              <p className="text-xs text-muted-foreground">{e.gramos}g · {m.kcal} kcal · {m.proteina}g P · {m.carbs}g C · {m.grasa}g G</p>
                            </div>
                          </div>
                          <button onClick={() => removeEntry(slot.id, e.id)} className="ml-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add food */}
                    {addingTo === slot.id ? (
                      <div className="bg-background border rounded-xl p-3 mt-2 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar alimento..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setSelected(null); }}
                            className="pl-8 h-9 text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                          {filtered.map(f => (
                            <button
                              key={f.id}
                              onClick={() => setSelected(f)}
                              className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-sm transition-colors ${selected?.id === f.id ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}
                            >
                              <span>{f.emoji}</span>
                              <span className="truncate text-xs">{f.nombre}</span>
                            </button>
                          ))}
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2 pt-1 border-t">
                            <span className="text-sm font-medium truncate flex-1">{selected.emoji} {selected.nombre}</span>
                            <Input
                              type="number"
                              value={grams}
                              onChange={e => setGrams(e.target.value)}
                              className="w-20 h-8 text-sm"
                              min="1"
                              max="2000"
                            />
                            <span className="text-xs text-muted-foreground">g</span>
                            <Button size="sm" onClick={addEntry} className="h-8">Añadir</Button>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => { setAddingTo(null); setSelected(null); setSearch(''); }}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 h-8 text-xs border-dashed"
                        onClick={() => { setAddingTo(slot.id); setOpenSlot(slot.id); }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Añadir alimento
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
