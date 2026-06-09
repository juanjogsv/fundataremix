import { useState } from "react";
import SeoHead from "@/components/SeoHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import EAPHistoricalCharts from "@/components/entrepreneurship/EAPHistoricalCharts";

const subsections = [
  {
    id: "eap",
    label: "Empresas de Alto Potencial",
    mobileLabel: "EAP",
    icon: TrendingUp,
    description: "Evolución histórica del programa EAP Manizales"
  }
];

const Entrepreneurship = () => {
  const [activeTab, setActiveTab] = useState("eap");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      <SeoHead
        title="Emprendimiento — Fundata | Fundación Luker"
        description="Ecosistema de emprendimiento y empresas de alto potencial impulsadas por Fundación Luker."
        path="/emprendimiento"
      />
      {/* Header */}
      <PageHeader
        title="Emprendimiento"
        subtitle="Manizales Más"
        icon={BarChart3}
        iconBgColor="bg-luker-orange"
        gradientColors="from-luker-orange via-luker-green to-cyan-500"
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
                  className="flex items-center gap-2 data-[state=active]:bg-luker-orange data-[state=active]:text-white"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{section.label}</span>
                  <span className="md:hidden">{section.mobileLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="eap" className="mt-0">
              <EAPHistoricalCharts />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Entrepreneurship;
