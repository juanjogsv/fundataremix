// Edge function: validar-codigo
// Recibe { codigo } y valida contra hashes en public.codigos_acceso.
// - Nunca loguea ni devuelve el código en texto plano.
// - Si la tabla está vacía y existe INITIAL_ACCESS_CODE en env, se siembra
//   automáticamente en el primer llamado.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PEPPER = Deno.env.get("ACCESS_CODE_PEPPER") ?? "";
const INITIAL_CODE = Deno.env.get("INITIAL_ACCESS_CODE") ?? "";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hashCode(codigo: string): Promise<string> {
  return sha256Hex(`${PEPPER}::${codigo.trim()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const codigo =
    body && typeof body === "object" && "codigo" in body
      ? String((body as { codigo: unknown }).codigo ?? "")
      : "";

  if (!codigo || codigo.length < 3 || codigo.length > 200) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!PEPPER) {
    console.error("ACCESS_CODE_PEPPER no configurado");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Auto-siembra en primer uso si la tabla está vacía y hay INITIAL_ACCESS_CODE
  const { count } = await admin
    .from("codigos_acceso")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) === 0 && INITIAL_CODE) {
    const seedHash = await hashCode(INITIAL_CODE);
    await admin
      .from("codigos_acceso")
      .insert({ codigo_hash: seedHash, descripcion: "Código inicial", activo: true });
  }

  const hash = await hashCode(codigo);

  const { data, error } = await admin
    .from("codigos_acceso")
    .select("id")
    .eq("codigo_hash", hash)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    // Nunca logueamos el código en claro
    console.error("Error consultando codigos_acceso:", error.message);
    return new Response(JSON.stringify({ error: "Lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ valid: Boolean(data) }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
