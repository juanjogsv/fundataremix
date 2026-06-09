import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchLegacyIndicators } from "@/integrations/ecosistema/legacy";
import { normalizeCityName } from "@/lib/city-name-normalizer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

interface RankingData {
  entidad: string;
  valor: number;
}

const EducationMediaRanking = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [data, setData] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const rowsAll = await fetchLegacyIndicators({
          codes: ["COBE_01"],
          categoria: 'Total',
          onlyMunicipalities: true,
        });
        const yearsData = rowsAll.map(r => ({ year: r.year }));
        const yearsError = null;

        if (yearsError) throw yearsError;

        const years = [...new Set(yearsData?.map(item => item.year) || [])];
        setAvailableYears(years);
        
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Error cargando años:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los años disponibles.",
          variant: "destructive",
        });
      }
    };

    loadYears();
  }, [toast]);

  useEffect(() => {
    if (selectedYear === null) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const rows = await fetchLegacyIndicators({
          codes: ["COBE_01"],
          year: selectedYear,
          categoria: 'Total',
          onlyMunicipalities: true,
        });
        const indicators = rows
          .filter(r => r.valor != null)
          .sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0));
        const error = null;

        if (error) throw error;

        const rankingData: RankingData[] = indicators
          ?.filter((row: any) => row.valor !== null)
          .map((row: any) => ({
            entidad: normalizeCityName(row.departamento || row.municipio || 'Sin nombre'),
            valor: row.valor,
          })) || [];

        setData(rankingData);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del ranking. Verifica que el archivo 'Indicadores_FunLuker_-_MCV_2024.xlsx' esté cargado correctamente.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear, toast]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-luker-brown" />
            <CardTitle className="text-xl text-luker-brown">
              Ranking de Entidades: Cobertura Neta en Media
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ChartDownloadButton 
              chartRef={chartRef} 
              title={`Ranking Cobertura Neta Media ${selectedYear || ''}`} 
            />
            <Select
              value={selectedYear?.toString() || ""}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay datos disponibles para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, data.length * 35)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `${Math.round(value)}%`}
                domain={[0, 100]}
              />
              <YAxis 
                type="category" 
                dataKey="entidad" 
                width={90}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelStyle={{ color: 'hsl(var(--luker-brown))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="valor" 
                radius={[0, 8, 8, 0]}
                label={{ 
                  position: 'right', 
                  formatter: (value: number) => `${value.toFixed(1)}%`,
                  fill: 'hsl(var(--luker-brown))',
                  fontSize: 11
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.entidad === 'Manizales' ? 'hsl(var(--luker-red))' : 'hsl(var(--luker-brown))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationMediaRanking;
