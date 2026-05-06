import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

const UploadATALData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProgress("");
    }
  };

  const processATALFile = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo primero",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setProgress("Procesando archivo...");

      // Read the selected file
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      setProgress("Procesando archivo Excel...");
      
      // Read the Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      setProgress(`Encontrados ${data.length} registros. Preparando datos...`);

      // Transform data to match our database structure
      const records = data.map((row: any) => {
        // Determinar si el valor está entre 0-1 o es un porcentaje directo
        let valor = parseFloat(row.dato);
        
        // Si el valor está entre 0 y 1, multiplicar por 100
        if (valor >= 0 && valor <= 1) {
          valor = valor * 100;
        }

        return {
          indicador: row.indicador,
          categoria: row.categoría,
          categoria_2: row['categoría 2'],
          categoria_3: row['categoría 3'],
          year: parseInt(row.año),
          valor: valor,
          seccion: row.sección || 'Aprendamos todos a leer',
          municipio: row.entidad || 'Manizales',
          departamento: 'Caldas',
          unidad: row.unidad_medida || 'Porcentaje'
        };
      });

      setProgress("Limpiando datos anteriores de ATL...");
      
      // Delete existing ATL data only from the 'Aprendamos todos a leer' section
      const { error: deleteError } = await supabase
        .from('education_indicators')
        .delete()
        .eq('seccion', 'Aprendamos todos a leer');

      if (deleteError) throw deleteError;

      setProgress(`Insertando ${records.length} registros...`);

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('education_indicators')
          .insert(batch);

        if (insertError) throw insertError;
        
        setProgress(`Insertados ${Math.min(i + batchSize, records.length)} de ${records.length} registros...`);
      }

      setProgress("¡Completado!");
      
      toast({
        title: "Datos cargados exitosamente",
        description: `Se cargaron ${records.length} registros de ATL.`,
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Error processing ATAL file:', error);
      toast({
        title: "Error al cargar datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cargar Datos ATL 2025
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Selecciona un archivo Excel con los datos de ATAL para cargar.
          Los datos existentes de ATL serán reemplazados.
        </p>

        <div className="space-y-2">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            className="cursor-pointer"
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Archivo seleccionado: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        {progress && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">{progress}</p>
          </div>
        )}

        <Button
          onClick={processATALFile}
          disabled={isLoading || !selectedFile}
          className="w-full"
        >
          {isLoading ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Cargar Datos ATL
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Nota:</strong> Este proceso:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Eliminará todos los datos existentes de ATL</li>
            <li>Cargará aproximadamente 2,900 registros</li>
            <li>Puede tomar algunos minutos</li>
            <li>La página se recargará automáticamente al finalizar</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadATALData;
