import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ParsedExpense {
  category: string;
  subcategory: string | null;
  item_name: string;
  budget: number;
  executed: number;
  execution_percentage: number;
  difference: number;
  is_parent: boolean;
  parent_category: string | null;
  display_order: number;
}

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

// Main categories that should be treated as parents
const PARENT_CATEGORIES = [
  "GASTOS DE FUNCIONAMIENTO",
  "GASTOS DE PERSONAL",
  "GASTOS OPERATIVOS",
  "TOTAL GASTOS OPERATIVOS DE FUNCIONAMIENTO",
  "GASTOS DE ADMINISTRACION DEL LEGADO",
  "TOTAL GASTOS DE ADMON DEL LEGADO",
  "TOTAL PRESUPUESTO",
];

export const UploadOperatingExpenses = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<{
    month: number;
    year: number;
    monthName: string;
    referenceDate: string;
    expenses: ParsedExpense[];
  } | null>(null);

  const extractMonthFromHeader = (headerText: string): { month: number; year: number; date: string } | null => {
    // Pattern: "A OCTUBRE 31 DE 2025" or "A 31 DE OCTUBRE DE 2025"
    const pattern1 = /A\s+(\w+)\s+(\d+)\s+DE\s+(\d{4})/i;
    const pattern2 = /A\s+(\d+)\s+DE\s+(\w+)\s+DE\s+(\d{4})/i;
    
    let match = headerText.match(pattern1);
    if (match) {
      const monthName = match[1].toUpperCase();
      const day = parseInt(match[2]);
      const year = parseInt(match[3]);
      const month = MONTH_NAMES[monthName];
      
      if (month) {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return { month, year, date };
      }
    }
    
    match = headerText.match(pattern2);
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
    if (typeof value === "number") {
      // If it's already a decimal percentage (like 0.7414)
      return value > 1 ? value : value * 100;
    }
    // Remove % sign and parse
    const cleaned = String(value).replace(/[%,]/g, "").replace(",", ".");
    const num = parseFloat(cleaned) || 0;
    return num > 1 ? num : num * 100;
  };

  const isParentCategory = (name: string): boolean => {
    const upper = name.toUpperCase().trim();
    return PARENT_CATEGORIES.some(cat => upper.includes(cat) || cat.includes(upper)) ||
           (upper === upper && upper.length > 3 && !upper.includes(":") && 
            upper !== "HONORARIOS" && upper !== "IMPUESTOS" && upper !== "SERVICIOS:" &&
            upper !== "GASTOS LEGALES:" && upper !== "GASTOS DE VIAJE" && 
            upper !== "ARRENDAMIENTOS" && upper !== "COMUNICACIONES" &&
            upper !== "DIVERSOS" && upper !== "GASTOS BANCARIOS" && upper !== "IMPREVISTOS");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsedData(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Look for PPTO FINAL sheet or first sheet
      const sheetName = workbook.SheetNames.find(name => 
        name.toUpperCase().includes("PPTO") || name.toUpperCase().includes("FINAL")
      ) || workbook.SheetNames[0];
      
      const sheet = workbook.Sheets[sheetName];
      
      if (!sheet) {
        toast.error("No se encontró la hoja de datos en el archivo");
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      
      // Find the header with date
      let monthInfo: { month: number; year: number; date: string } | null = null;
      for (const row of jsonData.slice(0, 30)) {
        for (const cell of row) {
          if (typeof cell === "string" && cell.toUpperCase().includes("DE") && cell.match(/\d{4}/)) {
            monthInfo = extractMonthFromHeader(cell);
            if (monthInfo) break;
          }
        }
        if (monthInfo) break;
      }

      if (!monthInfo) {
        // Try to extract from any cell containing month names
        for (const row of jsonData.slice(0, 30)) {
          for (const cell of row) {
            if (typeof cell === "string") {
              const monthMatch = Object.keys(MONTH_NAMES).find(m => cell.toUpperCase().includes(m));
              const yearMatch = cell.match(/20\d{2}/);
              if (monthMatch && yearMatch) {
                const month = MONTH_NAMES[monthMatch];
                const year = parseInt(yearMatch[0]);
                monthInfo = { month, year, date: `${year}-${String(month).padStart(2, "0")}-01` };
                break;
              }
            }
          }
          if (monthInfo) break;
        }
      }

      if (!monthInfo) {
        toast.error("No se pudo extraer la fecha del archivo. Verifica que el encabezado contenga la fecha.");
        return;
      }

      // Find the FIRST table with "DESGLOSADA"
      let tableStartRow = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowText = row?.join(" ").toUpperCase() || "";
        if (rowText.includes("DESGLOSADA")) {
          tableStartRow = i;
          break;
        }
      }

      // Find header row with PRESUPUESTO, EJECUCION columns after the table start
      let headerRow = -1;
      const searchStart = tableStartRow > -1 ? tableStartRow : 0;
      for (let i = searchStart; i < Math.min(searchStart + 15, jsonData.length); i++) {
        const row = jsonData[i];
        const rowText = row?.join(" ").toUpperCase() || "";
        if (rowText.includes("PRESUPUESTO") && rowText.includes("EJECUCION")) {
          headerRow = i;
          break;
        }
      }

      if (headerRow === -1) {
        toast.error("No se encontró la tabla con columnas PRESUPUESTO y EJECUCION");
        return;
      }

      // Map columns based on the header row (handles leading blank columns / merged cells)
      const header = jsonData[headerRow] || [];
      const cellText = (v: any) => String(v ?? "").toUpperCase().trim();

      const presupuestoCol = header.findIndex((c) => cellText(c).includes("PRESUPUESTO"));
      const ejecucionCol = header.findIndex((c) => {
        const t = cellText(c);
        return t.includes("EJECUCION") && !t.includes("%");
      });
      const porcentajeCol = header.findIndex((c) => {
        const t = cellText(c);
        return t.includes("%") && t.includes("EJECUCION");
      });
      const diferenciaCol = header.findIndex((c) => cellText(c).includes("DIFERENCIA"));

      // Fallback to fixed positions if we can't detect columns
      const colBudget = presupuestoCol !== -1 ? presupuestoCol : 1;
      const colExecuted = ejecucionCol !== -1 ? ejecucionCol : 2;
      const colPct = porcentajeCol !== -1 ? porcentajeCol : 3;
      const colDiff = diferenciaCol !== -1 ? diferenciaCol : 4;

      const getItemName = (row: any[]) => {
        // Item name is usually to the left of PRESUPUESTO (but may be shifted by blank columns)
        const limit = Math.max(colBudget, 1);
        for (let j = limit - 1; j >= 0; j--) {
          const v = row?.[j];
          const s = String(v ?? "").trim();
          if (s) return s;
        }
        // As a last resort, pick the first non-empty cell
        for (const v of row || []) {
          const s = String(v ?? "").trim();
          if (s) return s;
        }
        return "";
      };

      // Parse expenses
      const expenses: ParsedExpense[] = [];
      let currentCategory: string | null = null;
      let displayOrder = 0;

      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const itemName = getItemName(row);
        if (!itemName) continue;

        const budget = parseNumber(row[colBudget]);
        const executed = parseNumber(row[colExecuted]);
        const execPercentage = parsePercentage(row[colPct]);
        const difference = parseNumber(row[colDiff]);

        // Stop at end of table (the summary table has a final total row)
        if (itemName.toUpperCase().includes("TOTAL PRESUPUESTO")) {
          expenses.push({
            category: "TOTAL",
            subcategory: null,
            item_name: "TOTAL PRESUPUESTO",
            budget,
            executed,
            execution_percentage: execPercentage,
            difference,
            is_parent: true,
            parent_category: null,
            display_order: displayOrder++,
          });
          break;
        }

        // Skip empty value rows that are just section headers without numbers
        const hasValues = budget !== 0 || executed !== 0 || difference !== 0 || execPercentage !== 0;

        const isParent =
          itemName.toUpperCase().includes("TOTAL") ||
          PARENT_CATEGORIES.some((cat) => itemName.toUpperCase().includes(cat));

        if (isParent) {
          currentCategory = itemName;
        }

        // Only add rows that have values or are totals
        if (hasValues || itemName.toUpperCase().includes("TOTAL")) {
          expenses.push({
            category: currentCategory || "OTROS",
            subcategory: null,
            item_name: itemName,
            budget,
            executed,
            execution_percentage: execPercentage,
            difference,
            is_parent: isParent,
            parent_category: isParent ? null : currentCategory,
            display_order: displayOrder++,
          });
        }
      }

      if (expenses.length === 0) {
        console.warn("No se pudieron extraer filas. Debug:", {
          sheetName,
          tableStartRow,
          headerRow,
          header,
          colBudget,
          colExecuted,
          colPct,
          colDiff,
          sampleRows: jsonData.slice(headerRow, headerRow + 8),
        });
        toast.error("No se encontraron datos de gastos en la tabla");
        return;
      }

      setParsedData({
        month: monthInfo.month,
        year: monthInfo.year,
        monthName: MONTH_LABELS[monthInfo.month],
        referenceDate: monthInfo.date,
        expenses,
      });

      toast.success(`Se encontraron ${expenses.length} items para ${MONTH_LABELS[monthInfo.month]} ${monthInfo.year}`);
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
        .from("operating_expenses_monthly")
        .delete()
        .eq("year", parsedData.year)
        .eq("month", parsedData.month);

      if (deleteError) throw deleteError;

      // Insert new data
      const records = parsedData.expenses.map((e) => ({
        year: parsedData.year,
        month: parsedData.month,
        month_name: parsedData.monthName,
        reference_date: parsedData.referenceDate,
        category: e.category,
        subcategory: e.subcategory,
        item_name: e.item_name,
        budget: e.budget,
        executed: e.executed,
        execution_percentage: e.execution_percentage,
        difference: e.difference,
        is_parent: e.is_parent,
        parent_category: e.parent_category,
        display_order: e.display_order,
      }));

      const { error: insertError } = await supabase
        .from("operating_expenses_monthly")
        .insert(records);

      if (insertError) throw insertError;

      toast.success(`Datos de Funcionamiento ${parsedData.monthName} ${parsedData.year} cargados correctamente`);
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
          Cargar Gastos de Funcionamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Sube el archivo de ejecución presupuestal de funcionamiento (.xls o .xlsx). 
          El sistema leerá la tabla "EJECUCION PRESUPUESTAL - DESGLOSADA".
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
              <p><strong>Items encontrados:</strong> {parsedData.expenses.length}</p>
              <p><strong>Categorías principales:</strong> {parsedData.expenses.filter(e => e.is_parent).length}</p>
            </div>
          </div>
        )}

        {file && !parsedData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Procesando archivo...
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
