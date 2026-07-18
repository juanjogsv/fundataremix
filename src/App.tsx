import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AccessGate from "./components/AccessGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StrategicIndicators from "./pages/StrategicIndicators";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Map from "./pages/Map";
import AreaIndicators from "./pages/AreaIndicators";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminDocuments from "./pages/AdminDocuments";
import AdminBiblioteca from "./pages/AdminBiblioteca";
import About from "./pages/About";
import Help from "./pages/Help";
import Financial from "./pages/Financial";
import Education from "./pages/Education";
import Entrepreneurship from "./pages/Entrepreneurship";
import RuralDevelopment from "./pages/RuralDevelopment";
import SpecialProjects from "./pages/SpecialProjects";
import SocioeconomicContext from "./pages/SocioeconomicContext";
import DatosAbiertos from "./pages/DatosAbiertos";


const queryClient = new QueryClient();

const HomeRoute = () => {
  if (window.location.hostname === "datosabiertos.fundacionluker.org.co") {
    return <Navigate to="/datosabiertos" replace />;
  }
  return <Index />;
};

/**
 * GateWrapper — Temporalmente DESACTIVADO por decisión del usuario.
 * El código de acceso queda guardado en `codigos_acceso` + secret `INITIAL_ACCESS_CODE`
 * y el componente `AccessGate` sigue disponible. Para reactivar, reemplaza el cuerpo
 * de esta función por:
 *   const location = useLocation();
 *   const isPublic = location.pathname.startsWith("/datosabiertos") || location.pathname.startsWith("/auth");
 *   if (isPublic) return <>{children}</>;
 *   return <AccessGate>{children}</AccessGate>;
 */
const GateWrapper = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _location = useLocation();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GateWrapper>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/indicadores" element={<StrategicIndicators />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/mapa" element={<Map />} />
            <Route path="/financiero" element={<Financial />} />
            <Route path="/educacion" element={<Education />} />
            <Route path="/emprendimiento" element={<Entrepreneurship />} />
            <Route path="/desarrollo-rural" element={<RuralDevelopment />} />
            <Route path="/especiales" element={<SpecialProjects />} />
            <Route path="/contexto" element={<AreaIndicators />} />
            <Route path="/socioeconomico" element={<SocioeconomicContext />} />
            <Route path="/datosabiertos" element={<DatosAbiertos />} />

            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/documentos" element={<AdminDocuments />} />
            <Route path="/admin/biblioteca" element={<AdminBiblioteca />} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GateWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
