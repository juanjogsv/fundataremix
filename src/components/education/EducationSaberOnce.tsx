import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

const EducationSaberOnce = () => {
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);

  // Card 1: Saber 11 histórico desde dama_data (entidad Manizales = 17001)
  const SABER_OPTIONS = [
    { code: "SABER_02", label: "Puntaje Global" },
    { code: "SABER_05", label: "Matemáticas" },
    { code: "SABER_04", label: "Lectura Crítica" },
    { code: "SABER_01", label: "Ciencias Naturales" },
    { code: "SABER_06", label: "Sociales y Ciudadanas" },
    { code: "SABER_03", label: "Inglés" },
  ];

  const getCategoryLabel = (category: string) => {
    if (category === "Solo once") return "Sin ciclos";
    return category;
  };

  const [selectedIndicator, setSelectedIndicator] = useState<string>("SABER_02");
  const [selectedCategory, setSelectedCategory] = useState("Total");
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);

  const { data: damaSaberData, isLoading, error } = useQuery({
    queryKey: ["dama-saber-manizales", selectedIndicator],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dama_data")
        .select("anio, categoria, valor, cod_indicador")
        .eq("cod_indicador", selectedIndicator)
        .eq("cod_entidad", "17001")
        .order("anio", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // For legacy code below (Card 2 ranking uses indicators list from education_indicators)
  const { data: indicators } = useQuery({
    queryKey: ["education-saber-once-legacy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_indicators")
        .select("*")
        .eq("seccion", "Resultados pruebas Saber 11")
        .eq("departamento", "Manizales")
        .order("year", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (indicators && indicators.length > 0) {
      const indicatorsList = Array.from(new Set(indicators.map(i => i.indicador).filter(Boolean))) as string[];
      setAvailableIndicators(indicatorsList.sort());
    }
  }, [indicators]);

  const availableCategoriesCard1 = useMemo(() => {
    const cats = Array.from(new Set((damaSaberData || []).map(d => d.categoria).filter(Boolean))) as string[];
    const ordered = ["Total", "Oficial", "No oficial", "Urbano", "Rural", "Hombre", "Mujer", "Planteles oficiales", "Planteles privados"];
    return ordered.filter(c => cats.includes(c)).concat(cats.filter(c => !ordered.includes(c)));
  }, [damaSaberData]);

  const normalize = (v: any) => (v ?? "").toString().trim().toLowerCase();

  const chartData = useMemo(() => {
    const target = normalize(selectedCategory);
    const filtered = (damaSaberData || []).filter(d => normalize(d.categoria) === target);
    const grouped: Record<number, number[]> = {};
    filtered.forEach(d => {
      if (d.anio == null || d.valor == null) return;
      if (!grouped[d.anio]) grouped[d.anio] = [];
      grouped[d.anio].push(Number(d.valor));
    });
    const years: number[] = [];
    const maxYear = Math.max(2024, ...Object.keys(grouped).map(Number));
    for (let y = 2015; y <= maxYear; y++) years.push(y);
    return years.map(year => {
      const vals = grouped[year] || [];
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { año: year.toString(), puntaje: Math.round(avg) };
    });
  }, [damaSaberData, selectedCategory]);


  // Card 2 - Ranking de ciudades (dama_data + dama_entities)
  const [selectedRankingIndicator, setSelectedRankingIndicator] = useState<string>("SABER_02");
  const [selectedRankingCategory, setSelectedRankingCategory] = useState("Total");
  const [selectedRankingYear, setSelectedRankingYear] = useState<number>(2024);

  const { data: damaEntities } = useQuery({
    queryKey: ["dama-entities-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dama_entities")
        .select("cod_entidad, entidad");
      if (error) throw error;
      return data;
    },
  });

  const { data: rankingData, isLoading: isLoadingRanking } = useQuery({
    queryKey: ["dama-saber-ranking", selectedRankingIndicator],
    queryFn: async () => {
      // Paginar para superar el límite por defecto de Supabase (1000 filas)
      // y asegurarnos de leer TODAS las categorías (Oficial, No oficial, etc.)
      const pageSize = 1000;
      let from = 0;
      const all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("dama_data")
          .select("anio, categoria, valor, cod_entidad")
          .eq("cod_indicador", selectedRankingIndicator)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  const availableRankingYears = useMemo(() => {
    const years = Array.from(new Set((rankingData || []).map(d => d.anio).filter(Boolean))) as number[];
    return years.sort((a, b) => b - a);
  }, [rankingData]);

  const availableRankingCategories = useMemo(() => {
    const cats = Array.from(new Set((rankingData || []).map(d => d.categoria).filter(Boolean))) as string[];
    const ordered = ["Total", "Oficial", "No oficial", "Urbano", "Rural", "Hombre", "Mujer", "Planteles oficiales", "Planteles privados"];
    return ordered.filter(c => cats.includes(c)).concat(cats.filter(c => !ordered.includes(c)));
  }, [rankingData]);

  useEffect(() => {
    if (availableRankingYears.length > 0 && !availableRankingYears.includes(selectedRankingYear)) {
      setSelectedRankingYear(availableRankingYears[0]);
    }
  }, [availableRankingYears, selectedRankingYear]);

  const rankingChartData = useMemo(() => {
    if (!rankingData || !damaEntities) return [];
    const entityMap = new Map(damaEntities.map(e => [e.cod_entidad, e.entidad]));
    const grouped: Record<string, number[]> = {};
    rankingData
      .filter(d => d.anio === selectedRankingYear && normalize(d.categoria) === normalize(selectedRankingCategory) && d.cod_entidad)
      .forEach(d => {
        const code = String(d.cod_entidad);
        // Solo ciudades capitales (códigos de 5 dígitos)
        if (code.length !== 5) return;
        if (d.valor == null) return;
        if (!grouped[code]) grouped[code] = [];
        grouped[code].push(Number(d.valor));
      });
    return Object.entries(grouped)
      .map(([code, vals]) => ({
        entidad: entityMap.get(code) || code,
        puntaje: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      }))
      .sort((a, b) => b.puntaje - a.puntaje);
  }, [rankingData, damaEntities, selectedRankingYear, selectedRankingCategory]);

  // Card 3 - Evolución comparada usando dama_data (SABER_01..SABER_06)
  const [selectedEvolutionIndicator, setSelectedEvolutionIndicator] = useState<string>("SABER_02");
  const [selectedCities, setSelectedCities] = useState<string[]>(["Manizales"]);

  // Fetch evolution data for selected indicator (paginated to bypass 1000-row default)
  const { data: evolutionRawData, isLoading: isLoadingEvolution } = useQuery({
    queryKey: ["dama-saber-evolution", selectedEvolutionIndicator],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      const all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("dama_data")
          .select("anio, categoria, valor, cod_entidad")
          .eq("cod_indicador", selectedEvolutionIndicator)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  // City list: capitales (5-digit cod_entidad) presentes en datos del indicador
  const availableCities = useMemo(() => {
    if (!evolutionRawData || !damaEntities) return [];
    const entityMap = new Map(damaEntities.map(e => [e.cod_entidad, e.entidad]));
    const cityCodes = new Set<string>();
    evolutionRawData.forEach(d => {
      const code = String(d.cod_entidad || "");
      if (code.length === 5) cityCodes.add(code);
    });
    const cities = Array.from(cityCodes)
      .map(code => entityMap.get(code))
      .filter(Boolean) as string[];
    return cities.sort((a, b) => {
      if (a === "Manizales") return -1;
      if (b === "Manizales") return 1;
      return a.localeCompare(b);
    });
  }, [evolutionRawData, damaEntities]);

  const evolutionChartData = useMemo(() => {
    if (!evolutionRawData || !damaEntities) return [];
    const entityMap = new Map(damaEntities.map(e => [e.cod_entidad, e.entidad]));

    const cityYearVals: Record<string, Record<number, number[]>> = {};
    evolutionRawData
      .filter(d => normalize(d.categoria) === "total")
      .forEach(d => {
        const code = String(d.cod_entidad || "");
        if (code.length !== 5) return;
        const city = entityMap.get(code);
        if (!city || d.anio == null || d.valor == null) return;
        if (!selectedCities.includes(city)) return;
        if (!cityYearVals[city]) cityYearVals[city] = {};
        if (!cityYearVals[city][d.anio]) cityYearVals[city][d.anio] = [];
        cityYearVals[city][d.anio].push(Number(d.valor));
      });

    const years: number[] = [];
    const maxYear = Math.max(
      2024,
      ...Object.values(cityYearVals).flatMap(v => Object.keys(v).map(Number))
    );
    for (let y = 2015; y <= maxYear; y++) years.push(y);

    return years.map(year => {
      const row: any = { año: year };
      selectedCities.forEach(city => {
        const vals = cityYearVals[city]?.[year];
        row[city] = vals && vals.length
          ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
          : null;
      });
      return row;
    });
  }, [evolutionRawData, damaEntities, selectedCities]);

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  // Manizales rojo, demás ciudades en gris/cian tenues
  const cityColors = useMemo(() => {
    const muted = ["hsl(180 25% 65%)", "hsl(210 10% 65%)", "hsl(190 30% 55%)", "hsl(200 15% 55%)"];
    const colors: Record<string, string> = {};
    let i = 0;
    availableCities.forEach((city) => {
      if (city === "Manizales") {
        colors[city] = "#e11d48";
      } else {
        colors[city] = muted[i % muted.length];
        i++;
      }
    });
    return colors;
  }, [availableCities]);

  // Calculate Y-axis domain for better scale
  const yAxisDomain = useMemo(() => {
    if (evolutionChartData.length === 0) return [0, 100];
    
    const allValues: number[] = [];
    evolutionChartData.forEach((data: any) => {
      selectedCities.forEach(city => {
        if (data[city] !== null) allValues.push(data[city]);
      });
    });
    
    if (allValues.length === 0) return [0, 100];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1; // 10% padding
    
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [evolutionChartData, selectedCities]);

  console.log("📊 EducationSaberOnce rendering. Indicators:", indicators?.length || 0);
  
  return (
    <div className="space-y-6">
      {/* Card 1: Histórico de Puntaje Saber Once */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-luker-brown">
            <Award className="h-5 w-5 text-luker-red" />
            Puntaje Histórico Saber Once - Manizales
          </CardTitle>
          <ChartDownloadButton 
            chartRef={chart1Ref} 
            title="Puntaje Histórico Saber Once - Manizales"
            excelData={chartData}
            excelColumns={[
              { header: "Año", key: "año" },
              { header: "Puntaje", key: "puntaje" }
            ]}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar los datos. Por favor, intente nuevamente.
              </AlertDescription>
            </Alert>
          ) : !damaSaberData || damaSaberData.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para esta sección. Por favor, cargue los datos desde el módulo de administración.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Área Temática</label>
                  <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {SABER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoría/Sector</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategoriesCard1.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 ? (
                <div ref={chart1Ref} className="h-80 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="año" />
                      <YAxis domain={[0, 500]} ticks={[0, 100, 200, 300, 400, 500]} tickFormatter={(value) => Math.round(value).toString()} />
                      <Tooltip 
                        formatter={(value: number) => [Math.round(value), 'Puntaje']}
                      />
                      <Legend />
                      <Bar dataKey="puntaje" fill="#e11d48" name="Puntaje" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay datos disponibles para los filtros seleccionados.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Ranking de Entidades 2024 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-luker-brown">
            <Award className="h-5 w-5 text-luker-red" />
            Ranking de Ciudades en Saber Once
          </CardTitle>
          <ChartDownloadButton 
            chartRef={chart2Ref} 
            title={`Ranking Saber Once - ${selectedRankingYear}`}
            excelData={rankingChartData}
            excelColumns={[
              { header: "Entidad", key: "entidad" },
              { header: "Puntaje", key: "puntaje" }
            ]}
          />
        </CardHeader>
        <CardContent>
          {isLoadingRanking ? (
            <Skeleton className="h-96 w-full" />
          ) : !rankingData || rankingData.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para esta sección.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Año</label>
                  <Select value={selectedRankingYear.toString()} onValueChange={(value) => setSelectedRankingYear(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione año" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRankingYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Área Temática/Indicador</label>
                  <Select value={selectedRankingIndicator} onValueChange={setSelectedRankingIndicator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {SABER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoría/Sector</label>
                  <Select value={selectedRankingCategory} onValueChange={setSelectedRankingCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRankingCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chart */}
              {rankingChartData.length > 0 ? (
                <div ref={chart2Ref} className="h-[800px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="entidad" 
                        width={180} 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="puntaje" name="Puntaje">
                        {rankingChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.entidad.toLowerCase().includes('manizales') 
                              ? '#e11d48' 
                              : '#0d9488'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay datos disponibles para los filtros seleccionados.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Evolución Comparativa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-luker-brown">
              <Award className="h-5 w-5 text-luker-red" />
              Puntaje Global Saber Once - Evolución Comparada
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Manizales vs ciudades punteras
            </p>
          </div>
          <ChartDownloadButton 
            chartRef={chart3Ref} 
            title="Evolución Comparada Saber Once"
            excelData={evolutionChartData}
            excelColumns={[
              { header: "Año", key: "año" },
              ...selectedCities.map(city => ({ header: city, key: city }))
            ]}
          />
        </CardHeader>
        <CardContent>
          {isLoadingEvolution ? (
            <Skeleton className="h-96 w-full" />
          ) : !evolutionRawData || evolutionRawData.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos disponibles para esta sección.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Área Temática</label>
                  <Select value={selectedEvolutionIndicator} onValueChange={setSelectedEvolutionIndicator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {SABER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ciudades a comparar ({selectedCities.length} seleccionadas)</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-gray-50">
                    {availableCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                          selectedCities.includes(city)
                            ? 'text-white shadow-sm'
                            : 'bg-white text-muted-foreground hover:bg-gray-100 border'
                        }`}
                        style={selectedCities.includes(city) ? { backgroundColor: cityColors[city] } : {}}
                      >
                        {selectedCities.includes(city) && <Check className="h-3 w-3" />}
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart */}
              {evolutionChartData.length > 0 ? (
                <div ref={chart3Ref} className="h-96 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="año" />
                      <YAxis 
                        domain={yAxisDomain}
                        tickFormatter={(value) => Math.round(value).toString()} 
                      />
                      <Tooltip 
                        formatter={(value: number) => [value !== null ? Math.round(value) : 'N/A', 'Puntaje']}
                      />
                      <Legend />
                      {selectedCities.map((city) => (
                        <Line 
                          key={city}
                          type="monotone" 
                          dataKey={city} 
                          stroke={cityColors[city]}
                          strokeWidth={city === "Manizales" ? 3 : 2}
                          name={city}
                          dot={{ r: city === "Manizales" ? 5 : 3 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay datos disponibles para mostrar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationSaberOnce;
