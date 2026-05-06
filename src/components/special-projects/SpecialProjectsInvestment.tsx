import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, Handshake, TrendingUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IndicatorData {
  cod_indicador: string;
  indicador: string;
  categoria: string;
  seccion: string;
  dato: number;
  year: number;
  unidad_medida: string;
}

// Card configurations
const cardConfigs = [
  {
    id: "total",
    title: "Inversión Total Ejecutada",
    icon: TrendingUp,
    color: "#2563eb",
    indicators: ["PE.3", "PE.4"],
  },
  {
    id: "propios",
    title: "Inversión: Recursos Propios (Fundación)",
    icon: Wallet,
    color: "#10B981",
    indicators: ["PE.3"],
  },
  {
    id: "terceros",
    title: "Inversión: Recursos de Terceros (Aliados)",
    icon: Handshake,
    color: "#8B5CF6",
    indicators: ["PE.4"],
  },
];

type SortField = "categoria" | "propios" | "terceros" | "total";
type SortDirection = "asc" | "desc";

const SpecialProjectsInvestment = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilters, setSectionFilters] = useState<Record<string, string>>({});
  const [tableYear, setTableYear] = useState<string>("all");
  const [tableSection, setTableSection] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("special_projects_indicators")
          .select("cod_indicador, indicador, categoria, seccion, dato, year, unidad_medida")
          .in("cod_indicador", ["PE.3", "PE.4"])
          .order("year", { ascending: true });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching investment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique sections
  const sections = useMemo(() => {
    const uniqueSections = [...new Set(data.map(d => d.seccion).filter(Boolean))];
    return uniqueSections.sort();
  }, [data]);

  // Get unique years
  const years = useMemo(() => {
    const uniqueYears = [...new Set(data.map(d => d.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [data]);

  // Get max year
  const maxYear = useMemo(() => {
    if (data.length === 0) return new Date().getFullYear();
    return Math.max(...data.map(d => d.year));
  }, [data]);

  // Get chart data for a card
  const getChartData = (indicators: string[], sectionFilter: string) => {
    let filteredData = data.filter(d => indicators.includes(d.cod_indicador));
    
    if (sectionFilter && sectionFilter !== "all") {
      filteredData = filteredData.filter(d => d.seccion === sectionFilter);
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
        inversion: value,
      }))
      .sort((a, b) => a.year - b.year);
  };

  // Get latest year total for a card
  const getLatestTotal = (indicators: string[], sectionFilter: string) => {
    const chartData = getChartData(indicators, sectionFilter);
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].inversion;
  };

  // Get table data
  const tableData = useMemo(() => {
    let filteredData = data;
    
    if (tableYear !== "all") {
      filteredData = filteredData.filter(d => d.year === parseInt(tableYear));
    }
    
    if (tableSection !== "all") {
      filteredData = filteredData.filter(d => d.seccion === tableSection);
    }

    // Group by categoria
    const grouped: Record<string, { propios: number; terceros: number }> = {};
    
    filteredData.forEach(item => {
      if (!grouped[item.categoria]) {
        grouped[item.categoria] = { propios: 0, terceros: 0 };
      }
      if (item.cod_indicador === "PE.3") {
        grouped[item.categoria].propios += (item.dato || 0);
      } else if (item.cod_indicador === "PE.4") {
        grouped[item.categoria].terceros += (item.dato || 0);
      }
    });

    const result = Object.entries(grouped).map(([categoria, values]) => ({
      categoria,
      propios: values.propios,
      terceros: values.terceros,
      total: values.propios + values.terceros,
    }));

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      return sortDirection === "asc" 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });

    return result;
  }, [data, tableYear, tableSection, sortField, sortDirection]);

  const formatCurrency = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 0 })} Mil MM`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 1 })} MM`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 })}M`;
    }
    return `$${value.toLocaleString("es-CO")}`;
  };

  const formatCurrencyTable = (value: number) => {
    return `$${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
  };

  const handleSectionChange = (cardId: string, value: string) => {
    setSectionFilters(prev => ({ ...prev, [cardId]: value }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 grid-cols-1">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-56 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Inversión</h2>
      </div>

      {/* KPI Cards with Charts */}
      <div className="grid gap-6 grid-cols-1">
        {cardConfigs.map((config, index) => {
          const Icon = config.icon;
          const sectionFilter = sectionFilters[config.id] || "all";
          const chartData = getChartData(config.indicators, sectionFilter);
          const latestTotal = getLatestTotal(config.indicators, sectionFilter);
          const gradientId = `investment-gradient-${index}`;

          return (
            <Card key={config.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold text-gray-800">
                      {config.title}
                    </CardTitle>
                    <p className="text-lg font-bold" style={{ color: config.color }}>
                      {formatCurrency(latestTotal)}
                      <span className="text-xs font-normal text-gray-500 ml-1">({maxYear})</span>
                    </p>
                  </div>
                </div>
                
                {/* Section filter */}
                <div className="mt-3">
                  <Select 
                    value={sectionFilter} 
                    onValueChange={(value) => handleSectionChange(config.id, value)}
                  >
                    <SelectTrigger className="w-full bg-white text-sm h-9">
                      <SelectValue placeholder="Filtrar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las secciones</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
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
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickFormatter={formatCurrency}
                        width={55}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Inversión"]}
                        labelFormatter={(label) => `Año ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="inversion"
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

      {/* Detail Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">
                Detalle de Inversión por Proyecto
              </CardTitle>
            </div>
            
            {/* Table Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={tableYear} onValueChange={setTableYear}>
                <SelectTrigger className="w-32 bg-white text-sm h-9">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={tableSection} onValueChange={setTableSection}>
                <SelectTrigger className="w-48 bg-white text-sm h-9">
                  <SelectValue placeholder="Sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 font-semibold"
                      onClick={() => handleSort("categoria")}
                    >
                      Proyecto
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8 px-2 font-semibold"
                      onClick={() => handleSort("propios")}
                    >
                      Inversión Propios
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8 px-2 font-semibold"
                      onClick={() => handleSort("terceros")}
                    >
                      Inversión Terceros
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8 px-2 font-semibold"
                      onClick={() => handleSort("total")}
                    >
                      Inversión Total
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No hay datos para los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row) => (
                    <TableRow key={row.categoria}>
                      <TableCell className="font-medium">{row.categoria}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrencyTable(row.propios)}
                      </TableCell>
                      <TableCell className="text-right text-purple-600">
                        {formatCurrencyTable(row.terceros)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {formatCurrencyTable(row.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Table Totals */}
          {tableData.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total Propios</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(tableData.reduce((sum, r) => sum + r.propios, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Terceros</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(tableData.reduce((sum, r) => sum + r.terceros, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total General</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(tableData.reduce((sum, r) => sum + r.total, 0))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialProjectsInvestment;
