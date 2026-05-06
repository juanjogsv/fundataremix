import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface HistoricalData {
  year: number;
  base: string;
  total: number;
}

// Color palette and label mapping for bases
const baseConfig: Record<string, { color: string; label: string }> = {
  "Cacao": { color: "#8B4513", label: "Rural" },
  "Educación": { color: "#3b82f6", label: "Educación" },
  "Formare": { color: "#10b981", label: "Formare" },
  "Proyectos especiales": { color: "#8b5cf6", label: "Especiales" },
};

export const ParticipantsCompactCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["participants-historical"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("year, base, valor")
        .lt("year", 2025) // Exclude 2025 until more complete data is available
        .order("year", { ascending: true });

      if (error) throw error;
      return data as { year: number; base: string; valor: number }[];
    },
  });

  // Transform data for stacked bar chart
  const chartData = data?.reduce((acc: Record<number, Record<string, number>>, item) => {
    if (!acc[item.year]) {
      acc[item.year] = { year: item.year };
    }
    const baseName = item.base || "Otros";
    acc[item.year][baseName] = (acc[item.year][baseName] || 0) + (item.valor || 0);
    return acc;
  }, {});

  const formattedData = chartData ? Object.values(chartData) : [];

  // Get unique bases from data
  const bases = data ? [...new Set(data.map(d => d.base || "Otros"))] : [];

  // Calculate year range dynamically
  const years = data?.map(d => d.year) || [];
  const minYear = years.length > 0 ? Math.min(...years) : null;
  const maxYear = years.length > 0 ? Math.max(...years) : null;
  const periodLabel = minYear && maxYear ? `${minYear} - ${maxYear}` : "";

  // Calculate totals by base for the last available year only
  const lastYearData = data?.filter(d => d.year === maxYear) || [];
  const totalsByBase = lastYearData.reduce((acc: Record<string, number>, item) => {
    const baseName = item.base || "Otros";
    acc[baseName] = (acc[baseName] || 0) + (item.valor || 0);
    return acc;
  }, {});

  const grandTotal = Object.values(totalsByBase).reduce((sum, val) => sum + val, 0);

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('es-CO').format(Math.round(value));
  };

  const formatFullNumber = (value: number) => {
    return new Intl.NumberFormat('es-CO').format(Math.round(value));
  };

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg h-full">
        <CardContent className="p-5 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h3 className="text-base font-bold text-gray-800">Participantes</h3>
            {periodLabel && (
              <span className="text-xs text-gray-500 font-medium">{periodLabel}</span>
            )}
          </div>
          
          {/* Totals by base */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-3">
            {bases.slice(0, 4).map((base) => {
              const config = baseConfig[base] || { color: "#6b7280", label: base };
              return (
                <div key={base} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-sm" 
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-gray-600 truncate max-w-[80px]" title={config.label}>
                      {config.label.length > 12 ? config.label.substring(0, 12) + "..." : config.label}
                    </span>
                  </div>
                  <span className="font-bold" style={{ color: config.color }}>
                    {formatNumber(totalsByBase[base] || 0)}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Grand Total */}
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Total {maxYear}</span>
            <span className="text-sm font-bold text-gray-800">{formatFullNumber(grandTotal)}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 5, right: 5, left: -5, bottom: 25 }} barCategoryGap="12%">
              <XAxis 
                dataKey="year" 
                tick={({ x, y, payload }) => (
                  <text 
                    x={x} 
                    y={y + 5} 
                    textAnchor="end" 
                    fontSize={9} 
                    fill="#6b7280"
                    transform={`rotate(-90, ${x}, ${y})`}
                  >
                    {payload.value}
                  </text>
                )}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={30}
              />
              <YAxis 
                tick={{ fontSize: 8, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={35}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value.toString();
                }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
                        <p className="font-semibold mb-2 text-gray-800">Año {label}</p>
                        {payload.map((entry, index) => {
                          const config = baseConfig[entry.name as string] || { color: entry.color, label: entry.name };
                          return (
                            <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4">
                              <span>{config.label}:</span>
                              <span className="font-bold">{formatFullNumber(Number(entry.value))}</span>
                            </p>
                          );
                        })}
                        <p className="font-bold text-gray-800 border-t border-gray-200 mt-2 pt-2 flex justify-between gap-4">
                          <span>Total:</span>
                          <span>{formatFullNumber(total)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {bases.map((base) => {
                const config = baseConfig[base] || { color: "#6b7280", label: base };
                return (
                  <Bar 
                    key={base}
                    dataKey={base}
                    name={config.label}
                    stackId="a" 
                    fill={config.color} 
                    radius={base === bases[bases.length - 1] ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Keep backward compatibility alias
export const BeneficiariesCompactCard = ParticipantsCompactCard;
