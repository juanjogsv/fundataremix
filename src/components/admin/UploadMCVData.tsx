import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, Loader2, Check, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface MCVIndicator {
  base: string;
  seccion: string;
  cod_indicador: string;
  indicador: string;
  categoria: string;
  cod_entidad: string;
  entidad: string;
  dato: number | null;
  year: number;
  periodicidad: string;
  mes_trimestre: string;
  fuente: string;
  unidad_medida: string;
}

const UploadMCVData = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseExcelFile = async (file: File): Promise<MCVIndicator[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          
          // Find the "Base" sheet or use the second sheet (index 1 is usually data)
          let sheetName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes("base")
          ) || workbook.SheetNames[1] || workbook.SheetNames[0];
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
          
          const indicators: MCVIndicator[] = jsonData.map((row: any) => ({
            base: row.base || row.Base || "Contexto socioeconómico",
            seccion: row.sección || row.seccion || row.Seccion || "",
            cod_indicador: row.cod_indicador || row["cod_indicador"] || "",
            indicador: row.indicador || row.Indicador || "",
            categoria: row.categoría || row.categoria || row.Categoria || "Total",
            cod_entidad: String(row.cod_entidad || row["cod_entidad"] || ""),
            entidad: row.entidad || row.Entidad || "",
            dato: row.dato !== null && row.dato !== undefined ? Number(row.dato) : null,
            year: Number(row.año || row.anio || row.year || row.Year || 0),
            periodicidad: row.periodicidad || row.Periodicidad || "anual",
            mes_trimestre: row.mes_trimestre || row["mes_trimestre"] || "na",
            fuente: row.fuente || row.Fuente || "",
            unidad_medida: row.unidad_medida || row["unidad_medida"] || ""
          })).filter((ind: MCVIndicator) => 
            ind.seccion && ind.entidad && ind.year > 0
          );
          
          resolve(indicators);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const indicators = await parseExcelFile(file);
      
      if (indicators.length === 0) {
        toast.error("No se encontraron datos válidos en el archivo");
        setLoading(false);
        return;
      }

      setProgress({ current: 0, total: indicators.length });

      // Delete existing data first
      const { error: deleteError } = await supabase
        .from("mcv_indicators")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        console.error("Error deleting existing data:", deleteError);
      }

      // Upload in batches of 500
      const batchSize = 500;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < indicators.length; i += batchSize) {
        const batch = indicators.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from("mcv_indicators")
          .insert(batch);

        if (error) {
          console.error("Error uploading batch:", error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }

        setProgress({ current: i + batch.length, total: indicators.length });
      }

      setResult({ success: successCount, errors: errorCount });
      
      if (errorCount === 0) {
        toast.success(`Se cargaron ${successCount} indicadores exitosamente`);
      } else {
        toast.warning(`Se cargaron ${successCount} indicadores. ${errorCount} errores.`);
      }

    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error al procesar el archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-luker-blue" />
          <CardTitle className="text-lg">Cargar Datos MCV</CardTitle>
        </div>
        <CardDescription>
          Carga los indicadores de Contexto Socioeconómico (Manizales Cómo Vamos)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mcv-file">Archivo Excel (MCV)</Label>
          <Input
            id="mcv-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Selecciona el archivo Indicadores_FunLuker_-_MCV.xlsx
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{file.name}</span>
          </div>
        )}

        {loading && progress.total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Cargando datos...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-luker-blue h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <div className={`flex items-center gap-2 p-3 rounded ${
            result.errors === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}>
            {result.errors === 0 ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>
              {result.success} indicadores cargados
              {result.errors > 0 && `, ${result.errors} errores`}
            </span>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Cargar datos MCV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadMCVData;
