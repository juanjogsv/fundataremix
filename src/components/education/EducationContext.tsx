import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, TrendingUp, GraduationCap, School, BookOpen, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EducationPreschoolRanking from "./EducationPreschoolRanking";
import EducationPrimaryRanking from "./EducationPrimaryRanking";
import EducationSecondaryRanking from "./EducationSecondaryRanking";
import EducationMediaRanking from "./EducationMediaRanking";
import EducationTransitRanking from "./EducationTransitRanking";
import EducationDesertionRanking from "./EducationDesertionRanking";

interface ContextData {
  coberturaPreescolar: number | null;
  coberturaPrimaria: number | null;
  coberturaSecundaria: number | null;
  coberturaMedia: number | null;
  tasaTransito: number | null;
  tasaDesercion: number | null;
}

const EducationContext = () => {
  const { toast } = useToast();
  const [data, setData] = useState<ContextData>({
    coberturaPreescolar: null,
    coberturaPrimaria: null,
    coberturaSecundaria: null,
    coberturaMedia: null,
    tasaTransito: null,
    tasaDesercion: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Consultar datos desde la tabla mcv_indicators (misma fuente que Contexto Socioeconómico)
        const { data: indicators, error } = await supabase
          .from('mcv_indicators')
          .select('*')
          .eq('entidad', 'Manizales')
          .eq('seccion', 'Educación');

        if (error) throw error;

        console.log('Datos cargados de mcv_indicators:', indicators);

        // Filtrar y mapear los datos - buscar el año más reciente para cada indicador
        const contextData: ContextData = {
          coberturaPreescolar: null,
          coberturaPrimaria: null,
          coberturaSecundaria: null,
          coberturaMedia: null,
          tasaTransito: null,
          tasaDesercion: null
        };

        // Agrupar por indicador y tomar el valor más reciente
        const indicatorMap: Record<string, { value: number | null; year: number }> = {};
        
        indicators?.forEach((row: any) => {
          const indicador = row.indicador?.toLowerCase() || '';
          const key = indicador;
          
          if (!indicatorMap[key] || row.year > indicatorMap[key].year) {
            indicatorMap[key] = { value: row.dato, year: row.year };
          }
        });

        // Mapear los indicadores a los campos de contexto
        Object.keys(indicatorMap).forEach(indicador => {
          const value = indicatorMap[indicador].value;
          
          if (indicador.includes('cobertura neta') && indicador.includes('preescolar')) {
            contextData.coberturaPreescolar = value;
          } else if (indicador.includes('cobertura neta') && indicador.includes('primaria')) {
            contextData.coberturaPrimaria = value;
          } else if (indicador.includes('cobertura neta') && indicador.includes('secundaria')) {
            contextData.coberturaSecundaria = value;
          } else if (indicador.includes('cobertura neta') && indicador.includes('media')) {
            contextData.coberturaMedia = value;
          } else if (indicador.includes('tránsito') || indicador.includes('transito')) {
            contextData.tasaTransito = value;
          } else if (indicador.includes('deserción') || indicador.includes('desercion')) {
            contextData.tasaDesercion = value;
          }
        });

        setData(contextData);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de contexto. Asegúrate de que el administrador haya cargado los datos MCV.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const kpiCards = [
    {
      title: "Cobertura Neta Preescolar",
      value: data.coberturaPreescolar,
      icon: School,
      color: "text-luker-red",
      bgColor: "bg-luker-red/10"
    },
    {
      title: "Cobertura Neta Primaria",
      value: data.coberturaPrimaria,
      icon: BookOpen,
      color: "text-luker-orange",
      bgColor: "bg-luker-orange/10"
    },
    {
      title: "Cobertura Neta Secundaria",
      value: data.coberturaSecundaria,
      icon: GraduationCap,
      color: "text-luker-green",
      bgColor: "bg-luker-green/10"
    },
    {
      title: "Cobertura Neta Media",
      value: data.coberturaMedia,
      icon: Users,
      color: "text-luker-teal",
      bgColor: "bg-luker-teal/10"
    },
    {
      title: "Tasa de Tránsito",
      value: data.tasaTransito,
      icon: TrendingUp,
      color: "text-luker-brown",
      bgColor: "bg-luker-brown/10"
    },
    {
      title: "Tasa de Deserción Escolar",
      value: data.tasaDesercion,
      icon: Database,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-luker-teal" />
          <h2 className="text-2xl font-bold text-luker-brown">Datos de Contexto</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-luker-teal" />
        <h2 className="text-2xl font-bold text-luker-brown">Datos de Contexto</h2>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">
            Manizales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiCards.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card 
                  key={index} 
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
                        <p className={`text-3xl font-bold ${kpi.color}`}>
                          {kpi.value !== null ? `${kpi.value.toFixed(1)}%` : '--'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

      {(data.coberturaPreescolar === null || data.coberturaPrimaria === null || 
            data.coberturaSecundaria === null || data.coberturaMedia === null || 
            data.tasaTransito === null || data.tasaDesercion === null) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Nota del Administrador:</strong> Algunos datos no están disponibles. 
                Por favor, sube el archivo de datos MCV a través del 
                Panel de Administración → Cargar Datos MCV.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <EducationPreschoolRanking />
      <EducationPrimaryRanking />
      <EducationSecondaryRanking />
      <EducationMediaRanking />
      <EducationTransitRanking />
      <EducationDesertionRanking />
    </div>
  );
};

export default EducationContext;
