// External "Ecosistema de Datos" Supabase project — read-only.
// Tables: catalogo_indicadores, catalogo_entidades, datos_maestros.
// Shape mirrors the internal dama_catalog / dama_entities / dama_data.
import { createClient } from "@supabase/supabase-js";

const ECOSISTEMA_URL = "https://vbyrqktymwuuzdtvjruz.supabase.co";
const ECOSISTEMA_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieXJxa3R5bXd1dXpkdHZqcnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzA4NzcsImV4cCI6MjA5NDk0Njg3N30.W67WXmYO8f6Dy5AmbhDdOZYpltLhk0RfMqKHrYNH7uc";

// Use untyped client — schema lives in another project, no generated Database type.
export const ecosistema = createClient<any>(ECOSISTEMA_URL, ECOSISTEMA_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Table name constants for clarity at call sites.
export const ECO_TABLES = {
  indicadores: "catalogo_indicadores",
  entidades: "catalogo_entidades",
  datos: "datos_maestros",
} as const;
