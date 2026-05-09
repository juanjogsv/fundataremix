import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle, School } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const normalizeProgram = (raw: string | null | undefined) => {
  if (!raw) return "";
  const v = raw.trim();
  if (/^escuela\s+activa(\s+urbana)?$/i.test(v)) return "Escuela Activa";
  return v;
};

const EducationBeneficiaries = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>("todos");
  const [selectedSchoolProgram, setSelectedSchoolProgram] = useState<string>("Aprendamos todos a leer");

  // Fetch from participants table (Base de Datos de Participantes)
  const { data: participants, isLoading, error } = useQuery({
    queryKey: ["education-participants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .in("base", ["Educación", "Formare"])
        .order("year", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch schools data from DAMA master base (cod_indicador = GP_03 "Número de instituciones beneficiarias")
  const { data: damaSchools } = useQuery({
    queryKey: ["dama-schools-gp03"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dama_data")
        .select("anio, cod_entidad, categoria_2, valor")
        .eq("cod_indicador", "GP_03")
        .eq("cod_entidad", "17001")
        .order("anio", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Get unique specific programs for filter
  const programs = useMemo(() => {
    if (!participants) return [];
    const uniquePrograms = [...new Set(participants
      .filter(item => item.categoria === "Total Beneficiarios")
      .map(item => item.programa)
      .filter(prog => prog && prog !== null)
    )];
    return uniquePrograms.sort();
  }, [participants]);

  // Get unique programs for schools filter
  const schoolPrograms = useMemo(() => {
    if (!participants) return [];
    const uniquePrograms = [...new Set(participants
      .filter(item => item.categoria === "N° de colegios")
      .map(item => item.programa)
      .filter(prog => prog && prog !== null)
    )];
    return uniquePrograms.sort();
  }, [participants]);

  // Process data for stacked bar chart with Educación and Formare (Total Beneficiarios only)
  const chartData = useMemo(() => {
    if (!participants) return [];

    const beneficiariosData = participants.filter(
      item => item.categoria === "Total Beneficiarios"
    );

    // Group by year
    const yearGroups = beneficiariosData.reduce((acc, item) => {
      const year = item.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    }, {} as Record<number, typeof beneficiariosData>);

    // Calculate totals per year for each base (Educación and Formare)
    const data = Object.entries(yearGroups).map(([year, items]) => {
      let educacion = 0;
      let formare = 0;
      
      if (selectedProgram === "todos") {
        educacion = items
          .filter(item => item.base === "Educación")
          .reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
        formare = items
          .filter(item => item.base === "Formare")
          .reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
      } else {
        educacion = items
          .filter(item => item.base === "Educación" && item.programa === selectedProgram)
          .reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
        formare = items
          .filter(item => item.base === "Formare" && item.programa === selectedProgram)
          .reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
      }

      return {
        year: parseInt(year),
        educacion,
        formare,
        total: educacion + formare
      };
    });

    return data.sort((a, b) => a.year - b.year);
  }, [participants, selectedProgram]);

  // Process data for schools chart (N° de colegios) - filtered by program
  const schoolsChartData = useMemo(() => {
    if (!participants || !selectedSchoolProgram) return [];

    const colegiosData = participants.filter(
      item => item.categoria === "N° de colegios" && item.programa === selectedSchoolProgram
    );

    // Group by year
    const yearGroups = colegiosData.reduce((acc, item) => {
      const year = item.year;
      if (!acc[year]) {
        acc[year] = 0;
      }
      acc[year] += Number(item.valor) || 0;
      return acc;
    }, {} as Record<number, number>);

    const data = Object.entries(yearGroups).map(([year, colegios]) => ({
      year: parseInt(year),
      colegios
    }));

    return data.sort((a, b) => a.year - b.year);
  }, [participants, selectedSchoolProgram]);

  // Latest year participants total (dynamic — siempre el año más reciente disponible)
  const year2024Data = useMemo(() => {
    if (chartData.length === 0) return { total: 0, year: new Date().getFullYear() };
    const latest = chartData[chartData.length - 1];
    return { total: latest.total, year: latest.year };
  }, [chartData]);

  // Latest year schools total (dynamic)
  const schools2024Data = useMemo(() => {
    if (schoolsChartData.length === 0) return { total: 0, year: new Date().getFullYear() };
    const latest = schoolsChartData[schoolsChartData.length - 1];
    return { total: latest.colegios, year: latest.year };
  }, [schoolsChartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos de participantes. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay datos de participantes disponibles. Por favor, cargue los datos desde el módulo de administración.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-luker-red" />
          <h2 className="text-2xl font-bold text-luker-brown">Histórico de Participantes</h2>
        </div>
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger className="w-[250px] bg-white border-gray-300">
            <SelectValue placeholder="Seleccionar programa" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="todos">Todos los Programas</SelectItem>
            {programs.map(program => (
              <SelectItem key={program} value={program}>{program}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Total for Latest Year */}
      <Card className="border-luker-red/20 bg-gradient-to-br from-luker-red/5 to-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-luker-red mb-2">
              {year2024Data.total.toLocaleString('es-CO')}
            </div>
            <p className="text-sm text-gray-600">
              Participantes {year2024Data.year}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Participants Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-luker-brown">
            {selectedProgram === "todos" 
              ? "Histórico participantes" 
              : `Histórico participantes - ${selectedProgram}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  angle={-90}
                  textAnchor="end"
                  height={60}
                  domain={[2003, 'dataMax']}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => value.toLocaleString('es-CO')}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString('es-CO'), 
                    name === 'educacion' ? 'Educación' : 'Formare'
                  ]}
                  labelFormatter={(label) => `Año ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'educacion' ? 'Educación' : 'Formare'}
                />
                <Bar 
                  dataKey="educacion" 
                  stackId="a"
                  fill="hsl(var(--luker-red))" 
                  radius={[4, 4, 4, 4]}
                  name="educacion"
                />
                <Bar 
                  dataKey="formare" 
                  stackId="a"
                  fill="hsl(var(--luker-green))" 
                  radius={[8, 8, 0, 0]}
                  name="formare"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Schools Section Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-luker-green" />
          <h2 className="text-2xl font-bold text-luker-brown">Histórico de Colegios</h2>
        </div>
        <Select value={selectedSchoolProgram} onValueChange={setSelectedSchoolProgram}>
          <SelectTrigger className="w-[250px] bg-white border-gray-300">
            <SelectValue placeholder="Seleccionar programa" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {schoolPrograms.map(program => (
              <SelectItem key={program} value={program}>{program}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schools Total Card */}
      <Card className="border-luker-green/20 bg-gradient-to-br from-luker-green/5 to-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-luker-green mb-2">
              {schools2024Data.total.toLocaleString('es-CO')}
            </div>
            <p className="text-sm text-gray-600">
              Colegios {schools2024Data.year}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schools Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-luker-brown">
            {selectedSchoolProgram 
              ? `Histórico N° de colegios - ${selectedSchoolProgram}` 
              : "Histórico N° de colegios"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  angle={-90}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => value.toLocaleString('es-CO')}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value.toLocaleString('es-CO'), 'Colegios']}
                  labelFormatter={(label) => `Año ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={() => 'N° de Colegios'}
                />
                <Bar 
                  dataKey="colegios" 
                  fill="hsl(var(--luker-green))" 
                  radius={[8, 8, 0, 0]}
                  name="colegios"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationBeneficiaries;
