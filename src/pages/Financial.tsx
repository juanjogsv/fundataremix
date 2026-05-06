import { useState } from "react";
import { DollarSign, Wallet, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { SocialInvestmentSection } from "@/components/financial/SocialInvestmentSection";
import { OperatingExpensesSection } from "@/components/financial/OperatingExpensesSection";

const subsections = [
  {
    id: "inversion-social",
    label: "Inversión Social",
    mobileLabel: "Inv. Social",
    icon: Wallet,
  },
  {
    id: "funcionamiento",
    label: "Funcionamiento",
    mobileLabel: "Func.",
    icon: Building2,
  },
];

const Financial = () => {
  const [activeTab, setActiveTab] = useState("inversion-social");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      {/* Header */}
      <PageHeader
        title="Financiero"
        icon={DollarSign}
        iconBgColor="bg-luker-green"
        gradientColors="from-luker-green via-emerald-500 to-teal-500"
      />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Subsections Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-white border border-gray-200 p-2 mb-6">
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

          <TabsContent value="inversion-social" className="mt-0">
            <SocialInvestmentSection />
          </TabsContent>

          <TabsContent value="funcionamiento" className="mt-0">
            <OperatingExpensesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Financial;
