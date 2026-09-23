import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
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
import lukerLogo from "@/assets/fundacion-luker-color-letra-cafe-horizontal.png.asset.json";
import heroPeople from "@/assets/mi-junta-hero-people.png";

const lukerLogoUrl = `https://id-preview--86b2a9c4-6838-4f82-a3c4-21cb241b504c.lovable.app${lukerLogo.url}`;

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
      <header className="home-editorial__header">
        <div className="home-editorial__header-inner">
          <img src={lukerLogoUrl} alt="Fundación Luker" className="home-editorial__logo" />
          {user && (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Settings className="h-4 w-4 mr-2" />Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />Salir
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero__letter" aria-hidden="true">L</div>
          <div className="home-hero__copy animate-fade-in">
            <p className="home-kicker">Plataforma de gestión estratégica</p>
            <h1>Transformamos vidas a través de la <span>educación</span></h1>
            <p className="home-hero__lead">
              Movilizamos palancas para que niños y jóvenes potencien su desarrollo para una vida productiva gratificante.
            </p>
            <Button className="home-hero__action" onClick={() => navigate("/indicadores")}>Explorar indicadores <ArrowRight className="h-4 w-4" /></Button>
          </div>
          <div className="home-hero__visual animate-scale-in">
            <div className="home-hero__accent" aria-hidden="true" />
            <img src={heroPeople} alt="Educadora, estudiante y productor rural de la comunidad" width={1200} height={1400} />
          </div>
        </section>

        <section className="home-directory" aria-labelledby="directory-title">
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
                <Button
                  key={section.id}
                  variant="ghost"
                  onClick={() => navigate(section.path)}
                  className="home-module animate-fade-in"
                  data-accent={section.accent}
                  data-featured={index === 0 || index === 4 ? "true" : "false"}
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
                >
                  <span className="home-module__number">{String(section.id).padStart(2, "0")}</span>
                  <span className="home-module__icon"><Icon /></span>
                  <span className="home-module__copy">
                    <strong>{section.title}</strong>
                    <small>{section.description}</small>
                  </span>
                  <ArrowRight className="home-module__arrow" />
                </Button>
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
      </main>
    </div>
  );
};

export default Index;
