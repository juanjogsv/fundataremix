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
  gradientColors?: string;
}

export const PageHeader = ({ 
  title, 
  mobileTitle,
  subtitle, 
  icon: Icon, 
  iconBgColor
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 border-b border-border shadow-sm sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-muted transition-colors shrink-0 text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Icon badge — kit accent per module */}
              <div className={`${iconBgColor} w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Title — editorial, solid brown */}
              <div className="min-w-0">
                {/* Mobile title (shorter) */}
                <h1 className="sm:hidden text-xl font-extrabold tracking-tight text-foreground truncate">
                  {mobileTitle || title}
                </h1>
                {/* Desktop title (full) */}
                <h1 className="hidden sm:block text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
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
