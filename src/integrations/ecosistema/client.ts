// "Ecosistema de Datos" client — ahora apunta al backend interno (Lovable Cloud)
// donde una edge function (bd-fundata-sync) mantiene un caché sincronizado
// desde Google Drive (bd_fundata/) según el protocolo TEC_PROTOCOLO-BD-002.
//
// Los nombres de tablas (`catalogo_indicadores`, `catalogo_entidades`,
// `datos_maestros`) son vistas que hacen alias a las tablas caché
// `bd_catalogo_*` y `bd_datos_cache`, por lo que el resto del frontend
// no requiere cambios.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const ecosistema = createClient<any>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const ECO_TABLES = {
  indicadores: "catalogo_indicadores",
  entidades: "catalogo_entidades",
  datos: "datos_maestros",
} as const;
