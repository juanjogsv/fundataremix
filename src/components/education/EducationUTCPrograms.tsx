import { useState, useEffect } from "react";
import { fetchLegacyIndicators } from "@/integrations/ecosistema/legacy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProgramData {
  programa: string;
  matriculados2024: number;
  total20182025: number;
}

const EducationUTCPrograms = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programData, setProgramData] = useState<ProgramData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const rows = await fetchLegacyIndicators({
          codes: ["UTC_03"],
        });
        const result = rows.map(r => ({ categoria: r.categoria_2 ?? r.categoria, valor: r.valor, year: r.year }));
        const fetchError = null;

        if (fetchError) throw fetchError;
        
        // Group by programa (categoria) and calculate totals
        const programMap = new Map<string, { total2024: number; totalHistorico: number }>();
        
        (result || []).forEach((item) => {
          // Filter for years 2018-2025
          const year = Number(item.year);
          if (year < 2018 || year > 2025) return;
          
          const programa = item.categoria || "Sin categoría";
          const valor = Number(item.valor) || 0;
          
          if (!programMap.has(programa)) {
            programMap.set(programa, { total2024: 0, totalHistorico: 0 });
          }
          
          const programStats = programMap.get(programa)!;
          
          // Add to historical total (2018-2025)
          programStats.totalHistorico += valor;
          
          // Add to 2024 total if year is 2024
          if (year === 2024) {
            programStats.total2024 += valor;
          }
        });
        
        // Convert to array and sort by 2024 enrollment (descending)
        const programArray: ProgramData[] = Array.from(programMap.entries())
          .map(([programa, stats]) => ({
            programa,
            matriculados2024: Math.round(stats.total2024),
            total20182025: Math.round(stats.totalHistorico)
          }))
          .sort((a, b) => b.matriculados2024 - a.matriculados2024);
        
        setProgramData(programArray);

      } catch (err: any) {
        console.error('Error fetching UTC programs data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos de programas UTC: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-luker-green/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
        <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
          <BookOpen className="h-5 w-5 text-luker-teal" />
          Matrícula Técnica UTC por Programa
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Matriculados por programa académico (2024 vs. Histórico 2018-2025)
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {programData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-luker-green/5">
                  <TableHead className="text-luker-green font-semibold">Programa</TableHead>
                  <TableHead className="text-luker-green font-semibold text-right">Matriculados 2024</TableHead>
                  <TableHead className="text-luker-green font-semibold text-right">Total 2018-2025</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programData.map((program, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-luker-teal/5 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{program.programa}</TableCell>
                    <TableCell className="text-right text-luker-teal font-semibold">
                      {program.matriculados2024.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-luker-green font-semibold">
                      {program.total20182025.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay datos disponibles para programas UTC.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationUTCPrograms;
