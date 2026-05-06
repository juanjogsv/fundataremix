import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

// Color palette for KPI cards (soft pastel backgrounds with matching icon colors)
const cardStyles = [
  { bg: "bg-red-50", iconBg: "bg-white", iconColor: "text-red-500", valueColor: "text-red-600" },
  { bg: "bg-amber-50", iconBg: "bg-white", iconColor: "text-amber-500", valueColor: "text-amber-600" },
  { bg: "bg-green-50", iconBg: "bg-white", iconColor: "text-green-500", valueColor: "text-green-600" },
  { bg: "bg-cyan-50", iconBg: "bg-white", iconColor: "text-cyan-500", valueColor: "text-cyan-600" },
  { bg: "bg-blue-50", iconBg: "bg-white", iconColor: "text-blue-500", valueColor: "text-blue-600" },
  { bg: "bg-purple-50", iconBg: "bg-white", iconColor: "text-purple-500", valueColor: "text-purple-600" },
  { bg: "bg-pink-50", iconBg: "bg-white", iconColor: "text-pink-500", valueColor: "text-pink-600" },
  { bg: "bg-gray-100", iconBg: "bg-white", iconColor: "text-gray-500", valueColor: "text-gray-600" },
];

interface MCVIndicator {
  dato: number | null;
  year: number;
}

interface MCVKPICardProps {
  title: string;
  value: number | null;
  year: number;
  unit?: string | null;
  trend?: MCVIndicator[];
  useSimpleDifference?: boolean;
  icon?: LucideIcon;
  colorIndex?: number;
}

const MCVKPICard = ({ 
  title, 
  value, 
  year, 
  unit, 
  trend, 
  useSimpleDifference = false,
  icon: Icon,
  colorIndex = 0
}: MCVKPICardProps) => {
  const formatValue = (val: number | null) => {
    if (val === null) return "N/A";
    
    if (unit?.toLowerCase().includes("porcentaje")) {
      return `${val.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`;
    }
    if (unit?.toLowerCase().includes("pesos") || unit?.toLowerCase().includes("cop")) {
      if (val >= 1000000000) {
        return `$${(val / 1000000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}B`;
      }
      if (val >= 1000000) {
        return `$${(val / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
      }
      if (val >= 1000) {
        return `$${(val / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}K`;
      }
      return `$${val.toLocaleString('es-CO')}`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}K`;
    }
    return val.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  };

  // Calculate trend
  const getTrend = () => {
    if (!trend || trend.length < 2) return null;
    
    const sortedTrend = [...trend].sort((a, b) => b.year - a.year);
    const latest = sortedTrend[0].dato;
    const previous = sortedTrend[1].dato;
    
    if (latest === null || previous === null) return null;
    
    const diff = latest - previous;
    
    // Use simple difference for growth rate indicators, percentage change for others
    if (useSimpleDifference) {
      return {
        direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
        change: Math.abs(diff),
        isSimpleDiff: true
      };
    }
    
    const percentChange = previous !== 0 ? ((diff / Math.abs(previous)) * 100) : 0;
    
    return {
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
      change: Math.abs(percentChange),
      isSimpleDiff: false
    };
  };

  const trendInfo = getTrend();
  const style = cardStyles[colorIndex % cardStyles.length];

  return (
    <Card className={`${style.bg} border-none shadow-sm hover:shadow-md transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          {Icon && (
            <div className={`${style.iconColor} p-3 rounded-full bg-white/80`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          
          <div className="space-y-1">
            {/* Title */}
            <p className="text-xs font-medium text-gray-600 leading-tight">
              {title}
            </p>
            
            {/* Value */}
            <p className={`text-3xl font-bold ${style.valueColor}`}>
              {formatValue(value)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MCVKPICard;
