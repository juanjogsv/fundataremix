import { useEffect, useState } from "react";
import { Sprout, RefreshCw, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RuralKPICard, formatValue } from "./RuralKPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import RuralProductividadCharts from "./RuralProductividadCharts";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string;
}

const RuralProductividad = () => {
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
          .order("year", { ascending: false });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Productividad data:", error);
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

  // Get the 4 required indicators
  const hectareasSembradas = getLatestIndicator("Hectáreas Sembradas (Ha): Monto ejecutado");
  const hectareasRehabilitadas = getLatestIndicator("Hectáreas Rehabilitadas: Monto ejecutado");
  const ventas = getLatestIndicator("Ventas: Monto ejecutado");
  const productividad = getLatestIndicator("Productividad (KG/Ha): Monto ejecutado");

  const kpis = [
    {
      title: "Hectáreas Sembradas",
      data: hectareasSembradas,
      icon: Sprout,
      iconBgColor: "bg-luker-green",
      unit: "Hectáreas"
    },
    {
      title: "Hectáreas Rehabilitadas",
      data: hectareasRehabilitadas,
      icon: RefreshCw,
      iconBgColor: "bg-luker-teal",
      unit: "Hectáreas"
    },
    {
      title: "Ventas Totales",
      data: ventas,
      icon: DollarSign,
      iconBgColor: "bg-luker-orange",
      unit: "Pesos"
    },
    {
      title: "Productividad Media (Kg/Ha)",
      data: productividad,
      icon: TrendingUp,
      iconBgColor: "bg-luker-brown",
      unit: "Kg/Ha"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map((kpi, index) => (
          <RuralKPICard
            key={index}
            title={kpi.title}
            value={kpi.data ? formatValue(kpi.data.valor, kpi.data.unidad_medida) : "Dato pendiente"}
            year={kpi.data ? `${kpi.data.year} • ${kpi.unit}` : "Sin datos"}
            icon={kpi.icon}
            iconBgColor={kpi.iconBgColor}
            isPlaceholder={!kpi.data}
          />
        ))}
      </div>
      
      {/* Historical Charts */}
      <RuralProductividadCharts />
    </div>
  );
};

export default RuralProductividad;
