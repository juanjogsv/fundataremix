import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, BookOpen, Video, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
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
              Centro de Ayuda
            </h1>
            <p className="text-gray-600 mt-2">
              Encuentra respuestas y aprende a usar la plataforma
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <section className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-3 bg-luker-green/10 rounded-xl w-fit mx-auto">
                <BookOpen className="h-8 w-8 text-luker-green" />
              </div>
              <h3 className="font-semibold text-luker-brown">Guía de Usuario</h3>
              <p className="text-sm text-gray-600">Documentación completa</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-3 bg-luker-orange/10 rounded-xl w-fit mx-auto">
                <Video className="h-8 w-8 text-luker-orange" />
              </div>
              <h3 className="font-semibold text-luker-brown">Video Tutoriales</h3>
              <p className="text-sm text-gray-600">Aprende paso a paso</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-3 bg-luker-teal/10 rounded-xl w-fit mx-auto">
                <Mail className="h-8 w-8 text-luker-teal" />
              </div>
              <h3 className="font-semibold text-luker-brown">Contacto Soporte</h3>
              <p className="text-sm text-gray-600">Escríbenos directamente</p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-luker-green/10 rounded-lg">
              <HelpCircle className="h-6 w-6 text-luker-green" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-luker-brown font-heading">
              Preguntas Frecuentes
            </h2>
          </div>

          <Card className="bg-white border-gray-200/80 shadow-sm">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Cómo accedo a los indicadores estratégicos?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Desde la página principal, haz clic en el módulo "Indicadores Estratégicos". 
                    Podrás ver todos los indicadores organizados por área temática, con gráficos 
                    y tablas detalladas que muestran el avance hacia las metas anuales.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Qué permisos necesito para actualizar datos?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    La actualización de datos está restringida a usuarios con rol de Administrador. 
                    Si necesitas estos permisos, contacta al equipo de tecnología o al coordinador 
                    de la plataforma de tu área.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Cómo se cargan los datos en la plataforma?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Los administradores pueden cargar datos mediante archivos Excel estructurados. 
                    Cada módulo tiene un formato específico que debe respetarse. Consulta la guía 
                    de carga de datos para más detalles sobre los formatos requeridos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Con qué frecuencia se actualizan los indicadores?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    La frecuencia de actualización varía según el indicador y el área. En general, 
                    los indicadores principales se actualizan mensualmente, mientras que algunos 
                    indicadores específicos pueden tener actualizaciones trimestrales o anuales.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Puedo exportar los datos para análisis externos?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Sí, la plataforma permite exportar datos en formato Excel y PDF. 
                    Los usuarios con permisos apropiados pueden generar reportes personalizados 
                    desde cada módulo.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Cómo funciona el mapa georreferenciado?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    El módulo de Mapa muestra las ubicaciones de proyectos e intervenciones de la 
                    Fundación en un mapa interactivo. Puedes hacer clic en cada marcador para ver 
                    detalles del proyecto, filtrar por tipo de intervención y explorar el alcance 
                    territorial de nuestras actividades.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Qué navegadores son compatibles?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    La plataforma funciona mejor en las últimas versiones de Google Chrome, 
                    Mozilla Firefox, Safari y Microsoft Edge. Recomendamos mantener tu navegador 
                    actualizado para una experiencia óptima.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left text-luker-brown hover:text-luker-green">
                    ¿Cómo reporto un problema técnico?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Si encuentras algún problema o error, por favor contacta al equipo de soporte 
                    técnico proporcionando la siguiente información: tu nombre de usuario, el módulo 
                    donde ocurrió el problema, una descripción detallada del error y, si es posible, 
                    capturas de pantalla.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Contact Support */}
        <section className="mt-12">
          <Card className="bg-gradient-to-br from-luker-green/5 via-luker-orange/5 to-luker-teal/5 border-luker-green/20 shadow-md">
            <div className="p-8 text-center space-y-4">
              <h3 className="text-2xl font-bold text-luker-brown font-heading">
                ¿No encontraste lo que buscabas?
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta o problema
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button 
                  className="bg-luker-green hover:bg-luker-green/90 text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar Soporte
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

export default Help;
