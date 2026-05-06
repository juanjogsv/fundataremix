import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface IndicatorCardProps {
  value: number;
  unit: string;
  goal: number;
  percentage: number;
  keyword: string;
  area: string;
  indicatorName?: string;
  isPlaceholder?: boolean;
}

export const IndicatorCard = ({ value, unit, goal, percentage, keyword, area, indicatorName, isPlaceholder = false }: IndicatorCardProps) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimatedWidth(Math.min(Math.max(percentage, 0), 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);
  // Format value based on unit
  const formatValue = (val: number, unitType: string) => {
    if (unitType === "Porcentaje") return Math.round(val).toString();
    if (unitType === "Pesos") {
      return new Intl.NumberFormat('es-CO', { 
        notation: 'compact', 
        compactDisplay: 'short',
        maximumFractionDigits: 1
      }).format(val);
    }
    return new Intl.NumberFormat('es-CO', { 
      notation: 'compact', 
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(val);
  };

  // Get color based on percentage (red -> orange -> yellow -> teal) - same as ExecutionProjectsCard
  const getProgressColor = (percent: number): string => {
    if (percent <= 25) {
      // Red to Orange: #E53935 to #FF8C00
      const ratio = percent / 25;
      return `rgb(${Math.round(229 + (255 - 229) * ratio)}, ${Math.round(57 + (140 - 57) * ratio)}, ${Math.round(53 + (0 - 53) * ratio)})`;
    } else if (percent <= 50) {
      // Orange to Yellow: #FF8C00 to #FFD700
      const ratio = (percent - 25) / 25;
      return `rgb(255, ${Math.round(140 + (215 - 140) * ratio)}, 0)`;
    } else if (percent <= 75) {
      // Yellow to Light Green: #FFD700 to #7CB342
      const ratio = (percent - 50) / 25;
      return `rgb(${Math.round(255 + (124 - 255) * ratio)}, ${Math.round(215 + (179 - 215) * ratio)}, ${Math.round(0 + (66 - 0) * ratio)})`;
    } else {
      // Light Green to Teal: #7CB342 to #00A0AF
      const ratio = Math.min((percent - 75) / 25, 1);
      return `rgb(${Math.round(124 + (0 - 124) * ratio)}, ${Math.round(179 + (160 - 179) * ratio)}, ${Math.round(66 + (175 - 66) * ratio)})`;
    }
  };

  // Get gradient colors for progress bar - red -> orange -> yellow -> green -> teal
  const getGradientColors = (percent: number) => {
    if (percent >= 80) return { from: '#EF3E42', via: '#FFD700', to: '#00A0AF' }; // Red to Yellow to Teal
    if (percent >= 60) return { from: '#EF3E42', via: '#FBB040', to: '#7AC143' }; // Red to Orange to Green
    if (percent >= 40) return { from: '#EF3E42', via: '#FBB040', to: '#FFD700' }; // Red to Orange to Yellow
    if (percent >= 20) return { from: '#EF3E42', via: '#EF3E42', to: '#FBB040' }; // Red to Red to Orange
    return { from: '#EF3E42', via: '#EF3E42', to: '#EF3E42' }; // All Red
  };

  const gradient = getGradientColors(percentage);
  const progressColor = getProgressColor(percentage);
  const displayPercentage = Math.min(Math.max(percentage, 0), 100);
  if (isPlaceholder) {
    return (
      <Card className="bg-white/50 border-gray-300/40 shadow-sm relative overflow-hidden h-full">
        <div className="absolute top-4 right-4 opacity-5">
          <Plus className="h-6 w-6 text-gray-400 rotate-45" />
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="space-y-1.5">
            <div className="text-4xl font-bold leading-none text-gray-300">
              --
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Sin datos
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-gray-100 rounded-full" />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 leading-snug">
              {keyword}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50/30 border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group h-full">
      {/* Icon decorator */}
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Plus className="h-6 w-6 text-luker-teal rotate-45" />
      </div>

      <CardContent className="p-4 flex flex-col h-full">
        {/* Main Value */}
        <div className="space-y-0.5">
          <div 
            className="text-3xl font-bold leading-none"
            style={{ color: progressColor }}
          >
            {formatValue(value, unit)}
            {unit === "Porcentaje" && "%"}
          </div>
          <p className="text-xs text-gray-600 font-medium">
            Meta: {formatValue(goal, unit)}
            {unit === "Porcentaje" && "%"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${animatedWidth}%`,
                background: `linear-gradient(90deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
              }}
            >
              {/* Slider ball */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 transition-all duration-1000"
                style={{ borderColor: gradient.to }}
              />
            </div>
          </div>
        </div>

        {/* Indicator Info */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex-1">
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {keyword}
          </p>
          {indicatorName && (
            <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-2">
              {indicatorName}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};