import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  GraduationCap,
  Lightbulb,
  Sprout,
  Sparkles,
  TrendingUp,
  Wallet,
  Building2,
  Users,
  BookOpen,
  Brain,
  Award,
  Briefcase,
  Heart,
  Bean,
  UserCheck,
  Star,
  Shield,
} from "lucide-react";
import lukerLogo from "@/assets/fundacion-luker-logo.jpeg";


// Educación
import EducationBeneficiaries from "@/components/education/EducationBeneficiaries";
import EducationATL from "@/components/education/EducationATL";
import EducationUTC from "@/components/education/EducationUTC";
import EducationSocioemotional from "@/components/education/EducationSocioemotional";
import EducationSaberOnce from "@/components/education/EducationSaberOnce";
import EducationLaborMarket from "@/components/education/EducationLaborMarket";
import EducationContext from "@/components/education/EducationContext";

// Emprendimiento
import EAPHistoricalCharts from "@/components/entrepreneurship/EAPHistoricalCharts";

// Desarrollo Rural
import RuralBeneficiarios from "@/components/rural/RuralBeneficiarios";
import RuralGeneracionR from "@/components/rural/RuralGeneracionR";
import RuralProductividad from "@/components/rural/RuralProductividad";
import RuralAsociatividad from "@/components/rural/RuralAsociatividad";
import RuralSocial from "@/components/rural/RuralSocial";
import RuralFinanciero from "@/components/rural/RuralFinanciero";
import RuralSuenoChocolate from "@/components/rural/RuralSuenoChocolate";

// Especiales
import SpecialProjectsBeneficiaries from "@/components/special-projects/SpecialProjectsBeneficiaries";
import SpecialProjectsInvestment from "@/components/special-projects/SpecialProjectsInvestment";

// Contexto Socioeconómico
import MCVSubsection from "@/components/mcv/MCVSubsection";

// Mapa — se enlaza a /mapa (componente completo con su propio layout)

const sections = [
  { id: "financiero", title: "Financiero", icon: DollarSign, iconColor: "bg-luker-green", color: "from-luker-green/20 to-luker-teal/20" },
  { id: "educacion", title: "Educación", icon: GraduationCap, iconColor: "bg-luker-red", color: "from-luker-red/20 to-luker-orange/20" },
  { id: "emprendimiento", title: "Emprendimiento", icon: Lightbulb, iconColor: "bg-luker-orange", color: "from-luker-orange/20 to-luker-green/20" },
  { id: "desarrollo-rural", title: "Desarrollo Rural", icon: Sprout, iconColor: "bg-luker-green", color: "from-luker-green/20 to-luker-brown/20" },
  { id: "especiales", title: "Especiales", icon: Sparkles, iconColor: "bg-luker-red", color: "from-luker-red/20 to-luker-teal/20" },
  { id: "socioeconomico", title: "Contexto Socioeconómico", icon: TrendingUp, iconColor: "bg-luker-orange", color: "from-luker-orange/20 to-luker-green/20" },
];

// Configuración reusada de las páginas ampliadas
const financialTabs = [
  { id: "inversion-social", label: "Inversión Social", mobile: "Inv. Social", icon: Wallet },
  { id: "funcionamiento", label: "Funcionamiento", mobile: "Func.", icon: Building2 },
];

const educationTabs = [
  { id: "beneficiarios", label: "Participantes", mobile: "Participantes", icon: Users, Component: EducationBeneficiaries },
  { id: "atl", label: "Aprendamos Todos a Leer", mobile: "ATAL", icon: BookOpen, Component: EducationATL },
  { id: "utc", label: "Matrícula técnica UTC", mobile: "UTC", icon: GraduationCap, Component: EducationUTC },
  { id: "socioemocional", label: "Pruebas socioemocionales", mobile: "Socioem.", icon: Brain, Component: EducationSocioemotional },
  { id: "saber-once", label: "Saber Once", mobile: "Saber 11", icon: Award, Component: EducationSaberOnce },
  { id: "mercado-laboral", label: "Mercado laboral", mobile: "Laboral", icon: Briefcase, Component: EducationLaborMarket },
  { id: "datos-contexto", label: "Datos de contexto", mobile: "Contexto", icon: TrendingUp, Component: EducationContext },
];

