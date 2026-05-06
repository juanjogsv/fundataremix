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
} from "recharts";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string;
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
  formatValue: (value: number) => string;
  yAxisLabel: string;
  years: number[];
}

const CHART_CONFIGS: ChartConfig[] = [
  {
    title: "Histórico: Hectáreas Sembradas vs Meta",
    indicadorBase: "Hectáreas Sembradas",
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Hectáreas",
    years: [2020, 2021, 2022, 2023, 2024],
  },
  {
    title: "Histórico: Hectáreas Rehabilitadas vs Meta",
    indicadorBase: "Hectáreas Rehabilitadas",
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Hectáreas",
    years: [2020, 2021, 2022, 2023, 2024],
  },
  {
    title: "Histórico de Ventas vs Meta de Comercialización",
    indicadorBase: "Ventas",
    formatValue: (v) => {
      if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      return `$${v.toLocaleString("es-CO")}`;
    },
    yAxisLabel: "COP",
    years: [2019, 2020, 2021, 2022, 2023],
  },
  {
    title: "Evolución de Productividad vs Meta (Kg/Ha)",
    indicadorBase: "Productividad (Kg/Ha)",
    formatValue: (v) => v.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    yAxisLabel: "Kg/Ha",
    years: [2020, 2021, 2022, 2023, 2024],
  },
];
const RuralProductividadCharts = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year, unidad_medida")
          .eq("seccion", "Productividad")
          .eq("categoria", "Total")
          .gte("year", 2019)
          .lte("year", 2024)
          .order("year", { ascending: true });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Productividad historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (indicadorBase: string, years: number[]): ChartDataPoint[] => {
    return years.map((year) => {
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

  const CustomTooltip = ({
    active,
    payload,
    label,
    formatValue,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
    formatValue: (v: number) => string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">Año {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "% Ejecución"
                ? `${entry.value?.toFixed(1)}%`
                : formatValue(entry.value || 0)}
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
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {CHART_CONFIGS.map((config, index) => {
        const chartData = getChartData(config.indicadorBase, config.years);
        const hasData = chartData.some(
          (d) => d.meta !== null || d.ejecutado !== null
        );

        return (
          <Card key={index} className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <ResponsiveContainer width="100%" height={280}>
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
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickFormatter={(value) => config.formatValue(value)}
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
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 200]}
                      label={{
                        value: "% Ejecución",
                        angle: 90,
                        position: "insideRight",
                        style: { textAnchor: "middle", fill: "#6b7280", fontSize: 11 },
                      }}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip formatValue={config.formatValue} />
                      }
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 10 }}
                      iconType="rect"
                      iconSize={12}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="meta"
                      name="Meta"
                      fill="hsl(var(--luker-teal))"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="ejecutado"
                      name="Ejecutado"
                      fill="hsl(var(--luker-green))"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="porcentaje"
                      name="% Ejecución"
                      stroke="hsl(var(--luker-orange))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--luker-orange))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      label={{
                        position: "top",
                        fill: "hsl(var(--luker-orange))",
                        fontSize: 10,
                        formatter: (value: number) =>
                          value ? `${value.toFixed(0)}%` : "",
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
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

export default RuralProductividadCharts;
