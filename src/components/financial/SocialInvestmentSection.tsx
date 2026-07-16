import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Search, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList } from "recharts";

// Dynamic color function based on execution percentage (matching Strategic Indicators style)
const getBarColor = (percentage: number): string => {
  if (percentage <= 25) {
    // Red to Orange: #E53935 to #FF8C00
    const ratio = percentage / 25;
    return `rgb(${Math.round(229 + (255 - 229) * ratio)}, ${Math.round(57 + (140 - 57) * ratio)}, ${Math.round(53 + (0 - 53) * ratio)})`;
  } else if (percentage <= 50) {
    // Orange to Yellow: #FF8C00 to #FFD700
    const ratio = (percentage - 25) / 25;
    return `rgb(255, ${Math.round(140 + (215 - 140) * ratio)}, 0)`;
  } else if (percentage <= 75) {
    // Yellow to Light Green: #FFD700 to #7CB342
    const ratio = (percentage - 50) / 25;
    return `rgb(${Math.round(255 - (255 - 124) * ratio)}, ${Math.round(215 - (215 - 179) * ratio)}, ${Math.round(0 + 66 * ratio)})`;
  } else if (percentage <= 90) {
    // Light Green to Green: #7CB342 to #00A0AF
    const ratio = (percentage - 75) / 15;
    return `rgb(${Math.round(124 - 124 * ratio)}, ${Math.round(179 - (179 - 160) * ratio)}, ${Math.round(66 + (175 - 66) * ratio)})`;
  } else {
    // Green to Teal: #00A0AF
    return '#00A0AF';
  }
};
import { MonthSelector } from "./MonthSelector";
import { useFinancialMonthlyData } from "@/hooks/useFinancialMonthlyData";

interface HistoricalExecution {
  month: number;
  month_name: string;
  year: number;
  execution_percentage: number;
  executed: number;
  saldo_inicial: number;
}

interface SocialInvestment {
  id: string;
  project_name: string;
  category: string;
  budget_2025: number;
  executed: number;
  pending: number;
  execution_percentage: number;
  is_parent: boolean;
  parent_category: string | null;
}

