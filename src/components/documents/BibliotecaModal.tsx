import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BibliotecaModalProps = {
  src: string;
  openUrl: string;
  title: string;
};

/**
 * Renders a button that opens the external Biblioteca site inside a
 * full-screen modal. Using a modal prevents scroll jumping in the
 * parent page and contains all iframe quirks within its own viewport.
 */
export function BibliotecaModal({ src, openUrl, title }: BibliotecaModalProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    setLoaded(false);
    setShowFallback(false);
    clearTimer();
    fallbackTimerRef.current = window.setTimeout(() => setShowFallback(true), 4000);
    setOpen(true);
  }, [clearTimer]);

  const handleLoad = useCallback(() => {
    clearTimer();
    setShowFallback(false);
    requestAnimationFrame(() => setLoaded(true));
  }, [clearTimer]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        clearTimer();
      }
      setOpen(value);
    },
    [clearTimer]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 justify-center py-10 text-base"
          onClick={handleOpen}
        >
          <BookOpen className="h-5 w-5" />
          Abrir Biblioteca
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 gap-0 rounded-none sm:rounded-none">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border bg-card gap-2">
          <DialogTitle className="text-base font-semibold truncate">{title}</DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(openUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Nueva pestaña
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Iframe container */}
        <div className="relative flex-1 overflow-hidden bg-background">
          <iframe
            src={src}
            title={title}
            loading="eager"
            scrolling="yes"
            className={cn(
              "w-full h-full transition-opacity duration-500 ease-out",
              loaded ? "opacity-100" : "opacity-0"
            )}
            style={{ border: 0, willChange: "opacity" }}
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={handleLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads"
          />

          {/* Loading overlay */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 transition-opacity duration-300 ease-out",
              loaded ? "opacity-0" : "opacity-100"
            )}
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando biblioteca…</p>
            {showFallback && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Si no carga, usa el botón "Nueva pestaña".
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
