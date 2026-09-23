import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowRight } from "lucide-react";

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

  const displayPercentage = Math.min(Math.max(percentage, 0), 100);
  const progressClass = displayPercentage <= 25
    ? "bg-kit-coral"
    : displayPercentage <= 50
      ? "bg-kit-orange"
      : displayPercentage <= 75
        ? "bg-kit-lime"
        : "bg-kit-teal";
  if (isPlaceholder) {
    return (
      <Card className="bg-card/70 border-border/40 relative overflow-hidden h-full">
        <div className="absolute top-4 right-4 opacity-5">
          <Plus className="h-6 w-6 text-muted-foreground/80 rotate-45" />
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="space-y-1.5">
            <div className="text-4xl font-bold leading-none text-muted-foreground/50">
              --
            </div>
            <p className="text-sm text-muted-foreground/80 font-medium">
              Sin datos
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-muted rounded-full" />
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold text-muted-foreground leading-snug">
              {keyword}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300 relative overflow-hidden group h-full">
      {/* Icon decorator */}
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Plus className="h-6 w-6 text-luker-teal rotate-45" />
      </div>

      <CardContent className="p-4 flex flex-col h-full">
        {/* Main Value */}
        <div className="space-y-0.5">
          <div className="text-3xl font-bold leading-none text-foreground">
            {formatValue(value, unit)}
            {unit === "Porcentaje" && "%"}
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Meta: {formatValue(goal, unit)}
            {unit === "Porcentaje" && "%"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${progressClass}`}
              style={{ width: `${displayPercentage}%` }}
            >
              {/* Slider ball */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full shadow-md border-2 border-foreground/20 transition-all duration-1000"
              />
            </div>
          </div>
        </div>

        {/* Indicator Info */}
        <div className="mt-2 pt-2 border-t border-border flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {keyword}
          </p>
          {indicatorName && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-2">
              {indicatorName}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};