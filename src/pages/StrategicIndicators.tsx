import { useEffect, useState, useMemo } from "react";
import SeoHead from "@/components/SeoHead";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, LayoutDashboard } from "lucide-react";
import { IndicatorCard } from "@/components/indicators/IndicatorCard";
import { RadialProgressCard } from "@/components/indicators/RadialProgressCard";
import { PageHeader } from "@/components/PageHeader";
import { SocialInvestmentCompactCard } from "@/components/indicators/SocialInvestmentCompactCard";
import { ExecutionProjectsCard } from "@/components/indicators/ExecutionProjectsCard";
import { ParticipantsCompactCard } from "@/components/indicators/BeneficiariesCompactCard";

import lukerPattern1 from "@/assets/luker-pattern-1.png";
import lukerPattern2 from "@/assets/luker-pattern-2.png";

interface Indicator {
  id: string;
  indicator_name: string;
  area: string;
  keyword: string | null;
  unit: string;
  annual_goal: number | null;
  accumulated_value: number | null;
  accumulated_percentage: number | null;
  achievement_2023: number | null;
  achievement_2024: number | null;
  achievement_2025: number | null;
}

const StrategicIndicators = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2025");
  

  // Calculate progress averages
  const progressData = useMemo(() => {
    if (indicators.length === 0) return { strategic: 0, general: 0 };
    
    const strategicAreas = ['Educación', 'Emprendimiento', 'Desarrollo rural', 'Proyectos especiales'];
    const strategicIndicators = indicators.filter(ind => strategicAreas.includes(ind.area));
    
    const strategicAvg = strategicIndicators.length > 0
      ? strategicIndicators.reduce((sum, ind) => sum + (ind.accumulated_percentage || 0), 0) / strategicIndicators.length
      : 0;
    
    const generalAvg = indicators.reduce((sum, ind) => sum + (ind.accumulated_percentage || 0), 0) / indicators.length;
    
    return {
      strategic: Math.round(strategicAvg * 100),
      general: Math.round(generalAvg * 100)
    };
  }, [indicators]);

  useEffect(() => {
    fetchIndicators();
  }, [selectedYear]);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("strategic_indicators")
        .select("*")
        .eq("year", parseInt(selectedYear))
        .order("area", { ascending: true });

      if (error) throw error;
      setIndicators(data || []);
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  // Map indicators by keyword for easy access
  const getIndicatorByKeyword = (searchKeyword: string): Indicator | undefined => {
    return indicators.find(ind => 
      ind.keyword?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ind.indicator_name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  };

  // Define indicators by year - keywords that exist in each dataset
  const keywordMapByYear: Record<string, Array<{ keyword: string; displayName: string }>> = {
    "2023": [
      { keyword: "Competencias socioemocionales", displayName: "Competencias socioemocionales" },
      { keyword: "Lectura", displayName: "Lectura" },
      { keyword: "Egresados UTC ocupados", displayName: "Egresados UTC ocupados" },
      { keyword: "Crecimiento EAP", displayName: "Crecimiento EAP" },
      { keyword: "Ventas de cacao", displayName: "Ventas de cacao" },
      { keyword: "Estudiantes UTC rural con titulo", displayName: "Estudiantes UTC rural con titulo" },
      { keyword: "Lectura rural", displayName: "Lectura rural" },
      { keyword: "Primera infancia", displayName: "Primera infancia" },
      { keyword: "Prototipos innovación", displayName: "Prototipos innovación" }
    ],
    "2024": [
      { keyword: "Lectura 1ero", displayName: "Lectura 1ero" },
      { keyword: "Lectura 5to", displayName: "Lectura 5to" },
      { keyword: "Egresados UTC ocupados", displayName: "Egresados UTC ocupados" },
      { keyword: "Utilidad Spin Off", displayName: "Utilidad Spin Off" },
      { keyword: "Beneficiarios Spin Off", displayName: "Beneficiarios Spin Off" },
      { keyword: "Evaluación emprendimiento", displayName: "Evaluación emprendimiento" },
      { keyword: "Vehículo jóvenes rurales", displayName: "Vehículo jóvenes rurales" },
      { keyword: "Modelo pedagógico", displayName: "Modelo pedagógico" },
      { keyword: "Ecosistema social", displayName: "Ecosistema social" },
      { keyword: "Gestión del conocimiento", displayName: "Gestión del conocimiento" },
      { keyword: "Cooperación Jacobs", displayName: "Cooperación Jacobs" }
    ],
    "2025": [
      { keyword: "Lectura 1ero", displayName: "Lectura 1ero" },
      { keyword: "Egresados UTC ocupados", displayName: "Egresados UTC ocupados" },
      { keyword: "Beneficiarios Spin Off", displayName: "Beneficiarios Spin Off" },
      { keyword: "GEIAL", displayName: "GEIAL" },
      { keyword: "Emprendimiento colegios", displayName: "Emprendimiento colegios" },
      { keyword: "Empresas silver aceleradas", displayName: "Empresas silver aceleradas" },
      { keyword: "Matriculados formación", displayName: "Matriculados formación" },
      { keyword: "Nuevos aliados", displayName: "Nuevos aliados" },
      { keyword: "Avance Plan Silver", displayName: "Avance Plan Silver" },
      { keyword: "Alianza universidades", displayName: "Alianza universidades" },
      { keyword: "Recursos cooperación", displayName: "Recursos cooperación" },
      { keyword: "Incremento cubrimiento educación", displayName: "Incremento cubrimiento educación" }
    ]
  };

  const keywordMap = keywordMapByYear[selectedYear] || keywordMapByYear["2025"];
  
  // No more placeholder cards - all have real data now

  const displayIndicators = keywordMap
    .map(item => {
      const indicator = getIndicatorByKeyword(item.keyword);
      return indicator ? { ...indicator, displayName: item.displayName } : null;
    })
    .filter(Boolean) as (Indicator & { displayName: string })[];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-white">
      <SeoHead
        title="Indicadores Estratégicos — Fundata | Fundación Luker"
        description="KPIs y avances de los programas estratégicos de Fundación Luker en Manizales y Caldas."
        path="/indicadores"
      />
      {/* Background decorative elements - matching home style */}
      <div className="absolute inset-0 bg-gradient-to-br from-luker-green/5 via-luker-orange/5 to-luker-teal/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-luker-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-luker-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-luker-teal/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Decorative pattern - bottom right only */}
      <div 
        className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: `url(${lukerPattern2})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="container mx-auto px-6 py-8 max-w-[1600px] relative z-10">
        {/* Header */}
        <PageHeader
          title="Indicadores Estratégicos"
          mobileTitle="Indicadores"
          icon={TrendingUp}
          iconBgColor="bg-purple-500"
          gradientColors="from-purple-500 via-pink-500 to-rose-500"
        />

        {/* Tabs for subsections */}
        <Tabs defaultValue="indicadores" className="mt-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="indicadores" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Indicadores Estratégicos</span>
              <span className="sm:hidden">Indicadores</span>
            </TabsTrigger>
            <TabsTrigger value="tablero" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Tablero General</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Indicadores Estratégicos */}
          <TabsContent value="indicadores">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luker-green mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Cargando indicadores...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Year Selector - Above cards */}
                <div className="flex justify-center mt-5 mb-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Año</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-28 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block space-y-4">
                  {/* First row: Radial Progress Cards - centered, half width */}
                  <div className="flex justify-center gap-4">
                    <div className="h-[180px] w-1/4">
                      <RadialProgressCard
                        title="Avance Indicadores Estratégicos"
                        percentage={progressData.general}
                        gradientId="radial-gradient-strategic"
                      />
                    </div>
                    <div className="h-[180px] w-1/4">
                      <RadialProgressCard
                        title="Avance General Indicadores"
                        percentage={progressData.strategic}
                        gradientId="radial-gradient-general"
                      />
                    </div>
                  </div>

                  {/* Second section: KPIs (cols 1-2) + Special cards (col 3) */}
                  <div className="grid grid-cols-3 gap-4 items-stretch">
                    {/* KPI Cards in columns 1-2 */}
                    <div className="col-span-2">
                      <div className="grid grid-cols-2 gap-4 auto-rows-[160px]">
                        {displayIndicators.map((indicator) => {
                          let value = indicator.accumulated_value ?? 0;
                          let goal = indicator.annual_goal ?? 1;
                          let percentage = indicator.accumulated_percentage ?? 0;

                          if (percentage > 0 && percentage <= 2) {
                            percentage = percentage * 100;
                          }

                          if (indicator.unit === "Porcentaje") {
                            value = value > 0 && value <= 1 ? value * 100 : value;
                            goal = goal > 0 && goal <= 1 ? goal * 100 : goal;
                          }

                          const label = indicator.keyword || indicator.displayName;

                          return (
                            <IndicatorCard
                              key={indicator.id}
                              value={value}
                              unit={indicator.unit}
                              goal={goal}
                              percentage={percentage}
                              keyword={label}
                              area={indicator.area}
                              indicatorName={indicator.indicator_name}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Special cards in column 3 - distributed evenly */}
                    <div className="flex flex-col justify-between gap-4">
                      <div className="flex-1">
                        <ExecutionProjectsCard />
                      </div>
                      <div className="flex-1">
                        <ParticipantsCompactCard />
                      </div>
                      <div className="flex-1">
                        <SocialInvestmentCompactCard />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile/Tablet Layout - Radial charts first, then KPIs, then special cards */}
                <div className="lg:hidden">
                  {/* Radial Progress Cards for mobile */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="h-[180px]">
                      <RadialProgressCard
                        title="Avance Estratégicos"
                        percentage={progressData.general}
                        gradientId="radial-gradient-strategic-mobile"
                      />
                    </div>
                    <div className="h-[180px]">
                      <RadialProgressCard
                        title="Avance General"
                        percentage={progressData.strategic}
                        gradientId="radial-gradient-general-mobile"
                      />
                    </div>
                  </div>

                  {/* All KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayIndicators.slice(0, 12).map((indicator) => {
                      let value = indicator.accumulated_value ?? 0;
                      let goal = indicator.annual_goal ?? 1;
                      let percentage = indicator.accumulated_percentage ?? 0;

                      if (percentage > 0 && percentage <= 2) {
                        percentage = percentage * 100;
                      }

                      if (indicator.unit === "Porcentaje") {
                        value = value > 0 && value <= 1 ? value * 100 : value;
                        goal = goal > 0 && goal <= 1 ? goal * 100 : goal;
                      }

                      const label = indicator.keyword || indicator.displayName;

                      return (
                        <IndicatorCard
                          key={indicator.id}
                          value={value}
                          unit={indicator.unit}
                          goal={goal}
                          percentage={percentage}
                          keyword={label}
                          area={indicator.area}
                          indicatorName={indicator.indicator_name}
                        />
                      );
                    })}
                  </div>

                  {/* Special cards at the end for mobile */}
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <SocialInvestmentCompactCard />
                    <ExecutionProjectsCard />
                    <ParticipantsCompactCard />
                  </div>
                </div>

                {/* Remaining KPIs in rows of 2 */}
                {displayIndicators.length > 12 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {displayIndicators.slice(12).map((indicator) => {
                      let value = indicator.accumulated_value ?? 0;
                      let goal = indicator.annual_goal ?? 1;
                      let percentage = indicator.accumulated_percentage ?? 0;

                      if (percentage > 0 && percentage <= 2) {
                        percentage = percentage * 100;
                      }

                      if (indicator.unit === "Porcentaje") {
                        value = value > 0 && value <= 1 ? value * 100 : value;
                        goal = goal > 0 && goal <= 1 ? goal * 100 : goal;
                      }

                      const label = indicator.keyword || indicator.displayName;

                      return (
                        <IndicatorCard
                          key={indicator.id}
                          value={value}
                          unit={indicator.unit}
                          goal={goal}
                          percentage={percentage}
                          keyword={label}
                          area={indicator.area}
                          indicatorName={indicator.indicator_name}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Tab: Tablero General (Embedded Dashboard) */}
          <TabsContent value="tablero">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <iframe
                src="https://inluk.fundacionluker.org.co/fundata/"
                title="Tablero General - Fundación Luker"
                className="w-full h-[800px] border-0"
                allowFullScreen
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StrategicIndicators;