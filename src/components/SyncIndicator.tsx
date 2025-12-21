import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { dbHelpers } from '@/db';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SyncIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

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

    const handleSync = async () => {
        if (!isOnline) return;
        setIsSyncing(true);
        try {
            await dbHelpers.sync();
            const count = await dbHelpers.getPendingSyncCount();
            setPendingCount(count);
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
                        <p>{pendingCount} cambios pendientes de subir. Click para sincronizar.</p>
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
