import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SyncMeta {
  last_file_name: string | null;
  last_sync_at: string | null;
  rows_ingested: number | null;
  status: string | null;
  error_message: string | null;
}

export default function BdFundataSyncPanel() {
  const { toast } = useToast();
  const [meta, setMeta] = useState<SyncMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    const { data } = await (supabase as any)
      .from("bd_sync_meta")
      .select("last_file_name,last_sync_at,rows_ingested,status,error_message")
      .eq("id", 1)
      .maybeSingle();
    setMeta(data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const runSync = async (permissive: boolean) => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("bd-fundata-sync", {
        body: {},
        method: "POST",
        headers: {},
        // pasar permissive como query param no es soportado por invoke,
        // por eso construimos la URL directamente cuando aplique.
      } as any);
      if (permissive) {
        // fallback: fetch directo con query param
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bd-fundata-sync?permissive=1`;
        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
        });
      }
      if (error) throw error;
      toast({ title: "Sincronización disparada", description: "Puede tardar 1–2 minutos. Refresca el estado." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setSyncing(false);
      setTimeout(fetchStatus, 3000);
    }
  };

  const StatusIcon = () => {
    if (!meta?.status) return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    if (meta.status === "ok") return <CheckCircle2 className="h-5 w-5 text-luker-green" />;
    if (meta.status === "ok_with_warnings") return <AlertTriangle className="h-5 w-5 text-luker-orange" />;
    if (meta.status === "running") return <Loader2 className="h-5 w-5 animate-spin text-luker-teal" />;
    return <XCircle className="h-5 w-5 text-luker-red" />;
  };

  return (
    <Card className="border-luker-teal/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon />
          Sincronización BDM Fundata (Google Drive)
        </CardTitle>
        <CardDescription>
          Lee el último <code>AAAAMMDD_datos_fundata.xlsx</code> desde <code>bd_fundata/data/</code> y los catálogos de <code>bd_fundata/catalogos/</code>, validando integridad referencial según protocolo TEC_PROTOCOLO-BD-002.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : meta ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Archivo</div>
              <div className="font-mono">{meta.last_file_name ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Última sync</div>
              <div>{meta.last_sync_at ? new Date(meta.last_sync_at).toLocaleString() : "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Filas ingeridas</div>
              <div className="font-semibold">{meta.rows_ingested?.toLocaleString() ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Estado</div>
              <div className="font-semibold capitalize">{meta.status ?? "never_synced"}</div>
            </div>
          </div>
        ) : null}

        {meta?.error_message && (
          <div className="rounded-md bg-luker-orange/10 border border-luker-orange/30 p-3 text-xs">
            <div className="font-semibold text-luker-orange mb-1">Detalle</div>
            <div className="font-mono whitespace-pre-wrap break-all">{meta.error_message}</div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runSync(false)} disabled={syncing} className="bg-luker-teal hover:bg-luker-teal/90">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sincronizar (estricto)
          </Button>
          <Button onClick={() => runSync(true)} disabled={syncing} variant="outline">
            Sincronizar (permissive, filtra huérfanos)
          </Button>
          <Button onClick={fetchStatus} variant="ghost" size="sm">
            Refrescar estado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
