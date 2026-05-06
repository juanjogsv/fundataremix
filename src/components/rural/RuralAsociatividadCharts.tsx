import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
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
import { Users, Briefcase } from "lucide-react";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string | null;
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
  icon: React.ElementType;
  formatValue: (value: number) => string;
  yAxisLabel: string;
}

const CHART_CONFIGS: ChartConfig[] = [
  {
    title: "Organizaciones que mejoraron su desempeño",
    indicadorBase: "Asociaciones Mejoradas",
    icon: Users,
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Organizaciones",
  },
  {
    title: "Iniciativas de Emprendimiento Mejoradas",
    indicadorBase: "Iniciativas emprendimiento Mejoradas",
    icon: Briefcase,
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Iniciativas",
  },
];

const YEARS = [2020, 2021, 2022, 2023];

const RuralAsociatividadCharts = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicatorsData, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year, unidad_medida")
          .eq("seccion", "Asociatividad")
          .eq("categoria", "Total")
          .gte("year", 2020)
          .lte("year", 2023)
          .order("year", { ascending: true });

        if (error) throw error;
        setData(indicatorsData || []);
      } catch (error) {
        console.error("Error fetching Asociatividad historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (indicadorBase: string): ChartDataPoint[] => {
    return YEARS.map((year) => {
      const meta = data.find(
        (d) =>
          d.year === year &&
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("meta")
      );

      const ejecutado = data.find(
        (d) =>
          d.year === year &&
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("monto ejecutado")
      );

      const porcentaje = data.find(
        (d) =>
          d.year === year &&
          d.indicador.toLowerCase().includes(indicadorBase.toLowerCase()) &&
          d.indicador.toLowerCase().includes("% ejecución")
      );

      return {
        year,
        meta: meta?.valor ?? null,
        ejecutado: ejecutado?.valor ?? null,
        porcentaje: porcentaje?.valor ?? null,
      };
    });
  };

  const CustomTooltip = ({ active, payload, label, config }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800 mb-2">{`Año: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "% Ejecución"
                ? `${entry.value?.toFixed(1)}%`
                : config.formatValue(entry.value || 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-white border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {CHART_CONFIGS.map((config, index) => {
        const chartData = getChartData(config.indicadorBase);
        const hasData = chartData.some(
          (d) => d.meta !== null || d.ejecutado !== null
        );
        const Icon = config.icon;

        return (
          <Card key={index} className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-2 rounded-full bg-luker-green/10">
                  <Icon className="h-5 w-5 text-luker-green" />
                </div>
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickFormatter={(value) => config.formatValue(value)}
                      label={{
                        value: config.yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "#6b7280" },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, "auto"]}
                      label={{
                        value: "% Ejecución",
                        angle: 90,
                        position: "insideRight",
                        style: { textAnchor: "middle", fill: "#6b7280" },
                      }}
                    />
                    <Tooltip content={<CustomTooltip config={config} />} />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="meta"
                      name="Meta"
                      fill="hsl(var(--luker-teal))"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="ejecutado"
                      name="Ejecutado"
                      fill="hsl(var(--luker-green))"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
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
                        formatter={(value: number) =>
                          value ? `${value.toFixed(0)}%` : ""
                        }
                        style={{ fill: "hsl(var(--luker-orange))", fontSize: 11, fontWeight: 600 }}
                      />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  No hay datos disponibles para este indicador
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RuralAsociatividadCharts;
