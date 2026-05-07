// Edge function: parses Base Maestra DAMA xlsx and replaces dama_catalog,
// dama_entities and dama_data, then triggers sync_legacy_from_dama().
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "missing file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buf = new Uint8Array(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "array" });

    const need = ["datos", "catalogo_indicadores", "catalogo_entidades"];
    for (const s of need) {
      if (!wb.SheetNames.includes(s)) {
        return new Response(
          JSON.stringify({ error: `sheet '${s}' missing in workbook` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const cat = XLSX.utils.sheet_to_json<any>(wb.Sheets["catalogo_indicadores"]);
    const ent = XLSX.utils.sheet_to_json<any>(wb.Sheets["catalogo_entidades"]);
    const dat = XLSX.utils.sheet_to_json<any>(wb.Sheets["datos"]);

    // Replace catalogs
    await supabase.from("dama_catalog").delete().neq("cod_indicador", "__never__");
    await supabase.from("dama_entities").delete().neq("cod_entidad", "__never__");
    await supabase.from("dama_data").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert catalog
    const catRows = cat.map((r) => ({
      cod_indicador: String(r.cod_indicador).trim(),
      indicador: r.indicador ?? null,
      dimension: r.dimension ?? null,
      seccion: r.seccion ?? null,
      periodicidad: r.periodicidad ?? null,
      fuente: r.fuente ?? null,
      unidad_medida: r.unidad_medida ?? null,
    }));
    if (catRows.length) {
      const { error } = await supabase.from("dama_catalog").insert(catRows);
      if (error) throw error;
    }

    // Insert entities (dedupe by cod_entidad)
    const entMap = new Map<string, string>();
    for (const r of ent) {
      const code = String(r.cod_entidad).trim();
      if (!entMap.has(code)) entMap.set(code, String(r.entidad ?? "").trim());
    }
    const entRows = [...entMap.entries()].map(([cod_entidad, entidad]) => ({
      cod_entidad,
      entidad,
    }));
    if (entRows.length) {
      const { error } = await supabase.from("dama_entities").insert(entRows);
      if (error) throw error;
    }

    // Insert data in chunks
    const chunkSize = 1000;
    let inserted = 0;
    for (let i = 0; i < dat.length; i += chunkSize) {
      const chunk = dat.slice(i, i + chunkSize).map((r) => ({
        cod_indicador: String(r.cod_indicador).trim(),
        cod_entidad: String(r.cod_entidad).trim(),
        anio: Number(r.anio),
        categoria: r.categoria != null ? String(r.categoria) : null,
        categoria_2: r.categoria_2 != null ? String(r.categoria_2) : null,
        valor: r.valor != null && r.valor !== "" ? Number(r.valor) : null,
        fecha_actualizacion: r.fecha_actualizacion
          ? new Date(r.fecha_actualizacion).toISOString().slice(0, 10)
          : null,
      }));
      const { error } = await supabase.from("dama_data").insert(chunk);
      if (error) throw error;
      inserted += chunk.length;
    }

    // Sync legacy tables
    const { error: rpcErr } = await supabase.rpc("sync_legacy_from_dama");
    if (rpcErr) throw rpcErr;

    return new Response(
      JSON.stringify({
        ok: true,
        catalog: catRows.length,
        entities: entRows.length,
        data: inserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("process-dama-upload error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