export const SocialInvestmentSection = () => {
  // Monthly data hook
  const {
    data: monthlyData,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    loading: monthlyLoading,
    getTotalBudget: getMonthlyTotalBudget,
    getTotalExecuted: getMonthlyTotalExecuted,
    getOverallExecutionPercentage: getMonthlyExecutionPercentage,
    hasData: hasMonthlyData,
  } = useFinancialMonthlyData();

  // Fallback to legacy data if no monthly data exists
  const [legacyInvestments, setLegacyInvestments] = useState<SocialInvestment[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInvestments, setFilteredInvestments] = useState<SocialInvestment[]>([]);
  const [historicalExecution, setHistoricalExecution] = useState<HistoricalExecution[]>([]);

  // Colores oficiales de la marca Luker para el pie chart
  const COLORS = ['#7AC143', '#FBB040', '#EF3E42', '#00A0AF', '#572700', '#B8D432', '#F7931E'];

  useEffect(() => {
    fetchLegacyInvestments();
    fetchHistoricalExecution();
  }, []);

  const fetchHistoricalExecution = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_execution_monthly")
        .select("year, month, month_name, execution_percentage, saldo_inicial, executed")
        .eq("project_name", "TOTAL")
        .order("year", { ascending: true })
        .order("month", { ascending: true });

      if (error) throw error;
      setHistoricalExecution(data || []);
    } catch (error) {
      console.error("Error fetching historical execution:", error);
    }
  };

  // Filter investments when search term or data changes
  useEffect(() => {
    filterInvestments();
  }, [searchTerm, monthlyData, legacyInvestments, hasMonthlyData]);

  const fetchLegacyInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from("social_investment")
        .select("*")
        .order("category", { ascending: true })
        .order("is_parent", { ascending: false });

      if (error) throw error;
      setLegacyInvestments(data || []);
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLegacyLoading(false);
    }
  };

  // Convert monthly data to unified format for display
  const getDisplayData = () => {
    if (hasMonthlyData) {
      return monthlyData.map((item) => ({
        id: item.id,
        project_name: item.project_name,
        category: item.category,
        budget_2025: item.saldo_inicial,
        executed: item.executed,
        pending: item.pending,
        execution_percentage: item.execution_percentage,
        is_parent: item.is_parent,
        parent_category: item.parent_category,
      }));
    }
    return legacyInvestments;
  };

  // Orden explícito de categorías según el archivo Excel (2026 primero, se
  // completa con las categorías previas y desconocidas al final)
  const CATEGORY_ORDER: string[] = [
    "EMPRENDIMIENTO",
    "PROGRAMAS",
    "EXPLORACION Y EXPERIMENTACION",
    "PROYECTO ALIANZA LUKER",
    "PROYECTOS ESPECIALES NO MISIONAL",
    "CONOCIMIENTO E INCIDENCIA",
    // Categorías 2025 y previos
    "EMPRENDIMIENTO DE ALTO IMPACTO",
    "EDUCACION PARA EL DESARROLLO",
    "PROYECTOS ESPECIALES",
    "INCIDENCIA",
    "EDUCACION",
    "TRANSFORMACION DIGITAL",
  ];

  // Orden explícito de sub-rubros dentro de una categoría (según Excel)
  const PROJECT_ORDER_BY_CATEGORY: Record<string, string[]> = {
    "CONOCIMIENTO E INCIDENCIA": [
      "COOPERACIÓN Y ALIANZAS",
      "GESTIÓN DEL CONOCIMIENTO",
      "INCIDENCIA",
      "COMUNICACIONES",
      "MONITOREO Y EVALUACIÓN",
      "4*1000",
    ],
  };

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

  const sortByCategoryOrder = (rows: SocialInvestment[]): SocialInvestment[] => {
    const rank = (cat: string) => {
      const idx = CATEGORY_ORDER.indexOf(cat.toUpperCase());
      return idx === -1 ? CATEGORY_ORDER.length : idx;
    };
    const projectRank = (category: string, name: string) => {
      const list = PROJECT_ORDER_BY_CATEGORY[category.toUpperCase()];
      if (!list) return -1;
      const n = normalize(name);
      const idx = list.findIndex((p) => normalize(p) === n);
      return idx === -1 ? list.length : idx;
    };
    return [...rows].sort((a, b) => {
      // TOTAL siempre al final
      const aTotal = a.project_name.toUpperCase() === "TOTAL";
      const bTotal = b.project_name.toUpperCase() === "TOTAL";
      if (aTotal !== bTotal) return aTotal ? 1 : -1;
      const catDiff = rank(a.category) - rank(b.category);
      if (catDiff !== 0) return catDiff;
      // Dentro de la categoría, primero el padre
      if (a.is_parent !== b.is_parent) return a.is_parent ? -1 : 1;
      // Orden explícito por sub-rubro si aplica
      const pr = projectRank(a.category, a.project_name) - projectRank(b.category, b.project_name);
      if (pr !== 0) return pr;
      return a.project_name.localeCompare(b.project_name, "es");
    });
  };

  const filterInvestments = () => {
    const displayData = getDisplayData();
    const sorted = sortByCategoryOrder(displayData);
    if (!searchTerm.trim()) {
      setFilteredInvestments(sorted);
      return;
    }

    const filtered = sorted.filter((inv) =>
      inv.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvestments(filtered);
  };

  const getTotalBudget = () => {
    if (hasMonthlyData) return getMonthlyTotalBudget();
    return legacyInvestments
      .filter((inv) => inv.is_parent)
      .reduce((sum, inv) => sum + inv.budget_2025, 0);
  };

  const getTotalExecuted = () => {
    if (hasMonthlyData) return getMonthlyTotalExecuted();
    return legacyInvestments
      .filter((inv) => inv.is_parent)
      .reduce((sum, inv) => sum + inv.executed, 0);
  };

  const getOverallExecutionPercentage = () => {
    if (hasMonthlyData) return getMonthlyExecutionPercentage();
    const total = getTotalBudget();
    const executed = getTotalExecuted();
    return total > 0 ? ((executed / total) * 100).toFixed(1) : "0";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyMillions = (value: number) => {
    const millions = value / 1000000;
    return `$ ${new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(millions))} M`;
  };

  // Map long category names to short labels for pie chart
  const categoryLabels: Record<string, string> = {
    // 2025 y previos
    "EDUCACION PARA EL DESARROLLO": "Educación",
    "EMPRENDIMIENTO DE ALTO IMPACTO": "Emprendimiento",
    "PROYECTOS ESPECIALES": "Especiales",
    "PROYECTO ALIANZA LUKER": "Alianza Luker",
    "INCIDENCIA": "Incidencia",
    "EMPRENDIMIENTO": "Emprendimiento",
    "EDUCACION": "Educación",
    "TRANSFORMACION DIGITAL": "Transf. Digital",
    // 2026
    "PROGRAMAS": "Programas",
    "EXPLORACION Y EXPERIMENTACION": "Exploración y Exp.",
    "PROYECTOS ESPECIALES NO MISIONAL": "Especiales",
    "CONOCIMIENTO E INCIDENCIA": "Conocimiento e Incidencia",
  };

  // Preparar datos para el gráfico de torta (solo proyectos principales, excluyendo TOTAL)
  const displayData = getDisplayData();
  // Orden explícito de la leyenda del gráfico de torta
  const PIE_LEGEND_ORDER = [
    "PROGRAMAS",
    "EXPLORACION Y EXPERIMENTACION",
    "CONOCIMIENTO E INCIDENCIA",
    "EMPRENDIMIENTO",
    "PROYECTO ALIANZA LUKER",
    "PROYECTOS ESPECIALES NO MISIONAL",
  ];
  const pieChartData = displayData
    .filter((inv) => inv.is_parent && inv.project_name.toUpperCase() !== "TOTAL")
    .slice()
    .sort((a, b) => {
      const ra = PIE_LEGEND_ORDER.indexOf(a.category.toUpperCase());
      const rb = PIE_LEGEND_ORDER.indexOf(b.category.toUpperCase());
      return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
    })
    .map((inv) => ({
      name: categoryLabels[inv.category] || inv.category,
      value: inv.budget_2025,
      percentage: getTotalBudget() > 0 ? ((inv.budget_2025 / getTotalBudget()) * 100).toFixed(1) : "0",
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-luker-brown/20">
          <p className="text-base font-bold text-luker-brown mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Presupuesto:</span> {formatCurrency(data.value)}
            </p>
            <p className="text-sm font-bold text-luker-green">
              {data.percentage}% del presupuesto total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const loading = monthlyLoading || legacyLoading;

  // Get selected month label for display
  const getSelectedMonthLabel = () => {
    if (!selectedMonth) return "";
    const monthData = availableMonths.find(
      (m) => m.year === selectedMonth.year && m.month === selectedMonth.month
    );
    return monthData?.label || `${selectedMonth.month}/${selectedMonth.year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luker-brown mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  if (!hasMonthlyData && legacyInvestments.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">No hay datos disponibles</p>
            <p className="text-sm text-yellow-700">
              Carga un archivo de ejecución mensual desde el panel de administración.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Month Selector */}
      {availableMonths.length > 0 && (
        <div className="flex justify-end">
          <MonthSelector
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>
      )}

      {/* Resumen Ejecutivo */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200/80 shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-luker-green/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-luker-green" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Presupuesto</p>
              <h3 className="text-2xl font-bold text-luker-brown">
                {formatCurrencyMillions(getTotalBudget())}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200/80 shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-luker-orange/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-luker-orange" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Ejecutado</p>
              <h3 className="text-2xl font-bold text-luker-brown">
                {formatCurrencyMillions(getTotalExecuted())}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200/80 shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-luker-teal/10 rounded-xl">
              <FileText className="h-6 w-6 text-luker-teal" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">% Ejecución General</p>
              <h3 className="text-2xl font-bold text-luker-brown">
                {getOverallExecutionPercentage()}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gráficos en la misma fila */}
      {(pieChartData.length > 0 || historicalExecution.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Torta - Distribución del Presupuesto */}
          {pieChartData.length > 0 && (
            <Card className="bg-white border-gray-200/80 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-luker-brown font-heading flex items-center gap-2">
                  <div className="w-1 h-6 bg-luker-green rounded-full"></div>
                  Distribución del Presupuesto
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-xl p-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="40%"
                        labelLine={false}
                        label={false}
                        outerRadius="65%"
                        innerRadius={0}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        iconType="circle"
                        wrapperStyle={{ 
                          paddingTop: '12px',
                          paddingBottom: '4px',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          flexWrap: 'wrap',
                        }}
                        formatter={(value, entry: any) => {
                          const item = pieChartData.find(d => d.name === value);
                          return (
                            <span className="text-xs font-medium text-gray-700">
                              {value} ({item?.percentage}%)
                            </span>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ejecución Presupuestal Histórica */}
          {historicalExecution.length > 0 && (
            <Card className="bg-white border-gray-200/80 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-luker-brown font-heading flex items-center gap-2">
                  <div className="w-1 h-6 bg-luker-teal rounded-full"></div>
                  Ejecución presupuestal por mes {selectedMonth?.year ? `- ${selectedMonth.year}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-xl p-2">
                  {(() => {
                    const chartYear = selectedMonth?.year ?? (historicalExecution[historicalExecution.length - 1]?.year);
                    const chartData = historicalExecution
                      .filter(item => item.year === chartYear)
                      .map(item => ({
                        ...item,
                        calculated_percentage: item.saldo_inicial > 0 
                          ? Number(((item.executed / item.saldo_inicial) * 100).toFixed(1))
                          : 0,
                        short_month: item.month_name.substring(0, 3),
                      }));
                    return (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={chartData}
                          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="short_month" 
                            tick={{ fill: '#572700', fontSize: 11 }}
                            axisLine={{ stroke: '#d1d5db' }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            tick={{ fill: '#572700', fontSize: 11 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => `${value}%`}
                            width={40}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Ejecución']}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return `${payload[0].payload.month_name} ${payload[0].payload.year}`;
                              }
                              return label;
                            }}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '2px solid #572700',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <ReferenceLine y={50} stroke="#FBB040" strokeDasharray="5 5" label={{ value: '50%', position: 'right', fill: '#FBB040', fontSize: 11 }} />
                          <Bar 
                            dataKey="calculated_percentage" 
                            radius={[4, 4, 0, 0]}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getBarColor(entry.calculated_percentage)} />
                            ))}
                            <LabelList 
                              dataKey="calculated_percentage" 
                              position="top" 
                              formatter={(value: number) => `${value.toFixed(0)}%`}
                              style={{ fill: '#572700', fontSize: 10, fontWeight: 600 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Tabla Detallada con Búsqueda */}
      {filteredInvestments.length > 0 && (
        <section>
          <Card className="bg-white border-gray-200/80 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-luker-brown font-heading flex items-center gap-2">
                    <div className="w-1 h-8 bg-luker-orange rounded-full"></div>
                    Detalle de Inversión por Proyecto
                  </CardTitle>
                </div>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por proyecto o área..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-luker-green focus:ring-luker-green rounded-lg"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b-2 border-luker-brown/10">
                      <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide">
                        Proyecto
                      </TableHead>
                      <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide text-right">
                        {hasMonthlyData ? "Saldo Inicial" : "Inversión Social"}
                      </TableHead>
                      <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide text-right">
                        Ejecutado
                      </TableHead>
                      <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide text-center">
                        % Ejecución
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="text-gray-400">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No se encontraron resultados para "{searchTerm}"</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvestments.map((investment) => (
                        <TableRow 
                          key={investment.id}
                          className={`hover:bg-luker-green/5 transition-colors ${
                            investment.is_parent 
                              ? 'bg-gradient-to-r from-luker-brown/5 to-luker-brown/3 border-l-4 border-luker-brown font-semibold' 
                              : 'border-l-4 border-transparent'
                          }`}
                        >
                          <TableCell className={investment.is_parent ? 'font-bold text-luker-brown text-base' : 'pl-8 text-gray-700'}>
                            {investment.project_name}
                          </TableCell>
                          <TableCell className="text-right font-mono text-luker-brown font-semibold">
                            {formatCurrency(investment.budget_2025)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-luker-green font-semibold">
                            {formatCurrency(investment.executed)}
                          </TableCell>
                          <TableCell className="text-center">
                            {(() => {
                              const calcPercentage = investment.budget_2025 > 0 
                                ? (investment.executed / investment.budget_2025) * 100 
                                : 0;
                              return (
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className={`h-2.5 rounded-full transition-all duration-300 ${
                                        calcPercentage >= 75 ? 'bg-gradient-to-r from-luker-green to-green-500' :
                                        calcPercentage >= 50 ? 'bg-gradient-to-r from-luker-orange to-orange-500' :
                                        'bg-gradient-to-r from-luker-red to-red-500'
                                      }`}
                                      style={{ width: `${Math.min(calcPercentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-bold min-w-[3.5rem] ${
                                    calcPercentage >= 75 ? 'text-luker-green' :
                                    calcPercentage >= 50 ? 'text-luker-orange' :
                                    'text-luker-red'
                                  }`}>
                                    {calcPercentage.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};
