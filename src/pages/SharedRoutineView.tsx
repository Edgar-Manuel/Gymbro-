import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appwriteDbHelpers } from '@/db/appwriteDb';
import { dbHelpers } from '@/db';
import { useAuth } from '@/contexts/AuthContext';

import type { SharedRoutine } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Download, Calendar, Clock, User, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { ID } from 'appwrite';

export default function SharedRoutineView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();


  const [shared, setShared] = useState<SharedRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    appwriteDbHelpers.getSharedRoutineBySlug(slug).then((result) => {
      if (result) setShared(result);
      else setError('Esta rutina no existe o ha sido eliminada.');
      setLoading(false);
    });
  }, [slug]);

  const handleImport = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setImporting(true);
    try {
      const userId = await appwriteDbHelpers.getCurrentUserId();
      const rutina = {
        ...shared!.datos,
        id: ID.unique(),
        userId,
        activa: false,
        fechaCreacion: new Date(),
        nombre: `${shared!.datos.nombre} (importada)`,
      };
      await dbHelpers.createRoutine(rutina);
      setImported(true);
    } catch (e) {
      console.error(e);
      setError('Error al importar la rutina. Inténtalo de nuevo.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Dumbbell className="w-10 h-10 animate-pulse text-primary" />
      </div>
    );
  }

  if (error || !shared) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 p-8">
        <Dumbbell className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Rutina no encontrada</h2>
        <p className="text-muted-foreground text-center">{error || 'Esta rutina no existe.'}</p>
        <Button onClick={() => navigate('/')}>Ir a GymBro</Button>
      </div>
    );
  }

  const rutina = shared.datos;
  const dias = rutina.diasRutina || rutina.dias || [];

  const objetivoLabel: Record<string, string> = {
    hipertrofia: 'Hipertrofia',
    fuerza: 'Fuerza',
    resistencia: 'Resistencia',
    perdida_grasa: 'Pérdida de grasa',
  };

  const nivelColor: Record<string, string> = {
    principiante: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermedio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    avanzado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">GymBro</span>
          </div>
          {!isAuthenticated && (
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Routine header card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl truncate">{rutina.nombre}</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>por <strong>{shared.userName}</strong></span>
                </div>
              </div>
              {rutina.nivel && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${nivelColor[rutina.nivel] || ''}`}>
                  {rutina.nivel}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {rutina.objetivo && (
                <div className="flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>{objetivoLabel[rutina.objetivo] || rutina.objetivo}</span>
                </div>
              )}
              {rutina.diasPorSemana && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{rutina.diasPorSemana} días/semana</span>
                </div>
              )}
              {rutina.duracionTotal && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>~{rutina.duracionTotal} min/sesión</span>
                </div>
              )}
            </div>

            {imported ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>Rutina importada — encuéntrala en tu generador de rutinas</span>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleImport}
                disabled={importing}
              >
                <Download className="w-4 h-4 mr-2" />
                {importing
                  ? 'Importando...'
                  : isAuthenticated
                  ? 'Importar esta rutina'
                  : 'Inicia sesión para importar'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Days */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Programa semanal</h3>
          {dias.map((dia, idx) => (
            <Card key={idx} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
              >
                <div>
                  <div className="font-semibold">{dia.nombre}</div>
                  <div className="text-sm text-muted-foreground">
                    {dia.ejercicios.length} ejercicios · ~{dia.duracionEstimada} min
                  </div>
                </div>
                {expandedDay === idx ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {expandedDay === idx && (
                <CardContent className="pt-0 pb-4 space-y-2">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dia.grupos?.map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs capitalize">{g}</Badge>
                    ))}
                  </div>
                  {dia.ejercicios.map((ej, ejIdx) => (
                    <div
                      key={ejIdx}
                      className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                    >
                      <span className="font-medium capitalize">
                        {ej.ejercicio?.nombre || ej.ejercicioId}
                      </span>
                      <span className="text-muted-foreground shrink-0 ml-3">
                        {ej.seriesObjetivo} × {Array.isArray(ej.repsObjetivo)
                          ? `${ej.repsObjetivo[0]}-${ej.repsObjetivo[1]}`
                          : ej.repsObjetivo}
                      </span>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground pb-8">
          Compartido con GymBro · {new Date(shared.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>
    </div>
  );
}
