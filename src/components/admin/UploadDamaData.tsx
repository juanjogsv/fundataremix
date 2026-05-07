import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Loader2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Phase = "idle" | "validating" | "uploading" | "processing" | "syncing" | "done" | "error";

interface UploadSummary {
  catalog: number;
  entities: number;
  data: number;
}

const REQUIRED_DATA_COLS = ["cod_indicador", "cod_entidad", "anio", "valor"];
const REQUIRED_SHEETS = ["datos", "catalogo_indicadores", "catalogo_entidades"];
const CHUNK_SIZE = 500;

const UploadDamaData = () => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const isBusy = ["validating", "uploading", "processing", "syncing"].includes(phase);

  const reset = () => {
    setPhase("idle");
    setProgress(0);
    setProgressLabel("");
    setErrorMsg(null);
    setSummary(null);
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setErrorMsg(null);
    setSummary(null);
    setProgress(0);

    try {
      // 1) Parse workbook in browser
      setPhase("validating");
      setProgressLabel("Leyendo y validando archivo…");
      setProgress(5);

      const buf = new Uint8Array(await file.arrayBuffer());
      const wb = XLSX.read(buf, { type: "array" });

      for (const s of REQUIRED_SHEETS) {
        if (!wb.SheetNames.includes(s)) {
          throw new Error(`Falta la hoja "${s}". El archivo debe contener: ${REQUIRED_SHEETS.join(", ")}.`);
        }
      }

      const cat = XLSX.utils.sheet_to_json<any>(wb.Sheets["catalogo_indicadores"], { defval: null });
      const ent = XLSX.utils.sheet_to_json<any>(wb.Sheets["catalogo_entidades"], { defval: null });
      const dat = XLSX.utils.sheet_to_json<any>(wb.Sheets["datos"], { defval: null });

      if (!dat.length) throw new Error('La hoja "datos" está vacía.');
      const cols = Object.keys(dat[0] ?? {});
      const missing = REQUIRED_DATA_COLS.filter((c) => !cols.includes(c));
      if (missing.length) {
        throw new Error(`La hoja "datos" no contiene las columnas requeridas: ${missing.join(", ")}.`);
      }

      // 2) Build payloads
      const catRows = cat.map((r) => ({
        cod_indicador: String(r.cod_indicador ?? "").trim(),
        indicador: r.indicador ?? null,
        dimension: r.dimension ?? null,
        seccion: r.seccion ?? null,
        periodicidad: r.periodicidad ?? null,
        fuente: r.fuente ?? null,
        unidad_medida: r.unidad_medida ?? null,
      })).filter((r) => r.cod_indicador);

      const entMap = new Map<string, string>();
      for (const r of ent) {
        const code = String(r.cod_entidad ?? "").trim();
        if (code && !entMap.has(code)) entMap.set(code, String(r.entidad ?? "").trim());
      }
      const entRows = [...entMap.entries()].map(([cod_entidad, entidad]) => ({ cod_entidad, entidad }));

      const dataRows = dat.map((r) => ({
        cod_indicador: String(r.cod_indicador ?? "").trim(),
        cod_entidad: String(r.cod_entidad ?? "").trim(),
        anio: Number(r.anio),
        categoria: r.categoria != null && r.categoria !== "" ? String(r.categoria) : null,
        categoria_2: r.categoria_2 != null && r.categoria_2 !== "" ? String(r.categoria_2) : null,
        valor: r.valor != null && r.valor !== "" ? Number(r.valor) : null,
        fecha_actualizacion: r.fecha_actualizacion
          ? new Date(r.fecha_actualizacion).toISOString().slice(0, 10)
          : null,
      })).filter((r) => r.cod_indicador && r.cod_entidad && !Number.isNaN(r.anio));

      // 3) Replace tables (delete + chunked insert) directly via SDK
      setPhase("uploading");
      setProgressLabel("Limpiando tablas previas…");
      setProgress(12);

      const del1 = await supabase.from("dama_data").delete().not("id", "is", null);
      if (del1.error) throw del1.error;
      const del2 = await supabase.from("dama_catalog").delete().neq("cod_indicador", "__never__");
      if (del2.error) throw del2.error;
      const del3 = await supabase.from("dama_entities").delete().neq("cod_entidad", "__never__");
      if (del3.error) throw del3.error;

      setProgressLabel(`Cargando ${catRows.length} indicadores…`);
      setProgress(18);
      if (catRows.length) {
        const { error } = await supabase.from("dama_catalog").insert(catRows);
        if (error) throw error;
      }

      setProgressLabel(`Cargando ${entRows.length} entidades…`);
      setProgress(22);
      if (entRows.length) {
        const { error } = await supabase.from("dama_entities").insert(entRows);
        if (error) throw error;
      }

      setPhase("processing");
      let inserted = 0;
      const total = dataRows.length;
      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = dataRows.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from("dama_data").insert(chunk);
        if (error) throw error;
        inserted += chunk.length;
        const pct = 25 + Math.round((inserted / total) * 65);
        setProgress(Math.min(pct, 90));
        setProgressLabel(`Insertando datos… ${inserted.toLocaleString()} / ${total.toLocaleString()}`);
      }

      // 4) Sync legacy
      setPhase("syncing");
      setProgressLabel("Sincronizando vistas legacy…");
      setProgress(95);
      const { error: rpcErr } = await supabase.rpc("sync_legacy_from_dama" as any);
      if (rpcErr) throw rpcErr;

      setSummary({ catalog: catRows.length, entities: entRows.length, data: inserted });
      setProgress(100);
      setPhase("done");
      setProgressLabel("Carga completada");

      toast({
        title: "Base Maestra DAMA actualizada",
        description: `${catRows.length} indicadores · ${entRows.length} entidades · ${inserted} filas.`,
      });
    } catch (e: any) {
      console.error("[DAMA Upload]", e);
      setPhase("error");
      setErrorMsg(e?.message ?? String(e));
      toast({
        variant: "destructive",
        title: "Error al cargar la Base Maestra",
        description: e?.message ?? String(e),
      });
    }
  }, [toast]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.rpc("sync_legacy_from_dama" as any);
      if (error) throw error;
      toast({
        title: "Vistas sincronizadas",
        description: "Educación y Contexto Socioeconómico se refrescaron desde la Base Maestra DAMA.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error al sincronizar",
        description: e?.message ?? String(e),
      });
    } finally {
      setSyncing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <Card className="border-2 border-luker-teal/40 bg-gradient-to-br from-card via-card to-luker-teal/5 shadow-lg">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-luker-teal/10 border border-luker-teal/20">
            <Database className="h-7 w-7 text-luker-teal" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg md:text-xl font-bold">Base Maestra DAMA</CardTitle>
              <Badge variant="outline" className="border-luker-teal/40 text-luker-teal gap-1">
                <Sparkles className="h-3 w-3" /> Fuente principal
              </Badge>
            </div>
            <CardDescription className="mt-2 text-sm">
              Esta es ahora la fuente principal para <strong>Educación</strong> y{" "}
              <strong>Contexto Socioeconómico</strong>. Sube un archivo <code>.xlsx</code> con tres
              hojas: <code>catalogo_indicadores</code>, <code>catalogo_entidades</code> y{" "}
              <code>datos</code>.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isBusy && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isBusy
              ? "border-luker-teal bg-luker-teal/5 cursor-wait"
              : isDragging
              ? "border-luker-teal bg-luker-teal/10 scale-[1.01]"
              : "border-border hover:border-luker-teal hover:bg-luker-teal/5"
          }`}
        >
          {isBusy ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-luker-teal" />
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{fileName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progressLabel}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-base font-semibold">
                  Arrastra el archivo aquí o haz click para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">Formatos aceptados: .xlsx · .csv</p>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            disabled={isBusy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                handleFile(f);
                e.target.value = "";
              }
            }}
          />
        </div>

        {phase === "error" && errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Carga fallida</AlertTitle>
            <AlertDescription className="break-words">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {phase === "done" && summary && (
          <Alert className="border-luker-green/40 bg-luker-green/5">
            <CheckCircle2 className="h-4 w-4 text-luker-green" />
            <AlertTitle className="text-luker-green">Carga completada</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="rounded-lg border border-luker-green/30 bg-card p-3">
                  <div className="text-2xl font-bold text-luker-green">
                    {summary.catalog.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">indicadores actualizados</div>
                </div>
                <div className="rounded-lg border border-luker-teal/30 bg-card p-3">
                  <div className="text-2xl font-bold text-luker-teal">
                    {summary.entities.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">entidades mapeadas</div>
                </div>
                <div className="rounded-lg border border-luker-orange/30 bg-card p-3">
                  <div className="text-2xl font-bold text-luker-orange">
                    {summary.data.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">filas de datos procesadas</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || isBusy}
            className="gap-2"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Sincronizar vistas
          </Button>
          {phase !== "idle" && phase !== "validating" && (
            <Button variant="ghost" size="sm" onClick={reset} disabled={isBusy}>
              Limpiar
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <FileSpreadsheet className="h-3 w-3" />
            <span>Hojas requeridas: catalogo_indicadores · catalogo_entidades · datos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadDamaData;
