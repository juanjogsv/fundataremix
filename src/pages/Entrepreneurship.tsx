import { useState } from "react";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="Emprendimiento"
        subtitle="Manizales Más"
        icon={BarChart3}
        iconBgColor="bg-luker-orange"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-[1400px]">
        {/* Subsections Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2">
            {subsections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-2 data-[state=active]:bg-kit-orange data-[state=active]:text-primary-foreground"
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
