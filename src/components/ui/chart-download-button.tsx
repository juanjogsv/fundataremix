import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Presentation, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ChartDownloadButtonProps {
  chartRef: React.RefObject<HTMLDivElement>;
  title: string;
  className?: string;
  excelData?: Record<string, any>[];
  excelColumns?: { header: string; key: string }[];
}

export const ChartDownloadButton = ({ 
  chartRef, 
  title, 
  className = "",
  excelData,
  excelColumns 
}: ChartDownloadButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const sanitizeFilename = (name: string) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
  };

  const captureChart = async () => {
    if (!chartRef.current) {
      toast.error("No se encontró la gráfica para exportar");
      return null;
    }

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      return canvas;
    } catch (error) {
      console.error("Error capturing chart:", error);
      toast.error("Error al capturar la gráfica");
      return null;
    }
  };

  const downloadPDF = async () => {
    setIsExporting(true);
    try {
      const canvas = await captureChart();
      if (!canvas) return;

      const { default: jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const isLandscape = imgWidth > imgHeight;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(16);
      pdf.setTextColor(87, 39, 0);
      pdf.text(title, 10, 15);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 10, 22);

      const margin = 10;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - 35 - margin;

      let finalWidth = maxWidth;
      let finalHeight = (imgHeight / imgWidth) * finalWidth;

      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (imgWidth / imgHeight) * finalHeight;
      }

      const xOffset = (pageWidth - finalWidth) / 2;

      pdf.addImage(imgData, "PNG", xOffset, 30, finalWidth, finalHeight);

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Fundación Luker - Plataforma de Gestión", pageWidth / 2, pageHeight - 5, { align: "center" });

      pdf.save(`${sanitizeFilename(title)}.pdf`);
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPPT = async () => {
    setIsExporting(true);
    try {
      const canvas = await captureChart();
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png");
      const PptxGenJS = (await import("pptxgenjs")).default;

      const pptx = new PptxGenJS();
      pptx.author = "Fundación Luker";
      pptx.title = title;
      pptx.subject = "Gráfica exportada";

      const slide = pptx.addSlide();

      slide.addText(title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: "572700",
      });

      slide.addText(`Generado: ${new Date().toLocaleDateString("es-CO")}`, {
        x: 0.5,
        y: 0.8,
        w: 9,
        h: 0.3,
        fontSize: 12,
        color: "666666",
      });

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const aspectRatio = imgWidth / imgHeight;

      const maxW = 9;
      const maxH = 5.5;

      let finalW = maxW;
      let finalH = finalW / aspectRatio;

      if (finalH > maxH) {
        finalH = maxH;
        finalW = finalH * aspectRatio;
      }

      const xPos = (10 - finalW) / 2;

      slide.addImage({
        data: imgData,
        x: xPos,
        y: 1.3,
        w: finalW,
        h: finalH,
      });

      slide.addText("Fundación Luker - Plataforma de Gestión", {
        x: 0,
        y: 7,
        w: 10,
        h: 0.3,
        fontSize: 10,
        color: "999999",
        align: "center",
      });

      await pptx.writeFile({ fileName: `${sanitizeFilename(title)}.pptx` });
      toast.success("PowerPoint descargado exitosamente");
    } catch (error) {
      console.error("Error exporting PPT:", error);
      toast.error("Error al exportar PowerPoint");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExcel = async () => {
    if (!excelData || !excelColumns || excelData.length === 0) {
      toast.error("No hay datos disponibles para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");
      
      // Create worksheet data with headers
      const headers = excelColumns.map(col => col.header);
      const rows = excelData.map(item => 
        excelColumns.map(col => item[col.key] ?? "")
      );
      
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths
      const colWidths = excelColumns.map(col => ({ wch: Math.max(col.header.length, 15) }));
      ws['!cols'] = colWidths;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      
      XLSX.writeFile(wb, `${sanitizeFilename(title)}.xlsx`);
      toast.success("Excel descargado exitosamente");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Error al exportar Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${className}`}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exportando..." : "Descargar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={downloadPDF} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Descargar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadPPT} className="cursor-pointer">
          <Presentation className="h-4 w-4 mr-2" />
          Descargar PowerPoint
        </DropdownMenuItem>
        {excelData && excelColumns && (
          <DropdownMenuItem onClick={downloadExcel} className="cursor-pointer">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar Excel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
