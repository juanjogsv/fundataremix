import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const SECTION_NAV = [
  { label: "Indicadores", href: "/indicadores" },
  { label: "Calendario", href: "/calendario" },
  { label: "Documentos", href: "/documentos" },
  { label: "Financiero", href: "/financiero" },
  { label: "Educación", href: "/educacion" },
  { label: "Emprendimiento", href: "/emprendimiento" },
  { label: "Desarrollo Rural", href: "/desarrollo-rural" },
  { label: "Especiales", href: "/especiales" },
  { label: "Mapa", href: "/mapa" },
  { label: "Contexto Socioeconómico", href: "/socioeconomico" },
];

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
  const { pathname } = useLocation();
  const accent = accentFromClass(iconBgColor);

  return (
    <section className="institutional-page-header" data-accent={accent} aria-labelledby="page-title">
      <div className="institutional-page-header__title-row">
        <div className="institutional-page-header__number" aria-hidden="true">
          <Icon />
        </div>
        <div className="min-w-0">
          <nav aria-label="Secciones" className="institutional-section-nav">
            {SECTION_NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
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
