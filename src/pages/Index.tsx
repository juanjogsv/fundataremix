import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SECTION_NAVIGATION } from "@/config/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  FolderOpen,
  GraduationCap,
  Lightbulb,
  MapPin,
  Sparkles,
  Sprout,
  TrendingUp,
} from "lucide-react";
const heroPeople = "/hero-people.webp";

const sections = [
  { icon: BarChart3, description: "Seguimiento de KPIs" },
  { icon: Calendar, description: "Eventos y actividades" },
  { icon: FolderOpen, description: "Repositorio documental" },
  { icon: DollarSign, description: "Gestión financiera" },
  { icon: GraduationCap, description: "Programas educativos" },
  { icon: Lightbulb, description: "Ecosistema de emprendimiento" },
  { icon: Sprout, description: "Proyectos rurales" },
  { icon: Sparkles, description: "Proyectos especiales" },
  { icon: MapPin, description: "Georreferenciación" },
  { icon: TrendingUp, description: "Indicadores de ciudad" },
] as const;

const directorySections = SECTION_NAVIGATION.map((section, index) => ({
  ...section,
  id: index + 1,
  title: section.label,
  path: section.href,
  ...sections[index],
}));

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="home-editorial">
      <div>
        <section className="home-hero">
          <div className="home-hero__letter" aria-hidden="true">L</div>
          <div className="home-hero__copy animate-fade-in">
            <p className="home-kicker">Plataforma de gestión estratégica</p>
              <h1 id="page-title" tabIndex={-1}>Transformamos vidas a través de la <span>educación</span></h1>
            <p className="home-hero__lead">
              Movilizamos palancas para que niños y jóvenes potencien su desarrollo para una vida productiva gratificante.
            </p>
            <Button asChild className="home-hero__action">
              <a href="#directory">Explorar módulos <ArrowRight className="h-4 w-4" /></a>
            </Button>
          </div>
          <div className="home-hero__visual animate-scale-in">
            <div className="home-hero__accent" aria-hidden="true" />
            <img src={heroPeople} alt="Educadora, estudiante y joven universitario de la comunidad" width={1200} height={1408} fetchPriority="high" decoding="async" />
          </div>
        </section>

        <section id="directory" className="home-directory" aria-labelledby="directory-title">
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">Índice de contenidos</p>
              <h2 id="directory-title">Nuestros programas y la ciudad</h2>
            </div>
            <p>Consulta el seguimiento estratégico, los programas y la información que acompaña nuestras decisiones.</p>
          </div>
          <div className="home-directory__grid">
            {directorySections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigate(section.path)}
                  className="home-module animate-fade-in"
                  data-accent={section.accent}
                >
                  <span className="home-module__icon"><Icon /></span>
                  <ArrowUpRight className="home-module__arrow" aria-hidden="true" />
                  <span className="home-module__copy">
                    <strong>{section.title}</strong>
                    <small>{section.description}</small>
                  </span>
                  <span className="home-module__footer">
                    <span>Acceder</span>
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                  <span className="home-module__number" aria-hidden="true">{String(section.id).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="home-impact" aria-labelledby="impact-title">
          <div className="home-impact__intro">
            <p className="home-kicker">La historia en cifras</p>
            <h2 id="impact-title">Datos que cuentan transformación</h2>
          </div>
          <div className="home-impact__stats">
            <article data-accent="coral"><strong>117.827</strong><span>participantes en 2025</span></article>
            <article data-accent="lime"><strong>10</strong><span>módulos conectados</span></article>
            <article data-accent="teal"><strong>2003—2025</strong><span>trayectoria visible</span></article>
          </div>
        </section>

        <section className="home-links">
          <p>¿Necesitas orientación para consultar la plataforma?</p>
          <nav aria-label="Enlaces de ayuda">
            <Button variant="link" onClick={() => navigate("/help")}>Ver guía de usuario <ArrowRight className="h-4 w-4" /></Button>
            <Button variant="link" onClick={() => navigate("/about")}>Acerca de Mi Junta <ArrowRight className="h-4 w-4" /></Button>
          </nav>
        </section>
      </div>
    </div>
  );
};

export default Index;
