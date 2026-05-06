import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  color: string | null;
  categoria: string | null;
  lugar: string | null;
  hora: string | null;
}

const CATEGORIES = [
  "Educación",
  "Emprendimiento",
  "Desarrollo Rural",
  "Financiero",
  "Especiales",
  "General",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Educación": "#7AC143",
  "Emprendimiento": "#00A0AF",
  "Desarrollo Rural": "#8B4513",
  "Financiero": "#FB8C00",
  "Especiales": "#EF3E42",
  "General": "#572700",
};

const CalendarEventManager = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    categoria: "",
    lugar: "",
    hora: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los eventos",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      categoria: "",
      lugar: "",
      hora: "",
    });
    setEditingEvent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      start_date: event.start_date.split("T")[0],
      end_date: event.end_date ? event.end_date.split("T")[0] : "",
      categoria: event.categoria || "",
      lugar: event.lugar || "",
      hora: event.hora || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El título y la fecha de inicio son obligatorios",
      });
      return;
    }

    setSaving(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        categoria: formData.categoria || null,
        color: formData.categoria ? CATEGORY_COLORS[formData.categoria] || "#572700" : "#572700",
        lugar: formData.lugar || null,
        hora: formData.hora || null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("calendar_events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;

        toast({
          title: "Evento actualizado",
          description: "El evento se ha actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from("calendar_events")
          .insert([eventData]);

        if (error) throw error;

        toast({
          title: "Evento creado",
          description: "El evento se ha creado correctamente",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el evento",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado correctamente",
      });

      fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el evento",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr.split("T")[0] + "T12:00:00"), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/80 border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          Gestión de Eventos del Calendario
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Junta directiva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del evento"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha inicio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    placeholder="Ej: 8:30 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar</Label>
                <Input
                  id="lugar"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  placeholder="Ej: Sala de juntas"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingEvent ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Título</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay eventos registrados
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.start_date)}</TableCell>
                    <TableCell>{event.hora || "-"}</TableCell>
                    <TableCell>
                      {event.categoria ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: event.color || "#572700" }}
                        >
                          {event.categoria}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      {event.lugar || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Total: {events.length} eventos
        </p>
      </CardContent>
    </Card>
  );
};

export default CalendarEventManager;
