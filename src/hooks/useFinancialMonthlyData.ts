import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyFinancialData {
  id: string;
  year: number;
  month: number;
  month_name: string;
  reference_date: string;
  project_name: string;
  category: string;
  saldo_inicial: number;
  executed: number;
  pending: number;
  execution_percentage: number;
  is_parent: boolean;
  parent_category: string | null;
}

interface AvailableMonth {
  year: number;
  month: number;
  month_name: string;
  label: string;
}

export const useFinancialMonthlyData = () => {
  const [data, setData] = useState<MonthlyFinancialData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch available months
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const { data: months, error } = await supabase
          .from("financial_execution_monthly")
          .select("year, month, month_name")
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        if (error) throw error;

        // Get unique year-month combinations
        const uniqueMonths = new Map<string, AvailableMonth>();
        months?.forEach((m) => {
          const key = `${m.year}-${m.month}`;
          if (!uniqueMonths.has(key)) {
            uniqueMonths.set(key, {
              year: m.year,
              month: m.month,
              month_name: m.month_name,
              label: `${m.month_name} ${m.year}`,
            });
          }
        });

        const monthsList = Array.from(uniqueMonths.values());
        setAvailableMonths(monthsList);

        // Auto-select most recent month if available
        if (monthsList.length > 0 && !selectedMonth) {
          setSelectedMonth({ year: monthsList[0].year, month: monthsList[0].month });
        }
      } catch (error) {
        console.error("Error fetching available months:", error);
      }
    };

    fetchAvailableMonths();
  }, []);

  // Fetch data for selected month
  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!selectedMonth) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: monthlyData, error } = await supabase
          .from("financial_execution_monthly")
          .select("*")
          .eq("year", selectedMonth.year)
          .eq("month", selectedMonth.month)
          .order("category", { ascending: true })
          .order("is_parent", { ascending: false });

        if (error) throw error;
        setData(monthlyData || []);
      } catch (error) {
        console.error("Error fetching monthly financial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedMonth]);

  // Computed values - use TOTAL row if it exists, otherwise sum parent categories
  const getTotalBudget = () => {
    const totalRow = data.find((inv) => inv.project_name.toUpperCase() === "TOTAL");
    if (totalRow) {
      return totalRow.saldo_inicial;
    }
    return data
      .filter((inv) => inv.is_parent && inv.project_name.toUpperCase() !== "TOTAL")
      .reduce((sum, inv) => sum + inv.saldo_inicial, 0);
  };

  const getTotalExecuted = () => {
    const totalRow = data.find((inv) => inv.project_name.toUpperCase() === "TOTAL");
    if (totalRow) {
      return totalRow.executed;
    }
    return data
      .filter((inv) => inv.is_parent && inv.project_name.toUpperCase() !== "TOTAL")
      .reduce((sum, inv) => sum + inv.executed, 0);
  };

  const getOverallExecutionPercentage = () => {
    // Always calculate from actual values for accuracy
    const total = getTotalBudget();
    const executed = getTotalExecuted();
    return total > 0 ? ((executed / total) * 100).toFixed(1) : "0";
  };

  return {
    data,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    loading,
    getTotalBudget,
    getTotalExecuted,
    getOverallExecutionPercentage,
    hasData: data.length > 0,
  };
};
