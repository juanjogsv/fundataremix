import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Upload, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface ParticipantRow {
  base: string;
  seccion: string;
  programa: string;
  departamento: string;
  cod_entidad?: string;
  entidad?: string;
  categoria?: string;
  valor: number;
  year: number;
}

const UploadParticipantsData = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const processExcelFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("El archivo está vacío");
      }

      setProgress(20);

      // Map Excel columns to database fields
      const participants: ParticipantRow[] = jsonData.map((row: any) => {
        // Try different column name variations
        const base = row.base || row.Base || row.BASE || "";
        const seccion = row.seccion || row.Seccion || row.SECCION || row.Sección || "";
        const programa = row.programa || row.Programa || row.PROGRAMA || "";
        const departamento = row.departamento || row.Departamento || row.DEPARTAMENTO || "";
        const cod_entidad = row.cod_entidad || row.Cod_entidad || row.COD_ENTIDAD || row["cod_entidad"] || "";
        const entidad = row.entidad || row.Entidad || row.ENTIDAD || "";
        const categoria = row.categoria || row.Categoria || row.CATEGORIA || row.Categoría || "Total Participantes";
        const valor = parseFloat(row.valor || row.Valor || row.VALOR || row.value || row.Value || 0) || 0;
        const year = parseInt(row.year || row.Year || row.YEAR || row.año || row.Año || row.AÑO || new Date().getFullYear());

        return {
          base: base.toString().trim(),
          seccion: seccion.toString().trim(),
          programa: programa.toString().trim(),
          departamento: departamento.toString().trim(),
          cod_entidad: cod_entidad.toString().trim() || null,
          entidad: entidad.toString().trim() || null,
          categoria: categoria.toString().trim(),
          valor,
          year,
        };
      }).filter(row => row.base && row.seccion && row.programa && row.departamento);

      if (participants.length === 0) {
        throw new Error("No se encontraron filas válidas. Verifica que las columnas 'base', 'seccion', 'programa' y 'departamento' existan.");
      }

      setProgress(40);

      // Get unique years from the data
      const years = [...new Set(participants.map(p => p.year))];

      // Delete existing data for those years
      for (const year of years) {
        const { error: deleteError } = await supabase
          .from("participants")
          .delete()
          .eq("year", year);

        if (deleteError) {
          console.error(`Error deleting year ${year}:`, deleteError);
        }
      }

      setProgress(60);

      // Insert in batches of 100
      const batchSize = 100;
      let inserted = 0;

      for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from("participants")
          .insert(batch);

        if (insertError) {
          throw new Error(`Error insertando datos: ${insertError.message}`);
        }

        inserted += batch.length;
        setProgress(60 + (inserted / participants.length) * 35);
      }

      setProgress(100);

      toast({
        title: "Carga exitosa",
        description: `Se cargaron ${participants.length} registros de participantes para los años: ${years.join(", ")}.`,
      });

    } catch (error: any) {
      console.error("Error processing file:", error);
      toast({
        variant: "destructive",
        title: "Error en la carga",
        description: error.message || "No se pudo procesar el archivo",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      setFileName("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
      e.target.value = "";
    }
  };

  return (
    <Card className="col-span-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-900">
              Base de Datos de Participantes
            </CardTitle>
            <CardDescription className="text-blue-700">
              Datos unificados para Indicadores Estratégicos, Educación y Desarrollo Rural
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Box */}
        <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-medium">Columnas requeridas en el archivo Excel:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li><code className="bg-blue-100 px-1 rounded">base</code> - Área principal (Cacao, Educación, Formare, etc.)</li>
                <li><code className="bg-blue-100 px-1 rounded">seccion</code> - Subsección (The Cacao Effect, Generación R, Educación, Formare)</li>
                <li><code className="bg-blue-100 px-1 rounded">programa</code> - Nombre del programa específico</li>
                <li><code className="bg-blue-100 px-1 rounded">departamento</code> - Departamento o región</li>
                <li><code className="bg-blue-100 px-1 rounded">cod_entidad</code> - (Opcional) Código de la entidad</li>
                <li><code className="bg-blue-100 px-1 rounded">entidad</code> - (Opcional) Nombre del municipio/entidad</li>
                <li><code className="bg-blue-100 px-1 rounded">valor</code> - Número de participantes</li>
                <li><code className="bg-blue-100 px-1 rounded">year</code> - Año de los datos</li>
                <li><code className="bg-blue-100 px-1 rounded">categoria</code> - (Opcional) Categoría adicional</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <Label htmlFor="participants-file" className="block cursor-pointer">
          <div className={`
            relative border-2 border-dashed rounded-xl p-8 text-center 
            transition-all duration-300 bg-white
            ${isUploading 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
            }
          `}>
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                </div>
                <div className="w-full max-w-md space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-blue-900 truncate flex-1">
                      {fileName || "Procesando..."}
                    </p>
                    <p className="text-blue-600 ml-2 font-bold">
                      {Math.round(progress)}%
                    </p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-blue-600">
                    Por favor espere mientras se procesan los datos...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-blue-100">
                  <Upload className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-900">
                    Arrastra o haz clic para subir
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Archivo Excel (.xlsx) con datos de participantes
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-500">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Formato: .XLSX</span>
                </div>
              </div>
            )}
          </div>
          <Input
            id="participants-file"
            type="file"
            accept=".xlsx"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileChange}
          />
        </Label>

        {/* Note */}
        <p className="text-xs text-blue-600 text-center">
          Al subir un archivo, se reemplazarán los datos existentes para los años incluidos en el archivo.
        </p>
      </CardContent>
    </Card>
  );
};

export default UploadParticipantsData;
