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

  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Total");
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);
  const [availableCategories] = useState<string[]>(["Total", "Rural", "Urbano", "Oficial", "No oficial"]);

  const { data: indicators, isLoading, error } = useQuery({
    queryKey: ["education-saber-once"],
    queryFn: async () => {
      console.log("🔍 Fetching Saber Once data...");
      const { data, error } = await supabase
        .from("education_indicators")
        .select("*")
        .eq("seccion", "Resultados pruebas Saber 11")
        .eq("departamento", "Manizales")
        .order("year", { ascending: true });
      
      if (error) {
        console.error("❌ Error fetching Saber Once:", error);
        throw error;
      }
      console.log("✅ Saber Once data loaded:", data?.length, "records");
      return data;
    },
  });

  useEffect(() => {
    if (indicators && indicators.length > 0) {
      // Extract unique indicators
      const indicatorsList = Array.from(new Set(indicators.map(i => i.indicador).filter(Boolean))) as string[];
      setAvailableIndicators(indicatorsList.sort());
      
      // Set default indicator (prefer 'global' without city names)
      if (!selectedIndicator && indicatorsList.length > 0) {
        const globalIndicator = indicatorsList.find(i => 
          i.toLowerCase() === 'global' || 
          (i.toLowerCase().includes('global') && !i.toLowerCase().includes('manizales') && !i.toLowerCase().includes('medellín'))
        );
        setSelectedIndicator(globalIndicator || indicatorsList[0]);
      }
    }
  }, [indicators, selectedIndicator]);

  const chartData = (() => {
    const allYears = Array.from({ length: 10 }, (_, i) => 2015 + i); // 2015 to 2024
    
    const filteredData = indicators
      ?.filter(item => 
        item.indicador === selectedIndicator &&
        item.categoria === selectedCategory
      ) || [];
    
    return allYears.map(year => {
      const dataPoint = filteredData.find(item => item.year === year);
      return {
        año: year.toString(),
        puntaje: dataPoint?.valor || 0,
      };
    });
  })();


  // Query for Card 2 - Ranking
  const { data: rankingData, isLoading: isLoadingRanking } = useQuery({
    queryKey: ["education-saber-once-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_indicators")
        .select("*")
        .eq("seccion", "Saber Once")
        .order("valor", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const [selectedRankingIndicator, setSelectedRankingIndicator] = useState("");
  const [selectedRankingCategory, setSelectedRankingCategory] = useState("Total");
  const [selectedRankingYear, setSelectedRankingYear] = useState(2024);
  const [availableRankingIndicators, setAvailableRankingIndicators] = useState<string[]>([]);
  const [availableRankingYears, setAvailableRankingYears] = useState<number[]>([]);

  useEffect(() => {
    if (rankingData && rankingData.length > 0) {
      const indicatorsList = Array.from(new Set(rankingData.map(i => i.indicador).filter(Boolean))) as string[];
      setAvailableRankingIndicators(indicatorsList.sort());
      
      const yearsList = Array.from(new Set(rankingData.map(i => i.year).filter(Boolean))) as number[];
      setAvailableRankingYears(yearsList.sort((a, b) => b - a));
      
      if (!selectedRankingIndicator && indicatorsList.length > 0) {
        const globalIndicator = indicatorsList.find(i => 
          i.toLowerCase().includes('global') && !i.toLowerCase().includes('manizales') && !i.toLowerCase().includes('medellín')
        );
        setSelectedRankingIndicator(globalIndicator || indicatorsList[0]);
      }
    }
  }, [rankingData, selectedRankingIndicator]);

  const rankingChartData = (() => {
    const filteredData = rankingData
      ?.filter(item => 
        item.indicador === selectedRankingIndicator &&
        item.categoria === selectedRankingCategory &&
        item.year === selectedRankingYear &&
        item.departamento
      )
      .sort((a, b) => (b.valor || 0) - (a.valor || 0))
      .map((item, index) => ({
        entidad: `${index + 1}. ${item.departamento}`,
        puntaje: Math.round(item.valor || 0),
      })) || [];
    
    return filteredData;
  })();

  // Query and state for Card 3 - Evolution comparison with indicator filter
  const [selectedEvolutionIndicator, setSelectedEvolutionIndicator] = useState("");
  const [availableEvolutionIndicators, setAvailableEvolutionIndicators] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(["Manizales"]);

  // Fetch city list (23 ciudades) for selector (small query)
  const { data: citiesSeedData } = useQuery({
    queryKey: ["education-saber-once-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_indicators")
        .select("departamento")
        .eq("seccion", "Saber Once")
        .eq("categoria", "Total")
        .eq("year", 2024)
        .eq("indicador", "global")
        .order("departamento", { ascending: true })
        .limit(1000);

      if (error) throw error;
      return data;
    },
  });

  // Extract available cities from seed data
  useEffect(() => {
    if (citiesSeedData && citiesSeedData.length > 0) {
      const cities = Array.from(
        new Set(citiesSeedData.map((d) => d.departamento).filter(Boolean))
      ) as string[];

      // Sort with Manizales first
      const sortedCities = cities.sort((a, b) => {
        if (a === "Manizales") return -1;
        if (b === "Manizales") return 1;
        return a.localeCompare(b);
      });

      setAvailableCities(sortedCities);
    }
  }, [citiesSeedData]);

  // Evolution indicators can reuse the indicator list already loaded for Manizales
  useEffect(() => {
    if (availableIndicators.length > 0) {
      const sorted = [...availableIndicators].sort();
      setAvailableEvolutionIndicators(sorted);

      if (!selectedEvolutionIndicator) {
        const global = sorted.find((i) => i.toLowerCase() === "global");
        setSelectedEvolutionIndicator(global || sorted[0]);
      }
    }
  }, [availableIndicators, selectedEvolutionIndicator]);

  // Fetch evolution data ONLY for the selected indicator (<= 23 ciudades × 10 años = 230 filas)
  const { data: evolutionData, isLoading: isLoadingEvolution } = useQuery({
    queryKey: ["education-saber-once-evolution-data", selectedEvolutionIndicator],
    enabled: !!selectedEvolutionIndicator,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_indicators")
        .select("year, departamento, indicador, valor")
        .eq("seccion", "Saber Once")
        .eq("categoria", "Total")
        .eq("indicador", selectedEvolutionIndicator)
        .order("year", { ascending: true })
        .order("departamento", { ascending: true })
        .limit(1000);

      if (error) throw error;
      return data;
    },
  });

  const evolutionChartData = useMemo(() => {
    if (!evolutionData || !selectedEvolutionIndicator) return [];

    // ALWAYS create all years from 2015 to 2024
    const years = Array.from({ length: 10 }, (_, i) => 2015 + i);

    // evolutionData already filtered by indicador in the query
    const filteredData = evolutionData;

    // Build chart data with ALL years (2015-2024)
    const chartData = years.map((year) => {
      const yearData: any = { año: year };

      // Only include selected cities in the data (prevents missing keys)
      selectedCities.forEach((city) => {
        const cityData = filteredData.find(
          (d) => d.year === year && d.departamento === city
        );
        yearData[city] = cityData ? Math.round(cityData.valor || 0) : null;
      });

      return yearData;
    });

    return chartData;
  }, [evolutionData, selectedEvolutionIndicator, selectedCities]);

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  // Generate colors for each city dynamically
  const cityColors = useMemo(() => {
    const baseColors = [
      "hsl(var(--luker-red))",
      "hsl(var(--luker-orange))",
      "hsl(var(--luker-teal))",
      "hsl(var(--luker-green))",
      "hsl(25 95% 53%)",    // Orange variant
      "hsl(280 65% 60%)",   // Purple
      "hsl(190 80% 45%)",   // Cyan
      "hsl(340 75% 55%)",   // Pink
      "hsl(45 90% 50%)",    // Yellow
      "hsl(160 60% 45%)",   // Teal variant
      "hsl(220 70% 55%)",   // Blue
      "hsl(0 70% 50%)",     // Red variant
      "hsl(120 50% 40%)",   // Green variant
      "hsl(300 60% 50%)",   // Magenta
      "hsl(180 60% 45%)",   // Cyan variant
      "hsl(60 70% 45%)",    // Olive
      "hsl(200 80% 50%)",   // Sky blue
      "hsl(330 70% 50%)",   // Rose
      "hsl(90 60% 45%)",    // Lime
      "hsl(270 60% 55%)",   // Violet
      "hsl(15 80% 55%)",    // Coral
      "hsl(240 60% 55%)",   // Indigo
      "hsl(150 60% 45%)",   // Emerald
    ];
    
    const colors: Record<string, string> = {};
    availableCities.forEach((city, index) => {
      colors[city] = baseColors[index % baseColors.length];
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
          ) : !indicators || indicators.length === 0 ? (
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
                      {availableIndicators.map((indicator) => (
                        <SelectItem key={indicator} value={indicator}>
                          {indicator}
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
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                      <YAxis tickFormatter={(value) => Math.round(value).toString()} />
                      <Tooltip 
                        formatter={(value: number) => [Math.round(value), 'Puntaje']}
                      />
                      <Legend />
                      <Bar dataKey="puntaje" fill="hsl(var(--luker-red))" name="Puntaje" />
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
                      {availableRankingIndicators.map((indicator) => (
                        <SelectItem key={indicator} value={indicator}>
                          {indicator}
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
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                              ? 'hsl(var(--luker-red))' 
                              : 'hsl(var(--luker-teal))'
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
          ) : !evolutionData || evolutionData.length === 0 ? (
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
                  <label className="text-sm font-medium text-gray-700">Área Temática/Indicador</label>
                  <Select value={selectedEvolutionIndicator} onValueChange={setSelectedEvolutionIndicator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvolutionIndicators.map((indicator) => (
                        <SelectItem key={indicator} value={indicator}>
                          {indicator}
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
