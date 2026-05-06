import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Indicator {
  id: string;
  indicator_name: string;
  area: string;
  keyword: string;
  unit: string;
  annual_goal: number;
  accumulated_value: number;
  accumulated_percentage: number;
  achievement_2023: number;
  achievement_2024: number;
}

const areaConfig: Record<string, { title: string; color: string; gradient: string }> = {
  financiero: {
    title: "Financiero",
    color: "from-green-500 to-emerald-500",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  educacion: {
    title: "Educación",
    color: "from-indigo-500 to-blue-500",
    gradient: "from-indigo-500/20 to-blue-500/20"
  },
  emprendimiento: {
    title: "Emprendimiento",
    color: "from-yellow-500 to-orange-500",
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  "desarrollo-rural": {
    title: "Desarrollo rural",
    color: "from-lime-500 to-green-500",
    gradient: "from-lime-500/20 to-green-500/20"
  },
  especiales: {
    title: "Proyectos especiales",
    color: "from-pink-500 to-rose-500",
    gradient: "from-pink-500/20 to-rose-500/20"
  },
  contexto: {
    title: "Contexto socioeconómico",
    color: "from-violet-500 to-purple-500",
    gradient: "from-violet-500/20 to-purple-500/20"
  }
};

const AreaIndicators = () => {
  const { area } = useParams<{ area: string }>();
  const navigate = useNavigate();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);

  const config = area ? areaConfig[area] : null;

  useEffect(() => {
    if (config) {
      fetchIndicators();
    }
  }, [area]);

  const fetchIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from("strategic_indicators")
        .select("*")
        .ilike("area", config!.title)
        .order("indicator_name", { ascending: true });

      if (error) throw error;
      setIndicators(data || []);
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <p className="text-muted-foreground">Área no encontrada</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
              {config.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              Indicadores de seguimiento y gestión
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando indicadores...</p>
          </div>
        ) : indicators.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {indicators.map((indicator) => (
              <Card key={indicator.id} className="hover:shadow-lg transition-all border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground leading-tight">
                    {indicator.indicator_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Meta 2025</span>
                    <span className="font-bold text-foreground">
                      {indicator.annual_goal?.toLocaleString()} {indicator.unit === "Porcentaje" ? "%" : ""}
                    </span>
                  </div>
                  {indicator.accumulated_value !== null && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Acumulado</span>
                        <span className="font-semibold text-primary">
                          {indicator.accumulated_value?.toLocaleString()} {indicator.unit === "Porcentaje" ? "%" : ""}
                        </span>
                      </div>
                      {indicator.accumulated_percentage !== null && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Progreso</span>
                            <Badge variant={indicator.accumulated_percentage >= 100 ? "default" : "secondary"}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {indicator.accumulated_percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress value={Math.min(indicator.accumulated_percentage, 100)} className="h-2" />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay indicadores disponibles para esta área
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AreaIndicators;