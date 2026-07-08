import { useState, useEffect, useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, MapPin, Clock, Filter, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  categoria: string | null;
  lugar: string | null;
  hora: string | null;
}

interface DocumentCategory {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  category_id: string | null;
}

// Category colors matching section colors
const categoryColors: Record<string, string> = {
  "Educación": "#7AC143",
  "Emprendimiento": "#00A0AF",
  "Desarrollo Rural": "#8B4513",
  "Financiero": "#FB8C00",
  "Especiales": "#EF3E42",
  "General": "#572700",
};

const getCategoryColor = (categoria: string | null): string => {
  if (!categoria) return categoryColors["General"];
  return categoryColors[categoria] || categoryColors["General"];
};

// Dates from backend come as timestamps in UTC (e.g. 2026-05-07T00:00:00+00:00).
// For calendar positioning we must treat them as "date-only" (YYYY-MM-DD) to avoid timezone day-shifts.
const dateKeyFromTimestamp = (value: string | null | undefined) =>
  value ? String(value).split("T")[0] : "";

const dateKeyFromDate = (date: Date) => format(date, "yyyy-MM-dd");

const localDateFromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const Calendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchDocumentsData();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchDocumentsData = async () => {
    try {
      // Fetch categories that start with "Junta"
      const { data: categoriesData, error: catError } = await supabase
        .from("document_categories")
        .select("*")
        .ilike("name", "Junta%");
      
      if (catError) throw catError;
      setDocumentCategories(categoriesData || []);

      // Fetch documents from those categories
      if (categoriesData && categoriesData.length > 0) {
        const categoryIds = categoriesData.map(c => c.id);
        const { data: docsData, error: docsError } = await supabase
          .from("documents")
          .select("*")
          .in("category_id", categoryIds);
        
        if (docsError) throw docsError;
        setDocuments(docsData || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Parse category name to get the date key
  // Supports formats: "Junta DD/MM/YY", "Junta DDMMYY", "Junta DD-MM-YY"
  const parseCategoryDateKey = (categoryName: string): string | null => {
    // Try format with slashes: "Junta DD/MM/YY" or "Junta D/M/YY"
    let match = categoryName.match(/Junta\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    
    // Try format without separators: "Junta DDMMYY"
    if (!match) {
      match = categoryName.match(/Junta\s+(\d{2})(\d{2})(\d{2})/);
    }
    
    // Try format with dashes: "Junta DD-MM-YY"
    if (!match) {
      match = categoryName.match(/Junta\s+(\d{1,2})-(\d{1,2})-(\d{2,4})/);
    }
    
    if (!match) return null;
    
    const [, day, month, year] = match;
    const yearNum = parseInt(year);
    const fullYear = year.length === 4 ? yearNum : (yearNum < 50 ? 2000 + yearNum : 1900 + yearNum);
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Get documents for an event based on date matching
  const getDocumentsForEvent = (event: CalendarEvent): Document[] => {
    if (!event.title.toLowerCase().includes("junta")) return [];
    
    const eventDateKey = dateKeyFromTimestamp(event.start_date);
    
    // Find category that matches this date
    const matchingCategory = documentCategories.find(cat => {
      const catDateKey = parseCategoryDateKey(cat.name);
      return catDateKey === eventDateKey;
    });

    if (!matchingCategory) return [];
    
    return documents.filter(doc => doc.category_id === matchingCategory.id);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const now = new Date();
  const today = startOfDay(now);

  // Separate upcoming and past events (by local date, ignoring timezone/time)
  const upcomingEvents = events.filter((event) => {
    const key = dateKeyFromTimestamp(event.start_date);
    if (!key) return false;
    return localDateFromKey(key) >= today;
  });

  const pastEvents = events
    .filter((event) => {
      const key = dateKeyFromTimestamp(event.start_date);
      if (!key) return false;
      return localDateFromKey(key) < today;
    })
    .reverse();

  // Get unique categories
  const categories = [...new Set(events.map((e) => e.categoria).filter(Boolean))] as string[];

  // Filter by category
  const filterByCategory = (eventsList: CalendarEvent[]) => {
    if (selectedCategory === "all") return eventsList;
    return eventsList.filter((e) => e.categoria === selectedCategory);
  };

  const filteredUpcoming = filterByCategory(upcomingEvents);
  const filteredPast = filterByCategory(pastEvents);

  const selectedDateKey = date ? dateKeyFromDate(date) : null;

  // Events for selected date in calendar
  const eventsForSelectedDate = selectedDateKey
    ? events.filter((event) => dateKeyFromTimestamp(event.start_date) === selectedDateKey)
    : [];

  // Highlight dates with events in the calendar
  const eventDateKeys = new Set(
    events.map((e) => dateKeyFromTimestamp(e.start_date)).filter(Boolean)
  );

  const EventCard = ({ event }: { event: CalendarEvent }) => {
    const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
    const eventDateKey = dateKeyFromTimestamp(event.start_date);
    const eventDate = localDateFromKey(eventDateKey);
    const categoryColor = getCategoryColor(event.categoria);
    const isPast = eventDate < today;
    const eventDocuments = getDocumentsForEvent(event);
    const hasDocuments = eventDocuments.length > 0;

    return (
      <Card className={`bg-card border-border overflow-hidden ${isPast ? "opacity-60" : ""}`}>
        <div className="flex">
          {/* Date highlight */}
          <div
            className="w-20 flex-shrink-0 flex flex-col items-center justify-center p-3 text-white"
            style={{ backgroundColor: categoryColor }}
          >
            <span className="text-2xl font-bold">{eventDate.getDate()}</span>
            <span className="text-xs uppercase">
              {eventDate.toLocaleDateString("es-ES", { month: "short" })}
            </span>
            <span className="text-xs">{eventDate.getFullYear()}</span>
          </div>

          {/* Event details */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{event.title}</h3>
              {event.categoria && (
                <Badge
                  variant="secondary"
                  className="text-xs whitespace-nowrap"
                  style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                >
                  {event.categoria}
                </Badge>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              {event.hora && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{event.hora}</span>
                </div>
              )}
              {event.lugar && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{event.lugar}</span>
                </div>
              )}
            </div>

            {/* Attachments section */}
            {hasDocuments && (
              <Collapsible open={isAttachmentsOpen} onOpenChange={setIsAttachmentsOpen} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Documentos previos ({eventDocuments.length})</span>
                    </div>
                    {isAttachmentsOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1">
                  {eventDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                        {doc.file_size && (
                          <span className="text-muted-foreground flex-shrink-0">
                            ({formatFileSize(doc.file_size)})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
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
              Calendario de Eventos
            </h1>
            <p className="text-muted-foreground mt-2">Planifica y consulta eventos importantes</p>
          </div>
        </div>

        {/* Filter by category - only show if there are categories */}
        {categories.length > 0 && (
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar picker */}
          <Card className="bg-card border-border lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-border"
                modifiers={{
                  hasEvent: (day) => eventDateKeys.has(dateKeyFromDate(day)),
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    color: "hsl(var(--primary))",
                  },
                }}
              />
            </CardContent>
            
            {/* Events for selected date */}
            {eventsForSelectedDate.length > 0 && (
              <CardContent className="pt-0">
                <h4 className="text-sm font-medium mb-3 text-foreground">
                  {date?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h4>
                <div className="space-y-2">
                  {eventsForSelectedDate.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-2 rounded-lg border border-border text-sm"
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.hora && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {event.hora}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Events list */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">
                  Próximos Eventos ({filteredUpcoming.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Eventos Pasados ({filteredPast.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {filteredUpcoming.length > 0 ? (
                  filteredUpcoming.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No hay eventos próximos
                        {selectedCategory !== "all" && ` en la categoría "${selectedCategory}"`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {filteredPast.length > 0 ? (
                  filteredPast.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No hay eventos pasados
                        {selectedCategory !== "all" && ` en la categoría "${selectedCategory}"`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
