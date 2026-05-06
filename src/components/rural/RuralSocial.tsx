import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, GraduationCap, HeartHandshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RuralKPICard, formatValue } from "./RuralKPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import RuralSocialCharts from "./RuralSocialCharts";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string;
}

const RuralSocial = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year, unidad_medida")
          .eq("seccion", "Social")
          .eq("categoria", "Total")
          .order("year", { ascending: false });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Social data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLatestIndicator = (indicadorName: string): IndicatorData | null => {
    const filtered = data.filter(d => d.indicador.toLowerCase().includes(indicadorName.toLowerCase()));
    return filtered.length > 0 ? filtered[0] : null;
  };

  const participantesLeer = getLatestIndicator("niños capacitados en programas académicos: monto ejecutado");
  const porcentajeLectura = getLatestIndicator("porcentaje mejoramiento competencias lectura: monto ejecutado");
  const jovenesGraduados = getLatestIndicator("jóvenes gradudados en programas vocacionales: monto ejecutado");
  const personasResiliencia = getLatestIndicator("personas capacitadas en resiliencia: monto ejecutado");

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RuralKPICard
          title="Participantes Aprendamos Todos a Leer"
          value={participantesLeer ? formatValue(participantesLeer.valor, participantesLeer.unidad_medida) : "N/A"}
          year={participantesLeer ? `${participantesLeer.year}` : "Sin datos"}
          icon={BookOpen}
          iconBgColor="bg-luker-green"
          isPlaceholder={!participantesLeer}
        />
        <RuralKPICard
          title="% de participantes que mejoran en lectura"
          value={porcentajeLectura ? formatValue(porcentajeLectura.valor, "Porcentaje") : "N/A"}
          year={porcentajeLectura ? `${porcentajeLectura.year}` : "Sin datos"}
          icon={TrendingUp}
          iconBgColor="bg-luker-teal"
          isPlaceholder={!porcentajeLectura}
        />
        <RuralKPICard
          title="Jóvenes Graduados U en tu Colegio"
          value={jovenesGraduados ? formatValue(jovenesGraduados.valor, jovenesGraduados.unidad_medida) : "N/A"}
          year={jovenesGraduados ? `${jovenesGraduados.year}` : "Sin datos"}
          icon={GraduationCap}
          iconBgColor="bg-luker-red"
          isPlaceholder={!jovenesGraduados}
        />
        <RuralKPICard
          title="Personas Capacitadas en Resiliencia"
          value={personasResiliencia ? formatValue(personasResiliencia.valor, personasResiliencia.unidad_medida) : "N/A"}
          year={personasResiliencia ? `${personasResiliencia.year}` : "Sin datos"}
          icon={HeartHandshake}
          iconBgColor="bg-amber-500"
          isPlaceholder={!personasResiliencia}
        />
      </div>

      {/* Historical Charts */}
      <RuralSocialCharts />
    </div>
  );
};

export default RuralSocial;
