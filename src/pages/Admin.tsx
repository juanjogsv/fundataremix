import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, FileSpreadsheet, FolderArchive, Loader2, Database } from "lucide-react";
import UploadATALData from "@/components/admin/UploadATALData";
import UploadMCVData from "@/components/admin/UploadMCVData";
import UploadDamaData from "@/components/admin/UploadDamaData";
import UploadParticipantsData from "@/components/admin/UploadParticipantsData";
import { UploadFinancialData } from "@/components/admin/UploadFinancialData";
import { UploadOperatingExpenses } from "@/components/admin/UploadOperatingExpenses";
import CalendarEventManager from "@/components/admin/CalendarEventManager";
import { ManageLibraryPublications } from "@/components/admin/ManageLibraryPublications";

interface UploadModule {
  id: string;
  title: string;
  description: string;
  acceptedType: string;
  icon: typeof FileSpreadsheet;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [uploadingModules, setUploadingModules] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [currentFile, setCurrentFile] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  const modules: UploadModule[] = [
    {
      id: "indicadores",
      title: "1. Indicadores Estratégicos",
      description: "Columnas: Indicador, Área, Keyword, Unidad, Meta 2025, Acumulado, % Acumulado, Logro 2023, Logro 2024",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "calendario",
      title: "2. Calendario",
      description: "Columnas: Título, Descripción, Fecha inicio, Fecha fin, Color",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "documentos",
      title: "3. Documentos Relevantes",
      description: "Uno o múltiples archivos ZIP con documentos organizados. Puedes seleccionar varios ZIPs a la vez. Cada carpeta con el mismo nombre se sobrescribirá.",
      acceptedType: ".zip",
      icon: FolderArchive,
    },
    {
      id: "inversion_historica",
      title: "4b. Inversión Social Histórica",
      description: "Columnas por año (2012-2024+): Fila 1 = Propios, Fila 2 = Terceros. Valores en pesos.",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "educacion",
      title: "5. Educación",
      description: "Beneficiarios: Base, Sección, Programa, Departamento, Valor, Año (se filtran automáticamente Base='Educación' y 'Formare') | Indicadores: Sección, Indicador, Valor, Meta, Cumplimiento, Año",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "emprendimiento",
      title: "6. Emprendimiento (Indicadores)",
      description: "Misma estructura que Indicadores Estratégicos",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "desarrollo_rural",
      title: "7a. Desarrollo Rural - Indicadores Cacao",
      description: "Columnas: base, sección, cod_indicador, indicador, categoría, cod_entidad, entidad, dato, año, periodicidad, mes_trimestre, fuente, unidad_medida",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "beneficiarios_rural",
      title: "7b. Desarrollo Rural - Beneficiarios",
      description: "Columnas: Base, Sección, Programa, Departamento, cod_entidad, entidad, Categoría, Valor, Año",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "especiales",
      title: "8. Proyectos Especiales",
      description: "Columnas: base, sección, cod_indicador, indicador, categoría, cod_entidad, entidad, dato, año, periodicidad, mes_trimestre, fuente, unidad_medida",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "georreferenciacion",
      title: "9. Georreferenciación",
      description: "Columnas: Nombre, Descripción, Latitud, Longitud, Categoría, Icono",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: "contexto",
      title: "10. Contexto Socioeconómico (Indicadores)",
      description: "Misma estructura que Indicadores Estratégicos",
      acceptedType: ".xlsx",
      icon: FileSpreadsheet,
    },
  ];

