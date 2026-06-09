import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchLegacyMCVBySection } from "@/integrations/ecosistema/legacy";
import { ecosistema } from "@/integrations/ecosistema/client";
import { toast } from "sonner";
import { LucideIcon, ChevronDown, ChevronUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import MCVKPICard from "./MCVKPICard";
import MCVIndicatorsTable from "./MCVIndicatorsTable";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

// List of all 23 cities
const ALL_CITIES = [
  "Manizales",
  "Armenia",
  "Barranquilla",
  "Bogotá, D.C.",
  "Bucaramanga",
  "Cali",
  "Cartagena de Indias",
  "Florencia",
  "Ibagué",
  "Medellín",
  "Montería",
  "Neiva",
  "Pasto",
  "Pereira",
  "Popayán",
  "Quibdó",
  "Riohacha",
  "San José de Cúcuta",
  "Santa Marta",
  "Sincelejo",
  "Tunja",
  "Valledupar",
  "Villavicencio"
];

interface MCVIndicator {
  id: string;
  seccion: string;
  cod_indicador: string;
  indicador: string;
  categoria: string;
  entidad: string;
  dato: number | null;
  year: number;
  fuente: string | null;
  unidad_medida: string | null;
}

interface MCVSubsectionProps {
  sectionName: string;
  mainIndicator: string;
  selectedEntity: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const MCVSubsection = ({
  sectionName,
  mainIndicator,
  selectedEntity,
  title,
  description,
  icon: Icon
}: MCVSubsectionProps) => {
  const [data, setData] = useState<MCVIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [compareCity, setCompareCity] = useState<string>("none");
  const [compareData, setCompareData] = useState<MCVIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Refs para las gráficas
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Set the initial selected indicator based on mainIndicator name
  useEffect(() => {
    if (data.length > 0 && !selectedIndicator) {
      // Find the indicator code that matches the mainIndicator name
      const matchingIndicator = data.find(d => 
        d.indicador.toLowerCase().includes(mainIndicator.toLowerCase()) ||
        mainIndicator.toLowerCase().includes(d.indicador.toLowerCase())
      );
      if (matchingIndicator) {
        setSelectedIndicator(matchingIndicator.cod_indicador);
      } else if (data.length > 0) {
        // Fallback to first available indicator
        setSelectedIndicator(data[0].cod_indicador);
      }
    }
  }, [data, mainIndicator, selectedIndicator]);
  // Education section: pull from dama_data instead of mcv_indicators
  const isEducation = sectionName === "Educación";
  const EDU_CODES = ["COBE_01", "COBE_02", "COBE_03", "COBE_04", "COBE_05", "COBE_06"];

  // Normalize entity names from dama_entities to match ALL_CITIES used in UI
  const normalizeEntityName = (name: string): string => {
    if (!name) return name;
    if (name === "Bogotá") return "Bogotá, D.C.";
    return name;
  };
  const denormalizeEntityName = (name: string): string => {
    if (name === "Bogotá, D.C.") return "Bogotá";
    return name;
  };

  const fetchDamaEducation = async (entityFilter?: string): Promise<MCVIndicator[]> => {
    // Catalog (codes -> indicador metadata)
    const { data: catalog, error: catErr } = await ecosistema
      .from("catalogo_indicadores")
      .select("cod_indicador, indicador, unidad_medida, fuente")
      .in("cod_indicador", EDU_CODES);
    if (catErr) throw catErr;
    const catalogMap = new Map(
      (catalog || []).map((c: any) => [c.cod_indicador, c])
    );

    // Entities (filter to municipalities, length 5 = city codes)
    const { data: entities, error: entErr } = await ecosistema
      .from("catalogo_entidades")
      .select("cod_entidad, entidad");
    if (entErr) throw entErr;
    const entityMap = new Map(
      (entities || []).map((e: any) => [e.cod_entidad, e.entidad])
    );

    // Data with pagination
    const pageSize = 1000;
    const maxPages = 100;
    const allRows: any[] = [];

    let query = ecosistema
      .from("datos_maestros")
      .select("id, cod_indicador, cod_entidad, anio, valor")
      .in("cod_indicador", EDU_CODES)
      .order("anio", { ascending: true });

    if (entityFilter) {
      const code = [...entityMap.entries()].find(
        ([, name]) => name === denormalizeEntityName(entityFilter)
      )?.[0];
      if (code) query = query.eq("cod_entidad", code);
    }

    for (let page = 0; page < maxPages; page++) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data: pageData, error } = await query.range(from, to);
      if (error) throw error;
      allRows.push(...(pageData || []));
      if (!pageData || pageData.length < pageSize) break;
    }

    // Map to MCVIndicator shape; only city-level (5-digit) entities
    return allRows
      .filter((r) => r.cod_entidad && r.cod_entidad.length === 5 && entityMap.has(r.cod_entidad))
      .map((r) => {
        const cat = catalogMap.get(r.cod_indicador) as any;
        return {
          id: r.id,
          seccion: "Educación",
          cod_indicador: r.cod_indicador,
          indicador: (cat?.indicador ?? r.cod_indicador).replace(/Tasa de cobertura/gi, "Cobertura"),
          categoria: "Total",
          entidad: normalizeEntityName(entityMap.get(r.cod_entidad) as string),
          dato: r.valor !== null && r.valor !== undefined ? Number(r.valor) : null,
          year: r.anio,
          fuente: cat?.fuente ?? null,
          unidad_medida: cat?.unidad_medida ?? "Porcentaje",
        } as MCVIndicator;
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isEducation) {
          const rows = await fetchDamaEducation();
          setData(rows);
          return;
        }

        // Fetch all rows for this section from ecosistema (no entity filter
        // so the page can show comparisons across cities)
        const all = (await fetchLegacyMCVBySection(sectionName)) as unknown as MCVIndicator[];
        all.sort((a, b) => a.year - b.year);

        setData(all);
      } catch (error) {
        console.error("Error fetching indicators:", error);
        toast.error("Error al cargar los indicadores");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectionName]);

  // Fetch comparison city data
  useEffect(() => {
    const fetchCompareData = async () => {
      if (compareCity === "none" || compareCity === selectedEntity) {
        setCompareData([]);
        return;
      }

      try {
        if (isEducation) {
          const rows = await fetchDamaEducation(compareCity);
          setCompareData(rows);
          return;
        }

        const indicators = (await fetchLegacyMCVBySection(sectionName, compareCity))
          .sort((a, b) => a.year - b.year) as unknown as MCVIndicator[];
        setCompareData(indicators || []);
      } catch (error) {
        console.error("Error fetching comparison data:", error);
      }
    };

    fetchCompareData();
  }, [sectionName, compareCity, selectedEntity]);

  // Filter data for the selected entity (for KPIs and chart)
  const entityData = useMemo(() => {
    return data.filter(d => d.entidad === selectedEntity);
  }, [data, selectedEntity]);

  // Get unique indicators for KPI cards
  const uniqueIndicators = useMemo(() => {
    const indicatorMap = new Map<string, MCVIndicator[]>();
    entityData.forEach(item => {
      const key = item.cod_indicador;
      if (!indicatorMap.has(key)) {
        indicatorMap.set(key, []);
      }
      indicatorMap.get(key)!.push(item);
    });
    return indicatorMap;
  }, [entityData]);

  // Per-section indicator exclusions for the chart selector
  const excludedIndicatorCodes: Record<string, string[]> = {
    "Mercado laboral comparativo": ["MLJ_02"], // Condición de actividad de egresados
  };

  // Get list of available indicators for selector
  const availableIndicators = useMemo(() => {
    const excluded = new Set(excludedIndicatorCodes[sectionName] ?? []);
    const indicators: { code: string; name: string }[] = [];
    uniqueIndicators.forEach((items, code) => {
      if (items.length > 0 && !excluded.has(code)) {
        indicators.push({ code, name: items[0].indicador });
      }
    });
    return indicators;
  }, [uniqueIndicators, sectionName]);

  // Get selected indicator data for the chart
  const selectedIndicatorData = useMemo(() => {
    return entityData
      .filter(d => d.cod_indicador === selectedIndicator)
      .sort((a, b) => a.year - b.year);
  }, [entityData, selectedIndicator]);

  // Get comparison city indicator data
  const compareIndicatorData = useMemo(() => {
    return compareData
      .filter(d => d.cod_indicador === selectedIndicator)
      .sort((a, b) => a.year - b.year);
  }, [compareData, selectedIndicator]);

  // Get available years for the selected indicator (for year filter in bar chart)
  const availableYears = useMemo(() => {
    const indicatorData = data.filter(d => d.cod_indicador === selectedIndicator);
    const years = [...new Set(indicatorData.map(d => d.year))].sort((a, b) => b - a);
    return years;
  }, [data, selectedIndicator]);

  // Set default year when indicator changes or when "all" comparison is selected
  useEffect(() => {
    if (compareCity === "all" && availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]); // Most recent year
    }
  }, [compareCity, availableYears, selectedYear]);

  // Reset selectedYear when comparison mode changes
  useEffect(() => {
    if (compareCity !== "all") {
      setSelectedYear(null);
    } else if (availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [compareCity, availableYears]);

  // Get all cities data for the selected indicator (for "Todos" comparison)
  const allCitiesData = useMemo(() => {
    if (compareCity !== "all") return [];
    
    // Get the selected indicator data
    const indicatorData = data.filter(d => d.cod_indicador === selectedIndicator);
    if (indicatorData.length === 0) return [];
    
    // Use selected year or fall back to most recent
    const yearToUse = selectedYear ?? Math.max(...indicatorData.map(d => d.year));
    
    // Get data for all cities for that year
    return indicatorData
      .filter(d => d.year === yearToUse)
      .sort((a, b) => (b.dato ?? 0) - (a.dato ?? 0));
  }, [data, selectedIndicator, compareCity, selectedYear]);

  // Merge data for chart with both cities - include ALL years in range
  const chartData = useMemo(() => {
    const allYears = new Set<number>();
    selectedIndicatorData.forEach(d => allYears.add(d.year));
    compareIndicatorData.forEach(d => allYears.add(d.year));
    
    if (allYears.size === 0) return [];
    
    // Get min and max years to create complete range
    const yearsArray = Array.from(allYears);
    const minYear = Math.min(...yearsArray);
    const maxYear = Math.max(...yearsArray);
    
    // Create data points for EVERY year in the range
    const completeYears: { year: number; yearLabel: string; [key: string]: number | string | null }[] = [];
    for (let year = minYear; year <= maxYear; year++) {
      const mainItem = selectedIndicatorData.find(d => d.year === year);
      const compareItem = compareIndicatorData.find(d => d.year === year);
      completeYears.push({
        year,
        yearLabel: year.toString(),
        [selectedEntity]: mainItem?.dato ?? null,
        [compareCity]: compareItem?.dato ?? null,
      });
    }
    
    return completeYears;
  }, [selectedIndicatorData, compareIndicatorData, selectedEntity, compareCity]);


  // Get the latest value for the selected indicator
  const latestSelectedIndicator = useMemo(() => {
    if (selectedIndicatorData.length === 0) return null;
    return selectedIndicatorData[selectedIndicatorData.length - 1];
  }, [selectedIndicatorData]);

  // Per-section KPI overrides: explicit codes + display labels
  const kpiOverrides: Record<string, { code: string; label: string }[]> = {
    "Mercado laboral comparativo": [
      { code: "ML_01", label: "No. de ocupados" },
      { code: "MLJ_10", label: "% de jóvenes que no estudian ni trabajan" },
      { code: "MLJ_07", label: "Tasa de desempleo juvenil (15 - 28 años)" },
      { code: "ML_02", label: "Tasa de desempleo" },
    ],
  };

  // Get KPI cards data (top indicators)
  const kpiData = useMemo(() => {
    const kpis: { indicator: MCVIndicator; trend: MCVIndicator[] }[] = [];

    const override = kpiOverrides[sectionName];
    if (override) {
      override.forEach(({ code, label }) => {
        const items = uniqueIndicators.get(code);
        if (items && items.length > 0) {
          const sortedDesc = [...items].sort((a, b) => b.year - a.year);
          kpis.push({
            indicator: { ...sortedDesc[0], indicador: label },
            trend: [...items].sort((a, b) => a.year - b.year),
          });
        }
      });
      return kpis;
    }

    uniqueIndicators.forEach((items) => {
      if (items.length > 0) {
        const sortedItems = [...items].sort((a, b) => b.year - a.year);
        kpis.push({
          indicator: sortedItems[0],
          trend: items.sort((a, b) => a.year - b.year),
        });
      }
    });

    return kpis.slice(0, 4); // Show only top 4 indicators
  }, [uniqueIndicators, sectionName]);

  const formatValue = (value: number | null, unit?: string | null) => {
    if (value === null) return "N/A";
    
    if (unit?.toLowerCase().includes("porcentaje")) {
      return `${value.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`;
    }
    if (unit?.toLowerCase().includes("pesos") || unit?.toLowerCase().includes("cop")) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
      }
      if (value >= 1000) {
        return `$${(value / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}K`;
      }
      return `$${value.toLocaleString('es-CO')}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}K`;
    }
    return value.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Sin datos disponibles</h3>
        <p className="text-gray-500">
          No hay datos de {title} para {selectedEntity}.
          <br />
          Carga los datos desde el archivo MCV en la sección de Administración.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map(({ indicator, trend }, index) => {
          // Use simple difference for growth rate indicators (crecimiento)
          const isGrowthIndicator = indicator.indicador.toLowerCase().includes('crecimiento');
          return (
            <MCVKPICard
              key={indicator.cod_indicador}
              title={indicator.indicador}
              value={indicator.dato}
              year={indicator.year}
              unit={indicator.unidad_medida}
              trend={trend}
              useSimpleDifference={isGrowthIndicator}
              icon={Icon}
              colorIndex={index}
            />
          );
        })}
      </div>

      {/* Indicator Chart */}
      {selectedIndicatorData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-luker-blue/10">
                    <Icon className="h-5 w-5 text-luker-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-luker-brown">
                      {compareCity === "all" ? "Comparación de ciudades" : "Serie histórica"}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {compareCity === "all" 
                        ? `Ranking de 23 ciudades • ${selectedYear ?? allCitiesData[0]?.year ?? ""}` 
                        : `${selectedEntity}${compareCity !== "none" ? ` vs ${compareCity}` : ""}`}
                    </p>
                  </div>
                </div>
                <ChartDownloadButton
                  chartRef={chartRef}
                  title={`${latestSelectedIndicator?.indicador || title} - ${compareCity === "all" ? "Comparación ciudades" : selectedEntity}`}
                  excelData={compareCity === "all" 
                    ? allCitiesData.map(d => ({ entidad: d.entidad, valor: d.dato, año: selectedYear }))
                    : chartData.map(d => ({ año: d.yearLabel, [selectedEntity]: d[selectedEntity], ...(compareCity !== "none" ? { [compareCity]: d[compareCity] } : {}) }))
                  }
                  excelColumns={compareCity === "all"
                    ? [
                        { header: "Ciudad", key: "entidad" },
                        { header: "Valor", key: "valor" },
                        { header: "Año", key: "año" }
                      ]
                    : [
                        { header: "Año", key: "año" },
                        { header: selectedEntity, key: selectedEntity },
                        ...(compareCity !== "none" ? [{ header: compareCity, key: compareCity }] : [])
                      ]
                  }
                />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Indicador:</span>
                  <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Seleccionar indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIndicators.map((ind) => (
                        <SelectItem key={ind.code} value={ind.code}>
                          {ind.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Comparar con:</span>
                  <Select value={compareCity} onValueChange={setCompareCity}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleccionar ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin comparación</SelectItem>
                      <SelectItem value="all">Todas las ciudades</SelectItem>
                      {ALL_CITIES.filter(city => city !== selectedEntity).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {compareCity === "all" && availableYears.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Año:</span>
                    <Select 
                      value={selectedYear?.toString() ?? ""} 
                      onValueChange={(val) => setSelectedYear(parseInt(val))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent ref={chartRef}>
            {compareCity === "all" ? (
              /* Bar chart for all cities comparison */
              <div className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allCitiesData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number"
                      stroke="#6b7280"
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      tickFormatter={(value) => formatValue(value, latestSelectedIndicator?.unidad_medida)}
                    />
                    <YAxis 
                      type="category"
                      dataKey="entidad"
                      stroke="#6b7280"
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      width={95}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [
                        formatValue(value, latestSelectedIndicator?.unidad_medida),
                        latestSelectedIndicator?.indicador || "Valor"
                      ]}
                    />
                    <Bar dataKey="dato" radius={[0, 4, 4, 0]}>
                      {allCitiesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.entidad === selectedEntity ? "#3b82f6" : "#94a3b8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Area chart for time series comparison */
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="yearLabel"
                      type="category"
                      stroke="#6b7280"
                      tick={(props) => {
                        const { x, y, payload } = props;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="end"
                              fill="#6b7280"
                              fontSize={10}
                              transform="rotate(-90)"
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                      interval={0}
                      height={60}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(value) => formatValue(value, latestSelectedIndicator?.unidad_medida)}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatValue(value, latestSelectedIndicator?.unidad_medida),
                        name
                      ]}
                      labelFormatter={(label) => `Año ${label}`}
                    />
                    {compareCity !== "none" && <Legend />}
                    <Area
                      type="monotone"
                      dataKey={selectedEntity}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorMain)"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
                      connectNulls
                    />
                    {compareCity !== "none" && compareCity !== "all" && (
                      <Area
                        type="monotone"
                        dataKey={compareCity}
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#colorCompare)"
                        dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: "#f97316", strokeWidth: 2 }}
                        connectNulls
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {latestSelectedIndicator?.fuente && (
              <p className="text-xs text-gray-500 mt-2 text-right">
                Fuente: {latestSelectedIndicator.fuente}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show More Indicators Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2"
        >
          {showTable ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar indicadores
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver más indicadores
            </>
          )}
        </Button>
      </div>

      {/* Indicators Table */}
      {showTable && (
        <MCVIndicatorsTable
          data={data}
          selectedEntity={selectedEntity}
          sectionName={sectionName}
          allEntities={ALL_CITIES}
        />
      )}
    </div>
  );
};

export default MCVSubsection;
