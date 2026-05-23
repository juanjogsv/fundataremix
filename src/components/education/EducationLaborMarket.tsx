import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

const EducationLaborMarket = () => {
  // Refs para las gráficas
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const chartRef3 = useRef<HTMLDivElement>(null);

  // Query para obtener datos de ocupación de egresados (MLJ_02 - Condición de actividad de egresados)
  const { data: occupationData, isLoading: isLoadingOccupation, error: errorOccupation } = useQuery({
    queryKey: ["education-labor-market-occupation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcv_indicators")
        .select("*")
        .eq("cod_indicador", "MLJ_02")
        .eq("entidad", "Manizales")
        .order("year", { ascending: false });

      if (error) throw error;
      return (data || []).map((d: any) => ({ ...d, valor: d.dato, departamento: d.entidad }));
    },
  });

  // Query para obtener datos de situación ocupacional
  const { data: occupationalData, isLoading: isLoadingOccupational, error: errorOccupational } = useQuery({
    queryKey: ["education-labor-market-occupational"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcv_indicators")
        .select("*")
        .eq("cod_indicador", "MLJ_02")
        .eq("entidad", "Manizales")
        .in("categoria", ["Estudiando y trabajando", "Solo trabajando", "Solo estudiando", "Buscando trabajo", "NOES"])
        .order("year", { ascending: true });

      if (error) throw error;
      return (data || []).map((d: any) => ({ ...d, valor: d.dato }));
    },
  });

  // Query para KPI de Ocupación Total (último año disponible, dinámico)
  const { data: totalOccupationData, isLoading: isLoadingTotal, error: errorTotal } = useQuery({
    queryKey: ["education-labor-market-total"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcv_indicators")
        .select("*")
        .eq("cod_indicador", "MLJ_02")
        .eq("entidad", "Manizales")
        .in("categoria", ["Estudiando y trabajando", "Solo trabajando", "Solo estudiando"])
        .order("year", { ascending: false });

      if (error) throw error;
      const rows = (data || []).map((d: any) => ({ ...d, valor: d.dato }));
      if (rows.length === 0) return rows;
      const latestYear = Math.max(...rows.map((r: any) => r.year));
      return rows.filter((r: any) => r.year === latestYear);
    },
  });

  // Query para histórico de Ocupación Total (todos los años)
  const { data: historicalOccupationData, isLoading: isLoadingHistorical, error: errorHistorical } = useQuery({
    queryKey: ["education-labor-market-historical"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcv_indicators")
        .select("*")
        .eq("cod_indicador", "MLJ_02")
        .eq("entidad", "Manizales")
        .in("categoria", ["Estudiando y trabajando", "Solo trabajando", "Solo estudiando"])
        .order("year", { ascending: true });

      if (error) throw error;
      return (data || []).map((d: any) => ({ ...d, valor: d.dato }));
    },
  });

  // Procesar datos para el gráfico - último año disponible
  const chartData = useMemo(() => {
    if (!occupationData || occupationData.length === 0) return [];

    // Obtener el último año disponible
    const latestYear = Math.max(...occupationData.map(item => item.year));
    
    // Filtrar datos del último año y agrupar por categoría
    const latestYearData = occupationData
      .filter(item => item.year === latestYear && item.categoria)
      .map(item => ({
        categoría: item.categoria,
        ocupación: Number(item.valor) || 0
      }))
      .sort((a, b) => b.ocupación - a.ocupación); // Orden descendente

    return latestYearData;
  }, [occupationData]);

  // Procesar datos de situación ocupacional - crear series por categoría
  const occupationalChartData = useMemo(() => {
    if (!occupationalData || occupationalData.length === 0) return [];

    // Agrupar por año y categoría
    const yearMap = new Map<number, any>();
    
    occupationalData.forEach(item => {
      const year = item.year;
      const categoria = item.categoria;
      const value = Number(item.valor) || 0;
      
      if (!yearMap.has(year)) {
        yearMap.set(year, { año: year.toString() });
      }
      
      const yearData = yearMap.get(year);
      yearData[categoria] = value;
    });

    // Convertir a array y ordenar por año
    return Array.from(yearMap.values())
      .sort((a, b) => Number(a.año) - Number(b.año));
  }, [occupationalData]);

  // Calcular KPI de ocupación total
  const totalOccupation = useMemo(() => {
    if (!totalOccupationData || totalOccupationData.length === 0) return 0;
    return totalOccupationData.reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
  }, [totalOccupationData]);

  // Procesar datos históricos de ocupación total
  const historicalChartData = useMemo(() => {
    if (!historicalOccupationData || historicalOccupationData.length === 0) return [];

    // Agrupar por año y sumar los valores de las 3 categorías
    const yearMap = new Map<number, number>();
    
    historicalOccupationData.forEach(item => {
      const year = item.year;
      const value = Number(item.valor) || 0;
      
      if (!yearMap.has(year)) {
        yearMap.set(year, 0);
      }
      
      yearMap.set(year, yearMap.get(year)! + value);
    });

    // Convertir a array y ordenar por año
    return Array.from(yearMap.entries())
      .map(([year, total]) => ({
        año: year.toString(),
        ocupación_total: Number(total.toFixed(1))
      }))
      .sort((a, b) => Number(a.año) - Number(b.año));
  }, [historicalOccupationData]);

  const isLoading = isLoadingOccupation || isLoadingOccupational || isLoadingTotal || isLoadingHistorical;
  const error = errorOccupation || errorOccupational || errorTotal || errorHistorical;

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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tarjeta 3: KPI Ocupación Total Juvenil */}
      <Card className="border-luker-orange/20 shadow-lg bg-gradient-to-br from-luker-orange/5 to-luker-teal/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-luker-orange">
            <Briefcase className="h-5 w-5 text-luker-teal" />
            Ocupación egresados Año 2024
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Suma de: Estudiando y trabajando, Solo trabajando, Solo estudiando
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-6xl font-bold text-luker-orange mb-2">
              {totalOccupation.toFixed(1)}%
            </div>
            <div className="text-sm text-luker-teal">
              Ocupación Total Juvenil 2024
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 1: Ocupación de Egresados por Categoría */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Briefcase className="h-5 w-5 text-luker-teal" />
              Situación ocupacional de los egresados
            </CardTitle>
            <ChartDownloadButton
              chartRef={chartRef1}
              title="Situación ocupacional de los egresados"
              excelData={chartData}
              excelColumns={[
                { header: "Categoría", key: "categoría" },
                { header: "Ocupación (%)", key: "ocupación" }
              ]}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Porcentaje de ocupación de egresados según categoría
          </p>
        </CardHeader>
        <CardContent className="pt-6" ref={chartRef1}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ left: 40, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="categoría" 
                  tick={{ fill: 'hsl(122 56% 51%)', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  label={{ 
                    value: 'Ocupación', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: 'hsl(122 56% 51%)',
                    style: { textAnchor: 'middle', fontSize: 12 },
                    dx: -10
                  }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Ocupación']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Bar 
                  dataKey="ocupación" 
                  fill="hsl(37 97% 62%)" 
                  name="% Ocupación"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para esta sección. Por favor, cargue los datos desde el módulo de administración.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tarjeta 2: Evolución Histórica de la Situación Ocupacional de Egresados */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Briefcase className="h-5 w-5 text-luker-teal" />
              Evolución Histórica de la Situación Ocupacional de Egresados
            </CardTitle>
            <ChartDownloadButton
              chartRef={chartRef2}
              title="Evolución Histórica Situación Ocupacional"
              excelData={occupationalChartData}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "Estudiando y trabajando (%)", key: "Estudiando y trabajando" },
                { header: "Solo trabajando (%)", key: "Solo trabajando" },
                { header: "Solo estudiando (%)", key: "Solo estudiando" },
                { header: "Buscando trabajo (%)", key: "Buscando trabajo" },
                { header: "NOES (%)", key: "NOES" }
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6" ref={chartRef2}>
          {occupationalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={occupationalChartData} margin={{ left: 40, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="año" 
                  tick={{ fill: 'hsl(122 56% 51%)', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis 
                  label={{ 
                    value: 'Egresados', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: 'hsl(122 56% 51%)',
                    style: { textAnchor: 'middle', fontSize: 12 },
                    dx: -10
                  }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone"
                  dataKey="Estudiando y trabajando" 
                  stroke="hsl(37 97% 62%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(37 97% 62%)', r: 4 }}
                  name="Estudiando y trabajando"
                />
                <Line 
                  type="monotone"
                  dataKey="Solo trabajando" 
                  stroke="hsl(122 56% 51%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(122 56% 51%)', r: 4 }}
                  name="Solo trabajando"
                />
                <Line 
                  type="monotone"
                  dataKey="Solo estudiando" 
                  stroke="hsl(175 65% 42%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(175 65% 42%)', r: 4 }}
                  name="Solo estudiando"
                />
                <Line 
                  type="monotone"
                  dataKey="Buscando trabajo" 
                  stroke="hsl(0 84% 60%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(0 84% 60%)', r: 4 }}
                  name="Buscando trabajo"
                />
                <Line 
                  type="monotone"
                  dataKey="NOES" 
                  stroke="hsl(280 65% 60%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(280 65% 60%)', r: 4 }}
                  name="NOES"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para esta sección. Por favor, cargue los datos desde el módulo de administración.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tarjeta 4: Ocupación Total Histórica por Año */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Briefcase className="h-5 w-5 text-luker-teal" />
              Ocupación histórica egresados
            </CardTitle>
            <ChartDownloadButton
              chartRef={chartRef3}
              title="Ocupación histórica egresados"
              excelData={historicalChartData}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "Ocupación Total (%)", key: "ocupación_total" }
              ]}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Suma de: Estudiando y trabajando, Solo trabajando, Solo estudiando
          </p>
        </CardHeader>
        <CardContent className="pt-6" ref={chartRef3}>
          {historicalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalChartData} margin={{ left: 40, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="año" 
                  tick={{ fill: 'hsl(122 56% 51%)', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis 
                  label={{ 
                    value: 'Ocupación Total', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: 'hsl(122 56% 51%)',
                    style: { textAnchor: 'middle', fontSize: 12 },
                    dx: -10
                  }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Ocupación Total']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Bar 
                  dataKey="ocupación_total" 
                  fill="hsl(175 65% 42%)" 
                  name="Ocupación Total"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para esta sección. Por favor, cargue los datos desde el módulo de administración.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationLaborMarket;
