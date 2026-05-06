import { useEffect, useState } from "react";
import { Users, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RuralKPICard, formatValue } from "./RuralKPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import RuralAsociatividadCharts from "./RuralAsociatividadCharts";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string;
}

const RuralAsociatividad = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: asociatividadData, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year, unidad_medida")
          .eq("seccion", "Asociatividad")
          .eq("categoria", "Total")
          .order("year", { ascending: false });

        if (error) throw error;
        setData(asociatividadData || []);
      } catch (error) {
        console.error("Error fetching Asociatividad data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLatestIndicator = (indicadorName: string): IndicatorData | null => {
    const filtered = data.filter(d => 
      d.indicador.toLowerCase().includes(indicadorName.toLowerCase()) &&
      d.indicador.toLowerCase().includes("monto ejecutado")
    );
    return filtered.length > 0 ? filtered[0] : null;
  };

  const asociacionesMejoradas = getLatestIndicator("Asociaciones Mejoradas");
  const iniciativasEmprendimiento = getLatestIndicator("Iniciativas emprendimiento Mejoradas");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RuralKPICard
          title="Organizaciones / Asociaciones Mejoradas"
          value={asociacionesMejoradas ? formatValue(asociacionesMejoradas.valor, asociacionesMejoradas.unidad_medida) : "N/A"}
          year={asociacionesMejoradas ? `${asociacionesMejoradas.year}` : "Sin datos"}
          icon={Users}
          iconBgColor="bg-luker-green"
          isPlaceholder={!asociacionesMejoradas}
        />
        <RuralKPICard
          title="Iniciativas de Emprendimiento Mejoradas"
          value={iniciativasEmprendimiento ? formatValue(iniciativasEmprendimiento.valor, iniciativasEmprendimiento.unidad_medida) : "N/A"}
          year={iniciativasEmprendimiento ? `${iniciativasEmprendimiento.year}` : "Sin datos"}
          icon={Briefcase}
          iconBgColor="bg-luker-orange"
          isPlaceholder={!iniciativasEmprendimiento}
        />
      </div>

      {/* Historical Charts */}
      <RuralAsociatividadCharts />
    </div>
  );
};

export default RuralAsociatividad;
