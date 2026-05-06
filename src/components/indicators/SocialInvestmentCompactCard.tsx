import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface HistoricalData {
  year: number;
  tipo: string;
  valor: number;
}

export const SocialInvestmentCompactCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["social-investment-historical"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_investment_historical")
        .select("*")
        .order("year", { ascending: true });

      if (error) throw error;
      return data as HistoricalData[];
    },
  });

  // Transform data for recharts
  const chartData = data?.reduce((acc: Record<number, { year: number; Propios: number; Terceros: number }>, item) => {
    if (!acc[item.year]) {
      acc[item.year] = { year: item.year, Propios: 0, Terceros: 0 };
    }
    if (item.tipo === "Propios") {
      acc[item.year].Propios = item.valor / 1000000000;
    } else if (item.tipo === "Terceros") {
      acc[item.year].Terceros = item.valor / 1000000000;
    }
    return acc;
  }, {});

  const formattedData = chartData ? Object.values(chartData) : [];

  // Calculate year range dynamically
  const years = data?.map(d => d.year) || [];
  const minYear = years.length > 0 ? Math.min(...years) : null;
  const maxYear = years.length > 0 ? Math.max(...years) : null;
  const periodLabel = minYear && maxYear ? `${minYear} - ${maxYear}` : "";

  // Calculate totals
  const totalPropios = data?.filter(d => d.tipo === "Propios").reduce((sum, d) => sum + d.valor, 0) || 0;
  const totalTerceros = data?.filter(d => d.tipo === "Terceros").reduce((sum, d) => sum + d.valor, 0) || 0;
  const grandTotal = totalPropios + totalTerceros;

  const formatCurrencyMillions = (value: number) => {
    const millions = value / 1000000;
    return `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(millions))} MM`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg h-full">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luker-green"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 h-full min-h-[320px]">
      <CardContent className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-bold text-luker-brown">Inversión Social</h3>
            {periodLabel && (
              <span className="text-xs text-gray-500 font-medium">{periodLabel}</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mt-3">
            <div>
              <span className="text-emerald-600 font-medium">Propios</span>
              <p className="font-bold text-emerald-700 text-sm">{formatCurrencyMillions(totalPropios)}</p>
            </div>
            <div className="text-center">
              <span className="text-purple-600 font-medium">Terceros</span>
              <p className="font-bold text-purple-700 text-sm">{formatCurrencyMillions(totalTerceros)}</p>
            </div>
            <div className="text-right">
              <span className="text-luker-brown font-medium">Total</span>
              <p className="font-bold text-luker-brown text-sm">{formatCurrencyMillions(grandTotal)}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 5, right: 5, left: -5, bottom: 0 }} barCategoryGap="12%">
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 9, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 8, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={35}
                tickFormatter={(value) => `${value}MM`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const propios = Number(payload.find(p => p.dataKey === "Propios")?.value || 0);
                    const terceros = Number(payload.find(p => p.dataKey === "Terceros")?.value || 0);
                    const total = propios + terceros;
                    return (
                      <div className="bg-white border border-gray-200 rounded p-2 shadow-lg text-xs">
                        <p className="font-semibold mb-1">Año {label}</p>
                        <p className="text-emerald-600">Propios: ${propios.toFixed(1)} MM</p>
                        <p className="text-purple-600">Terceros: ${terceros.toFixed(1)} MM</p>
                        <p className="font-bold text-luker-brown border-t border-gray-200 mt-1 pt-1">Total: ${total.toFixed(1)} MM</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="Propios" 
                stackId="a" 
                fill="#10b981" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="Terceros" 
                stackId="a" 
                fill="#8b5cf6" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