const ruralTabs = [
  { id: "participantes", label: "Participantes", mobile: "Partic.", icon: UserCheck, Component: RuralBeneficiarios },
  { id: "generacion-r", label: "Generación R", mobile: "Gen R", icon: GraduationCap, Component: RuralGeneracionR },
  { id: "productividad", label: "Productividad", mobile: "Product.", icon: Sprout, Component: RuralProductividad },
  { id: "asociatividad", label: "Asociatividad", mobile: "Asoc.", icon: Users, Component: RuralAsociatividad },
  { id: "social", label: "Social", mobile: "Social", icon: Heart, Component: RuralSocial },
  { id: "financiero", label: "Financiero", mobile: "Financ.", icon: Wallet, Component: RuralFinanciero },
  { id: "sueno-chocolate", label: "Sueño de Chocolate", mobile: "Sueño", icon: Bean, Component: RuralSuenoChocolate },
];

const specialTabs = [
  { id: "beneficiarios", label: "Participantes", mobile: "Partic.", icon: Users, Component: SpecialProjectsBeneficiaries },
  { id: "inversion", label: "Inversión", mobile: "Inversión", icon: Wallet, Component: SpecialProjectsInvestment },
];

const mcvSubsections = [
  { id: "demografia", label: "Demografía", mobile: "Demog.", icon: Users, sectionName: "Demografía", mainIndicator: "DEM.5", description: "Estructura poblacional" },
  { id: "pobreza", label: "Pobreza", mobile: "Pobreza", icon: Wallet, sectionName: "Pobreza", mainIndicator: "POB.6", description: "Indicadores de pobreza y desigualdad" },
  { id: "educacion", label: "Educación", mobile: "Educ.", icon: GraduationCap, sectionName: "Educación", mainIndicator: "EDU.6", description: "Cobertura y calidad educativa" },
  { id: "salud", label: "Salud", mobile: "Salud", icon: Heart, sectionName: "Salud", mainIndicator: "SAL.7", description: "Indicadores de salud pública" },
  { id: "mercado-laboral", label: "Mercado Laboral", mobile: "Laboral", icon: Briefcase, sectionName: "Mercado laboral comparativo", mainIndicator: "MLC.1", description: "Empleo y desempleo" },
  { id: "competitividad", label: "Competitividad", mobile: "Comp.", icon: TrendingUp, sectionName: "Competitividad", mainIndicator: "COM.1", description: "Índices de competitividad" },
];

