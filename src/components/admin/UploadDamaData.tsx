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

  const validateFile = async (file: File): Promise<{ catalogCount: number; entitiesCount: number; dataCount: number }> => {
    setProgressLabel("Validando hojas y columnas…");
    setProgress(15);
    const buf = new Uint8Array(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "array" });

    for (const s of REQUIRED_SHEETS) {
      if (!wb.SheetNames.includes(s)) {
        throw new Error(`Falta la hoja "${s}". El archivo debe contener: ${REQUIRED_SHEETS.join(", ")}.`);
      }
    }

    const datosSheet = wb.Sheets["datos"];
    const sample = XLSX.utils.sheet_to_json<any>(datosSheet, { range: 0, defval: null });
    if (sample.length === 0) {
      throw new Error('La hoja "datos" está vacía.');
    }
    const cols = Object.keys(sample[0] ?? {});
    const missing = REQUIRED_DATA_COLS.filter((c) => !cols.includes(c));
    if (missing.length) {
      throw new Error(
        `La hoja "datos" no contiene las columnas requeridas: ${missing.join(", ")}.`,
      );
    }

    const catalogCount = XLSX.utils.sheet_to_json(wb.Sheets["catalogo_indicadores"]).length;
    const entitiesCount = XLSX.utils.sheet_to_json(wb.Sheets["catalogo_entidades"]).length;
    const dataCount = sample.length;
    return { catalogCount, entitiesCount, dataCount };
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setErrorMsg(null);
    setSummary(null);
    setProgress(0);

    try {
      // Validate
      setPhase("validating");
      const pre = await validateFile(file);

      // Upload + process
      setPhase("uploading");
      setProgressLabel(`Enviando archivo (${(file.size / 1024 / 1024).toFixed(1)} MB)…`);
      setProgress(35);

      const fd = new FormData();
      fd.append("file", file);

      // Simulate processing tick while edge function runs
      setPhase("processing");
      setProgressLabel(
        `Procesando ${pre.dataCount.toLocaleString()} filas, ${pre.catalogCount} indicadores, ${pre.entitiesCount} entidades…`,
      );
      setProgress(70);

      const { data, error } = await supabase.functions.invoke("process-dama-upload", {
        body: fd,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Sync
      setPhase("syncing");
      setProgressLabel("Sincronizando vistas legacy…");
      setProgress(95);

      setSummary({
        catalog: data?.catalog ?? pre.catalogCount,
        entities: data?.entities ?? pre.entitiesCount,
        data: data?.data ?? pre.dataCount,
      });
      setProgress(100);
      setPhase("done");
      setProgressLabel("Carga completada");

      toast({
        title: "Base Maestra DAMA actualizada",
        description: `${data?.catalog ?? pre.catalogCount} indicadores · ${data?.entities ?? pre.entitiesCount} entidades · ${data?.data ?? pre.dataCount} filas.`,
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
              <CardTitle className="text-lg md:text-xl font-bold">
                Base Maestra DAMA
              </CardTitle>
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
        {/* Drag & Drop area */}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceptados: .xlsx · .csv
                </p>
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

        {/* Error */}
        {phase === "error" && errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validación fallida</AlertTitle>
            <AlertDescription className="break-words">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Success summary */}
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

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || isBusy}
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
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
