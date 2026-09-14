import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  ArrowDown,
} from "lucide-react";
import lukerLogoBrown from "@/assets/fundacion-luker-color-letra-cafe-horizontal.png.asset.json";
import lukerLogoWhite from "@/assets/fundacion-luker-color-letra-blanca-horizontal.png.asset.json";

const ASSET_ORIGIN = "https://id-preview--86b2a9c4-6838-4f82-a3c4-21cb241b504c.lovable.app";
const lukerLogoBrownUrl = `${ASSET_ORIGIN}${lukerLogoBrown.url}`;
const lukerLogoWhiteUrl = `${ASSET_ORIGIN}${lukerLogoWhite.url}`;

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
  { id: "educacion", title: "Educación", icon: GraduationCap, accent: "coral" },
  { id: "emprendimiento", title: "Emprendimiento", icon: Lightbulb, accent: "orange" },
  { id: "desarrollo-rural", title: "Desarrollo Rural", icon: Sprout, accent: "lime" },
  { id: "especiales", title: "Especiales", icon: Sparkles, accent: "teal" },
  { id: "socioeconomico", title: "Contexto Socioeconómico", icon: TrendingUp, accent: "brown" },
];

// Configuración reusada de las páginas ampliadas

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
  accent,
  index,
  children,
}: {
  id: string;
  title: string;
  icon: typeof DollarSign;
  accent: string;
  index: string;
  children: React.ReactNode;
}) => (
  <section id={id} data-accent={accent} className="da-section scroll-mt-36 py-12 md:py-20">
    <div className="container mx-auto px-5 md:px-8">
      <div className="da-section-heading mb-8 md:mb-10">
        <span className="da-section-number" aria-hidden="true">{index}</span>
        <div className="da-section-icon">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="da-eyebrow">Explora los indicadores</p>
          <h2 className="font-heading text-3xl font-extrabold leading-tight md:text-5xl">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  </section>
);

const DatosAbiertos = () => {
  
  const [educationTab, setEducationTab] = useState("beneficiarios");
  const [ruralTab, setRuralTab] = useState("participantes");
  const [specialTab, setSpecialTab] = useState("beneficiarios");
  const [mcvTab, setMcvTab] = useState("demografia");
  const [mcvEntity, setMcvEntity] = useState("Manizales");

  return (
    <div className="datos-abiertos min-h-screen font-sans">
      {/* Header público */}
      <header className="da-header sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-5 md:h-[72px] md:px-8">
          <div className="flex items-center gap-4">
            <img src={lukerLogoBrownUrl} alt="Fundación Luker" className="h-10 w-auto object-contain md:h-12" />
            <div className="da-header-divider hidden h-8 w-px sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-bold">Datos Abiertos</span>
            </div>
          </div>
          <span className="da-public-label">Acceso público</span>
        </div>
      </header>

      {/* Hero */}
      <section className="da-hero relative overflow-hidden">
        <span className="da-hero-letter da-hero-letter-left" aria-hidden="true">d</span>
        <span className="da-hero-letter da-hero-letter-right" aria-hidden="true">a</span>
        <div className="container relative z-10 mx-auto grid min-h-[440px] items-center gap-8 px-5 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-16">
          <div className="max-w-3xl">
            <p className="da-kicker mb-5">Transparencia y rendición de cuentas</p>
            <h1 className="font-heading text-5xl font-black leading-[0.98] md:text-7xl">
              Datos abiertos
              <span className="mt-2 block">Fundación Luker</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed md:text-xl">
              Información para aprender, decidir y transformar. Consulta libremente los principales indicadores y resultados de nuestros programas y la ciudad.
            </p>
          </div>
          <div className="da-hero-index" aria-label="Cinco áreas de información disponibles">
            <span className="da-hero-index-number">05</span>
            <span className="da-hero-index-label">áreas para explorar</span>
            <ArrowDown className="mt-5 h-7 w-7" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Barra sticky de accesos rápidos */}
      <nav aria-label="Secciones de datos abiertos" className="da-quick-nav sticky top-16 z-40 md:top-[72px]">
        <div className="container mx-auto px-5 py-3 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-nowrap gap-2 overflow-x-auto">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <Button
                  key={s.id}
                  variant="outline"
                  onClick={() => scrollToSection(s.id)}
                  data-accent={s.accent}
                  className="da-quick-link h-10 shrink-0 gap-2 px-3 md:px-4"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-heading text-xs font-bold md:text-sm">
                    {s.title}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>


      {/* Educación */}
      <SectionShell id="educacion" title="Educación" icon={GraduationCap} accent="coral" index="01">
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
      <SectionShell id="emprendimiento" title="Emprendimiento" icon={Lightbulb} accent="orange" index="02">
        <EAPHistoricalCharts />
      </SectionShell>

      {/* Desarrollo Rural */}
      <SectionShell id="desarrollo-rural" title="Desarrollo Rural — El Efecto Cacao" icon={Sprout} accent="lime" index="03">
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
      <SectionShell id="especiales" title="Proyectos Especiales" icon={Star} accent="teal" index="04">
        <Tabs value={specialTab} onValueChange={setSpecialTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2">
            {specialTabs.map((t) => {
              const Icon = t.icon;
              return (
              <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2 data-[state=active]:bg-luker-teal data-[state=active]:text-primary-foreground">
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
      <SectionShell id="socioeconomico" title="Contexto Socioeconómico" icon={TrendingUp} accent="brown" index="05">
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
      <footer className="da-footer py-10">
        <div className="container mx-auto px-5 md:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <img src={lukerLogoWhiteUrl} alt="Fundación Luker" className="mb-4 h-12 w-auto object-contain" />
              <p className="text-sm font-semibold">© 2026 Fundación Luker. Datos abiertos.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-lg font-extrabold">Aprender · Decidir · Transformar</p>
              <p className="mt-1 text-sm">Plataforma de Gestión Estratégica</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DatosAbiertos;
