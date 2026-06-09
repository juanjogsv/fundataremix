import { useState, useEffect } from "react";
import SeoHead from "@/components/SeoHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen, FileText, Download, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryPublicationsGrid } from "@/components/documents/LibraryPublicationsGrid";

interface DocumentCategory {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category_id: string;
  created_at: string;
}

const Documents = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("document_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const filteredDocuments = selectedCategory
    ? documents.filter((doc) => doc.category_id === selectedCategory)
    : documents;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Format category name: "Junta DDMMYY" -> "Junta DD/MM/YY"
  const formatCategoryName = (name: string): string => {
    const match = name.match(/^(Junta\s*)(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      const [, prefix, day, month, year] = match;
      return `${prefix}${day}/${month}/${year}`;
    }
    return name;
  };

  // Sort categories: Junta folders (newest first), then Actas junta, Informes de gestión, Asamblea
  const sortedCategories = [...categories].sort((a, b) => {
    const isJuntaA = /^Junta\s*\d{6}$/.test(a.name) || /^Junta\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(a.name);
    const isJuntaB = /^Junta\s*\d{6}$/.test(b.name) || /^Junta\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(b.name);
    
    // Both are Junta folders - sort by date (newest first)
    if (isJuntaA && isJuntaB) {
      const getDateFromName = (name: string): Date | null => {
        let match = name.match(/Junta\s*(\d{2})(\d{2})(\d{2})$/);
        if (match) {
          const [, day, month, year] = match;
          const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
        match = name.match(/Junta\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (match) {
          const [, day, month, year] = match;
          const fullYear = year.length === 4 ? parseInt(year) : (parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year));
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
        return null;
      };
      const dateA = getDateFromName(a.name);
      const dateB = getDateFromName(b.name);
      if (dateA && dateB) return dateB.getTime() - dateA.getTime();
      return 0;
    }
    
    // Junta folders come first
    if (isJuntaA && !isJuntaB) return -1;
    if (!isJuntaA && isJuntaB) return 1;
    
    // Custom order for non-Junta categories
    const order = ["Actas junta", "Informes de gestión", "Asamblea"];
    const indexA = order.findIndex(o => a.name.toLowerCase() === o.toLowerCase());
    const indexB = order.findIndex(o => b.name.toLowerCase() === o.toLowerCase());
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Alphabetical for any other categories
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <SeoHead
        title="Documentos — Fundata | Fundación Luker"
        description="Repositorio documental y biblioteca de publicaciones de Fundación Luker."
        path="/documentos"
      />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Documentos y Biblioteca
            </h1>
            <p className="text-muted-foreground mt-2">
              Organiza y accede a tus documentos importantes
            </p>
          </div>
        </div>

        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="biblioteca" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documentos" className="mt-6">
            {selectedCategory ? (
              // Vista de documentos dentro de una carpeta
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCategory(null)}
                      className="hover:bg-muted"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      {formatCategoryName(categories.find(c => c.id === selectedCategory)?.name || "")}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? "s" : ""}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {filteredDocuments.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {doc.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatFileSize(doc.file_size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      Esta carpeta no tiene documentos
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Vista de carpetas
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Carpetas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedCategories.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {sortedCategories.map((category) => {
                        const docCount = documents.filter(d => d.category_id === category.id).length;
                        return (
                          <div
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className="p-4 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                          >
                            <div className="flex flex-col items-center text-center gap-3">
                              <FolderOpen className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                              <div>
                                <h3 className="font-semibold text-sm text-foreground">
                                  {formatCategoryName(category.name)}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {docCount} documento{docCount !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      No hay carpetas disponibles
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="biblioteca" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Biblioteca Fundación Luker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LibraryPublicationsGrid />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documents;