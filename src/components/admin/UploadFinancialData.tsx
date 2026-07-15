import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ParsedProject {
  project_name: string;
  category: string;
  saldo_inicial: number;
  executed: number;
  pending: number;
  execution_percentage: number;
  is_parent: boolean;
  parent_category: string | null;
}

// Month name mappings
const MONTH_NAMES: Record<string, number> = {
  ENERO: 1,
  FEBRERO: 2,
  MARZO: 3,
  ABRIL: 4,
  MAYO: 5,
  JUNIO: 6,
  JULIO: 7,
  AGOSTO: 8,
  SEPTIEMBRE: 9,
  OCTUBRE: 10,
  NOVIEMBRE: 11,
  DICIEMBRE: 12,
};

const MONTH_LABELS: Record<number, string> = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};

export const UploadFinancialData = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<{
    month: number;
    year: number;
    monthName: string;
    referenceDate: string;
    projects: ParsedProject[];
  } | null>(null);

  const extractMonthFromHeader = (headerText: string): { month: number; year: number; date: string } | null => {
    // Pattern: "A 31 DE OCTUBRE DE 2025" or similar
    const pattern = /A\s+(\d+)\s+DE\s+(\w+)\s+DE\s+(\d{4})/i;
    const match = headerText.match(pattern);
    
    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toUpperCase();
      const year = parseInt(match[3]);
      const month = MONTH_NAMES[monthName];
      
      if (month) {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return { month, year, date };
      }
    }
    return null;
  };

  const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const parsePercentage = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value * 100;
    const cleaned = String(value).replace(/[%,]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsedData(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Look for RESUMEN sheet
      const resumenSheet = workbook.Sheets["RESUMEN"] || workbook.Sheets["Resumen"];
      
      if (!resumenSheet) {
        toast.error("No se encontró la hoja 'RESUMEN' en el archivo");
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(resumenSheet, { header: 1 }) as any[][];
      
      // Find the header with date
      let monthInfo: { month: number; year: number; date: string } | null = null;
      for (const row of jsonData.slice(0, 20)) {
        for (const cell of row) {
          if (typeof cell === "string" && cell.includes("DE") && cell.match(/\d{4}/)) {
            monthInfo = extractMonthFromHeader(cell);
            if (monthInfo) break;
          }
        }
        if (monthInfo) break;
      }

      if (!monthInfo) {
        toast.error("No se pudo extraer la fecha del encabezado");
        return;
      }

      // Find the table with "PORCENTAJE DE EJECUCION EN PROYECTOS CON RECURSOS PROPIOS"
      let tableStartRow = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowText = row.join(" ").toUpperCase();
        if (rowText.includes("PORCENTAJE DE EJECUCION") && rowText.includes("RECURSOS PROPIOS")) {
          tableStartRow = i;
          break;
        }
      }

      if (tableStartRow === -1) {
        toast.error("No se encontró la tabla de 'PORCENTAJE DE EJECUCIÓN EN PROYECTOS CON RECURSOS PROPIOS'");
        return;
      }

      // Find header row (PROYECTO, SALDO INICIAL, EJECUTADO, etc.)
      let headerRow = -1;
      for (let i = tableStartRow; i < Math.min(tableStartRow + 10, jsonData.length); i++) {
        const row = jsonData[i];
        const rowText = row?.join(" ").toUpperCase() || "";
        if (rowText.includes("PROYECTO") && (rowText.includes("SALDO") || rowText.includes("EJECUTADO"))) {
          headerRow = i;
          break;
        }
      }

      if (headerRow === -1) {
        headerRow = tableStartRow + 2; // Fallback
      }

      // Detect the column where the header "PROYECTO" starts (some files have an
      // empty leading column). Values are read starting from that column.
      const headerCells = jsonData[headerRow] || [];
      let nameCol = 0;
      for (let c = 0; c < headerCells.length; c++) {
        const cell = String(headerCells[c] || "").toUpperCase().trim();
        if (cell.startsWith("PROYECTO")) {
          nameCol = c;
          break;
        }
      }

      // Parse projects
      const projects: ParsedProject[] = [];
      let currentParent: string | null = null;
      let emptyStreak = 0;

      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) {
          emptyStreak++;
          if (emptyStreak >= 2) break;
          continue;
        }

        const projectName = String(row[nameCol] || "").trim();
        if (!projectName) {
          emptyStreak++;
          if (emptyStreak >= 2) break;
          continue;
        }
        emptyStreak = 0;

        if (projectName.toUpperCase().includes("TOTAL GENERAL")) continue;

        // Determine if it's a parent category
        const isParent = projectName === projectName.toUpperCase() &&
                         !projectName.includes("UTC") &&
                         projectName.length > 3;

        if (isParent) {
          currentParent = projectName;
        }

        const saldoInicial = parseNumber(row[nameCol + 1]);
        const executed = parseNumber(row[nameCol + 2]);
        const pending = parseNumber(row[nameCol + 3]);
        const executionPercentage = parsePercentage(row[nameCol + 4]);

        projects.push({
          project_name: projectName,
          category: isParent ? projectName : (currentParent || "OTROS"),
          saldo_inicial: saldoInicial,
          executed,
          pending,
          execution_percentage: executionPercentage,
          is_parent: isParent,
          parent_category: isParent ? null : currentParent,
        });
      }

      // === Sub-cuadro "CONOCIMIENTO E INCIDENCIA" (aparece más abajo en la hoja) ===
      // Busca un encabezado que contenga "CONOCIMIENTO E INCIDENCIA" e "INVERSION SOCIAL"
      let ciHeaderRow = -1;
      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const rowText = (jsonData[i] || []).join(" ").toUpperCase();
        if (rowText.includes("CONOCIMIENTO E INCIDENCIA") && rowText.includes("INVERSION SOCIAL")) {
          ciHeaderRow = i;
          break;
        }
      }

      if (ciHeaderRow !== -1) {
        // Detectar la columna donde arranca el nombre del rubro
        const ciHeader = jsonData[ciHeaderRow] || [];
        let ciNameCol = 0;
        for (let c = 0; c < ciHeader.length; c++) {
          const cell = String(ciHeader[c] || "").toUpperCase().trim();
          if (cell.includes("CONOCIMIENTO E INCIDENCIA")) {
            ciNameCol = c;
            break;
          }
        }

        // Remover el rubro padre general "Conocimiento e Incidencia" no-padre
        // que pudiera haber quedado desde la tabla principal, para no duplicar.
        const idxDup = projects.findIndex(
          (p) => !p.is_parent && p.project_name.toUpperCase() === "CONOCIMIENTO E INCIDENCIA"
        );
        if (idxDup !== -1) projects.splice(idxDup, 1);

        let ciEmpty = 0;
        for (let i = ciHeaderRow + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) {
            ciEmpty++;
            if (ciEmpty >= 2) break;
            continue;
          }
          const name = String(row[ciNameCol] || "").trim();
          if (!name) {
            ciEmpty++;
            if (ciEmpty >= 2) break;
            continue;
          }
          ciEmpty = 0;
          if (name.toUpperCase() === "TOTAL") break;

          const saldo = parseNumber(row[ciNameCol + 1]);
          const ejec = parseNumber(row[ciNameCol + 2]);
          const pend = parseNumber(row[ciNameCol + 3]);
          const pct = parsePercentage(row[ciNameCol + 4]);
          if (saldo === 0 && ejec === 0 && pend === 0) continue;

          projects.push({
            project_name: name,
            category: "CONOCIMIENTO E INCIDENCIA",
            saldo_inicial: saldo,
            executed: ejec,
            pending: pend,
            execution_percentage: pct,
            is_parent: false,
            parent_category: "CONOCIMIENTO E INCIDENCIA",
          });
        }
      }

      if (projects.length === 0) {
        toast.error("No se encontraron proyectos en la tabla");
        return;
      }

      setParsedData({
        month: monthInfo.month,
        year: monthInfo.year,
        monthName: MONTH_LABELS[monthInfo.month],
        referenceDate: monthInfo.date,
        projects,
      });

      toast.success(`Se encontraron ${projects.length} proyectos para ${MONTH_LABELS[monthInfo.month]} ${monthInfo.year}`);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Error al procesar el archivo");
    }
  };

  const handleUpload = async () => {
    if (!parsedData) return;

    setUploading(true);
    try {
      // First, delete existing data for this month/year
      const { error: deleteError } = await supabase
        .from("financial_execution_monthly")
        .delete()
        .eq("year", parsedData.year)
        .eq("month", parsedData.month);

      if (deleteError) throw deleteError;

      // Insert new data
      const records = parsedData.projects.map((p) => ({
        year: parsedData.year,
        month: parsedData.month,
        month_name: parsedData.monthName,
        reference_date: parsedData.referenceDate,
        project_name: p.project_name,
        category: p.category,
        saldo_inicial: p.saldo_inicial,
        executed: p.executed,
        pending: p.pending,
        execution_percentage: p.execution_percentage,
        is_parent: p.is_parent,
        parent_category: p.parent_category,
      }));

      const { error: insertError } = await supabase
        .from("financial_execution_monthly")
        .insert(records);

      if (insertError) throw insertError;

      toast.success(`Datos de ${parsedData.monthName} ${parsedData.year} cargados correctamente`);
      setFile(null);
      setParsedData(null);
    } catch (error) {
      console.error("Error uploading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200/80 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg text-luker-brown flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Cargar Ejecución Mensual Financiera
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Sube el archivo de ejecución mensual (formato .xls o .xlsx). El sistema extraerá
          automáticamente el mes y año del encabezado de la hoja RESUMEN.
        </p>

        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>

        {parsedData && (
          <div className="bg-luker-green/10 border border-luker-green/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-luker-green">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Archivo procesado correctamente</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Período:</strong> {parsedData.monthName} {parsedData.year}</p>
              <p><strong>Fecha de referencia:</strong> {parsedData.referenceDate}</p>
              <p><strong>Proyectos encontrados:</strong> {parsedData.projects.length}</p>
              <p><strong>Categorías principales:</strong> {parsedData.projects.filter(p => p.is_parent).length}</p>
            </div>
          </div>
        )}

        {file && !parsedData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Procesando archivo... Si no se detecta la estructura esperada, verifica que el archivo
              contenga la hoja RESUMEN con el cuadro de ejecución por proyectos.
            </span>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!parsedData || uploading}
          className="w-full bg-luker-green hover:bg-luker-green/90"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Cargando..." : "Cargar Datos al Sistema"}
        </Button>
      </CardContent>
    </Card>
  );
};
