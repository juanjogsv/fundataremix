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
  const chartCompRef = useRef<HTMLDivElement>(null);
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

  const SEXO_OPTIONS = ["Total", "Hombre", "Mujer"];
  const NATURALEZA_OPTIONS = ["Total", "Oficial", "No oficial"];
  const ZONA_OPTIONS = ["Total", "Urbano", "Rural"];

  // Helper: solo un filtro de categoria_2 puede ser distinto de "Total" a la vez
  const getEffectiveCat2 = (sexo: string, naturaleza: string, zona: string) => {
    if (sexo && sexo !== "Total") return sexo;
    if (naturaleza && naturaleza !== "Total") return naturaleza;
    if (zona && zona !== "Total") return zona;
    return "Total";
  };

  const [selectedIndicator, setSelectedIndicator] = useState<string>("SABER_02");
  const [selectedCategory, setSelectedCategory] = useState("Total");
  const [selectedSexo, setSelectedSexo] = useState("Total");
  const [selectedNaturaleza, setSelectedNaturaleza] = useState("Total");
  const [selectedZona, setSelectedZona] = useState("Total");
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);

  // Handlers que resetean los otros filtros al cambiar uno a no-Total (Card 1)
  const handleSexoChange = (v: string) => {
    setSelectedSexo(v);
    if (v !== "Total") { setSelectedNaturaleza("Total"); setSelectedZona("Total"); }
  };
  const handleNaturalezaChange = (v: string) => {
    setSelectedNaturaleza(v);
    if (v !== "Total") { setSelectedSexo("Total"); setSelectedZona("Total"); }
  };
  const handleZonaChange = (v: string) => {
    setSelectedZona(v);
    if (v !== "Total") { setSelectedSexo("Total"); setSelectedNaturaleza("Total"); }
  };

  const { data: damaSaberData, isLoading, error } = useQuery({
    queryKey: ["dama-saber-manizales", selectedIndicator],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dama_data")
        .select("anio, categoria, categoria_2, valor, cod_indicador")
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

  // Formatea nombres de ciudades para mostrar (ej: San José de Cúcuta → Cúcuta)
  const formatCityName = (name: string) => {
    if (!name) return name;
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes("san jose de cucuta") || normalized.includes("cucuta")) return "Cúcuta";
    return name;
  };

  // Ciudades sin datos que se deben excluir de todos los filtros
  const EXCLUDED_CITIES = [
    "algeciras", "agrado", "campoalegre", "garzon", "gigante",
    "hobo", "montelibano", "pital", "puerto libertador",
    "rivera", "tumaco", "villanueva",
  ];
  const isExcludedCity = (name: string) => {
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return EXCLUDED_CITIES.includes(normalized);
  };

  const chartData = useMemo(() => {
    const target = normalize(selectedCategory);
    const targetCat2 = normalize(getEffectiveCat2(selectedSexo, selectedNaturaleza, selectedZona));
    const filtered = (damaSaberData || []).filter(d => normalize(d.categoria) === target && normalize((d as any).categoria_2) === targetCat2);
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
  }, [damaSaberData, selectedCategory, selectedSexo, selectedNaturaleza, selectedZona]);


  // ===== Card 2 (NUEVA): Comparativo histórico Oficial vs No oficial =====
  const [selectedCompCity, setSelectedCompCity] = useState<string>("17001");
  const [selectedCompIndicator, setSelectedCompIndicator] = useState<string>("SABER_02");

  const { data: compRawData, isLoading: isLoadingComp } = useQuery({
    queryKey: ["dama-saber-comp-naturaleza", selectedCompIndicator, selectedCompCity],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dama_data")
        .select("anio, categoria, categoria_2, valor, cod_entidad")
        .eq("cod_indicador", selectedCompIndicator)
        .eq("cod_entidad", selectedCompCity)
        .order("anio", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Lista de ciudades capitales (códigos de 5 dígitos) — depende de damaEntities (declarada más abajo)
  const { data: damaEntitiesForComp } = useQuery({
    queryKey: ["dama-entities-cities-comp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dama_entities")
        .select("cod_entidad, entidad");
      if (error) throw error;
      return data;
    },
  });

  const availableCompCities = useMemo(() => {
    if (!damaEntitiesForComp) return [] as { code: string; name: string }[];
    return damaEntitiesForComp
      .filter(e => String(e.cod_entidad).length === 5 && !isExcludedCity(e.entidad || ""))
      .map(e => ({ code: String(e.cod_entidad), name: formatCityName(e.entidad || "") }))
      .sort((a, b) => {
        if (a.name === "Manizales") return -1;
        if (b.name === "Manizales") return 1;
        return a.name.localeCompare(b.name);
      });
  }, [damaEntitiesForComp]);


  const compChartData = useMemo(() => {
    if (!compRawData) return [];

    const grouped: Record<number, { oficial: number[]; no_oficial: number[] }> = {};
    compRawData.forEach(d => {
      if (d.anio == null || d.valor == null) return;
      if (normalize(d.categoria) !== "total") return;
      const cat2 = normalize((d as any).categoria_2);
      if (!grouped[d.anio]) grouped[d.anio] = { oficial: [], no_oficial: [] };
      if (cat2 === "oficial") grouped[d.anio].oficial.push(Number(d.valor));
      else if (cat2 === "no oficial") grouped[d.anio].no_oficial.push(Number(d.valor));
    });
    const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    return years.map(year => {
      const g = grouped[year];
      const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
      const oficialVal = avg(g.oficial);
      const noOficialVal = avg(g.no_oficial);
      const diff = (noOficialVal != null && oficialVal != null) ? oficialVal - noOficialVal : null;
      return {
        año: year.toString(),
        Oficial: oficialVal,
        "No oficial": noOficialVal,
        Diferencia: diff,
      };
    }).filter(r => r.Oficial !== null || r["No oficial"] !== null);
  }, [compRawData]);

  // Estadísticas de brecha para el resumen
  const gapStats = useMemo(() => {
    const diffs = compChartData.map(d => d.Diferencia).filter((v): v is number => v !== null);
    if (diffs.length === 0) return null;
    const latest = compChartData[compChartData.length - 1];
    const avgDiff = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    const maxDiff = Math.max(...diffs);
    const minDiff = Math.min(...diffs);
    const positiveYears = diffs.filter(d => d > 1).length;
    return {
      avgDiff,
      latestDiff: latest.Diferencia,
      latestYear: latest.año,
      maxDiff,
      minDiff,
      positiveYears,
      totalYears: diffs.length,
    };
  }, [compChartData]);

  // Card 2 - Ranking de ciudades (dama_data + dama_entities)

  const [selectedRankingIndicator, setSelectedRankingIndicator] = useState<string>("SABER_02");
  const [selectedRankingCategory, setSelectedRankingCategory] = useState("Total");
  const [selectedRankingSexo, setSelectedRankingSexo] = useState("Total");
  const [selectedRankingNaturaleza, setSelectedRankingNaturaleza] = useState("Total");
  const [selectedRankingZona, setSelectedRankingZona] = useState("Total");
  const [selectedRankingYear, setSelectedRankingYear] = useState<number>(2024);

  const handleRankingSexoChange = (v: string) => {
    setSelectedRankingSexo(v);
    if (v !== "Total") { setSelectedRankingNaturaleza("Total"); setSelectedRankingZona("Total"); }
  };
  const handleRankingNaturalezaChange = (v: string) => {
    setSelectedRankingNaturaleza(v);
    if (v !== "Total") { setSelectedRankingSexo("Total"); setSelectedRankingZona("Total"); }
  };
  const handleRankingZonaChange = (v: string) => {
    setSelectedRankingZona(v);
    if (v !== "Total") { setSelectedRankingSexo("Total"); setSelectedRankingNaturaleza("Total"); }
  };

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

  const isBrechaRanking = selectedRankingIndicator === "BRECHA";
  const effectiveRankingIndicator = isBrechaRanking ? "SABER_02" : selectedRankingIndicator;

  const { data: rankingData, isLoading: isLoadingRanking } = useQuery({
    queryKey: ["dama-saber-ranking", effectiveRankingIndicator],
    queryFn: async () => {
      // Paginar para superar el límite por defecto de Supabase (1000 filas)
      // y asegurarnos de leer TODAS las categorías (Oficial, No oficial, etc.)
      const pageSize = 1000;
      let from = 0;
      const all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("dama_data")
          .select("anio, categoria, categoria_2, valor, cod_entidad")
          .eq("cod_indicador", effectiveRankingIndicator)
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

  // Mantener seleccionado el último año disponible automáticamente
  const [userPickedRankingYear, setUserPickedRankingYear] = useState(false);
  useEffect(() => {
    if (availableRankingYears.length === 0) return;
    if (!userPickedRankingYear && availableRankingYears[0] !== selectedRankingYear) {
      setSelectedRankingYear(availableRankingYears[0]);
    } else if (!availableRankingYears.includes(selectedRankingYear)) {
      setSelectedRankingYear(availableRankingYears[0]);
    }
  }, [availableRankingYears, selectedRankingYear, userPickedRankingYear]);

  const rankingChartData = useMemo(() => {
    if (!rankingData || !damaEntities) return [];
    const entityMap = new Map(damaEntities.map(e => [e.cod_entidad, formatCityName(e.entidad || "")]));
    const targetCat2 = normalize(getEffectiveCat2(selectedRankingSexo, selectedRankingNaturaleza, selectedRankingZona));

    if (isBrechaRanking) {
      // Brecha = Oficial - No oficial por ciudad. Oficial/No oficial vienen en categoria_2.
      const perCity: Record<string, { oficial: number[]; noOficial: number[] }> = {};
      rankingData
        .filter(d => d.anio === selectedRankingYear && d.cod_entidad)
        .forEach(d => {
          const code = String(d.cod_entidad);
          if (code.length !== 5) return;
          if (d.valor == null) return;
          const cat2 = normalize((d as any).categoria_2);
          if (cat2 !== "oficial" && cat2 !== "no oficial") return;
          if (!perCity[code]) perCity[code] = { oficial: [], noOficial: [] };
          if (cat2 === "oficial") perCity[code].oficial.push(Number(d.valor));
          else perCity[code].noOficial.push(Number(d.valor));
        });
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      return Object.entries(perCity)
        .filter(([, v]) => v.oficial.length > 0 && v.noOficial.length > 0)
        .map(([code, v]) => ({
          entidad: entityMap.get(code) || code,
          puntaje: Math.round(avg(v.oficial) - avg(v.noOficial)),
        }))
        .filter(item => !isExcludedCity(item.entidad))
        .sort((a, b) => b.puntaje - a.puntaje);
    }

    const grouped: Record<string, number[]> = {};
    rankingData
      .filter(d => d.anio === selectedRankingYear && normalize(d.categoria) === normalize(selectedRankingCategory) && normalize((d as any).categoria_2) === targetCat2 && d.cod_entidad)
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
      .filter(item => !isExcludedCity(item.entidad))
      .sort((a, b) => b.puntaje - a.puntaje);
  }, [rankingData, damaEntities, selectedRankingYear, selectedRankingCategory, selectedRankingSexo, selectedRankingNaturaleza, selectedRankingZona, isBrechaRanking]);

  // Card 3 - Evolución comparada usando dama_data (SABER_01..SABER_06)
  const [selectedEvolutionIndicator, setSelectedEvolutionIndicator] = useState<string>("SABER_02");
  const [selectedEvolutionSexo, setSelectedEvolutionSexo] = useState("Total");
  const [selectedEvolutionNaturaleza, setSelectedEvolutionNaturaleza] = useState("Total");
  const [selectedEvolutionZona, setSelectedEvolutionZona] = useState("Total");
  const [selectedCities, setSelectedCities] = useState<string[]>(["Manizales"]);

  const handleEvolutionSexoChange = (v: string) => {
    setSelectedEvolutionSexo(v);
    if (v !== "Total") { setSelectedEvolutionNaturaleza("Total"); setSelectedEvolutionZona("Total"); }
  };
  const handleEvolutionNaturalezaChange = (v: string) => {
    setSelectedEvolutionNaturaleza(v);
    if (v !== "Total") { setSelectedEvolutionSexo("Total"); setSelectedEvolutionZona("Total"); }
  };
  const handleEvolutionZonaChange = (v: string) => {
    setSelectedEvolutionZona(v);
    if (v !== "Total") { setSelectedEvolutionSexo("Total"); setSelectedEvolutionNaturaleza("Total"); }
  };


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
          .select("anio, categoria, categoria_2, valor, cod_entidad")
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
    const entityMap = new Map(damaEntities.map(e => [e.cod_entidad, formatCityName(e.entidad || "")]));
    const cityCodes = new Set<string>();
    evolutionRawData.forEach(d => {
      const code = String(d.cod_entidad || "");
      if (code.length === 5) cityCodes.add(code);
    });
    const cities = Array.from(cityCodes)
      .map(code => entityMap.get(code))
      .filter(Boolean) as string[];
    return cities
      .filter(city => !isExcludedCity(city))
      .sort((a, b) => {
        if (a === "Manizales") return -1;
        if (b === "Manizales") return 1;
        return a.localeCompare(b);
      });
  }, [evolutionRawData, damaEntities]);

  const evolutionChartData = useMemo(() => {
    if (!evolutionRawData || !damaEntities) return [];
    const entityMap = new Map(damaEntities.map(e => [e.cod_entidad, formatCityName(e.entidad || "")]));

    const cityYearVals: Record<string, Record<number, number[]>> = {};
    const targetCat2 = normalize(getEffectiveCat2(selectedEvolutionSexo, selectedEvolutionNaturaleza, selectedEvolutionZona));
    evolutionRawData
      .filter(d => normalize(d.categoria) === "total" && normalize((d as any).categoria_2) === targetCat2)
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
  }, [evolutionRawData, damaEntities, selectedCities, selectedEvolutionSexo, selectedEvolutionNaturaleza, selectedEvolutionZona]);

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  // Manizales rojo, demás ciudades en gris/cian tenues
  const cityColors = useMemo(() => {
    // Paleta de marca con alto contraste entre ciudades
    const muted = [
      "#00A0AF", // Turquesa
      "#FBB040", // Naranja
      "#7AC143", // Verde
      "#572700", // Café
      "#6B5B95", // Púrpura complementario
      "#2E5C8A", // Azul profundo
      "#C84B31", // Terracota
      "#1F7A5A", // Verde bosque
    ];
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sexo</label>
                  <Select value={selectedSexo} onValueChange={handleSexoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEXO_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Naturaleza</label>
                  <Select value={selectedNaturaleza} onValueChange={handleNaturalezaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione naturaleza" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATURALEZA_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Zona</label>
                  <Select value={selectedZona} onValueChange={handleZonaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONA_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
                      <YAxis
                        domain={[
                          (dataMin: number) => Math.max(0, Math.floor((dataMin - 10) / 10) * 10),
                          (dataMax: number) => Math.ceil((dataMax + 10) / 10) * 10,
                        ]}
                        allowDecimals={false}
                        tickFormatter={(value) => Math.round(value).toString()}
                      />
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

      {/* Card 2 (NUEVA): Comparativo histórico Oficial vs No oficial */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-luker-brown">
            <Award className="h-5 w-5 text-luker-red" />
            Comparativo histórico Saber Once: Oficial vs No oficial
          </CardTitle>
          <ChartDownloadButton
            chartRef={chartCompRef}
            title="Comparativo Oficial vs No oficial - Saber Once"
            excelData={compChartData}
            excelColumns={[
              { header: "Año", key: "año" },
              { header: "Oficial", key: "Oficial" },
              { header: "No oficial", key: "No oficial" },
            ]}
          />
        </CardHeader>
        <CardContent>
          {isLoadingComp ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ciudad</label>
                  <Select value={selectedCompCity} onValueChange={setSelectedCompCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCompCities.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Área Temática</label>
                  <Select value={selectedCompIndicator} onValueChange={setSelectedCompIndicator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {SABER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {compChartData.length > 0 ? (
                <div className="space-y-6">
                  {/* KPIs de brecha */}
                  {gapStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Brecha promedio</p>
                        <p className={`text-2xl font-bold mt-1 ${gapStats.avgDiff >= 0 ? 'text-emerald-600' : 'text-luker-red'}`}>
                          {gapStats.avgDiff > 1 ? '+' : ''}{gapStats.avgDiff} pts
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {gapStats.avgDiff >= 1 ? 'A favor de Oficial' : gapStats.avgDiff <= -1 ? 'A favor de No oficial' : 'Paridad'}
                        </p>
                      </div>
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Brecha {gapStats.latestYear}</p>
                        <p className={`text-2xl font-bold mt-1 ${(gapStats.latestDiff ?? 1) >= 0 ? 'text-emerald-600' : 'text-luker-red'}`}>
                          {(gapStats.latestDiff ?? 0) > 1 ? '+' : ''}{gapStats.latestDiff} pts
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {(gapStats.latestDiff ?? 0) >= 1 ? 'A favor de Oficial' : (gapStats.latestDiff ?? 0) <= -1 ? 'A favor de No oficial' : 'Paridad'}
                        </p>
                      </div>
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Tendencia histórica</p>
                        <p className="text-2xl font-bold mt-1 text-luker-brown">
                          {gapStats.positiveYears} <span className="text-base font-normal text-gray-400">de {gapStats.totalYears} años</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          favorecen a Oficial
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gráfico principal */}
                  <div ref={chartCompRef} className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={compChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="año" />
                        <YAxis domain={[0, 500]} ticks={[0, 100, 200, 300, 400, 500]} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const row: any = payload[0]?.payload ?? {};
                            const diff = row.Diferencia;
                            const diffColor = diff == null ? '#6b7280' : diff > 0 ? '#0d9488' : diff < 0 ? '#e11d48' : '#6b7280';
                            const diffLabel = diff == null
                              ? 'N/A'
                              : `${diff > 0 ? '+' : ''}${Math.round(diff)} pts ${diff > 0 ? '(a favor Oficial)' : diff < 0 ? '(a favor No oficial)' : '(paridad)'}`;
                            return (
                              <div className="bg-white border border-gray-200 rounded-md shadow-md px-3 py-2 text-sm">
                                <div className="font-semibold text-gray-900 mb-1">{label}</div>
                                {payload.map((p: any) => (
                                  <div key={p.dataKey} style={{ color: p.color }}>
                                    {p.dataKey} : {p.value == null ? 'N/A' : Math.round(p.value)}
                                  </div>
                                ))}
                                <div className="mt-1 pt-1 border-t border-gray-100" style={{ color: diffColor }}>
                                  Brecha: {diffLabel}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Oficial" fill="#0d9488" name="Oficial" />
                        <Bar dataKey="No oficial" fill="#e11d48" name="No oficial" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de diferencia (brecha) */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Magnitud de la brecha: Oficial − No oficial (puntos)
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={compChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="año" tick={{ fontSize: 12 }} />
                          <YAxis
                            tickFormatter={(v) => `${v > 1 ? '+' : ''}${v}`}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(v: number) => [
                              `${v > 1 ? '+' : ''}${v} pts`,
                              'Diferencia (Oficial − No oficial)'
                            ]}
                          />
                          <Bar dataKey="Diferencia" name="Diferencia">
                            {compChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={(entry.Diferencia ?? 0) > 1 ? '#10b981' : (entry.Diferencia ?? 0) < -1 ? '#e11d48' : '#9ca3af'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                        Oficial mejor
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-sm bg-gray-400" />
                        Paridad
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-sm bg-luker-red" />
                        No oficial mejor
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay datos disponibles para los filtros seleccionados. Nota: los filtros de Sexo y Sector son excluyentes con la comparación Oficial/No oficial.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Ranking de Entidades 2024 */}

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Año</label>
                  <Select value={selectedRankingYear.toString()} onValueChange={(value) => { setUserPickedRankingYear(true); setSelectedRankingYear(Number(value)); }}>
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
                      <SelectItem value="BRECHA">Brecha (Oficial − No oficial)</SelectItem>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sexo</label>
                  <Select value={selectedRankingSexo} onValueChange={handleRankingSexoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEXO_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Naturaleza</label>
                  <Select value={selectedRankingNaturaleza} onValueChange={handleRankingNaturalezaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione naturaleza" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATURALEZA_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Zona</label>
                  <Select value={selectedRankingZona} onValueChange={handleRankingZonaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONA_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
                      <Bar dataKey="puntaje" name={isBrechaRanking ? "Brecha (Oficial − No oficial)" : "Puntaje"}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <label className="text-sm font-medium text-gray-700">Sexo</label>
                  <Select value={selectedEvolutionSexo} onValueChange={handleEvolutionSexoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEXO_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Naturaleza</label>
                  <Select value={selectedEvolutionNaturaleza} onValueChange={handleEvolutionNaturalezaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione naturaleza" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATURALEZA_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Zona</label>
                  <Select value={selectedEvolutionZona} onValueChange={handleEvolutionZonaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONA_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
