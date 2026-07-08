import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ecosistema as supabase } from "@/integrations/ecosistema/client";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
  code: string;
  title: string;
  accentVar: string;
  year: number | null;
  ascending?: boolean;
}

interface Row {
  entidad: string;
  valor: number;
}

interface HistRow {
  anio: number;
  valor: number;
}

const MANIZALES_COD = "17001";

const ContextRankingChart = ({ code, title, accentVar, year, ascending = false }: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"comparativo" | "historico">("comparativo");
  const [allRows, setAllRows] = useState<any[]>([]);
  const [entityMap, setEntityMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [resolvedYear, setResolvedYear] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("datos_maestros")
          .select("cod_entidad, anio, valor, categoria")
          .eq("cod_indicador", code);
        if (error) throw error;

        const totals = (rows || []).filter(
          (r: any) => (r.categoria ?? "").toString().trim().toLowerCase() === "total" && r.valor !== null
        );
        setAllRows(totals);

        const codes = Array.from(new Set(totals.map((r: any) => r.cod_entidad)));
        if (codes.length) {
          const { data: ents } = await supabase
            .from("catalogo_entidades")
            .select("cod_entidad, entidad")
            .in("cod_entidad", codes as any);
          setEntityMap(Object.fromEntries((ents || []).map((e: any) => [String(e.cod_entidad), e.entidad])));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  const compData = useMemo<Row[]>(() => {
    let targetYear = year;
    if (!targetYear) {
      targetYear = allRows.length ? Math.max(...allRows.map((r: any) => r.anio)) : null;
    }
    setResolvedYear(targetYear);
    const yearRows = allRows.filter((r: any) => r.anio === targetYear);
    const mapped: Row[] = yearRows.map((r: any) => ({
      entidad: entityMap[String(r.cod_entidad)] || String(r.cod_entidad),
      valor: Number(r.valor),
    }));
    mapped.sort((a, b) => (ascending ? a.valor - b.valor : b.valor - a.valor));
    return mapped;
  }, [allRows, entityMap, year, ascending]);

  const histData = useMemo<HistRow[]>(() => {
    const rows = allRows.filter((r: any) => String(r.cod_entidad) === MANIZALES_COD);
    const byYear = new Map<number, number[]>();
    rows.forEach((r: any) => {
      const arr = byYear.get(r.anio) || [];
      arr.push(Number(r.valor));
      byYear.set(r.anio, arr);
    });
    return Array.from(byYear.entries())
      .map(([anio, vals]) => ({ anio, valor: vals.reduce((a, b) => a + b, 0) / vals.length }))
      .sort((a, b) => a.anio - b.anio);
  }, [allRows]);

  const chartHeight = useMemo(() => Math.max(300, compData.length * 32), [compData.length]);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <TrendingUp className={`h-6 w-6 text-${accentVar}`} />
            <CardTitle className="text-xl text-luker-brown">
              {title}{" "}
              {mode === "comparativo" && resolvedYear ? (
                <span className="text-sm font-normal text-gray-500">({resolvedYear})</span>
              ) : null}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as any)}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="historico" className="text-xs px-2 h-7">
                Histórico
              </ToggleGroupItem>
              <ToggleGroupItem value="comparativo" className="text-xs px-2 h-7">
                Comparativo
              </ToggleGroupItem>
            </ToggleGroup>
            <ChartDownloadButton chartRef={chartRef} title={`${title} ${resolvedYear || ""}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        {loading ? (
          <div className="h-80 bg-gray-100 animate-pulse rounded" />
        ) : mode === "historico" ? (
          histData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay datos históricos para Manizales.</div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={histData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="anio" />
                <YAxis tickFormatter={(v) => `${Math.round(v)}%`} />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(var(--luker-teal))"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "hsl(var(--luker-teal))" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        ) : compData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay datos disponibles para mostrar.</div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={compData} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(v) => `${Math.round(v)}%`} domain={[0, "dataMax + 5"]} />
              <YAxis type="category" dataKey="entidad" width={110} style={{ fontSize: "12px" }} interval={0} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey="valor"
                radius={[0, 8, 8, 0]}
                label={{
                  position: "right",
                  formatter: (value: number) => `${value.toFixed(1)}%`,
                  fill: "hsl(var(--luker-brown))",
                  fontSize: 11,
                }}
              >
                {compData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.entidad === "Manizales" ? "hsl(var(--luker-red))" : `hsl(var(--${accentVar}))`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ContextRankingChart;
