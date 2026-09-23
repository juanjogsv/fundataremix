import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Wallet, 
  GraduationCap, 
  Heart, 
  Briefcase, 
  TrendingUp, 
  Shield
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import MCVSubsection from "@/components/mcv/MCVSubsection";

const subsections = [
  {
    id: "demografia",
    label: "Demografía",
    mobileLabel: "Demografía",
    icon: Users,
    sectionName: "Demografía",
    mainIndicator: "DEM.5",
    description: "Estructura poblacional"
  },
  {
    id: "pobreza",
    label: "Pobreza",
    mobileLabel: "Pobreza",
    icon: Wallet,
    sectionName: "Pobreza",
    mainIndicator: "POB.6",
    description: "Indicadores de pobreza y desigualdad"
  },
  {
    id: "educacion",
    label: "Educación",
    mobileLabel: "Educación",
    icon: GraduationCap,
    sectionName: "Educación",
    mainIndicator: "EDU.6",
    description: "Cobertura y calidad educativa"
  },
  {
    id: "salud",
    label: "Salud",
    mobileLabel: "Salud",
    icon: Heart,
    sectionName: "Salud",
    mainIndicator: "SAL.7",
    description: "Indicadores de salud pública"
  },
  {
    id: "mercado-laboral",
    label: "Mercado Laboral",
    mobileLabel: "Laboral",
    icon: Briefcase,
    sectionName: "Mercado laboral comparativo",
    mainIndicator: "MLC.1",
    description: "Empleo y desempleo"
  },
  {
    id: "competitividad",
    label: "Competitividad",
    mobileLabel: "Competitividad",
    icon: TrendingUp,
    sectionName: "Competitividad",
    mainIndicator: "COM.1",
    description: "Índices de competitividad"
  },
];


// List of all 23 cities from mcv_indicators, with Manizales first
// Names match the data uploaded via MCV admin module
const ALL_CITIES = [
  "Manizales",
  "Armenia",
  "Barranquilla",
  "Bogotá, D.C.",
  "Bucaramanga",
  "Cali",
  "Cartagena",
  "Cúcuta",
  "Florencia",
  "Ibagué",
  "Medellín",
  "Montería",
  "Neiva",
  "Pasto",
  "Pereira",
  "Popayán",
  "Quibdó",
  "Riohacha",
  "Santa Marta",
  "Sincelejo",
  "Tunja",
  "Valledupar",
  "Villavicencio"
];

const SocioeconomicContext = () => {
  const [activeTab, setActiveTab] = useState("demografia");
  const [selectedEntity, setSelectedEntity] = useState("Manizales");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="Contexto Socioeconómico"
        mobileTitle="Contexto"
        icon={TrendingUp}
        iconBgColor="bg-luker-teal"
        subtitle="Una lectura comparada de Manizales y otras ciudades"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-[1400px]">
        {/* Global Entity Filter */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-[var(--radius)] border border-border bg-[hsl(var(--filter-surface))] p-4 shadow-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-luker-teal" />
            <span className="font-bold text-foreground">Ciudad:</span>
          </div>
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar ciudad" />
            </SelectTrigger>
            <SelectContent>
              {ALL_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subsections Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex-nowrap overflow-x-auto justify-start gap-2">
            {subsections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{section.label}</span>
                  <span className="md:hidden">{section.mobileLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            {subsections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-0">
                <MCVSubsection
                  sectionName={section.sectionName}
                  mainIndicator={section.mainIndicator}
                  selectedEntity={selectedEntity}
                  title={section.label}
                  description={section.description}
                  icon={section.icon}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SocioeconomicContext;
