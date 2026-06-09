import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ecosistema } from "@/integrations/ecosistema/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
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
        
        // Determine latest year for ATAL_01 / ATAL_02 (Manizales)
        const [{ data: y1 }, { data: y2 }] = await Promise.all([
          ecosistema.from('datos_maestros').select('anio').eq('cod_indicador', 'ATAL_01').eq('cod_entidad', '17001').order('anio', { ascending: false }).limit(1),
          ecosistema.from('datos_maestros').select('anio').eq('cod_indicador', 'ATAL_02').eq('cod_entidad', '17001').order('anio', { ascending: false }).limit(1),
        ]);
        const latestYear = Math.max(y1?.[0]?.anio ?? 0, y2?.[0]?.anio ?? 0) || null;
        setComparisonYear(latestYear);

        const grados = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"];
        const acc: Record<string, { b: number[]; r: number[] }> = {};
        grados.forEach(g => { acc[g] = { b: [], r: [] }; });

        if (latestYear) {
          const [{ data: a1, error: e1 }, { data: a2, error: e2 }] = await Promise.all([
            ecosistema.from('datos_maestros').select('categoria_2, valor').eq('cod_indicador', 'ATAL_01').eq('cod_entidad', '17001').eq('anio', latestYear).limit(5000),
            ecosistema.from('datos_maestros').select('categoria_2, valor').eq('cod_indicador', 'ATAL_02').eq('cod_entidad', '17001').eq('anio', latestYear).limit(5000),
          ]);
          if (e1) throw e1;
          if (e2) throw e2;
          (a1 || []).forEach((row: any) => {
            const g = row.categoria_2;
            const v = parseFloat(row.valor);
            if (g && acc[g] && !Number.isNaN(v)) acc[g].b.push(v);
          });
          (a2 || []).forEach((row: any) => {
            const g = row.categoria_2;
            const v = parseFloat(row.valor);
            if (g && acc[g] && !Number.isNaN(v)) acc[g].r.push(v);
          });
        }

        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        setComparisonData(grados.map(g => ({
          grado: g,
          'Entrada': Number(avg(acc[g].b).toFixed(2)),
          'Salida': Number(avg(acc[g].r).toFixed(2)),
        })));

        // Fetch data for Card 4: Primero histórico (Entrada ATAL_01 vs Salida ATAL_02) desde dama_data
        const { data: dataPrimero, error: errorPrimero } = await supabase
          .from('dama_data')
          .select('anio, categoria, valor, cod_indicador')
          .in('cod_indicador', ['ATAL_01', 'ATAL_02'])
          .eq('categoria_2', 'Primero')
          .gte('anio', 2018)
          .lte('anio', 2025)
          .limit(10000);

        if (errorPrimero) throw errorPrimero;
        console.log("📚 Datos PRIMERO (dama_data) obtenidos:", dataPrimero?.length || 0, "registros");
        setDataPrimeroHistorico(dataPrimero || []);

        // Fetch data for Card 5: Quinto histórico (Entrada ATAL_01 vs Salida ATAL_02) desde dama_data
        const { data: dataQuinto, error: errorQuinto } = await supabase
          .from('dama_data')
          .select('anio, categoria, valor, cod_indicador')
          .in('cod_indicador', ['ATAL_01', 'ATAL_02'])
          .eq('categoria_2', 'Quinto')
          .gte('anio', 2018)
          .lte('anio', 2025)
          .limit(10000);

        if (errorQuinto) throw errorQuinto;
        console.log("📘 Datos QUINTO (dama_data) obtenidos:", dataQuinto?.length || 0, "registros");
        setDataQuintoHistorico(dataQuinto || []);

        // Get unique institutions for Card 4 (including "Total")
        const normalizeInst = (s: string) =>
          s && s.toLowerCase().trim() === 'escuela activa urbana' ? 'Escuela Activa' : s;
        const allInstitutionsCard4 = new Set<string>();
        (dataPrimero || []).forEach((item: any) => {
          if (item.categoria) {
            allInstitutionsCard4.add(normalizeInst(item.categoria));
          }
        });

        const institutionsListCard4 = ['Total', ...Array.from(allInstitutionsCard4).sort()];
        setInstitutionsCard4(institutionsListCard4);
        setSelectedInstitutionCard4('Total');

        // Get unique institutions for Card 5 (including "Total")
        const allInstitutionsCard5 = new Set<string>();
        (dataQuinto || []).forEach((item: any) => {
          if (item.categoria) {
            allInstitutionsCard5.add(normalizeInst(item.categoria));
          }
        });

        const institutionsListCard5 = ['Total', ...Array.from(allInstitutionsCard5).sort()];
        setInstitutionsCard5(institutionsListCard5);
        setSelectedInstitutionCard5('Total');

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

  // Procesar datos de Card 4: Primero histórico - Entrada (ATAL_01) vs Salida (ATAL_02) desde dama_data
  const historicalPrimeroChartData = useMemo(() => {
    if (!dataPrimeroHistorico || dataPrimeroHistorico.length === 0) return [];

    const normalizeInst = (s: string) =>
      s && s.toLowerCase().trim() === 'escuela activa urbana' ? 'Escuela Activa' : s;

    const filteredData = selectedInstitutionCard4 === 'Total'
      ? dataPrimeroHistorico
      : dataPrimeroHistorico.filter((item: any) => normalizeInst(item.categoria) === selectedInstitutionCard4);

    if (filteredData.length === 0) return [];

    // Agrupar por año, promediando ATAL_01 (Entrada) y ATAL_02 (Salida)
    const yearMap = new Map<number, { entrada: number[]; salida: number[] }>();

    filteredData.forEach((item: any) => {
      const year = item.anio as number;
      const value = parseFloat(item.valor);
      if (!year || Number.isNaN(value)) return;

      if (!yearMap.has(year)) yearMap.set(year, { entrada: [], salida: [] });
      const yd = yearMap.get(year)!;
      if (item.cod_indicador === 'ATAL_01') yd.entrada.push(value);
      else if (item.cod_indicador === 'ATAL_02') yd.salida.push(value);
    });

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, data]) => ({
        año: year.toString(),
        Entrada: Number(avg(data.entrada).toFixed(2)),
        Salida: Number(avg(data.salida).toFixed(2)),
      }));
  }, [dataPrimeroHistorico, selectedInstitutionCard4]);

  // Procesar datos de Card 5: Quinto histórico - Entrada (ATAL_01) vs Salida (ATAL_02) desde dama_data
  const historicalQuintoChartData = useMemo(() => {
    if (!dataQuintoHistorico || dataQuintoHistorico.length === 0) return [];

    const normalizeInst = (s: string) =>
      s && s.toLowerCase().trim() === 'escuela activa urbana' ? 'Escuela Activa' : s;

    const filteredData = selectedInstitutionCard5 === 'Total'
      ? dataQuintoHistorico
      : dataQuintoHistorico.filter((item: any) => normalizeInst(item.categoria) === selectedInstitutionCard5);

    if (filteredData.length === 0) return [];

    const yearMap = new Map<number, { entrada: number[]; salida: number[] }>();

    filteredData.forEach((item: any) => {
      const year = item.anio as number;
      const value = parseFloat(item.valor);
      if (!year || Number.isNaN(value)) return;

      if (!yearMap.has(year)) yearMap.set(year, { entrada: [], salida: [] });
      const yd = yearMap.get(year)!;
      if (item.cod_indicador === 'ATAL_01') yd.entrada.push(value);
      else if (item.cod_indicador === 'ATAL_02') yd.salida.push(value);
    });

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, data]) => ({
        año: year.toString(),
        Entrada: Number(avg(data.entrada).toFixed(2)),
        Salida: Number(avg(data.salida).toFixed(2)),
      }));
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

      {/* Tarjeta 1: Comparativo Entrada (ATAL_01) vs Salida (ATAL_02) */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
                <BookOpen className="h-5 w-5 text-luker-teal" />
                Resultados Fluidez: Comparativo Entrada vs. Salida
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                % de estudiantes Nivel Estándar o Avanzado Fluidez - Año {comparisonYear ?? 2025}
              </p>
            </div>
            <ChartDownloadButton 
              chartRef={chart2024Ref} 
              title={`ATAL Comparativo Entrada vs Salida ${comparisonYear ?? ""}`}
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
                <Bar dataKey="Entrada" fill="hsl(37 97% 62%)" name="Entrada" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Entrada" position="top" formatter={(v: any) => Number(v) === 0 ? '0' : ''} fill="hsl(122 56% 51%)" fontSize={12} />
                </Bar>
                <Bar dataKey="Salida" fill="hsl(180 100% 34%)" name="Salida" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Salida" position="top" formatter={(v: any) => Number(v) === 0 ? '0' : ''} fill="hsl(122 56% 51%)" fontSize={12} />
                </Bar>
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

      {/* Tarjeta 4: Avance Histórico de Lectura - Grado Primero */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <BookOpen className="h-5 w-5 text-luker-teal" />
              Avance Histórico Fluidez Lectura (Grado Primero)
            </CardTitle>
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Selecciona una institución para ver la evolución
            </label>
            <Select value={selectedInstitutionCard4} onValueChange={setSelectedInstitutionCard4}>
              <SelectTrigger className="w-full md:w-[360px] border-luker-teal/30 bg-background">
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
          </div>
          <p className="text-sm text-muted-foreground">
            Porcentaje de Estudiantes de Primero con Nivel Estándar o Avanzado Fluidez: Entrada vs. Salida - {selectedInstitutionCard4}
          </p>
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
                  domain={[0, 80]}
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', fill: 'hsl(122 56% 51%)' }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Entrada" fill="hsl(37 97% 62%)" name="Entrada" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Entrada" position="top" formatter={(v: any) => Number(v) === 0 ? '0' : ''} fill="hsl(122 56% 51%)" fontSize={12} />
                </Bar>
                <Bar dataKey="Salida" fill="hsl(180 100% 34%)" name="Salida" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Salida" position="top" formatter={(v: any) => Number(v) === 0 ? '0' : ''} fill="hsl(122 56% 51%)" fontSize={12} />
                </Bar>
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

      {/* Tarjeta 5: Avance Histórico de Lectura - Grado Quinto */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <BookOpen className="h-5 w-5 text-luker-teal" />
              Avance Histórico Fluidez Lectura (Grado Quinto)
            </CardTitle>
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Selecciona una institución para ver la evolución
            </label>
            <Select value={selectedInstitutionCard5} onValueChange={setSelectedInstitutionCard5}>
              <SelectTrigger className="w-full md:w-[360px] border-luker-teal/30 bg-background">
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
          </div>
          <p className="text-sm text-muted-foreground">
            Porcentaje de Estudiantes de Quinto con Nivel Estándar o Avanzado Fluidez: Entrada vs. Salida - {selectedInstitutionCard5}
          </p>
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
                  domain={[0, 100]}
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', fill: 'hsl(122 56% 51%)' }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Entrada" fill="hsl(37 97% 62%)" name="Entrada" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Entrada" position="top" formatter={(v: any) => Number(v) === 0 ? '0' : ''} fill="hsl(122 56% 51%)" fontSize={12} />
                </Bar>
                <Bar dataKey="Salida" fill="hsl(180 100% 34%)" name="Salida" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Salida" position="top" formatter={(v: any) => Number(v) === 0 ? '0' : ''} fill="hsl(122 56% 51%)" fontSize={12} />
                </Bar>
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
