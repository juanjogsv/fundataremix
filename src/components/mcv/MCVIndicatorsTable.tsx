import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Table as TableIcon } from "lucide-react";

interface MCVIndicator {
  id: string;
  seccion: string;
  cod_indicador: string;
  indicador: string;
  categoria: string;
  entidad: string;
  dato: number | null;
  year: number;
  fuente: string | null;
  unidad_medida: string | null;
}

interface MCVIndicatorsTableProps {
  data: MCVIndicator[];
  selectedEntity: string;
  sectionName: string;
  allEntities?: string[];
}

const MCVIndicatorsTable = ({ data, selectedEntity, sectionName, allEntities = [] }: MCVIndicatorsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntity, setFilterEntity] = useState<string>(selectedEntity);

  // Get unique years sorted descending (most recent first)
  const years = useMemo(() => {
    const uniqueYears = [...new Set(data.map(d => d.year))].sort((a, b) => b - a);
    return uniqueYears;
  }, [data]);

  // Default to most recent year
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const uniqueYears = [...new Set(data.map(d => d.year))].sort((a, b) => b - a);
    return uniqueYears.length > 0 ? uniqueYears[0].toString() : "all";
  });

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.indicador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cod_indicador.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = selectedYear === "all" || item.year.toString() === selectedYear;
      const matchesEntity = item.entidad === filterEntity;
      return matchesSearch && matchesYear && matchesEntity;
    });
  }, [data, searchTerm, selectedYear, filterEntity]);

  // Group by indicator for display
  const groupedByIndicator = useMemo(() => {
    const groups: Record<string, MCVIndicator[]> = {};
    filteredData.forEach(item => {
      if (!groups[item.cod_indicador]) {
        groups[item.cod_indicador] = [];
      }
      groups[item.cod_indicador].push(item);
    });
    return groups;
  }, [filteredData]);

  const formatValue = (value: number | null, unit?: string | null) => {
    if (value === null) return "N/A";
    
    if (unit?.toLowerCase().includes("porcentaje")) {
      return `${value.toLocaleString('es-CO', { maximumFractionDigits: 2 })}%`;
    }
    if (unit?.toLowerCase().includes("pesos") || unit?.toLowerCase().includes("cop")) {
      return `$${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-luker-blue" />
            <CardTitle className="text-base font-semibold text-luker-brown">
              Todos los indicadores de {sectionName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar indicador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            {allEntities.length > 1 && (
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {allEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead className="w-20 text-right">Año</TableHead>
                <TableHead className="w-32 text-right">Valor</TableHead>
                <TableHead className="w-40">Unidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No se encontraron indicadores
                  </TableCell>
                </TableRow>
              ) : (
                [...filteredData].reverse().map((item) => (
                  <TableRow key={`${item.cod_indicador}-${item.year}`}>
                    <TableCell className="text-sm">{item.indicador}</TableCell>
                    <TableCell className="text-right text-sm">{item.year}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatValue(item.dato, item.unidad_medida)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 truncate max-w-40">
                      {item.unidad_medida || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-right">
          Mostrando {filteredData.length} de {data.filter(d => d.entidad === filterEntity).length} registros para {filterEntity}
        </div>
      </CardContent>
    </Card>
  );
};

export default MCVIndicatorsTable;