const ALL_CITIES = [
  "Manizales", "Armenia", "Barranquilla", "Bogotá, D.C.", "Bucaramanga", "Cali", "Cartagena", "Cúcuta",
  "Florencia", "Ibagué", "Medellín", "Montería", "Neiva", "Pasto", "Pereira", "Popayán", "Quibdó",
  "Riohacha", "Santa Marta", "Sincelejo", "Tunja", "Valledupar", "Villavicencio",
];

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const SectionShell = ({
  id,
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  id: string;
  title: string;
  icon: typeof DollarSign;
  iconColor: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 py-10 md:py-14 border-t border-gray-200/70">
    <div className="container mx-auto px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className={`p-3 rounded-2xl ${iconColor} shadow-md`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-luker-brown font-heading">{title}</h2>
      </div>
      {children}
    </div>
  </section>
);

const DatosAbiertos = () => {
  const [financialTab, setFinancialTab] = useState("inversion-social");
  const [educationTab, setEducationTab] = useState("beneficiarios");
  const [ruralTab, setRuralTab] = useState("participantes");
  const [specialTab, setSpecialTab] = useState("beneficiarios");
  const [mcvTab, setMcvTab] = useState("demografia");
  const [mcvEntity, setMcvEntity] = useState("Manizales");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      {/* Header público */}
      <header className="border-b border-gray-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={lukerLogo} alt="Fundación Luker" className="h-10 md:h-12 w-auto object-contain" />
            <div className="hidden sm:block h-8 w-px bg-gray-200" />
            <div className="hidden sm:flex items-center gap-2 text-luker-brown">
              <Shield className="h-4 w-4 text-luker-green" />
              <span className="text-sm font-semibold">Datos Abiertos</span>
            </div>
          </div>
          <span className="text-xs md:text-sm text-gray-500 hidden md:inline">Acceso público</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-luker-green/5 via-luker-orange/5 to-luker-teal/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-luker-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-luker-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-6 py-10 md:py-14 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-sm font-semibold text-white bg-gradient-to-r from-luker-green to-luker-teal px-5 py-2.5 rounded-full shadow-md">
              Transparencia y rendición de cuentas
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-luker-brown leading-tight font-heading">
              Datos abiertos de la{" "}
              <span className="bg-gradient-to-r from-luker-green to-luker-teal bg-clip-text text-transparent">
                Fundación Luker
              </span>
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Consulta libre de los principales indicadores y resultados de nuestros programas sociales.
            </p>
          </div>
        </div>
      </section>

      {/* Barra sticky de accesos rápidos */}
      <div className="sticky top-[65px] z-40 bg-white/95 backdrop-blur-sm border-y border-gray-200/80 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-nowrap gap-2 overflow-x-auto max-w-7xl mx-auto">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="group flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-luker-green/40 hover:shadow-md transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <div className={`p-1.5 rounded-full ${s.iconColor} shadow-sm transform group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-luker-brown font-heading">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Financiero */}
      <SectionShell id="financiero" title="Financiero" icon={DollarSign} iconColor="bg-luker-green">
        <Tabs value={financialTab} onValueChange={setFinancialTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2 mb-6">
            {financialTabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2 data-[state=active]:bg-luker-green data-[state=active]:text-white">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t.label}</span>
                  <span className="md:hidden">{t.mobile}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsContent value="inversion-social" className="mt-0"><SocialInvestmentSection /></TabsContent>
          <TabsContent value="funcionamiento" className="mt-0"><OperatingExpensesSection /></TabsContent>
        </Tabs>
      </SectionShell>

      {/* Educación */}
      <SectionShell id="educacion" title="Educación" icon={GraduationCap} iconColor="bg-luker-red">
        <Tabs value={educationTab} onValueChange={setEducationTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2">
            {educationTabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2 data-[state=active]:bg-luker-red data-[state=active]:text-white">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t.label}</span>
                  <span className="md:hidden">{t.mobile}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="mt-6">
            {educationTabs.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-0"><t.Component /></TabsContent>
            ))}
          </div>
        </Tabs>
      </SectionShell>

      {/* Emprendimiento */}
      <SectionShell id="emprendimiento" title="Emprendimiento" icon={Lightbulb} iconColor="bg-luker-orange">
        <EAPHistoricalCharts />
      </SectionShell>

      {/* Desarrollo Rural */}
      <SectionShell id="desarrollo-rural" title="Desarrollo Rural — El Efecto Cacao" icon={Sprout} iconColor="bg-luker-green">
        <Tabs value={ruralTab} onValueChange={setRuralTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2">
            {ruralTabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2 data-[state=active]:bg-luker-green data-[state=active]:text-white">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t.label}</span>
                  <span className="md:hidden">{t.mobile}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="mt-6">
            {ruralTabs.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-0"><t.Component /></TabsContent>
            ))}
          </div>
        </Tabs>
      </SectionShell>

      {/* Especiales */}
      <SectionShell id="especiales" title="Proyectos Especiales" icon={Star} iconColor="bg-blue-600">
        <Tabs value={specialTab} onValueChange={setSpecialTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2">
            {specialTabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t.label}</span>
                  <span className="md:hidden">{t.mobile}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="mt-6">
            {specialTabs.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-0"><t.Component /></TabsContent>
            ))}
          </div>
        </Tabs>
      </SectionShell>

      {/* Contexto Socioeconómico */}
      <SectionShell id="socioeconomico" title="Contexto Socioeconómico" icon={TrendingUp} iconColor="bg-luker-teal">
        <div className="mb-6 flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-luker-teal" />
            <span className="font-medium text-gray-700">Ciudad:</span>
          </div>
          <Select value={mcvEntity} onValueChange={setMcvEntity}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar ciudad" />
            </SelectTrigger>
            <SelectContent>
              {ALL_CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Tabs value={mcvTab} onValueChange={setMcvTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2">
            {mcvSubsections.map((s) => {
              const Icon = s.icon;
              return (
                <TabsTrigger key={s.id} value={s.id} className="flex items-center gap-2 data-[state=active]:bg-luker-orange data-[state=active]:text-white">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{s.label}</span>
                  <span className="md:hidden">{s.mobile}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="mt-6">
            {mcvSubsections.map((s) => (
              <TabsContent key={s.id} value={s.id} className="mt-0">
                <MCVSubsection
                  sectionName={s.sectionName}
                  mainIndicator={s.mainIndicator}
                  selectedEntity={mcvEntity}
                  title={s.label}
                  description={s.description}
                  icon={s.icon}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </SectionShell>


      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white/95 py-8 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>© 2026 Fundación Luker. Datos abiertos.</p>
            <p>Plataforma de Gestión Estratégica</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DatosAbiertos;
