import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Publication {
  id: string;
  title: string;
  category: string | null;
  cover_image_url: string | null;
  external_url: string;
  display_order: number;
}

export function LibraryPublicationsGrid() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Group publications by category
  const groupedPublications = publications.reduce<Record<string, Publication[]>>(
    (acc, pub) => {
      const cat = pub.category || "Otras publicaciones";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(pub);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (publications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <BookOpen className="h-12 w-12" />
        <p className="text-center">No hay publicaciones disponibles.</p>
        <p className="text-xs text-center">
          Los administradores pueden agregar publicaciones desde el panel de administración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6">
      {Object.entries(groupedPublications).map(([category, pubs]) => (
        <section key={category}>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pubs.map((pub) => (
              <a
                key={pub.id}
                href={pub.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Cover image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {pub.cover_image_url ? (
                    <img
                      src={pub.cover_image_url}
                      alt={pub.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <BookOpen className="h-16 w-16 text-primary/40" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow">
                      <ExternalLink className="h-4 w-4" />
                      Ver publicación
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {pub.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
