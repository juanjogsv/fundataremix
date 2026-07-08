import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import SpecialProjectsBeneficiaries from "@/components/special-projects/SpecialProjectsBeneficiaries";
import SpecialProjectsInvestment from "@/components/special-projects/SpecialProjectsInvestment";

const subsections = [
  {
    id: "beneficiarios",
    label: "Participantes",
    mobileLabel: "Partic.",
    icon: Users,
    description: "Evolución histórica de participantes"
  },
  {
    id: "inversion",
    label: "Inversión",
    mobileLabel: "Inversión",
    icon: Wallet,
    description: "Inversión con recursos propios y de terceros"
  }
];

const SpecialProjects = () => {
  const [activeTab, setActiveTab] = useState("beneficiarios");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-white">
      {/* Header */}
      <PageHeader
        title="Proyectos Especiales"
        icon={Star}
        iconBgColor="bg-blue-600"
        gradientColors="from-blue-600 via-blue-500 to-slate-600"
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
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
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
              <SpecialProjectsBeneficiaries />
            </TabsContent>

            <TabsContent value="inversion" className="mt-0">
              <SpecialProjectsInvestment />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SpecialProjects;
