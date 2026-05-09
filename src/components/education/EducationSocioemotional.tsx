import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

const EducationSocioemotional = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  
  // Refs para las gráficas
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);
  const chart4Ref = useRef<HTMLDivElement>(null);
  const chart5Ref = useRef<HTMLDivElement>(null);

  // Estado para Cards 1 y 2: Fortalecimiento Trabajo en Equipo (CSOC_01 + CSOC_03)
  const [fortalecimientoData, setFortalecimientoData] = useState<any[]>([]);
  const [institutionsFort, setInstitutionsFort] = useState<string[]>([]);
  const [selectedGradeFort1, setSelectedGradeFort1] = useState<string>("Media");
  const [selectedInstitutionFort2, setSelectedInstitutionFort2] = useState<string>("Total");
  
  // Estado para la tercera tarjeta (distribución de niveles - Media)
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Total");
  
  // Estado para la cuarta tarjeta (distribución de niveles - Quinto)
  const [distributionDataQuinto, setDistributionDataQuinto] = useState<any[]>([]);
  const [selectedCategoryQuinto, setSelectedCategoryQuinto] = useState<string>("Total");
  
  // Estado para la quinta tarjeta (columnas por nivel)
  const [columnData, setColumnData] = useState<any[]>([]);
  const [selectedYearColumn, setSelectedYearColumn] = useState<string>("");
  const [selectedGradeColumn, setSelectedGradeColumn] = useState<string>("Media");
  const [selectedCategoryColumn, setSelectedCategoryColumn] = useState<string>("Total");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch CSOC_01 + CSOC_03 (Prosperando + En proceso) - Manizales
        const { data: fortResult, error: fortError } = await supabase
          .from("dama_data")
          .select("anio, categoria, categoria_2, valor, cod_indicador")
          .in("cod_indicador", ["CSOC_01", "CSOC_03"])
          .eq("cod_entidad", "17001")
          .limit(10000);

        if (fortError) throw fortError;
        setFortalecimientoData(fortResult || []);

        const normalizeInst = (s: string) =>
          s && s.toLowerCase().trim() === 'escuela activa urbana' ? 'Escuela Activa' : s;
        const instSet = new Set<string>();
        (fortResult || []).forEach((it: any) => {
          if (it.categoria) {
            const norm = normalizeInst(it.categoria);
            if (norm && norm.toLowerCase() !== 'total') instSet.add(norm);
          }
        });
        setInstitutionsFort(['Total', ...Array.from(instSet).sort()]);


        // Fetch distribution data for third card
        const { data: distributionResult, error: distributionError } = await supabase
          .from("education_indicators")
          .select("*")
          .eq("seccion", "Competencias socioemocionales")
          .eq("categoria_2", "Media")
          .in("indicador", [
            "Porcentaje de estudiantes en riesgo - trabajo en equipo",
            "Porcentaje de estudiantes en proceso - trabajo en equipo",
            "Porcentaje de estudiantes prosperando - trabajo en equipo"
          ])
          .order("year", { ascending: true })
          .order("indicador", { ascending: true });

        if (distributionError) throw distributionError;
        
        setDistributionData(distributionResult || []);

        // Fetch distribution data for fourth card (Quinto)
        const { data: distributionResultQuinto, error: distributionErrorQuinto } = await supabase
          .from("education_indicators")
          .select("*")
          .eq("seccion", "Competencias socioemocionales")
          .eq("categoria_2", "Quinto")
          .in("indicador", [
            "Porcentaje de estudiantes en riesgo - trabajo en equipo",
            "Porcentaje de estudiantes en proceso - trabajo en equipo",
            "Porcentaje de estudiantes prosperando - trabajo en equipo"
          ])
          .order("year", { ascending: true })
          .order("indicador", { ascending: true });

        if (distributionErrorQuinto) throw distributionErrorQuinto;
        
        setDistributionDataQuinto(distributionResultQuinto || []);

        // Fetch data for fifth card (column chart)
        const { data: columnResult, error: columnError } = await supabase
          .from("education_indicators")
          .select("*")
          .eq("seccion", "Competencias socioemocionales")
          .in("indicador", [
            "Porcentaje de estudiantes en riesgo - trabajo en equipo",
            "Porcentaje de estudiantes en proceso - trabajo en equipo",
            "Porcentaje de estudiantes prosperando - trabajo en equipo"
          ])
          .order("year", { ascending: true })
          .order("indicador", { ascending: true });

        if (columnError) throw columnError;
        
        setColumnData(columnResult || []);

        // Extract unique years and categories for filters
        const uniqueYears = new Set<string>();
        const uniqueCategories = new Set<string>();
        (columnResult || []).forEach((item) => {
          if (item.year) {
            uniqueYears.add(item.year.toString());
          }
          if (item.categoria) {
            uniqueCategories.add(item.categoria);
          }
        });
        setAvailableYears(Array.from(uniqueYears).sort((a, b) => parseInt(b) - parseInt(a)));
        setAvailableCategories(Array.from(uniqueCategories).sort());

      } catch (err: any) {
        console.error('Error fetching socioemotional data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set default year when available years are loaded
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYearColumn) {
      setSelectedYearColumn(availableYears[0]); // Select most recent year
    }
  }, [availableYears, selectedYearColumn]);

  const normalizeInst = (s: string) =>
    s && s.toLowerCase().trim() === 'escuela activa urbana' ? 'Escuela Activa' : s;

  // Helper: agrupa por (institución, año) sumando CSOC_01 + CSOC_03 (ambos deben existir)
  const sumByInstitutionYear = (rows: any[]) => {
    const map = new Map<string, { entrada: number | null; salida: number | null }>();
    rows.forEach((r: any) => {
      const inst = normalizeInst(r.categoria);
      const year = r.anio;
      if (!inst || !year) return;
      const key = `${inst}__${year}`;
      if (!map.has(key)) map.set(key, { entrada: null, salida: null });
      const v = parseFloat(r.valor);
      if (Number.isNaN(v)) return;
      const slot = map.get(key)!;
      if (r.cod_indicador === 'CSOC_01') slot.entrada = v;
      else if (r.cod_indicador === 'CSOC_03') slot.salida = v;
    });
    const result: { inst: string; year: number; sum: number }[] = [];
    map.forEach((val, key) => {
      const [inst, yearStr] = key.split('__');
      const a = val.entrada ?? 0;
      const b = val.salida ?? 0;
      result.push({ inst, year: parseInt(yearStr), sum: a + b });
    });
    return result;
  };

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  // Card 1: 4 barras (EA, No EA, Rural, Total) - suma CSOC_01 + CSOC_03 - año 2024
  const chartData = useMemo(() => {
    if (!fortalecimientoData.length) return [];
    const rows = fortalecimientoData.filter(
      (r: any) => r.anio === 2024 && r.categoria_2 === selectedGradeFort1
    );
    const buckets: Record<string, { c1: number | null; c3: number | null }> = {
      EA: { c1: null, c3: null },
      "No EA": { c1: null, c3: null },
      Rural: { c1: null, c3: null },
    };
    rows.forEach((r: any) => {
      if (!buckets[r.categoria]) return;
      const v = parseFloat(r.valor);
      if (Number.isNaN(v)) return;
      if (r.cod_indicador === 'CSOC_01') buckets[r.categoria].c1 = v;
      else if (r.cod_indicador === 'CSOC_03') buckets[r.categoria].c3 = v;
    });
    const sumOf = (k: string) => (buckets[k].c1 ?? 0) + (buckets[k].c3 ?? 0);
    const ea = sumOf('EA');
    const noea = sumOf('No EA');
    const rural = sumOf('Rural');
    const total = Number(((ea + noea + rural) / 3).toFixed(2));
    return [
      { categoría: 'Escuela Activa', porcentaje: Number(ea.toFixed(2)) },
      { categoría: 'No Escuela Activa', porcentaje: Number(noea.toFixed(2)) },
      { categoría: 'Rural', porcentaje: Number(rural.toFixed(2)) },
      { categoría: 'Total', porcentaje: total },
    ];
  }, [fortalecimientoData, selectedGradeFort1]);

  // Card 2: histórico por año, mismo cálculo
  const historicalChartData = useMemo(() => {
    if (!fortalecimientoData.length) return [];
    const sums = sumByInstitutionYear(fortalecimientoData);
    const byYear = new Map<number, number[]>();
    sums.forEach(s => {
      if (selectedInstitutionFort2 !== 'Total' && s.inst !== selectedInstitutionFort2) return;
      if (!byYear.has(s.year)) byYear.set(s.year, []);
      byYear.get(s.year)!.push(s.sum);
    });
    return Array.from(byYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, vals]) => ({ año: year.toString(), Fortalecimiento: Number(avg(vals).toFixed(2)) }));
  }, [fortalecimientoData, selectedInstitutionFort2]);

  // Process data for distribution chart (third card)
  const distributionChartData = useMemo(() => {
    if (!distributionData || distributionData.length === 0) return [];

    const filteredData = distributionData.filter(item => item.categoria === selectedCategory);
    
    // Group by year
    const yearGroups = filteredData.reduce((acc, item) => {
      const year = item.year.toString();
      if (!acc[year]) {
        acc[year] = { año: year };
      }
      
      // Simplify indicator names for display
      if (item.indicador.includes("riesgo")) {
        acc[year]["Riesgo"] = parseFloat(item.valor) || 0;
      } else if (item.indicador.includes("proceso")) {
        acc[year]["Proceso"] = parseFloat(item.valor) || 0;
      } else if (item.indicador.includes("prosperando")) {
        acc[year]["Prosperando"] = parseFloat(item.valor) || 0;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(yearGroups).sort((a: any, b: any) => parseInt(a.año) - parseInt(b.año));
  }, [distributionData, selectedCategory]);

  // Process data for distribution chart - Quinto (fourth card)
  const distributionChartDataQuinto = useMemo(() => {
    if (!distributionDataQuinto || distributionDataQuinto.length === 0) return [];

    const filteredData = distributionDataQuinto.filter(item => item.categoria === selectedCategoryQuinto);
    
    // Group by year
    const yearGroups = filteredData.reduce((acc, item) => {
      const year = item.year.toString();
      if (!acc[year]) {
        acc[year] = { año: year };
      }
      
      // Simplify indicator names for display
      if (item.indicador.includes("riesgo")) {
        acc[year]["Riesgo"] = parseFloat(item.valor) || 0;
      } else if (item.indicador.includes("proceso")) {
        acc[year]["Proceso"] = parseFloat(item.valor) || 0;
      } else if (item.indicador.includes("prosperando")) {
        acc[year]["Prosperando"] = parseFloat(item.valor) || 0;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(yearGroups).sort((a: any, b: any) => parseInt(a.año) - parseInt(b.año));
  }, [distributionDataQuinto, selectedCategoryQuinto]);

  // Process data for column chart (fifth card)
  const columnChartData = useMemo(() => {
    if (!columnData || columnData.length === 0) return [];

    const filteredData = columnData.filter(
      item => 
        item.year.toString() === selectedYearColumn &&
        item.categoria_2 === selectedGradeColumn &&
        item.categoria === selectedCategoryColumn
    );
    
    // Map indicator to simplified label and create data structure
    const labelMap: Record<string, string> = {
      "Porcentaje de estudiantes en riesgo - trabajo en equipo": "En riesgo",
      "Porcentaje de estudiantes en proceso - trabajo en equipo": "En proceso",
      "Porcentaje de estudiantes prosperando - trabajo en equipo": "Prosperando"
    };

    return filteredData.map(item => ({
      nivel: labelMap[item.indicador] || item.indicador,
      porcentaje: parseFloat(item.valor) || 0,
      indicadorOriginal: item.indicador
    })).sort((a, b) => {
      // Sort order: En riesgo, En proceso, Prosperando
      const order = ["En riesgo", "En proceso", "Prosperando"];
      return order.indexOf(a.nivel) - order.indexOf(b.nivel);
    });
  }, [columnData, selectedYearColumn, selectedGradeColumn, selectedCategoryColumn]);

  // Custom tick component for multi-line labels on mobile
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const text = payload.value as string;
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 9 : 12;
    
    // On mobile, allow up to 3 lines for long labels
    if (isMobile) {
      let lines: string[] = [];

      if (text === "No Escuela Activa") {
        lines = ["No", "Escuela", "Activa"];
      } else if (text === "Escuela Activa") {
        lines = ["Escuela", "Activa"];
      } else {
        const words = text.split(" ");
        if (words.length <= 1) {
          lines = [text];
        } else {
          const midPoint = Math.ceil(words.length / 2);
          lines = [words.slice(0, midPoint).join(" "), words.slice(midPoint).join(" ")];
        }
      }

      return (
        <g transform={`translate(${x},${y})`}>
          <text 
            x={0} 
            y={0} 
            dy={8} 
            textAnchor="middle" 
            fill="hsl(122 56% 51%)" 
            fontSize={fontSize}
            fontWeight="500"
          >
            {lines.map((line, index) => (
              <tspan key={index} x={0} dy={index === 0 ? "0" : "11"}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      );
    }
    
    // Desktop: single line is fine
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={8} 
          textAnchor="middle" 
          fill="hsl(122 56% 51%)" 
          fontSize={fontSize}
          fontWeight="500"
        >
          {text}
        </text>
      </g>
    );
  };

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
          Error al cargar los datos: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tarjeta 1: Fortalecimiento Trabajo en Equipo - Año 2024 */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Brain className="h-5 w-5 text-luker-teal" />
              Estudiantes en fortalecimiento en Trabajo en Equipo
            </CardTitle>
            <ChartDownloadButton
              chartRef={chart1Ref}
              title={`Fortalecimiento Trabajo en Equipo - Grado ${selectedGradeFort1} 2024`}
              excelData={chartData}
              excelColumns={[
                { header: "Categoría", key: "categoría" },
                { header: "Porcentaje (%)", key: "porcentaje" }
              ]}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            En proceso + prosperando Grado {selectedGradeFort1} - Año 2024
          </p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Selecciona el grado
            </label>
            <Select value={selectedGradeFort1} onValueChange={setSelectedGradeFort1}>
              <SelectTrigger className="w-full md:w-[360px] border-luker-teal/30 bg-background">
                <SelectValue placeholder="Selecciona un grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Quinto">Quinto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={chart1Ref}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="categoría"
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
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'En proceso + Prosperando']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                  />
                  <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                  <Bar
                    dataKey="porcentaje"
                    fill="hsl(37 97% 62%)"
                    name="En proceso + Prosperando"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay datos disponibles para la institución seleccionada.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 2: Evolución Histórica Fortalecimiento Trabajo en Equipo */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Brain className="h-5 w-5 text-luker-teal" />
              Evolución Histórica - Estudiantes en fortalecimiento Trabajo en Equipo Media
            </CardTitle>
            <ChartDownloadButton
              chartRef={chart2Ref}
              title={`Evolución Fortalecimiento Trabajo en Equipo - ${selectedInstitutionFort2}`}
              excelData={historicalChartData}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "En proceso + Prosperando (%)", key: "Fortalecimiento" }
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Selecciona una institución
            </label>
            <Select value={selectedInstitutionFort2} onValueChange={setSelectedInstitutionFort2}>
              <SelectTrigger className="w-full md:w-[360px] border-luker-teal/30 bg-background">
                <SelectValue placeholder="Selecciona una institución" />
              </SelectTrigger>
              <SelectContent>
                {institutionsFort.map((inst) => (
                  <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            En proceso + prosperando Grado Media - Total
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={chart2Ref}>
            {historicalChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalChartData}>
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
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'En proceso + Prosperando']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                  />
                  <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                  <Bar
                    dataKey="Fortalecimiento"
                    fill="hsl(173 58% 39%)"
                    name="En proceso + Prosperando"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay datos históricos disponibles para la institución seleccionada.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 3: Distribución de Niveles de Desempeño - Quinto */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Brain className="h-5 w-5 text-luker-teal" />
              Distribución de Niveles de Desempeño en Trabajo en Equipo
            </CardTitle>
            <ChartDownloadButton
              chartRef={chart4Ref}
              title={`Distribución Niveles Desempeño Quinto - ${selectedCategoryQuinto}`}
              excelData={distributionChartDataQuinto}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "Riesgo (%)", key: "Riesgo" },
                { header: "Proceso (%)", key: "Proceso" },
                { header: "Prosperando (%)", key: "Prosperando" }
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Selecciona una categoría
            </label>
            <Select value={selectedCategoryQuinto} onValueChange={setSelectedCategoryQuinto}>
              <SelectTrigger className="w-full md:w-[360px] border-luker-teal/30 bg-background">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Total">Total</SelectItem>
                <SelectItem value="EA">Escuela Activa</SelectItem>
                <SelectItem value="No EA">No Escuela Activa</SelectItem>
                <SelectItem value="Rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Grado Quinto - {selectedCategoryQuinto === "EA" ? "Escuela Activa" : selectedCategoryQuinto === "No EA" ? "No Escuela Activa" : selectedCategoryQuinto}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={chart4Ref}>
          {distributionChartDataQuinto.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={distributionChartDataQuinto} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="año"
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Riesgo" stackId="a" fill="hsl(0 84% 60%)" name="En Riesgo" />
                <Bar dataKey="Proceso" stackId="a" fill="hsl(37 97% 62%)" name="En Proceso" />
                <Bar dataKey="Prosperando" stackId="a" fill="hsl(122 56% 51%)" name="Prosperando" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos de distribución disponibles para la categoría seleccionada.
              </AlertDescription>
            </Alert>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 4: Distribución de Niveles de Desempeño - Media */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Brain className="h-5 w-5 text-luker-teal" />
              Distribución de Niveles de Desempeño en Trabajo en Equipo
            </CardTitle>
            <ChartDownloadButton
              chartRef={chart3Ref}
              title={`Distribución Niveles Desempeño Media - ${selectedCategory}`}
              excelData={distributionChartData}
              excelColumns={[
                { header: "Año", key: "año" },
                { header: "Riesgo (%)", key: "Riesgo" },
                { header: "Proceso (%)", key: "Proceso" },
                { header: "Prosperando (%)", key: "Prosperando" }
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Selecciona una categoría
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[360px] border-luker-teal/30 bg-background">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Total">Total</SelectItem>
                <SelectItem value="EA">Escuela Activa</SelectItem>
                <SelectItem value="No EA">No Escuela Activa</SelectItem>
                <SelectItem value="Rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Grado Media - {selectedCategory === "EA" ? "Escuela Activa" : selectedCategory === "No EA" ? "No Escuela Activa" : selectedCategory}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={chart3Ref}>
          {distributionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={distributionChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="año"
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar dataKey="Riesgo" stackId="a" fill="hsl(0 84% 60%)" name="En Riesgo" />
                <Bar dataKey="Proceso" stackId="a" fill="hsl(37 97% 62%)" name="En Proceso" />
                <Bar dataKey="Prosperando" stackId="a" fill="hsl(122 56% 51%)" name="Prosperando" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos de distribución disponibles para la categoría seleccionada.
              </AlertDescription>
            </Alert>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 5: Análisis por Nivel con Filtros Múltiples */}
      <Card className="border-luker-green/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-luker-green/5 to-luker-teal/5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl flex items-center gap-2 text-luker-green">
              <Brain className="h-5 w-5 text-luker-teal" />
              Desempeño en Trabajo en Equipo por Nivel
            </CardTitle>
            <ChartDownloadButton
              chartRef={chart5Ref}
              title={`Desempeño Trabajo en Equipo - ${selectedYearColumn} ${selectedGradeColumn} ${selectedCategoryColumn}`}
              excelData={columnChartData}
              excelColumns={[
                { header: "Nivel", key: "nivel" },
                { header: "Porcentaje (%)", key: "porcentaje" }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Año</label>
              <Select value={selectedYearColumn} onValueChange={setSelectedYearColumn}>
                <SelectTrigger className="w-full border-luker-teal/30 bg-background">
                  <SelectValue placeholder="Selecciona un año" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Grado</label>
              <Select value={selectedGradeColumn} onValueChange={setSelectedGradeColumn}>
                <SelectTrigger className="w-full border-luker-teal/30 bg-background">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Quinto">Quinto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Institución Educativa</label>
              <Select value={selectedCategoryColumn} onValueChange={setSelectedCategoryColumn}>
                <SelectTrigger className="w-full border-luker-teal/30 bg-background">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Análisis por IE - Año {selectedYearColumn}, Grado {selectedGradeColumn}, {selectedCategoryColumn}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={chart5Ref}>
          {columnChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={columnChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="nivel"
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <YAxis
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', fill: 'hsl(122 56% 51%)' }}
                  tick={{ fill: 'hsl(122 56% 51%)' }}
                  axisLine={{ stroke: 'hsl(122 56% 51%)' }}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Porcentaje']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(122 56% 51%)' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(122 56% 51%)' }} />
                <Bar
                  dataKey="porcentaje"
                  fill="hsl(37 97% 62%)"
                  name="Porcentaje de estudiantes"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para los filtros seleccionados.
              </AlertDescription>
            </Alert>
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationSocioemotional;
