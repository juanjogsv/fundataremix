import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/fundacion-luker-logo.jpeg";

interface PageHeaderProps {
  title: string;
  mobileTitle?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor: string;
  gradientColors: string;
}

export const PageHeader = ({ 
  title, 
  mobileTitle,
  subtitle, 
  icon: Icon, 
  iconBgColor,
  gradientColors 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Icon Circle */}
              <div className={`${iconBgColor} w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0`} aria-hidden="true">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Title — single h1 with responsive sizing */}
              <div className="min-w-0">
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent truncate sm:whitespace-normal`}>
                  <span className="sm:hidden">{mobileTitle || title}</span>
                  <span className="hidden sm:inline">{title}</span>
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <img 
            src={logoImage} 
            alt="Fundación Luker" 
            className="h-8 sm:h-10 lg:h-11 w-auto object-contain shrink-0"
          />
        </div>
      </div>
    </header>
  );
};
