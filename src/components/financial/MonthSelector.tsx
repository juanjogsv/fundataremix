import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AvailableMonth {
  year: number;
  month: number;
  month_name: string;
  label: string;
}

interface MonthSelectorProps {
  availableMonths: AvailableMonth[];
  selectedMonth: { year: number; month: number } | null;
  onMonthChange: (month: { year: number; month: number }) => void;
}

export const MonthSelector = ({
  availableMonths,
  selectedMonth,
  onMonthChange,
}: MonthSelectorProps) => {
  const availableYears = useMemo(
    () =>
      Array.from(new Set(availableMonths.map((m) => m.year))).sort(
        (a, b) => b - a
      ),
    [availableMonths]
  );

  const selectedYear = selectedMonth?.year ?? availableYears[0];

  const monthsForYear = useMemo(
    () => availableMonths.filter((m) => m.year === selectedYear),
    [availableMonths, selectedYear]
  );

  if (availableMonths.length === 0) {
    return null;
  }

  const handleYearChange = (value: string) => {
    const year = Number(value);
    // Auto-select most recent month of the newly selected year
    const monthsOfYear = availableMonths.filter((m) => m.year === year);
    if (monthsOfYear.length > 0) {
      const mostRecent = monthsOfYear.reduce((a, b) => (a.month > b.month ? a : b));
      onMonthChange({ year: mostRecent.year, month: mostRecent.month });
    }
  };

  const handleMonthChange = (value: string) => {
    const month = Number(value);
    onMonthChange({ year: selectedYear, month });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2">
      <CalendarDays className="h-5 w-5 text-luker-brown" />
      <span className="text-sm font-medium text-gray-600">Período:</span>

      <Select value={String(selectedYear)} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[110px] border-luker-brown/20 focus:ring-luker-green">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMonth ? String(selectedMonth.month) : undefined}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[160px] border-luker-brown/20 focus:ring-luker-green">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          {monthsForYear.map((m) => (
            <SelectItem key={m.month} value={String(m.month)}>
              {m.month_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
