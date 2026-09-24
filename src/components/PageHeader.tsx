import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  mobileTitle?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor: string;
}

const accentFromClass = (className: string) => {
  if (className.includes("coral") || className.includes("red")) return "coral";
  if (className.includes("orange")) return "orange";
  if (className.includes("green") || className.includes("lime")) return "lime";
  if (className.includes("brown")) return "brown";
  return "teal";
};

export const PageHeader = ({ 
  title, 
  mobileTitle,
  subtitle, 
  icon: Icon, 
  iconBgColor
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const accent = accentFromClass(iconBgColor);

  return (
    <section className="institutional-page-header" data-accent={accent} aria-labelledby="page-title">
      <div className="institutional-page-header__title-row">
        <div className="institutional-page-header__number" aria-hidden="true">
          <Icon />
        </div>
        <div className="min-w-0">
          <nav aria-label="Migas de pan" className="institutional-page-header__breadcrumbs">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="institutional-back-button" aria-label="Volver al inicio">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <h1 id="page-title" tabIndex={-1} className="institutional-page-header__title">
            <span className="sm:hidden">{mobileTitle || title}</span>
            <span className="hidden sm:inline">{title}</span>
          </h1>
          {subtitle && <p className="institutional-page-header__subtitle">{subtitle}</p>}
        </div>
        <div className="institutional-page-header__rule" />
      </div>
    </section>
  );
};
