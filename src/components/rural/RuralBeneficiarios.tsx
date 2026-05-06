import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Leaf, Users } from "lucide-react";

interface BeneficiaryData {
  seccion: string;
  entidad: string;
  valor: number;
  year: number;
}

const RuralBeneficiarios = () => {
  const [data, setData] = useState<BeneficiaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntityGenR, setSelectedEntityGenR] = useState<string>("all");
  const [selectedEntityCacao, setSelectedEntityCacao] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: beneficiaries, error } = await supabase
          .from("rural_beneficiaries")
          .select("seccion, entidad, valor, year")
          .gte("year", 2019)
          .order("year", { ascending: true });

        if (error) throw error;
        setData(beneficiaries || []);
      } catch (error) {
        console.error("Error fetching beneficiaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique entities for Generación R
  const entitiesGenR = useMemo(() => {
    const genRData = data.filter(d => d.seccion === "Generación R");
    const uniqueEntities = [...new Set(genRData.map(d => d.entidad).filter(Boolean))];
    return uniqueEntities.sort();
  }, [data]);

  // Get unique entities for Efecto Cacao
  const entitiesCacao = useMemo(() => {
    const cacaoData = data.filter(d => d.seccion === "The Cacao Effect");
    const uniqueEntities = [...new Set(cacaoData.map(d => d.entidad).filter(Boolean))];
    return uniqueEntities.sort();
  }, [data]);

  // Chart data for Generación R
  const chartDataGenR = useMemo(() => {
    const genRData = data.filter(d => d.seccion === "Generación R");
    const filteredData = selectedEntityGenR === "all" 
      ? genRData 
      : genRData.filter(d => d.entidad === selectedEntityGenR);

    const groupedByYear: Record<number, number> = {};
    filteredData.forEach(item => {
      if (!groupedByYear[item.year]) {
        groupedByYear[item.year] = 0;
      }
      groupedByYear[item.year] += (item.valor || 0);
    });

    return Object.entries(groupedByYear)
      .map(([year, value]) => ({
        year: parseInt(year),
        generacionR: value,
      }))
      .sort((a, b) => a.year - b.year);
  }, [data, selectedEntityGenR]);

  // Chart data for Efecto Cacao
  const chartDataCacao = useMemo(() => {
    const cacaoData = data.filter(d => d.seccion === "The Cacao Effect");
    const filteredData = selectedEntityCacao === "all" 
      ? cacaoData 
      : cacaoData.filter(d => d.entidad === selectedEntityCacao);

    const groupedByYear: Record<number, number> = {};
    filteredData.forEach(item => {
      if (!groupedByYear[item.year]) {
        groupedByYear[item.year] = 0;
      }
      groupedByYear[item.year] += (item.valor || 0);
    });

    return Object.entries(groupedByYear)
      .map(([year, value]) => ({
        year: parseInt(year),
        cacaoEffect: value,
      }))
      .sort((a, b) => a.year - b.year);
  }, [data, selectedEntityCacao]);

  const formatValue = (value: number) => value.toLocaleString('es-CO', { maximumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generación R Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#FBB04020" }}>
                  <Users className="h-5 w-5" style={{ color: "#FBB040" }} />
                </div>
                <CardTitle className="text-base font-semibold text-luker-brown">
                  Participantes - Generación R
                </CardTitle>
              </div>
              <Select value={selectedEntityGenR} onValueChange={setSelectedEntityGenR}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  {entitiesGenR.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataGenR}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    stroke="#6b7280"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={formatValue}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatValue(value), "Participantes"]}
                    labelFormatter={(label) => `Año ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    formatter={() => "Participantes"}
                  />
                  <Line
                    type="monotone"
                    dataKey="generacionR"
                    stroke="#FBB040"
                    strokeWidth={3}
                    dot={{ fill: "#FBB040", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#FBB040", strokeWidth: 2 }}
                    name="Participantes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cacao Effect Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#7AC14320" }}>
                  <Leaf className="h-5 w-5" style={{ color: "#7AC143" }} />
                </div>
                <CardTitle className="text-base font-semibold text-luker-brown">
                  Participantes - Efecto Cacao
                </CardTitle>
              </div>
              <Select value={selectedEntityCacao} onValueChange={setSelectedEntityCacao}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  {entitiesCacao.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataCacao}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    stroke="#6b7280"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={formatValue}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatValue(value), "Participantes"]}
                    labelFormatter={(label) => `Año ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    formatter={() => "Participantes"}
                  />
                  <Line
                    type="monotone"
                    dataKey="cacaoEffect"
                    stroke="#7AC143"
                    strokeWidth={3}
                    dot={{ fill: "#7AC143", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#7AC143", strokeWidth: 2 }}
                    name="Participantes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RuralBeneficiarios;
