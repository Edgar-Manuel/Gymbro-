import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Trophy, Flame, Star } from 'lucide-react';

// Los 5 hábitos innegociables Full W
const HABITOS = [
  { id: 'entrena',  emoji: '🏋️', nombre: 'Entrenar',          descripcion: 'Completa tu sesión del día (o descanso activo)' },
  { id: 'nutricion',emoji: '🥗', nombre: 'Nutrición',          descripcion: 'Cumple tus macros diarios (±10%)' },
  { id: 'sueno',    emoji: '😴', nombre: '7-9h de sueño',      descripcion: 'Dormir es cuando creces. No negociable.' },
  { id: 'hidrata',  emoji: '💧', nombre: 'Hidratación',        descripcion: 'Bebe ≥ 2.5 litros de agua' },
  { id: 'pasos',    emoji: '👟', nombre: '8.000 pasos',        descripcion: 'Actívate fuera del gym. NEAT cuenta.' },
];

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type WeekData = Record<string, Record<number, boolean>>; // habitId -> dayIndex -> done

const STORAGE_KEY = 'gymbro_habits_v1';

function getWeekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function loadData(): WeekData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { week: string; data: WeekData };
    if (parsed.week !== getWeekKey()) return {};
    return parsed.data;
  } catch { return {}; }
}

function saveData(data: WeekData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ week: getWeekKey(), data }));
}

export default function HabitsTracker() {
  const [checks, setChecks] = useState<WeekData>(loadData);
  const today = new Date().getDay(); // 0=Sun … 6=Sat → convert to Mon=0
  const todayIdx = today === 0 ? 6 : today - 1;

  useEffect(() => { saveData(checks); }, [checks]);

  function toggle(habitId: string, dayIdx: number) {
    setChecks(prev => ({
      ...prev,
      [habitId]: {
        ...(prev[habitId] ?? {}),
        [dayIdx]: !(prev[habitId]?.[dayIdx] ?? false),
      },
    }));
  }

  // Stats
  const totalPosible = HABITOS.length * 7;
  const totalHecho   = HABITOS.reduce((s, h) =>
    s + Object.values(checks[h.id] ?? {}).filter(Boolean).length, 0);
  const pct = Math.round((totalHecho / totalPosible) * 100);

  const diasPerfectos = Array.from({ length: 7 }, (_, d) =>
    HABITOS.every(h => checks[h.id]?.[d] === true)
  ).filter(Boolean).length;

  const mejorHabito = HABITOS.reduce<{ nombre: string; pct: number } | null>((best, h) => {
    const done = Object.values(checks[h.id] ?? {}).filter(Boolean).length;
    const p = Math.round((done / 7) * 100);
    return !best || p > best.pct ? { nombre: h.nombre, pct: p } : best;
  }, null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-1">Hábitos Semanales</h1>
        <p className="text-muted-foreground">Los 5 hábitos innegociables Full W · {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Resumen semana */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{pct}%</p>
            <p className="text-xs text-muted-foreground">Cumplimiento</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold">{diasPerfectos}</p>
            <p className="text-xs text-muted-foreground">Días perfectos</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold">{totalHecho}</p>
            <p className="text-xs text-muted-foreground">de {totalPosible} checks</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de hábitos */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Registro semanal</CardTitle>
          <CardDescription>Toca cada celda para marcar el hábito completado</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Cabecera días */}
          <div className="grid grid-cols-[1fr_repeat(7,2rem)] gap-1 mb-2">
            <div />
            {DIAS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-semibold rounded-md py-1 ${i === todayIdx ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Filas hábitos */}
          <div className="space-y-2">
            {HABITOS.map(h => {
              const done = Object.values(checks[h.id] ?? {}).filter(Boolean).length;
              return (
                <div key={h.id} className="grid grid-cols-[1fr_repeat(7,2rem)] gap-1 items-center">
                  {/* Nombre */}
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base">{h.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{h.nombre}</p>
                      <div className="h-1 rounded-full bg-muted mt-0.5">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.round((done / 7) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes por día */}
                  {Array.from({ length: 7 }, (_, d) => {
                    const checked = checks[h.id]?.[d] ?? false;
                    const isToday = d === todayIdx;
                    return (
                      <button
                        key={d}
                        onClick={() => toggle(h.id, d)}
                        className={`flex items-center justify-center rounded-lg h-8 transition-all ${
                          checked
                            ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                            : isToday
                            ? 'bg-muted/70 hover:bg-muted'
                            : 'hover:bg-muted/50'
                        }`}
                        title={`${h.nombre} — ${DIAS_FULL[d]}`}
                      >
                        {checked
                          ? <CheckCircle2 className="w-4 h-4 text-primary" />
                          : <Circle className={`w-4 h-4 ${isToday ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                        }
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Descripción hábitos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">¿Por qué estos 5?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {HABITOS.map(h => (
            <div key={h.id} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{h.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{h.nombre}</p>
                  {(() => {
                    const done = Object.values(checks[h.id] ?? {}).filter(Boolean).length;
                    return done === 7 ? <Badge variant="default" className="text-xs">7/7 ✓</Badge> :
                           done >= 5  ? <Badge variant="secondary" className="text-xs">{done}/7</Badge> : null;
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">{h.descripcion}</p>
              </div>
            </div>
          ))}

          {mejorHabito && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
              <p className="text-sm">
                <strong>🏆 Mejor hábito esta semana:</strong> {mejorHabito.nombre} ({mejorHabito.pct}% de cumplimiento)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
