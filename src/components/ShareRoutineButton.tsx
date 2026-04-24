import { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { appwriteDbHelpers } from '@/db/appwriteDb';
import type { RutinaSemanal } from '@/types';

interface Props {
  rutina: RutinaSemanal;
  userName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

export default function ShareRoutineButton({ rutina, userName, variant = 'outline', size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setOpen(true);
    if (shareUrl) return;

    setLoading(true);
    try {
      const shared = await appwriteDbHelpers.shareRoutine(rutina, userName);
      const url = `${window.location.origin}/split/${shared.slug}`;
      setShareUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleShare}>
        <Share2 className="w-4 h-4 mr-1.5" />
        Compartir
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Compartir rutina</DialogTitle>
            <DialogDescription>
              Cualquiera con este link puede ver e importar tu rutina.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : shareUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <span className="text-sm text-muted-foreground flex-1 truncate">{shareUrl}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-7 w-7"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button className="w-full" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-destructive text-center py-4">
              Error generando el link. Inténtalo de nuevo.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
