import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RadialProgressCardProps {
  title: string;
  percentage: number;
  gradientId: string;
}

// Get solid color based on percentage - red (0%) -> orange -> yellow -> green -> teal (100%)
const getProgressColor = (percent: number): string => {
  if (percent >= 90) return '#00A0AF'; // Teal (90-100%)
  if (percent >= 75) return '#7AC143'; // Green (75-90%)
  if (percent >= 50) return '#FFD700'; // Yellow (50-75%)
  if (percent >= 25) return '#FBB040'; // Orange (25-50%)
  return '#EF3E42'; // Red (0-25%)
};

export const RadialProgressCard = ({ 
  title, 
  percentage,
  gradientId
}: RadialProgressCardProps) => {
  const isMobile = useIsMobile();
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimatedPercentage(Math.min(percentage, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Cap percentage at 100 for visual display but show actual value
  const displayPercentage = Math.round(percentage);
  
  // Use responsive sizes - smaller on mobile
  const svgSize = isMobile ? 110 : 140;
  const radius = isMobile ? 43 : 55;
  const strokeWidth = isMobile ? 10 : 12;
  const center = svgSize / 2;
  
  // Calculate stroke dash for the progress circle
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Get solid color based on current percentage
  const progressColor = getProgressColor(percentage);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50/30 border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 p-3 sm:p-4 pt-4 sm:pt-5 flex flex-col items-center justify-center h-full w-full">
      <h3 className="text-[10px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 text-center leading-tight px-1">
        {title}
      </h3>
      <div className="relative w-[110px] h-[110px] sm:w-[140px] sm:h-[140px]">
        <svg
          className="transform -rotate-90"
          width={svgSize}
          height={svgSize}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle with solid color */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-xl sm:text-2xl font-bold"
            style={{
              color: progressColor
            }}
          >
            {displayPercentage}%
          </span>
        </div>
      </div>
    </Card>
  );
};
