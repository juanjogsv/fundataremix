import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, ExternalLink, Save, Upload, Image, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Publication {
  id: string;
  title: string;
  category: string | null;
  cover_image_url: string | null;
  external_url: string;
  display_order: number;
}

export function ManageLibraryPublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingNewCover, setUploadingNewCover] = useState(false);
  const [uploadingNewDoc, setUploadingNewDoc] = useState(false);
  const [uploadingCoverId, setUploadingCoverId] = useState<string | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Form state for new publication
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newExternalUrl, setNewExternalUrl] = useState("");

  const newCoverInputRef = useRef<HTMLInputElement>(null);
  const newDocInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPublications();
  }, []);

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

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("library-covers")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const uploadDocument = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("library-documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("library-documents")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleNewCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen");
      return;
    }

    setUploadingNewCover(true);
    try {
      const url = await uploadCoverImage(file);
      if (url) {
        setNewCoverUrl(url);
        toast.success("Imagen subida correctamente");
      }
    } catch (error) {
      console.error("Error uploading cover:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingNewCover(false);
      if (newCoverInputRef.current) {
        newCoverInputRef.current.value = "";
      }
    }
  };

  const handleNewDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewDoc(true);
    try {
      const url = await uploadDocument(file);
      if (url) {
        setNewExternalUrl(url);
        toast.success("Documento subido correctamente");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Error al subir el documento");
    } finally {
      setUploadingNewDoc(false);
      if (newDocInputRef.current) {
        newDocInputRef.current.value = "";
      }
    }
  };

  const handleExistingCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    pubId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen");
      return;
    }

    setUploadingCoverId(pubId);
    try {
      const url = await uploadCoverImage(file);
      if (url) {
        handleFieldChange(pubId, "cover_image_url", url);
        toast.success("Imagen subida correctamente");
      }
    } catch (error) {
      console.error("Error uploading cover:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingCoverId(null);
    }
  };

  const handleExistingDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    pubId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocId(pubId);
    try {
      const url = await uploadDocument(file);
      if (url) {
        handleFieldChange(pubId, "external_url", url);
        toast.success("Documento subido correctamente");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Error al subir el documento");
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newExternalUrl.trim()) {
      toast.error("Título y URL/documento son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const maxOrder = publications.length > 0
        ? Math.max(...publications.map((p) => p.display_order))
        : 0;

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
    } catch (error) {
      console.error("Error adding publication:", error);
      toast.error("Error al agregar publicación");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;

    try {
      const { error } = await supabase
        .from("library_publications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPublications(publications.filter((p) => p.id !== id));
      toast.success("Publicación eliminada");
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Error al eliminar publicación");
    }
  };

  const handleFieldChange = (
    id: string,
    field: keyof Publication,
    value: string
  ) => {
    setPublications(
      publications.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
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
    } catch (error) {
      console.error("Error saving publications:", error);
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground p-4">Cargando publicaciones…</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Publicaciones de la Biblioteca</CardTitle>
        {publications.length > 0 && (
          <Button size="sm" onClick={handleSaveAll} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Guardar cambios
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new publication form */}
        <div className="space-y-4 border-b border-border pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="new-title">Título *</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Informe de Calidad de Vida 2024"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-category">Categoría</Label>
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Informes calidad de vida"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Cover image */}
            <div className="space-y-1">
              <Label>Imagen de portada</Label>
              <div className="flex gap-2">
                <Input
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="URL o sube un archivo"
                  className="flex-1"
                />
                <input
                  ref={newCoverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewCoverUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => newCoverInputRef.current?.click()}
                  disabled={uploadingNewCover}
                  title="Subir imagen"
                >
                  {uploadingNewCover ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Document */}
            <div className="space-y-1">
              <Label>Documento / URL *</Label>
              <div className="flex gap-2">
                <Input
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                  placeholder="URL o sube un archivo"
                  className="flex-1"
                />
                <input
                  ref={newDocInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleNewDocUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => newDocInputRef.current?.click()}
                  disabled={uploadingNewDoc}
                  title="Subir documento"
                >
                  {uploadingNewDoc ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleAdd} disabled={saving} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar publicación
          </Button>
        </div>

        {/* List of existing publications */}
        {publications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay publicaciones. Agrega una arriba.
          </p>
        ) : (
          <div className="space-y-3">
            {publications.map((pub, idx) => (
              <ExistingPublicationRow
                key={pub.id}
                pub={pub}
                idx={idx}
                uploadingCoverId={uploadingCoverId}
                uploadingDocId={uploadingDocId}
                onFieldChange={handleFieldChange}
                onCoverUpload={handleExistingCoverUpload}
                onDocUpload={handleExistingDocUpload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ExistingPublicationRowProps {
  pub: Publication;
  idx: number;
  uploadingCoverId: string | null;
  uploadingDocId: string | null;
  onFieldChange: (id: string, field: keyof Publication, value: string) => void;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>, pubId: string) => void;
  onDocUpload: (e: React.ChangeEvent<HTMLInputElement>, pubId: string) => void;
  onDelete: (id: string) => void;
}

function ExistingPublicationRow({
  pub,
  idx,
  uploadingCoverId,
  uploadingDocId,
  onFieldChange,
  onCoverUpload,
  onDocUpload,
  onDelete,
}: ExistingPublicationRowProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const isUploadingCover = uploadingCoverId === pub.id;
  const isUploadingDoc = uploadingDocId === pub.id;

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <GripVertical className="h-4 w-4" />
          <span>#{idx + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild title="Ver documento">
            <a href={pub.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(pub.id)} title="Eliminar">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={pub.title}
          onChange={(e) => onFieldChange(pub.id, "title", e.target.value)}
          placeholder="Título"
        />
        <Input
          value={pub.category || ""}
          onChange={(e) => onFieldChange(pub.id, "category", e.target.value)}
          placeholder="Categoría"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Cover */}
        <div className="flex gap-2">
          <Input
            value={pub.cover_image_url || ""}
            onChange={(e) => onFieldChange(pub.id, "cover_image_url", e.target.value)}
            placeholder="URL portada"
            className="flex-1"
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onCoverUpload(e, pub.id)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            title="Subir imagen"
          >
            {isUploadingCover ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Document */}
        <div className="flex gap-2">
          <Input
            value={pub.external_url}
            onChange={(e) => onFieldChange(pub.id, "external_url", e.target.value)}
            placeholder="URL documento"
            className="flex-1"
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => onDocUpload(e, pub.id)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => docInputRef.current?.click()}
            disabled={isUploadingDoc}
            title="Subir documento"
          >
            {isUploadingDoc ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
