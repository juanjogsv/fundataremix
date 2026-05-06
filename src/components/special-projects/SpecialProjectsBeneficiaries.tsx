import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, TrendingUp, Heart, Lightbulb, Building2, Baby, Stethoscope, Home, UserCheck, Sparkles, LayoutGrid } from "lucide-react";

interface IndicatorData {
  cod_indicador: string;
  indicador: string;
  categoria: string;
  seccion: string;
  dato: number;
  year: number;
  unidad_medida: string;
}

// Section configuration with icons and colors
const sectionConfigs: Record<string, { icon: React.ElementType; color: string; title: string }> = {
  "General": { icon: LayoutGrid, color: "#2563eb", title: "Total General" },
  "Emprendimiento": { icon: Lightbulb, color: "#FB8C00", title: "Emprendimiento" },
  "Especiales - Religiosos": { icon: Heart, color: "#EF4444", title: "Religiosos" },
  "Especiales -Formación": { icon: Building2, color: "#7AC143", title: "Formación" },
  "Otras Iniciativas": { icon: Sparkles, color: "#8B5CF6", title: "Otras Iniciativas" },
  "Proyectos especiales": { icon: UserCheck, color: "#00A0AF", title: "Proyectos Especiales" },
  "Proyectos Especiales - primera Infancia": { icon: Baby, color: "#EC4899", title: "Primera Infancia" },
  "Proyectos Especiales - Salud": { icon: Stethoscope, color: "#10B981", title: "Salud" },
  "Proyectos Especiales - Tercera Edad": { icon: Users, color: "#6366F1", title: "Tercera Edad" },
  "Proyectos Especiales - Vivienda": { icon: Home, color: "#F59E0B", title: "Vivienda" },
};

const SpecialProjectsBeneficiaries = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("special_projects_indicators")
          .select("cod_indicador, indicador, categoria, seccion, dato, year, unidad_medida")
          .eq("cod_indicador", "PE.1")
          .order("year", { ascending: true });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching special projects data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique sections (excluding Emprendimiento and Proyectos especiales)
  const sections = useMemo(() => {
    const uniqueSections = [...new Set(data.map(d => d.seccion).filter(Boolean))];
    return uniqueSections.filter(s => s !== "Emprendimiento" && s !== "Proyectos especiales").sort();
  }, [data]);

  // Get categories for each section
  const categoriesBySection = useMemo(() => {
    const result: Record<string, string[]> = {};
    sections.forEach(section => {
      const sectionData = data.filter(d => d.seccion === section);
      const uniqueCategories = [...new Set(sectionData.map(d => d.categoria).filter(Boolean))];
      result[section] = uniqueCategories.sort();
    });
    return result;
  }, [data, sections]);

  // Get chart data for a section
  const getChartData = (section: string | null) => {
    let filteredData = data;
    
    if (section) {
      filteredData = filteredData.filter(d => d.seccion === section);
      const categoryFilter = categoryFilters[section];
      if (categoryFilter && categoryFilter !== "all") {
        filteredData = filteredData.filter(d => d.categoria === categoryFilter);
      }
    }

    const groupedByYear: Record<number, number> = {};
    filteredData.forEach(item => {
      if (!groupedByYear[item.year]) {
        groupedByYear[item.year] = 0;
      }
      groupedByYear[item.year] += (item.dato || 0);
    });

    return Object.entries(groupedByYear)
      .map(([year, value]) => ({
        year: parseInt(year),
        participantes: value,
      }))
      .sort((a, b) => a.year - b.year);
  };

  // Get latest year total for a section
  const getLatestYearTotal = (section: string | null) => {
    const chartData = getChartData(section);
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].participantes;
  };

  const getMaxYear = () => {
    if (data.length === 0) return new Date().getFullYear();
    return Math.max(...data.map(d => d.year));
  };

  const formatValue = (value: number) => value.toLocaleString('es-CO', { maximumFractionDigits: 0 });

  const handleCategoryChange = (section: string, value: string) => {
    setCategoryFilters(prev => ({ ...prev, [section]: value }));
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const maxYear = getMaxYear();

  // Build cards array: General first, then sections
  const cards = [
    { section: null, key: "General" },
    ...sections.map(section => ({ section, key: section }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Participantes</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map(({ section, key }, index) => {
          const config = sectionConfigs[key] || sectionConfigs["General"];
          const Icon = config.icon;
          const chartData = getChartData(section);
          const latestTotal = getLatestYearTotal(section);
          const categories = section ? categoriesBySection[section] || [] : [];
          const currentFilter = section ? categoryFilters[section] || "all" : "all";
          const gradientId = `gradient-${index}`;

          return (
            <Card key={key} className={`overflow-hidden ${index === 0 ? "md:col-span-2" : ""} ${index >= 1 ? "bg-transparent border-0 shadow-none" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-800">
                        {config.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {formatValue(latestTotal)} participantes ({maxYear})
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Category filter for non-general cards */}
                {section && categories.length > 0 && (
                  <div className="mt-3">
                    <Select 
                      value={currentFilter} 
                      onValueChange={(value) => handleCategoryChange(section, value)}
                    >
                      <SelectTrigger className="w-full bg-white text-sm h-9">
                        <SelectValue placeholder="Filtrar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={config.color} stopOpacity={0.25} />
                          <stop offset="50%" stopColor={config.color} stopOpacity={0.1} />
                          <stop offset="100%" stopColor={config.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="year"
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={formatValue}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatValue(value), "Participantes"]}
                        labelFormatter={(label) => `Año ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="participantes"
                        stroke={config.color}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={{ fill: config.color, strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: config.color, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialProjectsBeneficiaries;