  const handleFileUpload = async (moduleId: string, files: FileList) => {
    setUploadingModules(prev => new Set(prev).add(moduleId));
    setUploadProgress(prev => ({ ...prev, [moduleId]: 0 }));

    try {
      const filesArray = Array.from(files);
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setCurrentFile(prev => ({ ...prev, [moduleId]: file.name }));
        
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("moduleId", moduleId);

          const { data, error } = await supabase.functions.invoke("process-upload", {
            body: formData,
          });

          if (error) {
            errorCount++;
            errors.push(`${file.name}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (fileError: any) {
          errorCount++;
          errors.push(`${file.name}: ${fileError.message}`);
        }
        
        // Update progress
        const progress = ((i + 1) / filesArray.length) * 100;
        setUploadProgress(prev => ({ ...prev, [moduleId]: progress }));
      }

      // Show summary toast
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "Carga exitosa",
          description: `${successCount} archivo(s) procesado(s) correctamente.`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Carga parcial",
          description: `${successCount} exitoso(s), ${errorCount} fallido(s). Revisa la consola para detalles.`,
          variant: "destructive",
        });
        console.error("Errores de carga:", errors);
      } else {
        throw new Error(errors.join("\n"));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error en la carga",
        description: error.message || "No se pudieron procesar los archivos",
      });
    } finally {
      setUploadingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[moduleId];
        return newProgress;
      });
      setCurrentFile(prev => {
        const newFiles = { ...prev };
        delete newFiles[moduleId];
        return newFiles;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-border/50">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-card/50 transition-all hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Sistema de carga modular de datos - Fundación Luker
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={() => document.getElementById("dama-panel")?.scrollIntoView({ behavior: "smooth" })}
              className="gap-2 bg-luker-teal hover:bg-luker-teal/90"
            >
              <Database className="h-4 w-4" />
              Panel Maestro DAMA
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/documentos")}
              className="gap-2"
            >
              <FolderArchive className="h-4 w-4" />
              Gestionar Documentos
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/admin/biblioteca", "_blank")}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Gestionar Biblioteca
            </Button>
          </div>
        </div>

        {/* ⭐ DAMA Master Base — single source of truth (default & featured) */}
        <section id="dama-panel" className="space-y-3 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-luker-teal">
              ⭐ Gestión de la Base Maestra DAMA
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Punto de entrada principal del panel. Toda actualización de Educación y
            Contexto Socioeconómico se hace desde aquí.
          </p>
          <UploadDamaData />
        </section>

        {/* Otras cargas operativas */}
        <div className="pt-4 border-t border-border/50">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Otras cargas y herramientas (módulos legacy)
          </h2>
        </div>


        {/* Participants Upload - Full Width */}
        <div className="mb-8">
          <UploadParticipantsData />
        </div>

        {/* Special Upload Components (legacy — kept as backup) */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <UploadATALData />
          <UploadMCVData />
        </div>

        {/* Financial Monthly Uploads */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <UploadFinancialData />
          <UploadOperatingExpenses />
        </div>

        {/* Calendar Event Manager */}
        <div className="mb-8">
          <CalendarEventManager />
        </div>

        {/* Library Publications Manager - Button only, opens in new tab */}

        {/* Upload Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const isUploading = uploadingModules.has(module.id);

            return (
              <Card 
                key={module.id} 
                className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border/50 backdrop-blur-sm bg-card/80"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs md:text-sm">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <Label
                    htmlFor={`file-${module.id}`}
                    className="block cursor-pointer"
                  >
                    <div className={`
                      relative border-2 border-dashed rounded-lg p-8 text-center 
                      transition-all duration-300
                      ${isUploading 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary hover:bg-primary/5 group-hover:border-accent'
                      }
                    `}>
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="relative">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
                          </div>
                          <div className="w-full space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <p className="font-medium text-foreground truncate flex-1">
                                {currentFile[module.id] || "Procesando..."}
                              </p>
                              <p className="text-xs text-muted-foreground ml-2">
                                {Math.round(uploadProgress[module.id] || 0)}%
                              </p>
                            </div>
                            <Progress value={uploadProgress[module.id] || 0} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center">
                              Por favor espere...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="absolute inset-0 blur-xl bg-primary/0 group-hover:bg-primary/20 transition-all" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              Arrastra o click para subir
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                              Formato: {module.acceptedType.toUpperCase()}
                              {module.id === "documentos" && " (múltiples)"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      id={`file-${module.id}`}
                      type="file"
                      accept={module.acceptedType}
                      multiple={module.id === "documentos"}
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleFileUpload(module.id, files);
                          e.target.value = "";
                        }
                      }}
                    />
                  </Label>
                </CardContent>
              </Card>
            );
        })}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  📋 Plantillas de ejemplo disponibles
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Encuentra archivos CSV de ejemplo para cada módulo en <code className="bg-muted px-2 py-0.5 rounded text-xs">public/plantillas/</code>
                </p>
                <div className="bg-accent/5 rounded-md p-3 space-y-2 mb-4">
                  <p className="text-xs font-medium text-foreground">Cómo usar las plantillas:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                    <li>Descarga el archivo CSV del módulo que necesitas</li>
                    <li>Abre en Excel o Google Sheets</li>
                    <li>Edita los datos manteniendo la estructura de columnas</li>
                    <li>Guarda como Excel (.xlsx)</li>
                    <li>Sube el archivo usando los boxes arriba</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Instrucciones de carga
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Cada módulo acepta únicamente archivos Excel (.xlsx) o ZIP según indicado</li>
                  <li>Revisa las columnas requeridas en cada descripción antes de subir</li>
                  <li>La primera fila debe contener los nombres de columnas exactos</li>
                  <li>La carga sobrescribirá los datos existentes del módulo</li>
                  <li>Los archivos pueden tener cualquier nombre</li>
                  <li>Las filas vacías se ignoran automáticamente</li>
                </ul>
              </div>
              
              <div className="pt-3 border-t border-border/30">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  📄 Documentación completa
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Consulta el README.md para ver estructuras detalladas, ejemplos y formatos esperados para cada módulo.
                </p>
                <a 
                  href="/plantillas/README.md" 
                  target="_blank"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Ver documentación completa →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
