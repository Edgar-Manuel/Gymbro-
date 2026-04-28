import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { dbHelpers } from '@/db';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Traduce el código de error Appwrite a un mensaje útil
function interpretarError(error: string): { titulo: string; accion: string } {
    if (error.includes('401') || error.includes('user_unauthorized') || error.includes('Unauthorized')) {
        return {
            titulo: 'No autorizado (401)',
            accion: 'La sesión expiró o el Project ID es incorrecto. Cierra sesión y vuelve a entrar.',
        };
    }
    if (error.includes('404') || error.includes('not_found') || error.includes('Database not found') || error.includes('Collection not found')) {
        return {
            titulo: 'Base de datos no encontrada (404)',
            accion: 'La base de datos "gymbro-db" o una colección no existe en Appwrite. Ejecuta el script de configuración.',
        };
    }
    if (error.includes('403') || error.includes('Forbidden') || error.includes('missing scope')) {
        return {
            titulo: 'Sin permisos (403)',
            accion: 'Las colecciones de Appwrite no tienen permiso para usuarios autenticados. Añade permisos read/write a "Any authenticated user" en cada colección.',
        };
    }
    if (error.includes('placeholder') || error.includes('project_not_found')) {
        return {
            titulo: 'Project ID incorrecto',
            accion: 'El VITE_APPWRITE_PROJECT_ID no apunta a ningún proyecto. Comprueba el .env y reconstruye la app.',
        };
    }
    return {
        titulo: 'Error de conexión',
        accion: error,
    };
}

export function SyncIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const interval = setInterval(async () => {
            const count = await dbHelpers.getPendingSyncCount();
            setPendingCount(count);
        }, 5000);

        dbHelpers.getPendingSyncCount().then(setPendingCount);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const handleSync = async () => {
        if (!isOnline) return;
        setIsSyncing(true);
        setSyncError(null);
        try {
            const result = await dbHelpers.sync();
            const count = await dbHelpers.getPendingSyncCount();
            setPendingCount(count);
            if (result && result.failed > 0 && result.synced === 0) {
                setSyncError(result.lastError ?? 'Error desconocido');
            }
        } catch (e) {
            setSyncError(String(e));
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isOnline) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <CloudOff className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Modo Offline — cambios guardados localmente</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (isSyncing) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <RefreshCw className="h-5 w-5 animate-spin" />
            </Button>
        );
    }

    if (syncError) {
        const { titulo, accion } = interpretarError(syncError);
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSync}
                            className="text-destructive relative"
                        >
                            <AlertCircle className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs space-y-1">
                        <p className="font-semibold text-destructive">{titulo}</p>
                        <p className="text-xs">{accion}</p>
                        <p className="text-[10px] text-muted-foreground italic">Click para reintentar</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (pendingCount > 0) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleSync} className="text-amber-500 relative">
                            <RefreshCw className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{pendingCount} cambios pendientes. Click para sincronizar.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-green-500/70 hover:text-green-500">
                        <Cloud className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Todo sincronizado con la nube ✓</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
