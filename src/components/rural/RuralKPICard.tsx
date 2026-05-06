import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RuralKPICardProps {
  title: string;
  value: string;
  year: string;
  icon: LucideIcon;
  iconBgColor: string;
  isPlaceholder?: boolean;
}

const formatValue = (value: number | null, unidad?: string): string => {
  if (value === null || value === undefined) return "N/A";
  
  if (unidad === "Pesos" || unidad?.toLowerCase().includes("cop")) {
    // Valores en pesos - mostrar en millones o miles de millones
    if (value >= 1e12) {
      return `${(value / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 0 })} Miles MM`;
    }
    if (value >= 1e9) {
      return `${(value / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 0 })} MM`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 0 })} MM`;
    }
    return `$${value.toLocaleString("es-CO")}`;
  }
  
  if (unidad?.toLowerCase().includes("porcentaje")) {
    return `${value.toFixed(1)}%`;
  }
  
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return value.toLocaleString("es-CO");
  
  return value.toLocaleString("es-CO", { maximumFractionDigits: 1 });
};

export { formatValue };

export const RuralKPICard = ({ 
  title, 
  value, 
  year, 
  icon: Icon, 
  iconBgColor,
  isPlaceholder = false
}: RuralKPICardProps) => {
  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className={`${iconBgColor} w-16 h-16 rounded-full flex items-center justify-center`}>
          <Icon className="h-8 w-8 text-white" strokeWidth={2} />
        </div>

        {/* Title */}
        <h3 className="text-gray-700 text-base font-medium leading-tight min-h-[2.5rem] flex items-center">
          {title}
        </h3>

        {/* Value */}
        <div className={`text-5xl font-bold ${isPlaceholder ? 'text-gray-400' : 'text-luker-green'}`}>
          {value}
        </div>

        {/* Year */}
        <p className="text-gray-500 text-sm">
          {year}
        </p>
      </CardContent>
    </Card>
  );
};
