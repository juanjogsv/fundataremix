import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Lightbulb, Users, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import lukerLogo from "@/assets/fundacion-luker-logo.jpeg";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-luker-brown/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-luker-brown font-heading">
              Acerca de la Plataforma
            </h1>
            <p className="text-gray-600 mt-2">
              Conoce más sobre nuestro sistema de gestión estratégica
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <Card className="bg-gradient-to-br from-luker-green/5 via-white to-luker-orange/5 border-luker-green/20 shadow-md">
            <div className="p-8 md:p-12">
              <div className="flex items-start gap-6 mb-8">
                <img 
                  src={lukerLogo} 
                  alt="Fundación Luker" 
                  className="h-20 w-auto object-contain"
                />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-luker-brown mb-4 font-heading">
                    Nuestro Credo
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Estamos convencidos que una persona educada y emprendedora transforma y genera 
                    desarrollo para sí mismo y las comunidades a su alrededor.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Platform Overview */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-luker-brown mb-6 font-heading">
            ¿Qué es esta Plataforma?
          </h2>
          <div className="prose max-w-none">
            <Card className="bg-white border-gray-200/80 shadow-sm">
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  La Plataforma de Gestión Estratégica de la Fundación Luker es un sistema integral 
                  diseñado para centralizar, visualizar y analizar información clave sobre nuestros 
                  programas e iniciativas sociales.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Está pensada para facilitar la toma de decisiones informadas por parte de ejecutivos 
                  y líderes de la organización, proporcionando una visión 360° del impacto y desempeño 
                  de nuestras intervenciones en educación, emprendimiento, desarrollo rural y otras áreas estratégicas.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-luker-brown mb-6 font-heading">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-3 bg-luker-green/10 rounded-xl w-fit mb-2">
                  <Target className="h-6 w-6 text-luker-green" />
                </div>
                <CardTitle className="text-luker-brown">Indicadores Estratégicos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Seguimiento en tiempo real de KPIs clave organizados por áreas temáticas 
                  con visualizaciones claras y accionables.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-3 bg-luker-orange/10 rounded-xl w-fit mb-2">
                  <TrendingUp className="h-6 w-6 text-luker-orange" />
                </div>
                <CardTitle className="text-luker-brown">Análisis de Contexto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Información socioeconómica del entorno que permite contextualizar 
                  nuestras intervenciones y medir su impacto real.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-3 bg-luker-teal/10 rounded-xl w-fit mb-2">
                  <Lightbulb className="h-6 w-6 text-luker-teal" />
                </div>
                <CardTitle className="text-luker-brown">Gestión Documental</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Repositorio centralizado de documentos clave, informes y materiales 
                  de referencia organizados por categorías.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-3 bg-luker-red/10 rounded-xl w-fit mb-2">
                  <Users className="h-6 w-6 text-luker-red" />
                </div>
                <CardTitle className="text-luker-brown">Georreferenciación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualización geográfica de proyectos y ubicaciones de intervención 
                  para una mejor comprensión territorial.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-3 bg-luker-brown/10 rounded-xl w-fit mb-2">
                  <Shield className="h-6 w-6 text-luker-brown" />
                </div>
                <CardTitle className="text-luker-brown">Seguridad y Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sistema de permisos y roles que garantiza el acceso apropiado 
                  a la información según el perfil del usuario.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-3 bg-luker-green/10 rounded-xl w-fit mb-2">
                  <Zap className="h-6 w-6 text-luker-green" />
                </div>
                <CardTitle className="text-luker-brown">Actualizaciones Dinámicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sistema de carga de datos que permite mantener la información 
                  actualizada mediante archivos Excel y documentos estructurados.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-luker-brown mb-6 font-heading">
            Metodología de Indicadores
          </h2>
          <Card className="bg-white border-gray-200/80 shadow-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-luker-brown mb-3">Lógica de Medición</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Los indicadores estratégicos están diseñados para medir el avance hacia metas anuales 
                    definidas por área temática. Cada indicador incluye:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 text-gray-700">
                    <li>Meta anual establecida al inicio del período</li>
                    <li>Valor acumulado durante el año en curso</li>
                    <li>Porcentaje de avance hacia la meta</li>
                    <li>Histórico de logros de años anteriores (2023-2024)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-luker-brown mb-3">Áreas de Intervención</h3>
                  <p className="text-gray-700 leading-relaxed">
                    La plataforma organiza los indicadores en 10 áreas estratégicas que reflejan 
                    la amplitud y profundidad del impacto de la Fundación Luker:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-teal rounded-full"></div>
                      Educación
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-green rounded-full"></div>
                      Emprendimiento
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-orange rounded-full"></div>
                      Desarrollo Rural
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-red rounded-full"></div>
                      Proyectos Especiales
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-brown rounded-full"></div>
                      Estrategia
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-teal rounded-full"></div>
                      Comunicaciones
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-green rounded-full"></div>
                      Financiero
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-luker-brown rounded-full"></div>
                      Contexto Socioeconómico
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section>
          <Card className="bg-gradient-to-br from-luker-green/5 via-luker-orange/5 to-luker-teal/5 border-luker-green/20 shadow-md">
            <div className="p-8 text-center space-y-4">
              <h3 className="text-2xl font-bold text-luker-brown font-heading">
                ¿Listo para explorar los datos?
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Navega por los diferentes módulos para acceder a la información que necesitas
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button 
                  onClick={() => navigate("/indicadores")}
                  className="bg-luker-green hover:bg-luker-green/90 text-white"
                >
                  Ver Indicadores Estratégicos
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="border-luker-brown/30 text-luker-brown hover:bg-luker-brown/5"
                >
                  Volver al Inicio
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
