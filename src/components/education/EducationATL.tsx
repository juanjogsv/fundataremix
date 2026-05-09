import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EducationATALKPIs from "./EducationATALKPIs";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

const EducationATL = () => {
  console.log("🔍 EducationATL - Componente renderizado");
  
  const chart2024Ref = useRef<HTMLDivElement>(null);
  const chartPrimeroRef = useRef<HTMLDivElement>(null);
  const chartQuintoRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstitutionCard4, setSelectedInstitutionCard4] = useState<string>("Total");
  const [selectedInstitutionCard5, setSelectedInstitutionCard5] = useState<string>("Total");
  
  // Datos comparativo ATAL_01 vs ATAL_02 (último año)
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [comparisonYear, setComparisonYear] = useState<number | null>(null);
  // Datos para Card 4: Primero - Entrada vs Salida histórico
  const [dataPrimeroHistorico, setDataPrimeroHistorico] = useState<any[]>([]);
  // Datos para Card 5: Quinto - Entrada vs Salida histórico
  const [dataQuintoHistorico, setDataQuintoHistorico] = useState<any[]>([]);
  // Lista de instituciones
  const [institutionsCard4, setInstitutionsCard4] = useState<string[]>([]);
  const [institutionsCard5, setInstitutionsCard5] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch ATAL_01 vs ATAL_02 from dama_data (Manizales)
        const { data: atalCmp, error: errCmp } = await supabase
          .from('dama_data')
          .select('cod_indicador, anio, categoria_2, valor')
          .in('cod_indicador', ['ATAL_01', 'ATAL_02'])
          .eq('cod_entidad', '17001')
          .limit(10000);

        if (errCmp) throw errCmp;

        // Determine latest year present across both indicators
        const years = (atalCmp || []).map((r: any) => r.anio).filter((y: any) => y != null);
        const latestYear = years.length ? Math.max(...years) : null;
        setComparisonYear(latestYear);

        const grados = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"];
        const acc: Record<string, { b: number[]; r: number[] }> = {};
        grados.forEach(g => { acc[g] = { b: [], r: [] }; });
        (atalCmp || []).forEach((row: any) => {
          if (row.anio !== latestYear) return;
          const grade = row.categoria_2;
          if (!grade || !acc[grade]) return;
          const v = parseFloat(row.valor);
          if (Number.isNaN(v)) return;
          if (row.cod_indicador === 'ATAL_01') acc[grade].b.push(v);
          else if (row.cod_indicador === 'ATAL_02') acc[grade].r.push(v);
        });
        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        setComparisonData(grados.map(g => ({
          grado: g,
          'Línea de Base': Number(avg(acc[g].b).toFixed(2)),
          'Resultado Final': Number(avg(acc[g].r).toFixed(2)),
        })));

        // Fetch data for Card 4: Primero histórico (Entrada y Salida)
        const { data: dataPrimero, error: errorPrimero } = await supabase
          .from('education_indicators')
          .select('*')
          .eq('indicador', 'Estudiantes que alcanzan el nivel estándar o avanzado')
          .eq('categoria_2', 'Primero')
          .gte('year', 2018)
          .lte('year', 2024)
          .order('year', { ascending: true });

        if (errorPrimero) throw errorPrimero;
        console.log("📚 Datos PRIMERO histórico obtenidos:", dataPrimero?.length || 0, "registros");
        setDataPrimeroHistorico(dataPrimero || []);

        // Fetch data for Card 5: Quinto histórico (Entrada y Salida)
        const { data: dataQuinto, error: errorQuinto } = await supabase
          .from('education_indicators')
          .select('*')
          .eq('indicador', 'Estudiantes que alcanzan el nivel estándar o avanzado')
          .eq('categoria_2', 'Quinto')
          .gte('year', 2018)
          .lte('year', 2024)
          .order('year', { ascending: true });

        if (errorQuinto) throw errorQuinto;
        console.log("📘 Datos QUINTO histórico obtenidos:", dataQuinto?.length || 0, "registros");
        setDataQuintoHistorico(dataQuinto || []);

        // Get unique institutions for Card 4 (including "Total")
        const allInstitutionsCard4 = new Set<string>();
        (dataPrimero || []).forEach((item) => {
          if (item.categoria) {
            allInstitutionsCard4.add(item.categoria);
          }
        });

        const institutionsListCard4 = Array.from(allInstitutionsCard4).sort();
        setInstitutionsCard4(institutionsListCard4);
        
        // Set "Total" as default for Card 4
        if (institutionsListCard4.includes("Total")) {
          setSelectedInstitutionCard4("Total");
        } else if (institutionsListCard4.length > 0) {
          setSelectedInstitutionCard4(institutionsListCard4[0]);
        }

        // Get unique institutions for Card 5 (including "Total")
        const allInstitutionsCard5 = new Set<string>();
        (dataQuinto || []).forEach((item) => {
          if (item.categoria) {
            allInstitutionsCard5.add(item.categoria);
          }
        });

        const institutionsListCard5 = Array.from(allInstitutionsCard5).sort();
        setInstitutionsCard5(institutionsListCard5);
        
        // Set "Total" as default for Card 5
        if (institutionsListCard5.includes("Total")) {
          setSelectedInstitutionCard5("Total");
        } else if (institutionsListCard5.length > 0) {
          setSelectedInstitutionCard5(institutionsListCard5[0]);
        }

      } catch (err: any) {
        console.error('Error fetching ATL data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Datos comparativos para la tarjeta 1 (ATAL_01 vs ATAL_02)
  const current2024Data = comparisonData;

  // Procesar datos de Card 4: Primero histórico - Entrada vs Salida
  const historicalPrimeroChartData = useMemo(() => {
    if (!dataPrimeroHistorico || dataPrimeroHistorico.length === 0) return [];

    // Filtrar por institución seleccionada
    const filteredData = dataPrimeroHistorico.filter((item) => item.categoria === selectedInstitutionCard4);

    if (filteredData.length === 0) return [];

    // Agrupar por año, separando entrada y salida
    const yearMap = new Map<number, { entrada: number; salida: number }>();

    filteredData.forEach((item) => {
      const year = item.year as number;
      const type = (item.categoria_3 as string) || "";
      let value = parseFloat(item.valor) || 0;
      
      // Multiplicar por 100 si es año 2024
      if (year === 2024) {
        value = value * 100;
      }

      if (!yearMap.has(year)) {
        yearMap.set(year, { entrada: 0, salida: 0 });
      }

      const yearData = yearMap.get(year)!;
      if (type === "Entrada") {
        yearData.entrada = value;
      } else if (type === "Salida") {
        yearData.salida = value;
      }
    });

    // Convertir a formato para el gráfico
    const chartData = Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, data]) => ({
        año: year.toString(),
        Entrada: data.entrada,
        Salida: data.salida
      }));

    console.log("ATL Primero - chartData", chartData);

    return chartData;
  }, [dataPrimeroHistorico, selectedInstitutionCard4]);

  // Procesar datos de Card 5: Quinto histórico - Entrada vs Salida
  const historicalQuintoChartData = useMemo(() => {
    if (!dataQuintoHistorico || dataQuintoHistorico.length === 0) return [];

    // Filtrar por institución seleccionada
    const filteredData = dataQuintoHistorico.filter((item) => item.categoria === selectedInstitutionCard5);

    if (filteredData.length === 0) return [];

    // Agrupar por año, separando entrada y salida
    const yearMap = new Map<number, { entrada: number; salida: number }>();

    filteredData.forEach((item) => {
      const year = item.year as number;
      const type = (item.categoria_3 as string) || "";
      let value = parseFloat(item.valor) || 0;
      
      // Multiplicar por 100 si es año 2024
      if (year === 2024) {
        value = value * 100;
      }

      if (!yearMap.has(year)) {
        yearMap.set(year, { entrada: 0, salida: 0 });
      }

      const yearData = yearMap.get(year)!;
      if (type === "Entrada") {
        yearData.entrada = value;
      } else if (type === "Salida") {
        yearData.salida = value;
      }
    });

    // Convertir a formato para el gráfico
    const chartData = Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, data]) => ({
        año: year.toString(),
        Entrada: data.entrada,
        Salida: data.salida
      }));

    console.log("ATL Quinto - chartData", chartData);

    return chartData;
  }, [dataQuintoHistorico, selectedInstitutionCard5]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar los datos de ATL: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Paleta de colores contrastantes según referencia visual Fundación Luker
  const gradesColors = {
    'Primero': 'hsl(85, 45%, 45%)',     // Verde oliva
    'Segundo': 'hsl(185, 65%, 45%)',    // Azul teal/turquesa
    'Tercero': 'hsl(270, 55%, 50%)',    // Morado/púrpura
    'Cuarto': 'hsl(0, 75%, 55%)',       // Rojo
    'Quinto': 'hsl(37, 97%, 62%)'       // Naranja Luker institucional
  };

  const grados = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"];

  return (
    <div className="space-y-6">
      {/* KPIs ATAL */}
      <EducationATALKPIs />

      {/* Tarjeta 1: Resultados 2024 - Entrada vs Salida (Total) */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
                <BookOpen className="h-5 w-5 text-luker-teal" />
                Resultados 2024: Comparativo Entrada vs. Salida
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Datos agregados de todas las instituciones educativas
              </p>
            </div>
            <ChartDownloadButton 
              chartRef={chart2024Ref} 
              title="ATAL Resultados 2024 Entrada vs Salida"
              excelData={current2024Data}
              excelColumns={[
                { header: "Grado", key: "grado" },
                { header: "Entrada (%)", key: "Entrada" },
                { header: "Salida (%)", key: "Salida" }
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6" ref={chart2024Ref}>
          {current2024Data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={current2024Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="grado" 
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis 
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', fill: 'hsl(122 56% 51%)' }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Entrada" fill="hsl(37 97% 62%)" name="Entrada" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Salida" fill="hsl(180 100% 34%)" name="Salida" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertDescription>
                No hay datos disponibles para 2024.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Filtro de Institución para Tarjeta 4 */}
      <Card className="border-luker-teal/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-luker-teal">
            <BookOpen className="h-5 w-5 text-luker-green" />
            Filtrar Avance Histórico Grado Primero
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona una institución para ver la evolución de grado primero
          </p>
        </CardHeader>
        <CardContent>
          <Select value={selectedInstitutionCard4} onValueChange={setSelectedInstitutionCard4}>
            <SelectTrigger className="w-full md:w-[400px] border-luker-teal/30">
              <SelectValue placeholder="Selecciona una institución" />
            </SelectTrigger>
            <SelectContent>
              {institutionsCard4.map((institution) => (
                <SelectItem key={institution} value={institution}>
                  {institution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tarjeta 4: Avance Histórico de Lectura - Grado Primero */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
                <BookOpen className="h-5 w-5 text-luker-teal" />
                Avance Histórico de Lectura (Grado Primero)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Porcentaje de Estudiantes de Primero con Nivel Estándar o Avanzado: Entrada vs. Salida - {selectedInstitutionCard4}
              </p>
            </div>
            <ChartDownloadButton 
              chartRef={chartPrimeroRef} 
              title={`ATAL Avance Histórico Primero - ${selectedInstitutionCard4}`}
              excelData={historicalPrimeroChartData}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "Entrada (%)", key: "Entrada" },
                { header: "Salida (%)", key: "Salida" }
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6" ref={chartPrimeroRef}>
          {historicalPrimeroChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalPrimeroChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="año" 
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis 
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', fill: 'hsl(122 56% 51%)' }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Entrada" fill="hsl(37 97% 62%)" name="Entrada" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Salida" fill="hsl(180 100% 34%)" name="Salida" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertDescription>
                No hay datos disponibles para la institución seleccionada.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Filtro de Institución para Tarjeta 5 */}
      <Card className="border-luker-teal/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-luker-teal">
            <BookOpen className="h-5 w-5 text-luker-green" />
            Filtrar Avance Histórico Grado Quinto
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona una institución para ver la evolución de grado quinto
          </p>
        </CardHeader>
        <CardContent>
          <Select value={selectedInstitutionCard5} onValueChange={setSelectedInstitutionCard5}>
            <SelectTrigger className="w-full md:w-[400px] border-luker-teal/30">
              <SelectValue placeholder="Selecciona una institución" />
            </SelectTrigger>
            <SelectContent>
              {institutionsCard5.map((institution) => (
                <SelectItem key={institution} value={institution}>
                  {institution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tarjeta 5: Avance Histórico de Lectura - Grado Quinto */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
                <BookOpen className="h-5 w-5 text-luker-teal" />
                Avance Histórico de Lectura (Grado Quinto)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Porcentaje de Estudiantes de Quinto con Nivel Estándar o Avanzado: Entrada vs. Salida - {selectedInstitutionCard5}
              </p>
            </div>
            <ChartDownloadButton 
              chartRef={chartQuintoRef} 
              title={`ATAL Avance Histórico Quinto - ${selectedInstitutionCard5}`}
              excelData={historicalQuintoChartData}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "Entrada (%)", key: "Entrada" },
                { header: "Salida (%)", key: "Salida" }
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6" ref={chartQuintoRef}>
          {historicalQuintoChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalQuintoChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="año" 
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis 
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', fill: 'hsl(122 56% 51%)' }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Entrada" fill="hsl(37 97% 62%)" name="Entrada" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Salida" fill="hsl(180 100% 34%)" name="Salida" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertDescription>
                No hay datos disponibles para la institución seleccionada.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationATL;
