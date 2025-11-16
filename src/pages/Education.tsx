import { useState } from 'react';
import { BookOpen, Lightbulb, TrendingUp, Apple, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  conceptosEducativos,
  getConceptosPorCategoria,
  getConceptosCriticos,
  type ConceptoEducativo
} from '@/data/educacion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const iconoCategoria = {
  tecnica: BookOpen,
  nutricion: Apple,
  progresion: TrendingUp,
  anatomia: Lightbulb,
  mitos: XCircle
};

const colorCategoria = {
  tecnica: 'bg-blue-500',
  nutricion: 'bg-green-500',
  progresion: 'bg-purple-500',
  anatomia: 'bg-yellow-500',
  mitos: 'bg-red-500'
};

const colorImportancia = {
  critica: 'destructive',
  alta: 'default',
  media: 'secondary'
} as const;

export default function Education() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<ConceptoEducativo['categoria'] | 'todos'>('todos');
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<ConceptoEducativo | null>(null);

  // Filtrar conceptos
  const conceptosFiltrados = conceptosEducativos.filter(concepto => {
    const matchBusqueda = busqueda === '' ||
      concepto.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      concepto.resumen.toLowerCase().includes(busqueda.toLowerCase());

    const matchCategoria = categoriaFiltro === 'todos' || concepto.categoria === categoriaFiltro;

    return matchBusqueda && matchCategoria;
  });

  const conceptosCriticos = getConceptosCriticos();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Educación GymBro</h1>
        <p className="text-muted-foreground text-lg">
          "Usuarios informados entrenan mejor y más seguro" - ADN de GymBro
        </p>
      </div>

      {/* Conceptos Críticos Destacados */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-2xl font-bold">Conceptos Críticos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conceptosCriticos.map((concepto) => {
            const Icono = iconoCategoria[concepto.categoria];
            return (
              <Card
                key={concepto.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-red-200 dark:border-red-900"
                onClick={() => setConceptoSeleccionado(concepto)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${colorCategoria[concepto.categoria]} text-white`}>
                        <Icono className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{concepto.titulo}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      CRÍTICO
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {concepto.resumen}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="mb-6 space-y-4">
        <Input
          type="text"
          placeholder="Buscar conceptos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={categoriaFiltro === 'todos' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoriaFiltro('todos')}
          >
            Todos ({conceptosEducativos.length})
          </Badge>
          {(['tecnica', 'anatomia', 'progresion', 'nutricion', 'mitos'] as const).map((cat) => {
            const conceptos = getConceptosPorCategoria(cat);
            const Icono = iconoCategoria[cat];
            return (
              <Badge
                key={cat}
                variant={categoriaFiltro === cat ? 'default' : 'outline'}
                className="cursor-pointer flex items-center gap-1"
                onClick={() => setCategoriaFiltro(cat)}
              >
                <Icono className="w-3 h-3" />
                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({conceptos.length})
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Lista de Conceptos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conceptosFiltrados.map((concepto) => {
          const Icono = iconoCategoria[concepto.categoria];
          return (
            <Card
              key={concepto.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setConceptoSeleccionado(concepto)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${colorCategoria[concepto.categoria]} text-white`}>
                      <Icono className="w-4 h-4" />
                    </div>
                  </div>
                  {concepto.importancia === 'critica' && (
                    <Badge variant={colorImportancia[concepto.importancia]} className="shrink-0">
                      CRÍTICO
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{concepto.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 text-sm">
                  {concepto.resumen}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {conceptosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron conceptos con esos criterios.</p>
        </div>
      )}

      {/* Modal de Detalle */}
      <Dialog open={!!conceptoSeleccionado} onOpenChange={(open) => !open && setConceptoSeleccionado(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {conceptoSeleccionado && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  {(() => {
                    const Icono = iconoCategoria[conceptoSeleccionado.categoria];
                    return (
                      <div className={`p-3 rounded-lg ${colorCategoria[conceptoSeleccionado.categoria]} text-white`}>
                        <Icono className="w-6 h-6" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{conceptoSeleccionado.titulo}</DialogTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {conceptoSeleccionado.categoria}
                      </Badge>
                      <Badge variant={colorImportancia[conceptoSeleccionado.importancia]}>
                        {conceptoSeleccionado.importancia === 'critica' ? 'CRÍTICO' :
                         conceptoSeleccionado.importancia === 'alta' ? 'ALTA' : 'MEDIA'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogDescription className="text-base font-medium">
                  {conceptoSeleccionado.resumen}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Contenido */}
                <div className="prose dark:prose-invert max-w-none">
                  {conceptoSeleccionado.contenido.map((linea, idx) => {
                    if (linea === '') return <div key={idx} className="h-2" />;

                    // Detectar secciones con emojis
                    if (linea.startsWith('🎯') || linea.startsWith('⚠️') || linea.startsWith('✅') ||
                        linea.startsWith('❌') || linea.startsWith('💡') || linea.startsWith('📊') ||
                        linea.startsWith('🔧') || linea.startsWith('📈') || linea.startsWith('💪') ||
                        linea.startsWith('🔴') || linea.startsWith('🔵') || linea.startsWith('🟡')) {
                      return (
                        <h3 key={idx} className="text-lg font-bold mt-4 mb-2">
                          {linea}
                        </h3>
                      );
                    }

                    // Detectar items de lista
                    if (linea.startsWith('• ')) {
                      return (
                        <li key={idx} className="ml-4">
                          {linea.substring(2)}
                        </li>
                      );
                    }

                    // Texto normal
                    return (
                      <p key={idx} className="text-sm leading-relaxed">
                        {linea}
                      </p>
                    );
                  })}
                </div>

                {/* Ejemplos */}
                {conceptoSeleccionado.ejemplos && conceptoSeleccionado.ejemplos.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Ejemplos Prácticos
                    </h4>
                    <ul className="space-y-2">
                      {conceptoSeleccionado.ejemplos.map((ejemplo, idx) => (
                        <li key={idx} className="text-sm">• {ejemplo}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error Común */}
                {conceptoSeleccionado.errorComun && (
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      Error Común a Evitar
                    </h4>
                    <p className="text-sm">{conceptoSeleccionado.errorComun}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
