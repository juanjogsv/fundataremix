import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChartDownloadButton } from "@/components/ui/chart-download-button";

interface SocialInvestment {
  category: string;
  budget_2025: number;
  executed: number;
  is_parent: boolean;
}

export const InvestmentChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [investments, setInvestments] = useState<SocialInvestment[]>([]);
  const [totalOwn, setTotalOwn] = useState(0);
  const [totalThird, setTotalThird] = useState(0);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from("social_investment")
        .select("category, budget_2025, executed, is_parent")
        .eq("is_parent", true)
        .neq("project_name", "TOTAL");

      if (error) throw error;
      
      if (data) {
        setInvestments(data);
        // Calculate totals from actual executed vs pending
        const totalBudget = data.reduce((sum, item) => sum + item.budget_2025, 0);
        const totalExecuted = data.reduce((sum, item) => sum + item.executed, 0);
        setTotalOwn(totalExecuted);
        setTotalThird(totalBudget - totalExecuted);
      }
    } catch (error) {
      console.error("Error fetching investments:", error);
    }
  };

  // Map long category names to short labels
  const categoryLabels: Record<string, string> = {
    "EDUCACION PARA EL DESARROLLO": "Educación",
    "EMPRENDIMIENTO DE ALTO IMPACTO": "Emprendimiento",
    "PROYECTOS ESPECIALES": "Especiales",
    "PROYECTO ALIANZA LUKER": "Alianza Luker",
    "INCIDENCIA": "Incidencia"
  };

  // Create chart data from real investments
  const chartData = investments.map(inv => ({
    name: categoryLabels[inv.category] || inv.category,
    ejecutado: inv.executed / 1000000, // Convert to millions
    pendiente: (inv.budget_2025 - inv.executed) / 1000000
  }));

  const formatCurrencyMillions = (value: number) => {
    const millions = value / 1000000;
    return `$${new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(millions)} MM`;
  };

  return (
    <Card className="bg-white border-gray-200/60 shadow-sm lg:col-span-2">
      <CardContent className="p-6" ref={chartRef}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-luker-brown">Inversión Social</h3>
            <p className="text-sm text-gray-600 mt-1">Ejecutado vs. Pendiente - 2025</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm mr-24">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-luker-green"></div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Ejecutado</span>
                <span className="font-bold text-gray-900">{formatCurrencyMillions(totalOwn)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-luker-orange"></div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Pendiente</span>
                <span className="font-bold text-gray-900">{formatCurrencyMillions(totalThird)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#666' }} 
              axisLine={{ stroke: '#e0e0e0' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#666' }} 
              axisLine={{ stroke: '#e0e0e0' }}
              label={{ value: 'Millones ($)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#666' }}
            />
          <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`$${value.toFixed(0)} MM`, '']}
            />
            <Bar dataKey="ejecutado" fill="#7AC143" radius={[6, 6, 0, 0]} name="Ejecutado" />
            <Bar dataKey="pendiente" fill="#FBB040" radius={[6, 6, 0, 0]} name="Pendiente" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};