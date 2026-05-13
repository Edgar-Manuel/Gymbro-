import { useEffect, useRef, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { dbHelpers } from '@/db';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function SyncIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastErrors, setLastErrors] = useState<string[]>([]);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Poll for pending count every 5 seconds
        const interval = setInterval(async () => {
            const count = await dbHelpers.getPendingSyncCount();
            setPendingCount(count);
        }, 5000);

        // Initial check
        dbHelpers.getPendingSyncCount().then(setPendingCount);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const handleClearStuck = async () => {
        await dbHelpers.clearStuckPending();
        const count = await dbHelpers.getPendingSyncCount();
        setPendingCount(count);
        setLastErrors([]);
        toast.success('Elementos bloqueados liberados');
    };

    const handleSync = async () => {
        if (!isOnline) return;
        setIsSyncing(true);
        try {
            const result = await dbHelpers.sync();
            const count = await dbHelpers.getPendingSyncCount();
            setPendingCount(count);
            setLastErrors(result.errorMessages);

            if (result.errors > 0) {
                const firstError = result.errorMessages[0] ?? '';
                toast.error(`Sincronización con errores`, {
                    description: result.synced > 0
                        ? `${result.synced} subidos · ${result.errors} fallidos: ${firstError}`
                        : `${result.errors} fallidos: ${firstError}`,
                    duration: 8000,
                });
            } else if (result.synced > 0) {
                toast.success(`${result.synced} ${result.synced === 1 ? 'cambio sincronizado' : 'cambios sincronizados'}`);
                if (count === 0) setLastErrors([]); // limpia errores antiguos si todo está al día
            } else if (count === 0) {
                toast.info('Todo ya estaba al día');
                setLastErrors([]);
            }
        } catch (e) {
            // Excepción inesperada (no controlada por SyncManager)
            console.error('[SyncIndicator] sync threw:', e);
            const msg = e instanceof Error ? e.message : String(e);
            setLastErrors([msg]);
            toast.error('Error al sincronizar', { description: msg });
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
                    <TooltipContent>
                        <p>Modo Offline - Los cambios se guardarán localmente</p>
                    </TooltipContent>
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

    if (pendingCount > 0) {
        const hasErrors = lastErrors.length > 0;
        const tone = hasErrors ? 'text-destructive' : 'text-amber-500';
        const dot = hasErrors ? 'bg-destructive' : 'bg-amber-500';
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            className={`${tone} relative`}
                            onClick={handleSync}
                            onPointerDown={() => { longPressTimer.current = setTimeout(handleClearStuck, 800); }}
                            onPointerUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                            onPointerLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                        >
                            {hasErrors ? <AlertTriangle className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                            <span className={`absolute top-1 right-1 h-2 w-2 rounded-full ${dot} animate-pulse`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {hasErrors ? (
                            <div className="max-w-xs">
                                <p className="font-medium">{pendingCount} pendientes — {lastErrors.length} {lastErrors.length === 1 ? 'error' : 'errores'}</p>
                                {lastErrors.slice(0, 2).map((e, i) => (
                                    <p key={i} className="text-xs opacity-70 mt-0.5 break-words">{e}</p>
                                ))}
                                <p className="text-xs opacity-50 mt-1">Click para reintentar · mantén para limpiar</p>
                            </div>
                        ) : (
                            <p>{pendingCount} cambios pendientes de subir. Click para sincronizar.</p>
                        )}
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
                <TooltipContent>
                    <p>Todo sincronizado con la nube</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
