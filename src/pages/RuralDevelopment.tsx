import { useState } from "react";
import SeoHead from "@/components/SeoHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, GraduationCap, Users, Heart, Wallet, Bean, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import RuralBeneficiarios from "@/components/rural/RuralBeneficiarios";
import RuralGeneracionR from "@/components/rural/RuralGeneracionR";
import RuralProductividad from "@/components/rural/RuralProductividad";
import RuralAsociatividad from "@/components/rural/RuralAsociatividad";
import RuralSocial from "@/components/rural/RuralSocial";
import RuralFinanciero from "@/components/rural/RuralFinanciero";
import RuralSuenoChocolate from "@/components/rural/RuralSuenoChocolate";

const subsections = [
  {
    id: "participantes",
    label: "Participantes",
    mobileLabel: "Partic.",
    icon: UserCheck,
    description: "Evolución histórica de participantes"
  },
  {
    id: "generacion-r",
    label: "Generación R",
    mobileLabel: "Gen R",
    icon: GraduationCap,
    description: "Programa de formación juvenil"
  },
  {
    id: "productividad",
    label: "Productividad - Efecto Cacao",
    mobileLabel: "Productividad",
    icon: Sprout,
    description: "Indicadores de productividad agrícola"
  },
  {
    id: "asociatividad",
    label: "Asociatividad - Efecto Cacao",
    mobileLabel: "Asociatividad",
    icon: Users,
    description: "Indicadores de asociaciones"
  },
  {
    id: "social",
    label: "Social - Efecto Cacao",
    mobileLabel: "Social",
    icon: Heart,
    description: "Indicadores sociales"
  },
  {
    id: "financiero",
    label: "Financiero - Efecto Cacao",
    mobileLabel: "Financiero",
    icon: Wallet,
    description: "Indicadores financieros"
  },
  {
    id: "sueno-chocolate",
    label: "Sueño de Chocolate",
    mobileLabel: "Sueño",
    icon: Bean,
    description: "Programa Sueño de Chocolate"
  }
];

const RuralDevelopment = () => {
  const [activeTab, setActiveTab] = useState("participantes");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      <SeoHead
        title="Desarrollo Rural — Fundata | Fundación Luker"
        description="El Efecto Cacao: productividad, asociatividad y beneficiarios del programa rural de Fundación Luker."
        path="/desarrollo-rural"
      />
      {/* Header */}
      <PageHeader
        title="Desarrollo Rural"
        subtitle="El Efecto Cacao"
        icon={Sprout}
        iconBgColor="bg-luker-green"
        gradientColors="from-luker-green via-luker-brown to-luker-orange"
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
                  className="flex items-center gap-2 data-[state=active]:bg-luker-green data-[state=active]:text-white"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{section.label}</span>
                  <span className="md:hidden">{section.mobileLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="participantes" className="mt-0">
              <RuralBeneficiarios />
            </TabsContent>

            <TabsContent value="generacion-r" className="mt-0">
              <RuralGeneracionR />
            </TabsContent>

            <TabsContent value="productividad" className="mt-0">
              <RuralProductividad />
            </TabsContent>

            <TabsContent value="asociatividad" className="mt-0">
              <RuralAsociatividad />
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              <RuralSocial />
            </TabsContent>

            <TabsContent value="financiero" className="mt-0">
              <RuralFinanciero />
            </TabsContent>

            <TabsContent value="sueno-chocolate" className="mt-0">
              <RuralSuenoChocolate />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default RuralDevelopment;
