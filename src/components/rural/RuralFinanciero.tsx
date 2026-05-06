import { useEffect, useState } from "react";
import { Wallet, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RuralKPICard, formatValue } from "./RuralKPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import RuralFinancieroCharts from "./RuralFinancieroCharts";

interface IndicatorData {
  indicador: string;
  valor: number | null;
  year: number;
  unidad_medida: string;
}

const RuralFinanciero = () => {
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: indicators, error } = await supabase
          .from("rural_development_indicators")
          .select("indicador, valor, year, unidad_medida")
          .eq("seccion", "Financiero")
          .eq("categoria", "Total")
          .order("year", { ascending: false });

        if (error) throw error;
        setData(indicators || []);
      } catch (error) {
        console.error("Error fetching Financiero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSumIndicator = (indicadorName: string): { total: number; years: string } | null => {
    const filtered = data.filter(d => 
      d.indicador.toLowerCase().includes(indicadorName.toLowerCase()) &&
      d.indicador.toLowerCase().includes("monto ejecutado")
    );
    if (filtered.length === 0) return null;
    
    const total = filtered.reduce((sum, item) => sum + (item.valor || 0), 0);
    const years = filtered.map(d => d.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    return { total, years: `${minYear}-${maxYear}` };
  };

  const inversionTerceros = getSumIndicator("inversión de terceros");
  const presupuestoUSAID = getSumIndicator("presupuesto usaid");

  if (loading) {
    return (
      <div className="space-y-8">
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
        <div className="grid grid-cols-1 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-[350px] w-full" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RuralKPICard
          title="Inversión de Terceros (Contrapartidas)"
          value={inversionTerceros ? formatValue(inversionTerceros.total, "Pesos") : "N/A"}
          year={inversionTerceros ? inversionTerceros.years : "Sin datos"}
          icon={Building}
          iconBgColor="bg-luker-brown"
          isPlaceholder={!inversionTerceros}
        />
        <RuralKPICard
          title="Presupuesto USAID Ejecutado"
          value={presupuestoUSAID ? formatValue(presupuestoUSAID.total, "Pesos") : "N/A"}
          year={presupuestoUSAID ? presupuestoUSAID.years : "Sin datos"}
          icon={Wallet}
          iconBgColor="bg-luker-orange"
          isPlaceholder={!presupuestoUSAID}
        />
      </div>

      {/* Historical Charts */}
      <RuralFinancieroCharts />
    </div>
  );
};

export default RuralFinanciero;
