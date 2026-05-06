import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, School, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ATALKPIData {
  beneficiarios: number | null;
  beneficiariosYear: number | null;
  instituciones: number | null;
  institucionesYear: number | null;
  nivelPrimero: number | null;
  nivelPrimeroYear: number | null;
  nivelQuinto: number | null;
  nivelQuintoYear: number | null;
}

const EducationATALKPIs = () => {
  const { toast } = useToast();
  const [data, setData] = useState<ATALKPIData>({
    beneficiarios: null,
    beneficiariosYear: null,
    instituciones: null,
    institucionesYear: null,
    nivelPrimero: null,
    nivelPrimeroYear: null,
    nivelQuinto: null,
    nivelQuintoYear: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Tarjeta 1: Beneficiarios ATAL
        const { data: beneficiarios, error: errorBenef } = await supabase
          .from('education_beneficiaries')
          .select('valor, year')
          .eq('departamento', 'Caldas')
          .eq('programa', 'Educación')
          .order('year', { ascending: false })
          .limit(100);

        if (errorBenef) throw errorBenef;

        console.log('Beneficiarios data:', beneficiarios);

        // Obtener el último año disponible
        const lastYear = beneficiarios && beneficiarios.length > 0 
          ? Math.max(...beneficiarios.map((b: any) => b.year || 0))
          : null;

        // Filtrar por último año y sumar valores
        const beneficiariosLastYear = beneficiarios?.filter((b: any) => b.year === lastYear);
        const totalBeneficiarios = beneficiariosLastYear?.reduce((sum: number, item: any) => 
          sum + (parseFloat(String(item.valor)) || 0), 0) || null;

        // 2. Tarjeta 2: Instituciones Educativas (conteo distinto de categoría excluyendo "Total")
        const { data: instituciones, error: errorInst } = await supabase
          .from('education_indicators')
          .select('categoria, year')
          .eq('departamento', 'Manizales')
          .eq('seccion', 'Aprendamos todos a leer')
          .order('year', { ascending: false });

        if (errorInst) throw errorInst;

        console.log('Instituciones data:', instituciones);

        // Obtener el último año disponible de los indicadores
        const lastYearInst = instituciones && instituciones.length > 0 
          ? Math.max(...instituciones.map((i: any) => i.year || 0))
          : null;

        // Filtrar por último año, excluir "Total" y contar categorías únicas
        const institucionesUnicas = new Set(
          instituciones
            ?.filter((i: any) => i.year === lastYearInst && i.categoria && i.categoria !== 'Total')
            .map((i: any) => i.categoria)
        );
        const totalInstituciones = institucionesUnicas.size || null;

        // 3. Tarjeta 3: Nivel Estándar o Avanzado - Grado Primero
        const { data: primero, error: errorPrimero } = await supabase
          .from('education_indicators')
          .select('valor')
          .eq('departamento', 'Manizales')
          .eq('indicador', 'Estudiantes que alcanzan el nivel estándar o avanzado')
          .eq('year', 2024)
          .eq('categoria', 'Total')
          .eq('categoria_2', 'Primero')
          .eq('categoria_3', 'Salida')
          .maybeSingle();

        if (errorPrimero) throw errorPrimero;

        console.log('Primero data:', primero);

        // Multiplicar por 100 para convertir a porcentaje
        const valorPrimero = primero?.valor ? parseFloat(String(primero.valor)) * 100 : null;

        // 4. Tarjeta 4: Nivel Estándar o Avanzado - Grado Quinto
        const { data: quinto, error: errorQuinto } = await supabase
          .from('education_indicators')
          .select('valor')
          .eq('departamento', 'Manizales')
          .eq('indicador', 'Estudiantes que alcanzan el nivel estándar o avanzado')
          .eq('year', 2024)
          .eq('categoria', 'Total')
          .eq('categoria_2', 'Quinto')
          .eq('categoria_3', 'Salida')
          .maybeSingle();

        if (errorQuinto) throw errorQuinto;

        console.log('Quinto data:', quinto);

        // Multiplicar por 100 para convertir a porcentaje
        const valorQuinto = quinto?.valor ? parseFloat(String(quinto.valor)) * 100 : null;

        setData({
          beneficiarios: totalBeneficiarios,
          beneficiariosYear: lastYear,
          instituciones: totalInstituciones,
          institucionesYear: lastYearInst,
          nivelPrimero: valorPrimero,
          nivelPrimeroYear: 2024,
          nivelQuinto: valorQuinto,
          nivelQuintoYear: 2024
        });

        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos ATAL KPI:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los indicadores de ATAL.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const kpiCards = [
    {
      title: "Beneficiarios ATAL",
      value: data.beneficiarios,
      year: data.beneficiariosYear,
      icon: Users,
      color: "text-luker-orange",
      bgColor: "bg-luker-orange/10",
      format: "number"
    },
    {
      title: "Instituciones Educativas Participantes",
      value: data.instituciones,
      year: data.institucionesYear,
      icon: School,
      color: "text-luker-teal",
      bgColor: "bg-luker-teal/10",
      format: "number"
    },
    {
      title: "Nivel Estándar o Avanzado - Grado Primero",
      value: data.nivelPrimero,
      year: data.nivelPrimeroYear,
      icon: TrendingUp,
      color: "text-luker-green",
      bgColor: "bg-luker-green/10",
      format: "percentage"
    },
    {
      title: "Nivel Estándar o Avanzado - Grado Quinto",
      value: data.nivelQuinto,
      year: data.nivelQuintoYear,
      icon: Award,
      color: "text-luker-red",
      bgColor: "bg-luker-red/10",
      format: "percentage"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                    {kpi.value !== null 
                      ? kpi.format === "percentage" 
                        ? `${Number(kpi.value).toFixed(1)}%` 
                        : Number(kpi.value).toLocaleString('es-CO', { maximumFractionDigits: 0 })
                      : '--'}
                  </p>
                  {kpi.year && (
                    <p className="text-xs text-gray-500">
                      Año {kpi.year}
                    </p>
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
