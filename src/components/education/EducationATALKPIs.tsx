import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface KPI {
  title: string;
  value: string;
  year: number | null;
  icon: typeof Users;
  color: string;
  bgColor: string;
}

const COD_ENTIDAD = "17001"; // Manizales
const SD = "S.D.";

const fmtNumber = (n: number) =>
  Number(n).toLocaleString("es-CO", { maximumFractionDigits: 0 });
const fmtCurrency = (n: number) =>
  Number(n).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
const fmtPercent = (n: number) => `${Number(n).toFixed(1)}%`;

const EducationATALKPIs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Pull rows in two queries to avoid 1000-row default limit
        const [gpRes, atalRes] = await Promise.all([
          supabase
            .from("dama_data")
            .select("cod_indicador, anio, categoria_2, valor")
            .in("cod_indicador", ["GP_02", "GP_03"])
            .eq("cod_entidad", COD_ENTIDAD)
            .ilike("categoria_2", "%aprendamos todos a leer%"),
          supabase
            .from("dama_data")
            .select("cod_indicador, anio, categoria_2, valor")
            .eq("cod_indicador", "ATAL_02")
            .eq("cod_entidad", COD_ENTIDAD)
            .in("categoria_2", ["Primero", "Quinto"])
            .limit(5000),
        ]);

        if (gpRes.error) throw gpRes.error;
        if (atalRes.error) throw atalRes.error;
        const data = [...(gpRes.data ?? []), ...(atalRes.data ?? [])];
        const error = null as any;

        if (error) throw error;

        const rows = (data ?? []) as Array<{
          cod_indicador: string;
          anio: number;
          categoria: string | null;
          categoria_2: string | null;
          valor: number | null;
        }>;

        const isATL = (s: string | null) =>
          (s ?? "").trim().toLowerCase() === "aprendamos todos a leer";

        // KPI 1: GP_02, categoria_2 = ATL, latest year
        const gp02 = rows.filter(
          (r) => r.cod_indicador === "GP_02" && isATL(r.categoria_2)
        );
        const gp02Year = gp02.length ? Math.max(...gp02.map((r) => r.anio)) : null;
        const gp02Val = gp02Year
          ? gp02
              .filter((r) => r.anio === gp02Year)
              .reduce((s, r) => s + (Number(r.valor) || 0), 0)
          : null;

        // KPI 2: GP_03, categoria_2 = ATL, latest year
        const gp03 = rows.filter(
          (r) => r.cod_indicador === "GP_03" && isATL(r.categoria_2)
        );
        const gp03Year = gp03.length ? Math.max(...gp03.map((r) => r.anio)) : null;
        const gp03Val = gp03Year
          ? gp03
              .filter((r) => r.anio === gp03Year)
              .reduce((s, r) => s + (Number(r.valor) || 0), 0)
          : null;

        // KPI 3 & 4: ATAL_02 averages by categoria_2, latest year
        const atal = rows.filter((r) => r.cod_indicador === "ATAL_02");
        const atalYear = atal.length ? Math.max(...atal.map((r) => r.anio)) : null;

        const avgFor = (grade: string) => {
          if (!atalYear) return null;
          const subset = atal.filter(
            (r) =>
              r.anio === atalYear &&
              (r.categoria_2 ?? "").trim().toLowerCase() === grade.toLowerCase() &&
              r.valor != null
          );
          if (!subset.length) return null;
          const sum = subset.reduce((s, r) => s + Number(r.valor), 0);
          return sum / subset.length;
        };

        const primero = avgFor("Primero");
        const quinto = avgFor("Quinto");

        setKpis([
          {
            title: "Beneficiarios ATAL",
            value: gp02Val != null ? fmtNumber(gp02Val) : SD,
            year: gp02Year,
            icon: Users,
            color: "text-luker-orange",
            bgColor: "bg-luker-orange/10",
          },
          {
            title: "Instituciones ATAL",
            value: gp03Val != null ? fmtNumber(gp03Val) : SD,
            year: gp03Year,
            icon: Building2,
            color: "text-luker-teal",
            bgColor: "bg-luker-teal/10",
          },
          {
            title: "Nivel Estándar o Avanzado Fluidez - Grado Primero",
            value: primero != null ? fmtPercent(primero) : SD,
            year: atalYear,
            icon: TrendingUp,
            color: "text-luker-green",
            bgColor: "bg-luker-green/10",
          },
          {
            title: "Nivel Estándar o Avanzado Fluidez - Grado Quinto",
            value: quinto != null ? fmtPercent(quinto) : SD,
            year: atalYear,
            icon: Award,
            color: "text-luker-red",
            bgColor: "bg-luker-red/10",
          },
        ]);
        setLoading(false);
      } catch (e) {
        console.error("Error cargando KPIs ATAL:", e);
        toast({
          title: "Error",
          description: "No se pudieron cargar los indicadores de ATAL.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={i}
            className={`${kpi.bgColor} border-none shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`${kpi.color} p-3 rounded-full bg-white/80`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600 leading-tight">
                    {kpi.title}
                  </p>
                  <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  {kpi.year && (
                    <p className="text-xs text-gray-500">Año {kpi.year}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EducationATALKPIs;
