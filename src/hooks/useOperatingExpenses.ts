import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OperatingExpense {
  id: string;
  year: number;
  month: number;
  month_name: string;
  reference_date: string;
  category: string;
  subcategory: string | null;
  item_name: string;
  budget: number;
  executed: number;
  execution_percentage: number;
  difference: number;
  is_parent: boolean;
  parent_category: string | null;
  display_order: number;
}

interface AvailableMonth {
  year: number;
  month: number;
  month_name: string;
  label: string;
}

export const useOperatingExpenses = () => {
  const [data, setData] = useState<OperatingExpense[]>([]);
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch available months
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const { data: monthsData, error } = await supabase
          .from("operating_expenses_monthly")
          .select("year, month, month_name")
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        if (error) throw error;

        // Get unique months
        const uniqueMonths = new Map<string, AvailableMonth>();
        monthsData?.forEach((item) => {
          const key = `${item.year}-${item.month}`;
          if (!uniqueMonths.has(key)) {
            uniqueMonths.set(key, {
              year: item.year,
              month_name: item.month_name,
              month: item.month,
              label: `${item.month_name} ${item.year}`,
            });
          }
        });

        const months = Array.from(uniqueMonths.values());
        setAvailableMonths(months);

        // Set default to most recent month
        if (months.length > 0 && !selectedMonth) {
          setSelectedMonth({ year: months[0].year, month: months[0].month });
        }
      } catch (error) {
        console.error("Error fetching available months:", error);
      }
    };

    fetchAvailableMonths();
  }, []);

  // Fetch data for selected month
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMonth) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: expensesData, error } = await supabase
          .from("operating_expenses_monthly")
          .select("*")
          .eq("year", selectedMonth.year)
          .eq("month", selectedMonth.month)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setData(expensesData || []);
      } catch (error) {
        console.error("Error fetching operating expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const getTotalBudget = () => {
    return data
      .filter((item) => item.item_name.toUpperCase().includes("TOTAL PRESUPUESTO") || 
                        (item.item_name.toUpperCase().includes("TOTAL") && item.is_parent))
      .reduce((max, item) => Math.max(max, item.budget), 0) ||
      data.filter((item) => item.is_parent && !item.item_name.toUpperCase().includes("TOTAL"))
          .reduce((sum, item) => sum + item.budget, 0);
  };

  const getTotalExecuted = () => {
    return data
      .filter((item) => item.item_name.toUpperCase().includes("TOTAL PRESUPUESTO") || 
                        (item.item_name.toUpperCase().includes("TOTAL") && item.is_parent))
      .reduce((max, item) => Math.max(max, item.executed), 0) ||
      data.filter((item) => item.is_parent && !item.item_name.toUpperCase().includes("TOTAL"))
          .reduce((sum, item) => sum + item.executed, 0);
  };

  const getOverallExecutionPercentage = () => {
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
