import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, DollarSign, Building2, Users, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EAPHistoricalIndicator {
  indicator_name: string;
  year: number;
  value: number;
}

interface ChartConfig {
  indicator: string;
  title: string;
  color: string;
  icon: React.ElementType;
  formatValue: (value: number) => string;
  tooltipLabel: string;
}

const chartConfigs: ChartConfig[] = [
  {
    indicator: "Nº empresas",
    title: "Evolución Histórica: Número de Empresas",
    color: "#00A0AF",
    icon: Building2,
    formatValue: (value: number) => value.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    tooltipLabel: "Empresas",
  },
  {
    indicator: "Ventas",
    title: "Evolución Histórica de Ventas",
    color: "#FB8C00",
    icon: DollarSign,
    formatValue: (value: number) => {
      if (value >= 1000000000000) {
        return `$${(value / 1000000000000).toFixed(1)}B`;
      }
      return `$${(value / 1000000000).toFixed(0)}MM`;
    },
    tooltipLabel: "Ventas",
  },
  {
    indicator: "Promedio de Crecimiento",
    title: "Evolución Histórica: Promedio de Crecimiento",
    color: "#7AC143",
    icon: TrendingUp,
    formatValue: (value: number) => `${(value * 100).toFixed(0)}%`,
    tooltipLabel: "Crecimiento",
  },
  {
    indicator: "Nuevos empleos directos",
    title: "Nuevos Empleos Directos Creados",
    color: "#EF3E42",
    icon: Users,
    formatValue: (value: number) => value.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    tooltipLabel: "Empleos Directos",
  },
  {
    indicator: "Nuevos empleos temporales",
    title: "Nuevos Empleos Temporales Creados",
    color: "#572700",
    icon: Briefcase,
    formatValue: (value: number) => value.toLocaleString("es-CO", { maximumFractionDigits: 0 }),
    tooltipLabel: "Empleos Temporales",
  },
  {
    indicator: "Porcentaje crecimiento dos digitos",
    title: "% Empresas que Crecieron a más de Dos Dígitos",
    color: "#7AC143",
    icon: TrendingUp,
    formatValue: (value: number) => `${value.toFixed(0)}%`,
    tooltipLabel: "% Empresas",
  },
  {
    indicator: "Creditos con la banca",
    title: "Créditos con la Banca",
    color: "#00A0AF",
    icon: DollarSign,
    formatValue: (value: number) => {
      if (value >= 1000000000000) {
        return `$${(value / 1000000000000).toFixed(1)}B`;
      }
      return `$${(value / 1000000000).toFixed(0)}MM`;
    },
    tooltipLabel: "Créditos",
  },
  {
    indicator: "Inversiones",
    title: "Inversiones",
    color: "#FB8C00",
    icon: DollarSign,
    formatValue: (value: number) => {
      if (value >= 1000000000000) {
        return `$${(value / 1000000000000).toFixed(1)}B`;
      }
      return `$${(value / 1000000000).toFixed(0)}MM`;
    },
    tooltipLabel: "Inversiones",
  },
];

const EAPHistoricalCharts = () => {
  const { data: indicators, isLoading, error } = useQuery({
    queryKey: ["eap-historical-indicators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eap_historical_indicators")
        .select("*")
        .order("year", { ascending: true });

      if (error) throw error;
      return data as EAPHistoricalIndicator[];
    },
  });

  // Calculate chart data with special handling for percentage
  const getChartData = (indicatorName: string) => {
    if (!indicators) return [];

    if (indicatorName === "Porcentaje crecimiento dos digitos") {
      // Calculate percentage of companies that grew more than 2 digits
      const crecieron = indicators.filter((i) => i.indicator_name === "Crecieron a mas de dos digitos");
      const empresas = indicators.filter((i) => i.indicator_name === "Nº empresas");

      const years = [...new Set(crecieron.map((d) => d.year))];
      return years.map((year) => {
        const numCrecieron = crecieron.find((d) => d.year === year)?.value || 0;
        const numEmpresas = empresas.find((e) => e.year === year)?.value || 1;
        return {
          year,
          value: (Number(numCrecieron) / Number(numEmpresas)) * 100,
        };
      });
    }

    return indicators
      .filter((i) => i.indicator_name === indicatorName)
      .map((i) => ({
        year: i.year,
        value: Number(i.value),
      }));
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos históricos de EAP. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!indicators || indicators.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay datos históricos de EAP disponibles. Por favor, cargue los datos desde el módulo de administración.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-luker-orange" />
        <h2 className="text-2xl font-bold text-luker-brown">Empresas de Alto Potencial - Manizales</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {chartConfigs.map((config) => {
          const chartData = getChartData(config.indicator);
          const Icon = config.icon;

          return (
            <Card key={config.indicator} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                  <CardTitle className="text-base font-semibold text-luker-brown">
                    {config.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="year"
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickFormatter={config.formatValue}
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [
                          config.formatValue(value),
                          config.tooltipLabel,
                        ]}
                        labelFormatter={(label) => `Año ${label}`}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "10px" }}
                        formatter={() => config.tooltipLabel}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={config.color}
                        strokeWidth={3}
                        dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
                        name={config.tooltipLabel}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EAPHistoricalCharts;
