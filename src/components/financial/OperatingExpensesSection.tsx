import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, FileText, Search, AlertCircle } from "lucide-react";
import { useState } from "react";
import { MonthSelector } from "./MonthSelector";
import { useOperatingExpenses } from "@/hooks/useOperatingExpenses";

export const OperatingExpensesSection = () => {
  const {
    data,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    loading,
    getTotalBudget,
    getTotalExecuted,
    getOverallExecutionPercentage,
    hasData,
  } = useOperatingExpenses();

  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyMillions = (value: number) => {
    const millions = value / 1000000;
    return `$ ${new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(millions))} M`;
  };

  // Filter data by search term
  const filteredData = data.filter((item) =>
    !searchTerm.trim() ||
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected month label
  const getSelectedMonthLabel = () => {
    if (!selectedMonth) return "";
    const monthData = availableMonths.find(
      (m) => m.year === selectedMonth.year && m.month === selectedMonth.month
    );
    return monthData?.label || `${selectedMonth.month}/${selectedMonth.year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luker-brown mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de funcionamiento...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">No hay datos disponibles</p>
            <p className="text-sm text-yellow-700">
              Carga un archivo de ejecución presupuestal de funcionamiento desde el panel de administración.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Month Selector */}
      {availableMonths.length > 0 && (
        <div className="flex justify-end">
          <MonthSelector
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200/80 shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-luker-green/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-luker-green" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Presupuesto</p>
              <h3 className="text-2xl font-bold text-luker-brown">
                {formatCurrencyMillions(getTotalBudget())}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200/80 shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-luker-orange/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-luker-orange" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Ejecutado</p>
              <h3 className="text-2xl font-bold text-luker-brown">
                {formatCurrencyMillions(getTotalExecuted())}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200/80 shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-luker-teal/10 rounded-xl">
              <FileText className="h-6 w-6 text-luker-teal" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">% Ejecución General</p>
              <h3 className="text-2xl font-bold text-luker-brown">
                {getOverallExecutionPercentage()}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Table */}
      <section>
        <Card className="bg-white border-gray-200/80 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl text-luker-brown font-heading flex items-center gap-2">
                  <div className="w-1 h-8 bg-luker-orange rounded-full"></div>
                  Detalle de Gastos de Funcionamiento
                </CardTitle>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por concepto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-luker-green focus:ring-luker-green rounded-lg"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b-2 border-luker-brown/10">
                    <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide">
                      Concepto
                    </TableHead>
                    <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide text-right">
                      Presupuesto
                    </TableHead>
                    <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide text-right">
                      Ejecutado
                    </TableHead>
                    <TableHead className="font-bold text-luker-brown text-sm uppercase tracking-wide text-center">
                      % Ejecución
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="text-gray-400">
                          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No se encontraron resultados para "{searchTerm}"</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((expense) => {
                      const calcPercentage = expense.budget > 0 
                        ? (expense.executed / expense.budget) * 100 
                        : 0;
                      
                      return (
                        <TableRow 
                          key={expense.id}
                          className={`hover:bg-luker-green/5 transition-colors ${
                            expense.is_parent 
                              ? 'bg-gradient-to-r from-luker-brown/5 to-luker-brown/3 border-l-4 border-luker-brown font-semibold' 
                              : 'border-l-4 border-transparent'
                          }`}
                        >
                          <TableCell className={expense.is_parent ? 'font-bold text-luker-brown text-base' : 'pl-8 text-gray-700'}>
                            {expense.item_name}
                          </TableCell>
                          <TableCell className="text-right font-mono text-luker-brown font-semibold">
                            {formatCurrency(expense.budget)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-luker-green font-semibold">
                            {formatCurrency(expense.executed)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-300 ${
                                    calcPercentage >= 75 ? 'bg-gradient-to-r from-luker-green to-green-500' :
                                    calcPercentage >= 50 ? 'bg-gradient-to-r from-luker-orange to-orange-500' :
                                    'bg-gradient-to-r from-luker-red to-red-500'
                                  }`}
                                  style={{ width: `${Math.min(calcPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-bold min-w-[3.5rem] ${
                                calcPercentage >= 75 ? 'text-luker-green' :
                                calcPercentage >= 50 ? 'text-luker-orange' :
                                'text-luker-red'
                              }`}>
                                {calcPercentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
