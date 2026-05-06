import { useEffect, useState } from "react";
import { Users, Wallet, Presentation, GraduationCap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RuralKPICard, formatValue } from "./RuralKPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string;
}

const RuralGeneracionR = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year, unidad_medida")
          .eq("categoria", "Total")
          .eq("seccion", "Generación R")
          .order("year", { ascending: false });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Generación R data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIndicator = (searchTerm: string): IndicatorData | undefined => {
    return data.find(d => d.indicador.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const personasImpactadas = getIndicator("personas impactadas");
  const recursosMov = getIndicator("Recursos movilizados");
  const docentesFormados = getIndicator("docentes formados");
  const jovenesGraduados = getIndicator("jóvenes graduados");
  const aumentoIngresos = getIndicator("aumento de ingresos");

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-white border-0 shadow-sm">
            <CardContent className="p-8 flex flex-col items-center space-y-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "# de personas impactadas programa Generación R",
      data: personasImpactadas,
      icon: Users,
      iconBgColor: "bg-luker-green",
    },
    {
      title: "Recursos movilizados por el proyecto",
      data: recursosMov,
      icon: Wallet,
      iconBgColor: "bg-luker-teal",
    },
    {
      title: "# de docentes formados",
      data: docentesFormados,
      icon: Presentation,
      iconBgColor: "bg-luker-orange",
    },
    {
      title: "% de jóvenes graduados en los cursos de formación por competencias",
      data: jovenesGraduados,
      icon: GraduationCap,
      iconBgColor: "bg-luker-brown",
    },
    {
      title: "% de aumento de ingresos de jóvenes acompañados por fuente",
      data: aumentoIngresos,
      icon: TrendingUp,
      iconBgColor: "bg-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map((kpi, index) => (
          <RuralKPICard
            key={index}
            title={kpi.title}
            value={kpi.data ? formatValue(kpi.data.valor, kpi.data.unidad_medida) : "Dato pendiente de carga"}
            year={kpi.data ? `${kpi.data.year}` : "Sin datos"}
            icon={kpi.icon}
            iconBgColor={kpi.iconBgColor}
            isPlaceholder={!kpi.data}
          />
        ))}
      </div>
    </div>
  );
};

export default RuralGeneracionR;
