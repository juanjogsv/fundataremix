import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

interface HistoricalData {
  year: number;
  tipo: string;
  valor: number;
}

const SocialInvestmentHistoricalChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
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
  const chartData = data?.reduce((acc: Record<number, { year: number; Propios: number; Terceros: number; Total: number }>, item) => {
    if (!acc[item.year]) {
      acc[item.year] = { year: item.year, Propios: 0, Terceros: 0, Total: 0 };
    }
    if (item.tipo === "Propios") {
      acc[item.year].Propios = item.valor / 1000000000; // Convert to billions
    } else if (item.tipo === "Terceros") {
      acc[item.year].Terceros = item.valor / 1000000000;
    }
    acc[item.year].Total = acc[item.year].Propios + acc[item.year].Terceros;
    return acc;
  }, {});

  const formattedData = chartData ? Object.values(chartData) : [];

  // Calculate totals
  const totalPropios = data?.filter(d => d.tipo === "Propios").reduce((sum, d) => sum + d.valor, 0) || 0;
  const totalTerceros = data?.filter(d => d.tipo === "Terceros").reduce((sum, d) => sum + d.valor, 0) || 0;
  const grandTotal = totalPropios + totalTerceros;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(1)}B`;
    }
    return `$${(value / 1000000000).toFixed(0)}MM`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luker-green"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg relative">
      <div className="absolute top-4 right-4 z-10">
        <ChartDownloadButton chartRef={chartRef} title="Inversión Social Histórica" />
      </div>
      <div ref={chartRef}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-luker-green to-emerald-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-luker-brown">
                Inversión Social Histórica
              </CardTitle>
              <p className="text-sm text-gray-500">2012 - 2024</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-luker-green">{formatCurrency(grandTotal)}</p>
            <p className="text-xs text-gray-500">Total acumulado</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200/50">
            <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Propios</p>
            <p className="text-lg font-bold text-emerald-800">{formatCurrency(totalPropios)}</p>
            <p className="text-xs text-emerald-600">{((totalPropios / grandTotal) * 100).toFixed(0)}% del total</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200/50">
            <p className="text-xs text-purple-700 font-medium uppercase tracking-wide">Terceros</p>
            <p className="text-lg font-bold text-purple-800">{formatCurrency(totalTerceros)}</p>
            <p className="text-xs text-purple-600">{((totalTerceros / grandTotal) * 100).toFixed(0)}% del total</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickFormatter={(value) => `$${value}MM`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const propios = payload.find(p => p.dataKey === "Propios")?.value as number || 0;
                    const terceros = payload.find(p => p.dataKey === "Terceros")?.value as number || 0;
                    const total = propios + terceros;
                    return (
                      <div className="bg-white/95 border border-gray-200 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-gray-800 mb-2">Año {label}</p>
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between gap-4">
                            <span className="text-emerald-600">● Propios:</span>
                            <span className="font-medium">${propios.toFixed(1)} MM</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-purple-600">● Terceros:</span>
                            <span className="font-medium">${terceros.toFixed(1)} MM</span>
                          </p>
                          <div className="border-t border-gray-200 pt-1 mt-1">
                            <p className="flex justify-between gap-4 font-semibold">
                              <span className="text-gray-700">Total:</span>
                              <span className="text-luker-brown">${total.toFixed(1)} MM</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Bar 
                dataKey="Propios" 
                stackId="a" 
                fill="url(#propiosGradient)" 
                radius={[0, 0, 0, 0]}
                name="Propios"
              />
              <Bar 
                dataKey="Terceros" 
                stackId="a" 
                fill="url(#tercerosGradient)" 
                radius={[4, 4, 0, 0]}
                name="Terceros"
              />
              <defs>
                <linearGradient id="propiosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="tercerosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      </div>
    </Card>
  );
};

export default SocialInvestmentHistoricalChart;
