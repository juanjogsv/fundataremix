import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

interface Props {
  code: string;          // COBE_01..COBE_06
  title: string;
  accentVar: string;     // e.g. 'luker-orange'
  year: number | null;   // selected year, or null = latest available
  ascending?: boolean;   // default desc (mayor a menor)
}

interface Row {
  entidad: string;
  valor: number;
}

const ContextRankingChart = ({ code, title, accentVar, year, ascending = false }: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedYear, setResolvedYear] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("dama_data")
          .select("cod_entidad, anio, valor, categoria")
          .eq("cod_indicador", code);
        if (error) throw error;

        const totals = (rows || []).filter(
          (r: any) => (r.categoria ?? "").toString().trim().toLowerCase() === "total" && r.valor !== null
        );

        let targetYear = year;
        if (!targetYear) {
          targetYear = totals.length ? Math.max(...totals.map((r: any) => r.anio)) : null;
        }
        setResolvedYear(targetYear);

        const yearRows = totals.filter((r: any) => r.anio === targetYear);

        const codes = Array.from(new Set(yearRows.map((r: any) => r.cod_entidad)));
        let entityMap: Record<string, string> = {};
        if (codes.length) {
          const { data: ents } = await supabase
            .from("dama_entities")
            .select("cod_entidad, entidad")
            .in("cod_entidad", codes);
          entityMap = Object.fromEntries((ents || []).map((e: any) => [e.cod_entidad, e.entidad]));
        }

        const mapped: Row[] = yearRows.map((r: any) => ({
          entidad: entityMap[r.cod_entidad] || r.cod_entidad,
          valor: Number(r.valor),
        }));

        mapped.sort((a, b) => (ascending ? a.valor - b.valor : b.valor - a.valor));
        setData(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, year, ascending]);

  const chartHeight = useMemo(() => Math.max(300, data.length * 32), [data.length]);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <TrendingUp className={`h-6 w-6 text-${accentVar}`} />
            <CardTitle className="text-xl text-luker-brown">
              {title} {resolvedYear ? <span className="text-sm font-normal text-gray-500">({resolvedYear})</span> : null}
            </CardTitle>
          </div>
          <ChartDownloadButton chartRef={chartRef} title={`${title} ${resolvedYear || ""}`} />
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        {loading ? (
          <div className="h-80 bg-gray-100 animate-pulse rounded" />
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay datos disponibles para mostrar.</div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(v) => `${Math.round(v)}%`} domain={[0, "dataMax + 5"]} />
              <YAxis type="category" dataKey="entidad" width={110} style={{ fontSize: "12px" }} interval={0} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
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
                {data.map((entry, i) => (
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
