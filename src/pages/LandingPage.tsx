import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Zap,
  BarChart2,
  Brain,
  Apple,
  Trophy,
  ChevronRight,
  Users,
  Activity,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">GymBro</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Características</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">Cómo funciona</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Planes</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Empezar gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute -top-10 -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-8 border border-primary/20">
            <Zap className="h-4 w-4" />
            Tu entrenador personal potenciado por IA
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Entrena más inteligente.
            <br />
            <span className="text-primary">Alcanza tus metas.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            GymBro combina IA avanzada con seguimiento completo para crear rutinas personalizadas,
            monitorear tu progreso y optimizar tu nutrición.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="text-base px-8 h-14 shadow-lg shadow-primary/25 gap-2">
                Empezar gratis
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8 h-14 gap-2">
                Empezar ahora
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            <div>
              <div className="text-3xl font-extrabold text-primary">10k+</div>
              <div className="text-xs text-muted-foreground mt-1">Usuarios activos</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">500+</div>
              <div className="text-xs text-muted-foreground mt-1">Ejercicios</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">4.9★</div>
              <div className="text-xs text-muted-foreground mt-1">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Una plataforma completa para gestionar tu entrenamiento, nutrición y progreso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Rutinas con IA',
                desc: 'Genera rutinas personalizadas basadas en tus objetivos, nivel y disponibilidad usando inteligencia artificial avanzada.',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
              },
              {
                icon: BarChart2,
                title: 'Seguimiento de progreso',
                desc: 'Visualiza tu evolución con gráficos detallados de peso, medidas corporales y rendimiento en cada ejercicio.',
                color: 'text-green-500',
                bg: 'bg-green-500/10',
              },
              {
                icon: Apple,
                title: 'Nutrición inteligente',
                desc: 'Calcula tus macros y calorías según tu metabolismo y objetivos. Optimiza tu dieta para máximos resultados.',
                color: 'text-orange-500',
                bg: 'bg-orange-500/10',
              },
              {
                icon: Activity,
                title: 'Sesiones en tiempo real',
                desc: 'Registra tus entrenamientos en vivo con temporizador de descanso, progresión automática y notas de ejercicios.',
                color: 'text-red-500',
                bg: 'bg-red-500/10',
              },
              {
                icon: Trophy,
                title: 'Logros y metas',
                desc: 'Mantente motivado con un sistema de logros, rachas de entrenamiento y metas personalizadas.',
                color: 'text-yellow-500',
                bg: 'bg-yellow-500/10',
              },
              {
                icon: Users,
                title: 'Comparte tu progreso',
                desc: 'Comparte tus rutinas y estadísticas con amigos. Inspírate y motívate con la comunidad GymBro.',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`${bg} ${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Cómo funciona</h2>
            <p className="text-muted-foreground text-lg">Empieza a entrenar en 3 simples pasos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Crea tu perfil',
                desc: 'Configura tu perfil con tus objetivos, nivel de fitness, disponibilidad horaria y preferencias.',
              },
              {
                step: '02',
                title: 'Genera tu rutina',
                desc: 'Nuestra IA crea una rutina completamente personalizada y optimizada para tus metas específicas.',
              },
              {
                step: '03',
                title: 'Entrena y progresa',
                desc: 'Sigue tu plan, registra cada sesión y mira cómo mejoras semana a semana con datos reales.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="text-7xl font-black text-primary/15 mb-4 leading-none">{step}</div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planes simples y transparentes</h2>
            <p className="text-muted-foreground text-lg">Sin sorpresas. Cancela cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gratis</div>
              <div className="text-4xl font-extrabold mb-1">0€</div>
              <div className="text-muted-foreground text-sm mb-6">Para siempre</div>
              <ul className="space-y-3 text-sm mb-8">
                {['Rutinas básicas', 'Registro de entrenamientos', 'Seguimiento de peso', 'Hasta 3 rutinas'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full">Empezar gratis</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-3 right-4 bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">POPULAR</div>
              <div className="text-sm font-semibold opacity-75 uppercase tracking-wider mb-2">Pro</div>
              <div className="text-4xl font-extrabold mb-1">9.99€</div>
              <div className="opacity-75 text-sm mb-6">por mes</div>
              <ul className="space-y-3 text-sm mb-8">
                {[
                  'Todo lo del plan Gratis',
                  'Rutinas ilimitadas con IA',
                  'Análisis nutricional avanzado',
                  'Seguimiento corporal completo',
                  'Asistente GymBro 24/7',
                  'Sincronización en la nube',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 opacity-90">
                    <Check className="h-4 w-4 opacity-80 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full font-semibold">Empezar ahora</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para transformarte?</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Únete a miles de personas que ya están alcanzando sus metas con GymBro.
            Completamente gratis para empezar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="text-base px-10 h-14 shadow-lg shadow-primary/25 gap-2">
                Empezar ahora
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-semibold">GymBro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GymBro. Tu entrenador personal inteligente.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
