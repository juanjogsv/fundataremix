import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UploadDamaData = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data, error } = await supabase.functions.invoke("process-dama-upload", {
        body: fd,
      });
      if (error) throw error;
      toast({
        title: "Base Maestra DAMA actualizada",
        description: `Catálogo: ${data?.catalog ?? 0} · Entidades: ${data?.entities ?? 0} · Datos: ${data?.data ?? 0}. Los módulos de Educación y Contexto Socioeconómico se sincronizaron automáticamente.`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error al cargar la Base Maestra",
        description: e.message ?? String(e),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-luker-teal/30 bg-gradient-to-br from-card to-luker-teal/5">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-luker-teal/10">
            <Database className="h-6 w-6 text-luker-teal" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg font-bold">
              ⭐ Base Maestra DAMA (Educación + Contexto Socioeconómico)
            </CardTitle>
            <CardDescription className="mt-1 text-xs md:text-sm">
              Excel con tres hojas: <code>datos</code>, <code>catalogo_indicadores</code>, <code>catalogo_entidades</code>.
              Reemplaza el catálogo, las entidades y los datos históricos, y sincroniza
              automáticamente los módulos de Educación y Contexto Socioeconómico.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Label htmlFor="dama-upload" className="block cursor-pointer">
          <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            uploading ? "border-luker-teal bg-luker-teal/5" : "border-border hover:border-luker-teal hover:bg-luker-teal/5"
          }`}>
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-luker-teal" />
                <p className="text-sm font-medium">Procesando Base Maestra DAMA…</p>
                <p className="text-xs text-muted-foreground">
                  Reemplazando catálogos y sincronizando dashboards.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Click para subir el Excel DAMA</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">.xlsx</p>
                </div>
              </div>
            )}
          </div>
          <Input
            id="dama-upload"
            type="file"
            accept=".xlsx"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                handleUpload(f);
                e.target.value = "";
              }
            }}
          />
        </Label>
      </CardContent>
    </Card>
  );
};

export default UploadDamaData;
