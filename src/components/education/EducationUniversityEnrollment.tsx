import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

const EducationUniversityEnrollment = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("Total");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const { data: result, error: fetchError } = await supabase
          .from("education_indicators")
          .select("year, categoria, valor")
          .eq("indicador", "Matrícula técnica UTC por institución educativa")
          .eq("categoria_2", "Universidad / Instituto técnico o tecnológico")
          .gte("year", 2018)
          .order("year", { ascending: true });

        if (fetchError) throw fetchError;
        
        setData(result || []);

        // Get unique institutions
        const uniqueInstitutions = new Set<string>();
        (result || []).forEach((item) => {
          if (item.categoria) {
            uniqueInstitutions.add(item.categoria);
          }
        });

        const institutionsList = Array.from(uniqueInstitutions).sort();
        setInstitutions(institutionsList);

      } catch (err: any) {
        console.error('Error fetching university enrollment data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by year
    const yearGroups = data.reduce((acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = [];
      }
      acc[item.year].push(item);
      return acc;
    }, {} as Record<number, any[]>);

    // Calculate totals per year
    return Object.entries(yearGroups).map(([year, items]: [string, any[]]) => {
      const filteredItems = selectedInstitution === "Total" 
        ? items 
        : items.filter((item: any) => item.categoria === selectedInstitution);
      
      const total = filteredItems.reduce((sum: number, item: any) => sum + (parseFloat(item.valor) || 0), 0);
      
      return {
        año: year,
        matrícula: Math.round(total * 100) / 100
      };
    }).sort((a, b) => parseInt(a.año) - parseInt(b.año));
  }, [data, selectedInstitution]);

  if (isLoading) {
    return (
      <div className="space-y-6">
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
          Error al cargar los datos de matrícula universitaria: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-luker-green/20 shadow-lg h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
        <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
          <GraduationCap className="h-5 w-5 text-luker-teal" />
          Matrícula Técnica en Universidades / Institutos T. y T.: {selectedInstitution}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Selecciona una universidad o instituto para ver su evolución de matrícula técnica
          </p>
          <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
            <SelectTrigger className="w-full md:w-[400px] border-luker-teal/30">
              <SelectValue placeholder="Selecciona una institución" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Total">Total</SelectItem>
              {institutions.map((institution) => (
                <SelectItem key={institution} value={institution}>
                  {institution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Evolución histórica de matrícula (2018-2024)
        </p>
        <div ref={chartRef}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="año" 
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis 
                  label={{ value: 'Estudiantes Matriculados', angle: -90, position: 'insideLeft', dy: 60, fill: 'hsl(122 56% 51%)', style: { textAnchor: 'middle' } }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} estudiantes`, 'Matrícula']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Bar 
                  dataKey="matrícula" 
                  fill="hsl(184 59% 40%)" 
                  name="Estudiantes Matriculados"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para la institución seleccionada.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-end pt-4 mt-auto">
          <ChartDownloadButton 
            chartRef={chartRef} 
            title={`Matrícula Técnica Universidades - ${selectedInstitution}`}
            excelData={chartData}
            excelColumns={[
              { header: "Año", key: "año" },
              { header: "Estudiantes Matriculados", key: "matrícula" }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationUniversityEnrollment;
