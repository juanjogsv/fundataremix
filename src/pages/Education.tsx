import { useState } from "react";
import SeoHead from "@/components/SeoHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Brain, Award, TrendingUp, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import EducationBeneficiaries from "@/components/education/EducationBeneficiaries";
import EducationATL from "@/components/education/EducationATL";
import EducationUTC from "@/components/education/EducationUTC";
import EducationSocioemotional from "@/components/education/EducationSocioemotional";
import EducationSaberOnce from "@/components/education/EducationSaberOnce";
import EducationLaborMarket from "@/components/education/EducationLaborMarket";
import EducationContext from "@/components/education/EducationContext";

const subsections = [
  {
    id: "beneficiarios",
    label: "Participantes",
    mobileLabel: "Participantes",
    icon: Users,
    description: "Participantes del programa"
  },
  {
    id: "atl",
    label: "Aprendamos Todos a Leer",
    mobileLabel: "ATAL",
    icon: BookOpen,
    description: "Programa de lectoescritura"
  },
  {
    id: "utc",
    label: "Matrícula técnica UTC",
    mobileLabel: "UTC",
    icon: GraduationCap,
    description: "Matrícula en programas técnicos"
  },
  {
    id: "socioemocional",
    label: "Pruebas socioemocionales",
    mobileLabel: "Socioemocionales",
    icon: Brain,
    description: "Evaluación socioemocional"
  },
  {
    id: "saber-once",
    label: "Saber Once",
    mobileLabel: "Saber 11",
    icon: Award,
    description: "Resultados Saber 11"
  },
  {
    id: "mercado-laboral",
    label: "Mercado laboral egresados",
    mobileLabel: "Mercado Laboral",
    icon: Briefcase,
    description: "Inserción laboral juvenil"
  },
  {
    id: "datos-contexto",
    label: "Datos de contexto",
    mobileLabel: "Contexto",
    icon: TrendingUp,
    description: "Indicadores de contexto educativo"
  }
];

const Education = () => {
  const [activeTab, setActiveTab] = useState("beneficiarios");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      <SeoHead
        title="Educación — Fundata | Fundación Luker"
        description="Programas educativos de Fundación Luker: beneficiarios, ATAL, UTC, pruebas Saber 11 y desarrollo socioemocional."
        path="/educacion"
      />
      {/* Header */}
      <PageHeader
        title="Educación"
        icon={GraduationCap}
        iconBgColor="bg-luker-teal"
        gradientColors="from-luker-teal via-luker-green to-luker-orange"
      />

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* Subsections Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2">
            {subsections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-2 data-[state=active]:bg-luker-red data-[state=active]:text-white"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{section.label}</span>
                  <span className="md:hidden">{section.mobileLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="beneficiarios" className="mt-0">
              <EducationBeneficiaries />
            </TabsContent>

            <TabsContent value="atl" className="mt-0">
              <EducationATL />
            </TabsContent>

            <TabsContent value="utc" className="mt-0">
              <EducationUTC />
            </TabsContent>

            <TabsContent value="socioemocional" className="mt-0">
              <EducationSocioemotional />
            </TabsContent>

            <TabsContent value="saber-once" className="mt-0">
              <EducationSaberOnce />
            </TabsContent>

            <TabsContent value="mercado-laboral" className="mt-0">
              <EducationLaborMarket />
            </TabsContent>

            <TabsContent value="datos-contexto" className="mt-0">
              <EducationContext />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Education;
