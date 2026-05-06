import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Banknote, Wallet, Handshake, Bean } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const formatValue = (value: number | null, isCurrency: boolean = false): string => {
  if (value === null || value === undefined) return "N/A";
  
  if (isCurrency) {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} Miles MM`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} MM`;
    }
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      maximumFractionDigits: 0 
    }).format(value);
  }
  
  if (value >= 1000) {
    return new Intl.NumberFormat('es-CO').format(value);
  }
  return value.toString();
};

const formatYAxisCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  return value.toString();
};

interface ChartCardProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  data: Array<{ year: number; valor: number }>;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  isCurrency?: boolean;
  areaColor: string;
  gradientId: string;
}

const ChartCard = ({
  title,
  icon: Icon,
  iconColor,
  data,
  categories,
  selectedCategory,
  onCategoryChange,
  isCurrency = false,
  areaColor,
  gradientId,
}: ChartCardProps) => {
  const latestValue = data.length > 0 ? data[data.length - 1]?.valor : null;
  const previousValue = data.length > 1 ? data[data.length - 2]?.valor : null;
  
  const trend = latestValue && previousValue 
    ? ((latestValue - previousValue) / previousValue) * 100 
    : null;

  return (
    <Card className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconColor}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-sm font-semibold text-amber-900 leading-tight">
              {title}
            </CardTitle>
          </div>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[160px] h-8 text-xs border-amber-200">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* KPI Value */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-800">
            {formatValue(latestValue, isCurrency)}
          </span>
        </div>
        <p className="text-xs text-amber-600">
          Último año disponible: {data.length > 0 ? data[data.length - 1]?.year : 'N/A'}
        </p>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={areaColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5e6d3" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10, fill: "#92400e" }}
                tickLine={false}
                axisLine={{ stroke: "#d4a574" }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "#92400e" }}
                tickLine={false}
                axisLine={{ stroke: "#d4a574" }}
                tickFormatter={isCurrency ? formatYAxisCurrency : (v) => formatValue(v)}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #d4a574",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [formatValue(value, isCurrency), title]}
                labelFormatter={(label) => `Año ${label}`}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
                formatter={() => title}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke={areaColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                name={title}
                dot={{ fill: areaColor, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: areaColor, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const RuralSuenoChocolate = () => {
  const [categoryBeneficiarios, setCategoryBeneficiarios] = useState("Total");
  const [categoryInvTotal, setCategoryInvTotal] = useState("Total");
  const [categoryInvPropios, setCategoryInvPropios] = useState("Total");
  const [categoryInvTerceros, setCategoryInvTerceros] = useState("Total");

  // Fetch beneficiaries data
  const { data: beneficiariosData, isLoading: loadingBenef } = useQuery({
    queryKey: ["sueno-chocolate-beneficiarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rural_beneficiaries")
        .select("*")
        .eq("programa", "Beneficiarios de Sueños de Chocolate")
        .order("year", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch indicators data
  const { data: indicatorsData, isLoading: loadingInd } = useQuery({
    queryKey: ["sueno-chocolate-indicators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rural_development_indicators")
        .select("*")
        .eq("seccion", "Sueño de Chocolate")
        .order("year", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Get unique categories for indicators
  const indicatorCategories = useMemo(() => {
    if (!indicatorsData) return ["Total"];
    const cats = [...new Set(indicatorsData.map(d => d.categoria?.trim() || "Sin categoría"))];
    return ["Total", ...cats.filter(c => c !== "Total" && c !== "Sin categoría")];
  }, [indicatorsData]);

  // Process beneficiaries data
  const beneficiariosChartData = useMemo(() => {
    if (!beneficiariosData) return [];
    
    const grouped = beneficiariosData.reduce((acc, item) => {
      const year = item.year;
      if (!acc[year]) acc[year] = 0;
      acc[year] += item.valor || 0;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(grouped)
      .map(([year, valor]) => ({ year: parseInt(year), valor }))
      .sort((a, b) => a.year - b.year);
  }, [beneficiariosData]);

  // Process indicator data by type
  const processIndicatorData = (indicatorName: string, category: string) => {
    if (!indicatorsData) return [];
    
    const filtered = indicatorsData.filter(d => 
      d.indicador === indicatorName && 
      (category === "Total" || d.categoria?.trim() === category)
    );

    const grouped = filtered.reduce((acc, item) => {
      const year = item.year;
      if (!acc[year]) acc[year] = 0;
      acc[year] += item.valor || 0;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(grouped)
      .map(([year, valor]) => ({ year: parseInt(year), valor }))
      .sort((a, b) => a.year - b.year);
  };

  const invTotalData = useMemo(() => 
    processIndicatorData("Inversión total del proyecto", categoryInvTotal),
    [indicatorsData, categoryInvTotal]
  );

  const invPropiosData = useMemo(() => 
    processIndicatorData("Inversión con recursos propios", categoryInvPropios),
    [indicatorsData, categoryInvPropios]
  );

  const invTercerosData = useMemo(() => 
    processIndicatorData("Inversión con recursos de terceros", categoryInvTerceros),
    [indicatorsData, categoryInvTerceros]
  );

  if (loadingBenef || loadingInd) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Chart Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Participantes */}
        <ChartCard
          title="Evolución Histórica: Participantes"
          icon={Users}
          iconColor="bg-amber-600"
          data={beneficiariosChartData}
          categories={["Total"]}
          selectedCategory={categoryBeneficiarios}
          onCategoryChange={setCategoryBeneficiarios}
          isCurrency={false}
          areaColor="#d97706"
          gradientId="gradBenef"
        />

        {/* Card 2: Inversión Total */}
        <ChartCard
          title="Inversión Total Proyecto"
          icon={Banknote}
          iconColor="bg-amber-700"
          data={invTotalData}
          categories={indicatorCategories}
          selectedCategory={categoryInvTotal}
          onCategoryChange={setCategoryInvTotal}
          isCurrency={true}
          areaColor="#b45309"
          gradientId="gradInvTotal"
        />

        {/* Card 3: Inversión Recursos Propios */}
        <ChartCard
          title="Inversión: Recursos Propios"
          icon={Wallet}
          iconColor="bg-orange-600"
          data={invPropiosData}
          categories={indicatorCategories}
          selectedCategory={categoryInvPropios}
          onCategoryChange={setCategoryInvPropios}
          isCurrency={true}
          areaColor="#ea580c"
          gradientId="gradInvPropios"
        />

        {/* Card 4: Inversión Recursos de Terceros */}
        <ChartCard
          title="Inversión: Recursos de Terceros (Aliados)"
          icon={Handshake}
          iconColor="bg-yellow-700"
          data={invTercerosData}
          categories={indicatorCategories}
          selectedCategory={categoryInvTerceros}
          onCategoryChange={setCategoryInvTerceros}
          isCurrency={true}
          areaColor="#ca8a04"
          gradientId="gradInvTerceros"
        />
      </div>
    </div>
  );
};

export default RuralSuenoChocolate;
