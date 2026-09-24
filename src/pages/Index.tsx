import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  FolderOpen,
  GraduationCap,
  Lightbulb,
  LogOut,
  MapPin,
  Settings,
  Sparkles,
  Sprout,
  TrendingUp,
} from "lucide-react";
import heroPeople from "@/assets/mi-junta-hero-people.png";

const sections = [
  { id: 1, title: "Indicadores Estratégicos", icon: BarChart3, path: "/indicadores", accent: "teal", description: "Seguimiento de KPIs" },
  { id: 2, title: "Calendario", icon: Calendar, path: "/calendario", accent: "orange", description: "Eventos y actividades" },
  { id: 3, title: "Documentos", icon: FolderOpen, path: "/documentos", accent: "brown", description: "Repositorio documental" },
  { id: 4, title: "Financiero", icon: DollarSign, path: "/financiero", accent: "lime", description: "Gestión financiera" },
  { id: 5, title: "Educación", icon: GraduationCap, path: "/educacion", accent: "coral", description: "Programas educativos" },
  { id: 6, title: "Emprendimiento", icon: Lightbulb, path: "/emprendimiento", accent: "orange", description: "Ecosistema de emprendimiento" },
  { id: 7, title: "Desarrollo Rural", icon: Sprout, path: "/desarrollo-rural", accent: "lime", description: "Proyectos rurales" },
  { id: 8, title: "Especiales", icon: Sparkles, path: "/especiales", accent: "coral", description: "Proyectos especiales" },
  { id: 9, title: "Mapa", icon: MapPin, path: "/mapa", accent: "teal", description: "Georreferenciación" },
  { id: 10, title: "Contexto Socioeconómico", icon: TrendingUp, path: "/socioeconomico", accent: "orange", description: "Indicadores de ciudad" },
] as const;

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="home-editorial">
      <div>
        <section className="home-hero">
          <div className="home-hero__letter" aria-hidden="true">L</div>
          <div className="home-hero__copy animate-fade-in">
            {user && (
              <div className="home-session-actions">
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                    <Settings className="h-4 w-4" />Admin
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />Salir
                </Button>
              </div>
            )}
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
            <img src={heroPeople} alt="Educadora, estudiante y productor rural de la comunidad" width={1200} height={1400} />
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
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigate(section.path)}
                  className="home-module animate-fade-in"
                  data-accent={section.accent}
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
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
