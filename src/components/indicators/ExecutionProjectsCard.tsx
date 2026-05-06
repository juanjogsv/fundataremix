import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, LabelList, Cell } from "recharts";

interface HistoricalExecution {
  month: number;
  month_name: string;
  year: number;
  execution_percentage: number;
  executed: number;
  saldo_inicial: number;
}

export const ExecutionProjectsCard = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<HistoricalExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPercentage, setCurrentPercentage] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: execData, error } = await supabase
        .from("financial_execution_monthly")
        .select("year, month, month_name, execution_percentage, saldo_inicial, executed")
        .eq("project_name", "TOTAL")
        .order("year", { ascending: true })
        .order("month", { ascending: true });

      if (error) throw error;
      
      setData(execData || []);
      
      // Get the latest month's percentage
      if (execData && execData.length > 0) {
        const latest = execData[execData.length - 1];
        const percentage = latest.saldo_inicial > 0 
          ? (latest.executed / latest.saldo_inicial) * 100 
          : 0;
        setCurrentPercentage(Math.round(percentage));
      }
    } catch (error) {
      console.error("Error fetching execution data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get color based on percentage (red -> orange -> yellow -> teal)
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
      return `rgb(${Math.round(255 + (124 - 255) * ratio)}, ${Math.round(215 + (179 - 215) * ratio)}, ${Math.round(0 + (66 - 0) * ratio)})`;
    } else {
      // Light Green to Teal: #7CB342 to #00A0AF
      const ratio = (percentage - 75) / 25;
      return `rgb(${Math.round(124 + (0 - 124) * ratio)}, ${Math.round(179 + (160 - 179) * ratio)}, ${Math.round(66 + (175 - 66) * ratio)})`;
    }
  };

  const chartData = data.map(item => ({
    ...item,
    calculated_percentage: item.saldo_inicial > 0 
      ? Number(((item.executed / item.saldo_inicial) * 100).toFixed(1))
      : 0,
    short_month: item.month_name.substring(0, 3),
  }));

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg h-full">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luker-green"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-luker-teal/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-luker-teal" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inversión Social</span>
          </div>
          <h3 className="text-sm font-bold text-luker-brown mb-2">Ejecución Presupuestal Inversión Social</h3>
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Sin datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 h-full min-h-[320px] relative">
      <CardContent className="p-5 h-full flex flex-col" ref={chartRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-luker-teal/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-luker-teal" />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inversión Social</span>
          </div>
          <div className="text-right mr-20">
            <span className="text-3xl font-bold text-luker-teal">{currentPercentage}%</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-luker-brown mb-4">Ejecución Presupuestal Inversión Social</h3>

        {/* Chart */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 5, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="short_month" 
                tick={{ fill: '#572700', fontSize: 10 }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#572700', fontSize: 10 }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `${value}%`}
                width={38}
                tickLine={false}
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
                  border: '2px solid #00A0AF',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine y={50} stroke="#FBB040" strokeDasharray="3 3" />
              <Bar 
                dataKey="calculated_percentage" 
                radius={[3, 3, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.calculated_percentage)} />
                ))}
                <LabelList 
                  dataKey="calculated_percentage" 
                  position="top" 
                  formatter={(value: number) => `${value.toFixed(0)}%`}
                  style={{ fill: '#572700', fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
