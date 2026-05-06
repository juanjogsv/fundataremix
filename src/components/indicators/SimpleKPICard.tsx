import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SimpleKPICardProps {
  title: string;
  value: string;
  year: string;
  icon: LucideIcon;
  bgColor: string;
  iconBgColor: string;
  valueColor: string;
}

export const SimpleKPICard = ({ 
  title, 
  value, 
  year, 
  icon: Icon, 
  bgColor, 
  iconBgColor,
  valueColor 
}: SimpleKPICardProps) => {
  return (
    <Card className={`${bgColor} border-0 shadow-sm hover:shadow-md transition-all duration-300`}>
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
        <div className={`text-5xl font-bold ${valueColor}`}>
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
