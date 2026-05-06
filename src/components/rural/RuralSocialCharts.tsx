import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { BookOpen, TrendingUp, GraduationCap, HeartHandshake, LucideIcon } from "lucide-react";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
}

interface ChartDataPoint {
  year: number;
  meta: number | null;
  ejecutado: number | null;
  porcentaje: number | null;
}

interface ChartConfig {
  title: string;
  indicadorBase: string;
  icon: LucideIcon;
  formatValue: (value: number) => string;
  yAxisLabel: string;
  years: number[];
}

const YEARS_2020_2024 = [2020, 2021, 2022, 2023, 2024];

const CHART_CONFIGS: ChartConfig[] = [
  {
    title: "Participantes Aprendamos Todos a Leer",
    indicadorBase: "Niños capacitados en programas académicos",
    icon: BookOpen,
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Participantes",
    years: [2020, 2021, 2022, 2023],
  },
  {
    title: "% de participantes que mejoran competencias de lectura",
    indicadorBase: "Porcentaje mejoramiento competencias lectura",
    icon: TrendingUp,
    formatValue: (v) => `${v.toFixed(0)}%`,
    yAxisLabel: "Porcentaje",
    years: YEARS_2020_2024,
  },
  {
    title: "Jóvenes graduados de U en tu Colegio",
    indicadorBase: "Jóvenes gradudados en programas vocacionales",
    icon: GraduationCap,
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Jóvenes",
    years: YEARS_2020_2024,
  },
  {
    title: "Personas capacitadas en Resiliencia",
    indicadorBase: "Personas capacitadas en resiliencia",
    icon: HeartHandshake,
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Personas",
    years: [2021, 2022, 2023],
  },
];

const RuralSocialCharts = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year")
          .eq("seccion", "Social")
          .eq("categoria", "Total")
          .gte("year", 2020)
          .lte("year", 2024)
          .order("year", { ascending: true });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Social charts data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (indicadorBase: string, years: number[]): ChartDataPoint[] => {
    return years.map((year) => {
      const metaIndicator = data.find(
        (d) =>
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("meta") &&
          !d.indicador.toLowerCase().includes("ejecución") &&
          d.year === year
      );

      const ejecutadoIndicator = data.find(
        (d) =>
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("monto ejecutado") &&
          d.year === year
      );

      const porcentajeIndicator = data.find(
        (d) =>
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("% ejecución") &&
          d.year === year
      );

      return {
        year,
        meta: metaIndicator?.valor ?? null,
        ejecutado: ejecutadoIndicator?.valor ?? null,
        porcentaje: porcentajeIndicator?.valor ?? null,
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

        const hasData = chartData.some(
          (d) => d.meta !== null || d.ejecutado !== null
        );

        if (!hasData) {
          return (
            <Card key={index} className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-luker-green" />
                  {config.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[350px]">
                <p className="text-gray-500">No hay datos disponibles para este indicador</p>
              </CardContent>
            </Card>
          );
        }

        const maxValue = Math.max(
          ...chartData.map((d) => Math.max(d.meta || 0, d.ejecutado || 0))
        );

        return (
          <Card key={index} className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Icon className="h-5 w-5 text-luker-green" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
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
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={config.formatValue}
                    domain={[0, maxValue * 1.2]}
                    label={{
                      value: config.yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: "#6b7280", fontSize: 11 },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 200]}
                    label={{
                      value: "% Ejecución",
                      angle: 90,
                      position: "insideRight",
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
                    formatter={(value: number, name: string) => {
                      if (name === "% Ejecución") return [`${value?.toFixed(1)}%`, name];
                      return [config.formatValue(value), name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="rect"
                    iconSize={12}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="meta"
                    name="Meta"
                    fill="hsl(var(--luker-teal))"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="ejecutado"
                    name="Monto Ejecutado"
                    fill="hsl(var(--luker-green))"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="porcentaje"
                    name="% Ejecución"
                    stroke="hsl(var(--luker-orange))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--luker-orange))", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  >
                    <LabelList
                      dataKey="porcentaje"
                      position="top"
                      formatter={(v: number) => (v ? `${v.toFixed(0)}%` : "")}
                      style={{ fontSize: 11, fill: "hsl(var(--luker-orange))", fontWeight: 600 }}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RuralSocialCharts;
