import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, XCircle, ChevronDown, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrphanEntry { code: string; rows: number }
interface Diagnostics {
  file_rows: number;
  ingested: number;
  filtered: number;
  orphans_indicadores: OrphanEntry[];
  orphans_entidades: OrphanEntry[];
}
interface SyncMeta {
  last_file_name: string | null;
  last_sync_at: string | null;
  rows_ingested: number | null;
  status: string | null;
  error_message: string | null;
  diagnostics: Diagnostics | null;
}

export default function BdFundataSyncPanel() {
  const { toast } = useToast();
  const [meta, setMeta] = useState<SyncMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    const { data } = await (supabase as any)
      .from("bd_sync_meta")
      .select("last_file_name,last_sync_at,rows_ingested,status,error_message,diagnostics")
      .eq("id", 1)
      .maybeSingle();
    setMeta(data ?? null);
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const runSync = async (strict: boolean) => {
    setSyncing(true);
    try {
      if (!strict) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bd-fundata-sync`;
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: "{}",
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bd-fundata-sync?strict=1`;
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: "{}",
        });
        if (!res.ok) throw new Error(await res.text());
        const payload = await res.json().catch(() => null);
        if (payload && payload.ok === false) {
          toast({ title: "Validación con problemas", description: payload.error, variant: "destructive" });
        }
      }
      toast({ title: "Sincronización finalizada", description: "El estado y el detalle de problemas ya quedaron actualizados." });
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

  const copyCodes = async (entries: OrphanEntry[]) => {
    await navigator.clipboard.writeText(entries.map(e => e.code).join("\n"));
    toast({ title: "Copiado", description: `${entries.length} códigos copiados al portapapeles.` });
  };

  const downloadCsv = () => {
    if (!meta?.diagnostics) return;
    const rows: string[] = ["tipo,codigo,filas_descartadas"];
    meta.diagnostics.orphans_entidades.forEach(o => rows.push(`entidad,${o.code},${o.rows}`));
    meta.diagnostics.orphans_indicadores.forEach(o => rows.push(`indicador,${o.code},${o.rows}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `huerfanos_${meta.last_file_name ?? "sync"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const diag = meta?.diagnostics;
  const totalRows = diag?.file_rows ?? 0;
  const lossPct = totalRows > 0 ? ((diag!.filtered / totalRows) * 100).toFixed(1) : "0";
  const hasOrphans = !!diag && (diag.orphans_entidades.length > 0 || diag.orphans_indicadores.length > 0);

  return (
    <Card className="border-luker-teal/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon />
          Sincronización BDM Fundata (Google Drive)
        </CardTitle>
        <CardDescription>
          Lee el último <code>AAAAMMDD*.xlsx</code> desde la carpeta de datos y los catálogos, validando integridad referencial según protocolo TEC_PROTOCOLO-BD-002.
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

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runSync(false)} disabled={syncing} className="bg-luker-teal hover:bg-luker-teal/90">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sincronizar datos válidos
          </Button>
          <Button onClick={() => runSync(true)} disabled={syncing} variant="outline">
            Validar estricto
          </Button>
          <Button onClick={fetchStatus} variant="ghost" size="sm">Refrescar estado</Button>
        </div>

        {hasOrphans && diag && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-luker-orange" />
                  Detalle de problemas ({diag.orphans_entidades.length} entidades + {diag.orphans_indicadores.length} indicadores huérfanos)
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm rounded-md border p-3 bg-muted/30">
                <div>
                  <div className="text-muted-foreground text-xs">Filas en archivo</div>
                  <div className="font-semibold">{diag.file_rows.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Ingeridas</div>
                  <div className="font-semibold text-luker-green">{diag.ingested.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Descartadas</div>
                  <div className="font-semibold text-luker-orange">{diag.filtered.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">% pérdida</div>
                  <div className="font-semibold text-luker-orange">{lossPct}%</div>
                </div>
              </div>

              <Button onClick={downloadCsv} variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" /> Descargar CSV de huérfanos
              </Button>

              <OrphanTable
                title="Entidades huérfanas (cod_entidad no está en catalogo_entidades)"
                entries={diag.orphans_entidades}
                onCopy={() => copyCodes(diag.orphans_entidades)}
              />
              <OrphanTable
                title="Indicadores huérfanos (cod_indicador no está en catalogo_indicadores)"
                entries={diag.orphans_indicadores}
                onCopy={() => copyCodes(diag.orphans_indicadores)}
              />

              <div className="text-xs text-muted-foreground rounded-md border border-luker-teal/30 p-3 bg-luker-teal/5">
                <div className="font-semibold text-foreground mb-1">Cómo corregir</div>
                <ol className="list-decimal ml-4 space-y-0.5">
                  <li>Copia los códigos huérfanos con más filas (mayor impacto).</li>
                  <li>Agrégalos al Google Sheet <code>catalogo_entidades</code> (o <code>catalogo_indicadores</code>) en Drive con su nombre correspondiente.</li>
                  <li>Vuelve a ejecutar la sincronización — cada iteración recupera más filas.</li>
                </ol>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {meta?.error_message && !hasOrphans && (
          <div className="rounded-md bg-luker-orange/10 border border-luker-orange/30 p-3 text-xs">
            <div className="font-semibold text-luker-orange mb-1">Detalle</div>
            <div className="font-mono whitespace-pre-wrap break-all">{meta.error_message}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrphanTable({ title, entries, onCopy }: { title: string; entries: OrphanEntry[]; onCopy: () => void }) {
  if (!entries.length) return null;
  const totalRows = entries.reduce((s, e) => s + e.rows, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">
          {title} <span className="text-muted-foreground font-normal">— {entries.length} códigos · {totalRows.toLocaleString()} filas descartadas</span>
        </div>
        <Button onClick={onCopy} variant="ghost" size="sm">
          <Copy className="h-3 w-3 mr-1" /> Copiar códigos
        </Button>
      </div>
      <div className="max-h-64 overflow-auto rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left px-3 py-2">Código</th>
              <th className="text-right px-3 py-2">Filas descartadas</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.code} className="border-t">
                <td className="px-3 py-1.5 font-mono">{e.code}</td>
                <td className="px-3 py-1.5 text-right">{e.rows.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
