import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FolderOpen, Trash2, Calendar, Loader2, Upload, Pencil, Plus, Check, X, FolderPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentFolder {
  id: string;
  name: string;
  created_at: string;
  document_count: number;
  last_updated: string;
}

const AdminDocuments = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<DocumentFolder | null>(null);
  
  // Edit folder name state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [savingFolderName, setSavingFolderName] = useState(false);
  
  // Upload files state
  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // New folder creation state
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderFiles, setNewFolderFiles] = useState<FileList | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const newFolderFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    } else if (user && isAdmin) {
      fetchFolders();
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchFolders = async () => {
    try {
      setLoadingFolders(true);
      
      // Get all categories with document count
      const { data: categories, error: categoriesError } = await supabase
        .from("document_categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoriesError) throw categoriesError;

      // Get document counts for each category
      const foldersWithCounts = await Promise.all(
        (categories || []).map(async (category) => {
          const { data: docs, error: docsError } = await supabase
            .from("documents")
            .select("created_at")
            .eq("category_id", category.id);

          if (docsError) {
            console.error("Error fetching docs:", docsError);
            return null;
          }

          // Find latest document update
          const lastUpdated = docs && docs.length > 0
            ? docs.reduce((latest, doc) => {
                return new Date(doc.created_at) > new Date(latest) ? doc.created_at : latest;
              }, docs[0].created_at)
            : category.created_at;

          return {
            id: category.id,
            name: category.name,
            created_at: category.created_at,
            document_count: docs?.length || 0,
            last_updated: lastUpdated,
          };
        })
      );

      setFolders(foldersWithCounts.filter((f): f is DocumentFolder => f !== null));
    } catch (error: any) {
      console.error("Error fetching folders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las carpetas",
      });
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleEditFolderName = (folder: DocumentFolder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingFolderName("");
  };

  const handleSaveFolderName = async (folderId: string) => {
    if (!editingFolderName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la carpeta no puede estar vacío",
      });
      return;
    }

    try {
      setSavingFolderName(true);
      
      const { error } = await supabase
        .from("document_categories")
        .update({ name: editingFolderName.trim() })
        .eq("id", folderId);

      if (error) throw error;

      toast({
        title: "Nombre actualizado",
        description: "El nombre de la carpeta se ha actualizado correctamente",
      });

      setEditingFolderId(null);
      setEditingFolderName("");
      await fetchFolders();
    } catch (error: any) {
      console.error("Error updating folder name:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el nombre",
      });
    } finally {
      setSavingFolderName(false);
    }
  };

  const handleUploadFiles = async (folderId: string, files: FileList) => {
    try {
      setUploadingFolderId(folderId);
      setUploadProgress(0);

      const filesArray = Array.from(files);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        
        // Sanear el nombre para Supabase Storage (solo ASCII)
        const safeName = `${Date.now()}_${i}_${sanitizeFileName(file.name)}`;
        const filePath = `documents/${folderId}/${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          errorCount++;
          continue;
        }

        // Insert document record (mantenemos el nombre original visible)
        const { error: insertError } = await supabase
          .from("documents")
          .insert({
            name: file.name,
            file_path: filePath,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            category_id: folderId,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          errorCount++;
        } else {
          successCount++;
        }

        setUploadProgress(((i + 1) / filesArray.length) * 100);
      }

      if (successCount > 0) {
        toast({
          title: "Archivos subidos",
          description: `${successCount} archivo(s) subido(s) correctamente${errorCount > 0 ? `, ${errorCount} fallido(s)` : ""}`,
        });
        await fetchFolders();
      } else {
        throw new Error("No se pudo subir ningún archivo");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron subir los archivos",
      });
    } finally {
      setUploadingFolderId(null);
      setUploadProgress(0);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      setDeletingId(folderToDelete.id);

      const { error } = await supabase.functions.invoke("delete-document-folder", {
        body: { categoryId: folderToDelete.id },
      });

      if (error) throw error;

      toast({
        title: "Carpeta eliminada",
        description: `La carpeta "${folderToDelete.name}" ha sido eliminada exitosamente`,
      });

      // Refresh folders list
      await fetchFolders();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la carpeta",
      });
    } finally {
      setDeletingId(null);
      setFolderToDelete(null);
    }
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la carpeta es requerido",
      });
      return;
    }

    if (!newFolderFiles || newFolderFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un archivo",
      });
      return;
    }

    try {
      setCreatingFolder(true);
      setCreateProgress(0);

      // Create the category first
      const { data: category, error: categoryError } = await supabase
        .from("document_categories")
        .insert({ name: newFolderName.trim() })
        .select()
        .single();

      if (categoryError) throw categoryError;

      const folderId = category.id;
      const filesArray = Array.from(newFolderFiles);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        
        // Sanear el nombre para Supabase Storage (solo ASCII)
        const safeName = `${Date.now()}_${i}_${sanitizeFileName(file.name)}`;
        const filePath = `documents/${folderId}/${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          errorCount++;
          continue;
        }

        // Insert document record (mantenemos el nombre original visible)
        const { error: insertError } = await supabase
          .from("documents")
          .insert({
            name: file.name,
            file_path: filePath,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            category_id: folderId,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          errorCount++;
        } else {
          successCount++;
        }

        setCreateProgress(((i + 1) / filesArray.length) * 100);
      }

      if (successCount > 0) {
        toast({
          title: "Carpeta creada",
          description: `Carpeta "${newFolderName}" creada con ${successCount} archivo(s)${errorCount > 0 ? `, ${errorCount} fallido(s)` : ""}`,
        });
        
        // Reset and close dialog
        setShowNewFolderDialog(false);
        setNewFolderName("");
        setNewFolderFiles(null);
        if (newFolderFileInputRef.current) {
          newFolderFileInputRef.current.value = "";
        }
        
        await fetchFolders();
      } else {
        // If no files were uploaded, delete the category
        await supabase.from("document_categories").delete().eq("id", folderId);
        throw new Error("No se pudo subir ningún archivo");
      }
    } catch (error: any) {
      console.error("Create folder error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la carpeta",
      });
    } finally {
      setCreatingFolder(false);
      setCreateProgress(0);
    }
  };

  const sanitizeFileName = (fileName: string) => {
    // Separar nombre y extensión
    const lastDot = fileName.lastIndexOf(".");
    const name = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
    const ext = lastDot > 0 ? fileName.substring(lastDot) : "";

    // Quitar acentos/diacríticos y reemplazar caracteres no permitidos por Storage
    const normalized = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
      .replace(/[^a-zA-Z0-9._-]/g, "_") // solo ASCII seguro
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    return `${normalized || "archivo"}${ext.toLowerCase()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading || loadingFolders) {
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
            onClick={() => navigate("/admin")}
            className="hover:bg-card/50 transition-all hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Gestión de Documentos
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Administra las carpetas de documentos relevantes
            </p>
          </div>
          <Button
            onClick={() => setShowNewFolderDialog(true)}
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Subir nueva carpeta
          </Button>
        </div>

        {/* Folders Grid */}
        {folders.length === 0 ? (
          <Card className="border-border/50 backdrop-blur-sm bg-card/80">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No hay carpetas</h3>
                  <p className="text-muted-foreground mt-2">
                    Crea tu primera carpeta de documentos
                  </p>
                </div>
                <Button onClick={() => setShowNewFolderDialog(true)} className="mt-4 gap-2">
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder, index) => (
              <Card
                key={folder.id}
                className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border/50 backdrop-blur-sm bg-card/80"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="relative pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FolderOpen className="h-6 w-6 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingFolderId === folder.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingFolderName}
                            onChange={(e) => setEditingFolderName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveFolderName(folder.id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveFolderName(folder.id)}
                            disabled={savingFolderName}
                          >
                            {savingFolderName ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleCancelEdit}
                            disabled={savingFolderName}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {folder.name}
                          </CardTitle>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditFolderName(folder)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <CardDescription className="mt-1 text-xs">
                        {folder.document_count} documento{folder.document_count !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-4">
                  {uploadingFolderId === folder.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subiendo archivos...</span>
                        <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">
                            Actualizado: {formatDate(folder.last_updated)}
                          </span>
                        </div>
                      </div>

                      {/* Upload more files */}
                      <div className="pt-2 border-t border-border/50">
                        <label
                          htmlFor={`upload-${folder.id}`}
                          className="flex items-center justify-center gap-2 py-2 px-3 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Agregar archivos</span>
                        </label>
                        <input
                          ref={(el) => (fileInputRefs.current[folder.id] = el)}
                          id={`upload-${folder.id}`}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleUploadFiles(folder.id, e.target.files);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate("/documentos")}
                    >
                      Ver documentos
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setFolderToDelete(folder)}
                      disabled={deletingId === folder.id || uploadingFolderId === folder.id}
                    >
                      {deletingId === folder.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">ℹ️ Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Editar nombre:</strong> Haz clic en el icono de lápiz junto al nombre de la carpeta 
              para cambiar su nombre.
            </p>
            <p>
              <strong>Agregar archivos:</strong> Usa el botón "Agregar archivos" en cada carpeta para 
              subir documentos adicionales sin afectar los existentes.
            </p>
            <p>
              <strong>Nueva carpeta:</strong> Usa el botón "Subir nueva carpeta" para crear una nueva 
              carpeta y subir documentos directamente.
            </p>
            <p>
              <strong>Eliminar:</strong> Al eliminar una carpeta, se eliminarán todos los documentos 
              contenidos y sus archivos del almacenamiento. Esta acción no se puede deshacer.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar carpeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la carpeta <strong>"{folderToDelete?.name}"</strong> y todos 
              sus {folderToDelete?.document_count} documento(s). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              Nueva Carpeta
            </DialogTitle>
            <DialogDescription>
              Crea una nueva carpeta y sube los documentos que desees incluir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nombre de la carpeta</Label>
              <Input
                id="folder-name"
                placeholder="Ej: Junta 15/03/26"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                disabled={creatingFolder}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder-files">Archivos</Label>
              <div className="flex flex-col gap-2">
                <Input
                  ref={newFolderFileInputRef}
                  id="folder-files"
                  type="file"
                  multiple
                  onChange={(e) => setNewFolderFiles(e.target.files)}
                  disabled={creatingFolder}
                  className="cursor-pointer"
                />
                {newFolderFiles && newFolderFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {newFolderFiles.length} archivo(s) seleccionado(s)
                  </p>
                )}
              </div>
            </div>

            {creatingFolder && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subiendo archivos...</span>
                  <span className="text-muted-foreground">{Math.round(createProgress)}%</span>
                </div>
                <Progress value={createProgress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewFolderDialog(false);
                setNewFolderName("");
                setNewFolderFiles(null);
              }}
              disabled={creatingFolder}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNewFolder}
              disabled={creatingFolder || !newFolderName.trim() || !newFolderFiles?.length}
            >
              {creatingFolder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Crear carpeta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocuments;
