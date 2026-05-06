import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Building, Wallet, LucideIcon } from "lucide-react";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
}

interface ChartDataPoint {
  year: number;
  ejecutado: number | null;
}

interface ChartConfig {
  title: string;
  indicadorBase: string;
  icon: LucideIcon;
  yAxisLabel: string;
  years: number[];
}

const YEARS_2019_2024 = [2019, 2020, 2021, 2022, 2023, 2024];

const CHART_CONFIGS: ChartConfig[] = [
  {
    title: "Inversión de Terceros (Contrapartidas Aliados)",
    indicadorBase: "Inversión de terceros (contrapartidas Aliados CL-LA-EAFIT-FSC-UAM) COP",
    icon: Building,
    yAxisLabel: "COP (Millones)",
    years: YEARS_2019_2024,
  },
  {
    title: "Presupuesto USAID",
    indicadorBase: "Presupuesto USAID COP",
    icon: Wallet,
    yAxisLabel: "COP (Millones)",
    years: YEARS_2019_2024,
  },
];

const formatCurrency = (value: number): string => {
  // Valores en millones - formatear apropiadamente
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} Miles MM`;
  }
  return `${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })} MM`;
};

const RuralFinancieroCharts = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year")
          .eq("seccion", "Financiero")
          .eq("categoria", "Total")
          .gte("year", 2019)
          .lte("year", 2024)
          .order("year", { ascending: true });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Financiero charts data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (indicadorBase: string, years: number[]): ChartDataPoint[] => {
    return years.map((year) => {
      const ejecutadoIndicator = data.find(
        (d) =>
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("monto ejecutado") &&
          d.year === year
      );

      // Valor en millones (dividido por 1,000,000)
      const ejecutadoValue = ejecutadoIndicator?.valor ? Math.round(ejecutadoIndicator.valor / 1_000_000) : null;

      return {
        year,
        ejecutado: ejecutadoValue,
      };
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8">
        {CHART_CONFIGS.map((_, i) => (
          <Card key={i} className="bg-white border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {CHART_CONFIGS.map((config, index) => {
        const chartData = getChartData(config.indicadorBase, config.years);
        const Icon = config.icon;

        const hasData = chartData.some((d) => d.ejecutado !== null);

        if (!hasData) {
          return (
            <Card key={index} className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-luker-brown" />
                  {config.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[350px]">
                <p className="text-gray-500">No hay datos disponibles para este indicador</p>
              </CardContent>
            </Card>
          );
        }

        const maxValue = Math.max(...chartData.map((d) => d.ejecutado || 0));

        return (
          <Card key={index} className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Icon className="h-5 w-5 text-luker-brown" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={formatCurrency}
                    domain={[0, maxValue * 1.2]}
                    label={{
                      value: config.yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: "#6b7280", fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Monto Ejecutado"]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="rect"
                    iconSize={12}
                  />
                  <Bar
                    dataKey="ejecutado"
                    name="Monto Ejecutado"
                    fill="hsl(var(--luker-orange))"
                    radius={[4, 4, 0, 0]}
                    barSize={50}
                  >
                    <LabelList
                      dataKey="ejecutado"
                      position="top"
                      formatter={(v: number) => formatCurrency(v)}
                      style={{ fontSize: 11, fill: "hsl(var(--luker-brown))", fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RuralFinancieroCharts;