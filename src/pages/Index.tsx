import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Calendar, 
  FolderOpen, 
  
  DollarSign, 
  GraduationCap, 
  Lightbulb, 
  Sprout, 
  Sparkles, 
  MapPin, 
  TrendingUp,
  LogOut,
  Settings,
  ArrowRight,
  Target,
  Users,
  Heart,
} from "lucide-react";
import lukerLogo from "@/assets/fundacion-luker-logo.jpeg";

const sections = [
  {
    id: 1,
    title: "Indicadores Estratégicos",
    icon: BarChart3,
    path: "/indicadores",
    color: "from-luker-teal/20 to-luker-green/20",
    iconColor: "bg-luker-teal",
    description: "Seguimiento de KPIs"
  },
  {
    id: 2,
    title: "Calendario",
    icon: Calendar,
    path: "/calendario",
    color: "from-luker-orange/20 to-luker-red/20",
    iconColor: "bg-luker-orange",
    description: "Eventos y actividades"
  },
  {
    id: 3,
    title: "Documentos",
    icon: FolderOpen,
    path: "/documentos",
    color: "from-luker-brown/20 to-luker-orange/20",
    iconColor: "bg-luker-brown",
    description: "Repositorio documental"
  },
  {
    id: 4,
    title: "Financiero",
    icon: DollarSign,
    path: "/financiero",
    color: "from-luker-green/20 to-luker-teal/20",
    iconColor: "bg-luker-green",
    description: "Gestión financiera"
  },
  {
    id: 5,
    title: "Educación",
    icon: GraduationCap,
    path: "/educacion",
    color: "from-luker-red/20 to-luker-orange/20",
    iconColor: "bg-luker-red",
    description: "Programas educativos"
  },
  {
    id: 6,
    title: "Emprendimiento",
    icon: Lightbulb,
    path: "/emprendimiento",
    color: "from-luker-orange/20 to-luker-green/20",
    iconColor: "bg-luker-orange",
    description: "Ecosistema de emprendimiento"
  },
  {
    id: 7,
    title: "Desarrollo Rural",
    icon: Sprout,
    path: "/desarrollo-rural",
    color: "from-luker-green/20 to-luker-brown/20",
    iconColor: "bg-luker-green",
    description: "Proyectos rurales"
  },
  {
    id: 8,
    title: "Especiales",
    icon: Sparkles,
    path: "/especiales",
    color: "from-luker-red/20 to-luker-teal/20",
    iconColor: "bg-luker-red",
    description: "Proyectos especiales"
  },
  {
    id: 9,
    title: "Mapa",
    icon: MapPin,
    path: "/mapa",
    color: "from-luker-teal/20 to-luker-brown/20",
    iconColor: "bg-luker-teal",
    description: "Georreferenciación"
  },
  {
    id: 10,
    title: "Contexto Socioeconómico",
    icon: TrendingUp,
    path: "/socioeconomico",
    color: "from-luker-orange/20 to-luker-green/20",
    iconColor: "bg-luker-orange",
    description: "Indicadores de ciudad"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img 
              src={lukerLogo} 
              alt="Fundación Luker" 
              className="h-12 md:h-14 w-auto object-contain"
            />
            
            {user && (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="border-luker-green/30 text-luker-brown hover:bg-luker-green/5"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-luker-brown hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Storytelling */}
      <section className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-luker-green/5 via-luker-orange/5 to-luker-teal/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-luker-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-luker-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-6 py-8 md:py-10 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-block">
              <span className="text-sm font-semibold text-white bg-gradient-to-r from-luker-green to-luker-teal px-5 py-2.5 rounded-full shadow-md">
                Plataforma de Gestión Estratégica
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-luker-brown leading-tight font-heading">
              Transformando vidas a través de la{" "}
              <span className="bg-gradient-to-r from-luker-green to-luker-teal bg-clip-text text-transparent">educación</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              <span className="font-bold text-luker-brown">Movilizamos palancas para que niños y jóvenes</span> potencien su desarrollo para una vida <span className="font-bold text-luker-green">productiva gratificante</span>
            </p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.id}
                onClick={() => navigate(section.path)}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-white border-gray-200/80 aspect-square hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="h-full flex flex-col items-center justify-center p-4 space-y-3 relative z-10">
                  <div className={`p-3 md:p-4 rounded-2xl ${section.iconColor} shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-sm md:text-base text-luker-brown leading-tight font-heading">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-600 hidden md:block">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-luker-green/30 rounded-lg transition-colors duration-300" />
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 mb-12">
        <Card className="bg-gradient-to-br from-luker-green/5 via-luker-orange/5 to-luker-teal/5 border-luker-green/20 shadow-lg">
          <div className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-luker-brown font-heading">
              ¿Necesitas ayuda para navegar la plataforma?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Consulta nuestra guía de usuario o contacta al equipo técnico para obtener asistencia
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Button 
                variant="outline"
                onClick={() => navigate("/help")}
                className="border-luker-green/30 text-luker-brown hover:bg-luker-green/5"
              >
                Ver Guía de Usuario
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/about")}
                className="border-luker-orange/30 text-luker-brown hover:bg-luker-orange/5"
              >
                Acerca de la Plataforma
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white/95 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>© 2025 Fundación Luker. Todos los derechos reservados.</p>
            <p>Plataforma de Gestión Estratégica</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
