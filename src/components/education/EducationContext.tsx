import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, TrendingUp, GraduationCap, School, BookOpen, Users, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ecosistema } from "@/integrations/ecosistema/client";
import ContextRankingChart from "./ContextRankingChart";

// Mapping based on dama_catalog (source of truth)
const KPI_CONFIG: Array<{
  code: string;
  title: string;
  icon: any;
  bg: string;
  iconBg: string;
  text: string;
  accentVar: string;
  ascending?: boolean;
}> = [
  { code: "COBE_01", title: "Cobertura Neta Preescolar", icon: School,        bg: "bg-rose-50",   iconBg: "bg-rose-100",   text: "text-rose-600",  accentVar: "luker-orange" },
  { code: "COBE_02", title: "Cobertura Neta Primaria",   icon: BookOpen,      bg: "bg-amber-50",  iconBg: "bg-amber-100",  text: "text-amber-600", accentVar: "luker-orange" },
  { code: "COBE_03", title: "Cobertura Neta Secundaria", icon: GraduationCap, bg: "bg-green-50",  iconBg: "bg-green-100",  text: "text-green-600", accentVar: "luker-green" },
  { code: "COBE_04", title: "Cobertura Neta Media",      icon: Users,         bg: "bg-sky-50",    iconBg: "bg-sky-100",    text: "text-sky-600",   accentVar: "luker-teal" },
  { code: "COBE_06", title: "Tasa de Tránsito",          icon: TrendingUp,    bg: "bg-slate-50",  iconBg: "bg-slate-100",  text: "text-slate-600", accentVar: "luker-teal" },
  { code: "COBE_05", title: "Tasa de Deserción Escolar", icon: LogOut,        bg: "bg-red-50",    iconBg: "bg-red-100",    text: "text-red-600",   accentVar: "luker-red", ascending: false },
];

const MANIZALES_COD = "17001";

const EducationContext = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Array<{ cod_indicador: string; anio: number; valor: number | null }>>([]);
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const codes = KPI_CONFIG.map((k) => k.code);
        const { data, error } = await supabase
          .from("datos_maestros")
          .select("cod_indicador, anio, valor, categoria, cod_entidad")
          .in("cod_indicador", codes)
          .eq("cod_entidad", MANIZALES_COD);
        if (error) throw error;
        const filtered = (data || [])
          .filter((d: any) => (d.categoria ?? "").toString().trim().toLowerCase() === "total")
          .map((d: any) => ({ cod_indicador: d.cod_indicador, anio: d.anio, valor: d.valor }));
        setRows(filtered);
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const years = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((r) => set.add(r.anio));
    return Array.from(set).sort((a, b) => b - a);
  }, [rows]);

  const valuesByCode = useMemo(() => {
    const map: Record<string, { value: number | null; year: number | null }> = {};
    KPI_CONFIG.forEach(({ code }) => {
      const codeRows = rows.filter((r) => r.cod_indicador === code);
      if (codeRows.length === 0) {
        map[code] = { value: null, year: null };
        return;
      }
      let target: typeof codeRows;
      if (selectedYear === "latest") {
        const maxYear = Math.max(...codeRows.map((r) => r.anio));
        target = codeRows.filter((r) => r.anio === maxYear);
      } else {
        target = codeRows.filter((r) => r.anio === Number(selectedYear));
      }
      const valid = target.filter((r) => r.valor !== null && r.valor !== undefined);
      if (valid.length === 0) {
        map[code] = { value: null, year: null };
        return;
      }
      const avg = valid.reduce((s, r) => s + Number(r.valor), 0) / valid.length;
      map[code] = { value: avg, year: target[0].anio };
    });
    return map;
  }, [rows, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-luker-teal" />
          <h2 className="text-2xl font-bold text-luker-brown">Datos de Contexto</h2>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Último año disponible</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Manizales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KPI_CONFIG.map((kpi) => {
              const Icon = kpi.icon;
              const v = valuesByCode[kpi.code];
              return (
                <Card key={kpi.code} className={`${kpi.bg} border-none shadow-sm hover:shadow-md transition-all duration-200`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`${kpi.text} p-3 rounded-full bg-white/80`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 leading-tight min-h-[2.5rem] flex items-center">
                        {kpi.title}
                      </p>
                      <p className={`text-4xl font-bold ${kpi.text}`}>
                        {loading ? "…" : v?.value !== null && v?.value !== undefined ? `${v.value.toFixed(1)}%` : "--"}
                      </p>
                      <p className="text-xs text-gray-500">{v?.year ?? ""}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {KPI_CONFIG.map((kpi) => (
          <ContextRankingChart
            key={kpi.code}
            code={kpi.code}
            title={kpi.title}
            accentVar={kpi.accentVar}
            year={selectedYear === "latest" ? null : Number(selectedYear)}
            ascending={kpi.ascending}
          />
        ))}
      </div>
    </div>
  );
};

export default EducationContext;
