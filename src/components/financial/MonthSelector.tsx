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
  if (availableMonths.length === 0) {
    return null;
  }

  const currentValue = selectedMonth
    ? `${selectedMonth.year}-${selectedMonth.month}`
    : undefined;

  const handleChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    onMonthChange({ year, month });
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2">
      <CalendarDays className="h-5 w-5 text-luker-brown" />
      <span className="text-sm font-medium text-gray-600">Período:</span>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px] border-luker-brown/20 focus:ring-luker-green">
          <SelectValue placeholder="Seleccionar mes" />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((m) => (
            <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
