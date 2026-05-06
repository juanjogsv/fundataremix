import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BibliotecaIframeProps = {
  src: string;
  openUrl: string;
  title: string;
  heightClassName?: string;
};

/**
 * Wraps the external Biblioteca iframe with a smooth fade-in transition
 * after load, aiming to minimise flicker / white flashes when navigating.
 */
export function BibliotecaIframe({
  src,
  openUrl,
  title,
  heightClassName = "h-[calc(100vh-340px)] min-h-[500px]",
}: BibliotecaIframeProps) {
  const [loaded, setLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // Called on initial mount & when src changes
  const handleStartLoad = useCallback(() => {
    setLoaded(false);
    setShowFallback(false);
    clearTimer();
    // After 4s without load, hint the user about fallback
    fallbackTimerRef.current = window.setTimeout(() => setShowFallback(true), 4000);
  }, [clearTimer]);

  const handleLoad = useCallback(() => {
    clearTimer();
    setShowFallback(false);
    // Delay reveal for a smoother transition
    requestAnimationFrame(() => setLoaded(true));
  }, [clearTimer]);

  // We keep the iframe mounted, never unmount on navigation
  // so there's no re-render flicker.
  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-border bg-card md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sugerencia: si una entrada parpadea o queda en blanco, ábrela en nueva pestaña.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="md:shrink-0"
          onClick={() => window.open(openUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir en nueva pestaña
        </Button>
      </div>

      {/* Iframe container */}
      <div className="relative overflow-hidden">
        <iframe
          key={src}
          src={src}
          title={title}
          loading="eager"
          scrolling="yes"
          className={cn(
            "w-full transition-opacity duration-500 ease-out",
            heightClassName,
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            border: 0,
            willChange: "opacity",
          }}
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleLoad}
          onLoadStart={handleStartLoad as never}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-top-navigation-by-user-activation"
        />

        {/* Overlay while loading */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 transition-opacity duration-300 ease-out",
            loaded ? "opacity-0" : "opacity-100"
          )}
        >
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando biblioteca…</p>
          {showFallback && (
            <p className="text-xs text-muted-foreground">
              Si no carga, usa "Abrir en nueva pestaña".
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
