import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, ExternalLink, Save, Image, Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Publication {
  id: string;
  title: string;
  category: string | null;
  cover_image_url: string | null;
  external_url: string;
  display_order: number;
}

const AdminBiblioteca = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCoverId, setUploadingCoverId] = useState<string | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Form state for new publication
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newExternalUrl, setNewExternalUrl] = useState("");
  const [uploadingNewCover, setUploadingNewCover] = useState(false);
  const [uploadingNewDoc, setUploadingNewDoc] = useState(false);

  const newCoverInputRef = useRef<HTMLInputElement>(null);
  const newDocInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPublications();
    }
  }, [user, isAdmin]);

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from("library_publications")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error("Error fetching publications:", error);
      toast.error("Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("library-covers")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("library-covers")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const uploadDocument = async (file: File): Promise<string | null> => {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("library-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("library-documents")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleNewCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida");
      return;
    }
    setUploadingNewCover(true);
    try {
      const url = await uploadCoverImage(file);
      if (url) setNewCoverUrl(url);
      toast.success("Imagen subida");
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploadingNewCover(false);
      if (newCoverInputRef.current) newCoverInputRef.current.value = "";
    }
  };

  const handleNewDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNewDoc(true);
    try {
      const url = await uploadDocument(file);
      if (url) setNewExternalUrl(url);
      toast.success("Documento subido");
    } catch {
      toast.error("Error al subir documento");
    } finally {
      setUploadingNewDoc(false);
      if (newDocInputRef.current) newDocInputRef.current.value = "";
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newExternalUrl.trim()) {
      toast.error("Título y documento/URL son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const maxOrder = publications.length > 0 ? Math.max(...publications.map((p) => p.display_order)) : 0;
      const { data, error } = await supabase
        .from("library_publications")
        .insert({
          title: newTitle.trim(),
          category: newCategory.trim() || null,
          cover_image_url: newCoverUrl.trim() || null,
          external_url: newExternalUrl.trim(),
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      setPublications([...publications, data]);
      setNewTitle("");
      setNewCategory("");
      setNewCoverUrl("");
      setNewExternalUrl("");
      toast.success("Publicación agregada");
    } catch {
      toast.error("Error al agregar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    try {
      const { error } = await supabase.from("library_publications").delete().eq("id", id);
      if (error) throw error;
      setPublications(publications.filter((p) => p.id !== id));
      toast.success("Eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleFieldChange = (id: string, field: keyof Publication, value: string) => {
    setPublications(publications.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const pub of publications) {
        const { error } = await supabase
          .from("library_publications")
          .update({
            title: pub.title,
            category: pub.category,
            cover_image_url: pub.cover_image_url,
            external_url: pub.external_url,
            display_order: pub.display_order,
          })
          .eq("id", pub.id);
        if (error) throw error;
      }
      toast.success("Cambios guardados");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={() => window.close()} title="Cerrar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gestionar Biblioteca
            </h1>
            <p className="text-muted-foreground text-sm">
              Administra las publicaciones de la biblioteca
            </p>
          </div>
          {publications.length > 0 && (
            <Button onClick={handleSaveAll} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
          )}
        </div>

        {/* Add new publication - compact form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agregar nueva publicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-end">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título *"
                className="w-40 md:w-52"
              />
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Categoría"
                className="w-32 md:w-40"
              />
              <div className="flex gap-1 items-center">
                <Input
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="URL portada"
                  className="w-32 md:w-40"
                />
                <input ref={newCoverInputRef} type="file" accept="image/*" onChange={handleNewCoverUpload} className="hidden" />
                <Button variant="outline" size="icon" onClick={() => newCoverInputRef.current?.click()} disabled={uploadingNewCover} title="Subir imagen">
                  {uploadingNewCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-1 items-center">
                <Input
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                  placeholder="Documento/URL *"
                  className="w-36 md:w-48"
                />
                <input ref={newDocInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleNewDocUpload} className="hidden" />
                <Button variant="outline" size="icon" onClick={() => newDocInputRef.current?.click()} disabled={uploadingNewDoc} title="Subir documento">
                  {uploadingNewDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleAdd} disabled={saving} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compact table of publications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Publicaciones ({publications.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {publications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay publicaciones.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Portada</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publications.map((pub, idx) => (
                      <CompactPublicationRow
                        key={pub.id}
                        pub={pub}
                        idx={idx}
                        uploadingCoverId={uploadingCoverId}
                        uploadingDocId={uploadingDocId}
                        onFieldChange={handleFieldChange}
                        onCoverUpload={async (e, id) => {
                          const file = e.target.files?.[0];
                          if (!file || !file.type.startsWith("image/")) return;
                          setUploadingCoverId(id);
                          try {
                            const url = await uploadCoverImage(file);
                            if (url) handleFieldChange(id, "cover_image_url", url);
                            toast.success("Imagen subida");
                          } catch {
                            toast.error("Error");
                          } finally {
                            setUploadingCoverId(null);
                          }
                        }}
                        onDocUpload={async (e, id) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingDocId(id);
                          try {
                            const url = await uploadDocument(file);
                            if (url) handleFieldChange(id, "external_url", url);
                            toast.success("Documento subido");
                          } catch {
                            toast.error("Error");
                          } finally {
                            setUploadingDocId(null);
                          }
                        }}
                        onDelete={handleDelete}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface CompactRowProps {
  pub: Publication;
  idx: number;
  uploadingCoverId: string | null;
  uploadingDocId: string | null;
  onFieldChange: (id: string, field: keyof Publication, value: string) => void;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onDocUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onDelete: (id: string) => void;
}

function CompactPublicationRow({ pub, idx, uploadingCoverId, uploadingDocId, onFieldChange, onCoverUpload, onDocUpload, onDelete }: CompactRowProps) {
  const coverRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const isUploadingCover = uploadingCoverId === pub.id;
  const isUploadingDoc = uploadingDocId === pub.id;

  return (
    <TableRow className="text-sm">
      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
      <TableCell>
        <Input
          value={pub.title}
          onChange={(e) => onFieldChange(pub.id, "title", e.target.value)}
          className="h-8 text-sm"
        />
      </TableCell>
      <TableCell>
        <Input
          value={pub.category || ""}
          onChange={(e) => onFieldChange(pub.id, "category", e.target.value)}
          className="h-8 text-sm w-28"
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1 items-center">
          <Input
            value={pub.cover_image_url || ""}
            onChange={(e) => onFieldChange(pub.id, "cover_image_url", e.target.value)}
            className="h-8 text-xs w-24"
            placeholder="URL"
          />
          <input ref={coverRef} type="file" accept="image/*" onChange={(e) => onCoverUpload(e, pub.id)} className="hidden" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => coverRef.current?.click()} disabled={isUploadingCover}>
            {isUploadingCover ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />}
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 items-center">
          <Input
            value={pub.external_url}
            onChange={(e) => onFieldChange(pub.id, "external_url", e.target.value)}
            className="h-8 text-xs w-28"
            placeholder="URL"
          />
          <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(e) => onDocUpload(e, pub.id)} className="hidden" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => docRef.current?.click()} disabled={isUploadingDoc}>
            {isUploadingDoc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Ver">
            <a href={pub.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(pub.id)} title="Eliminar">
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default AdminBiblioteca;
