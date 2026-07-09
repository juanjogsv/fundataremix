// Edge Function: bd-fundata-sync
// Replica el pipeline n8n del protocolo TEC_PROTOCOLO-BD-002.
// Estrategia: delega el parseo del xlsx a Google (files.copy con conversión
// a Google Sheet), lee via Sheets API en páginas, y elimina el sheet temporal.
// Esto evita el límite de CPU/memoria de las edge functions al procesar xlsx.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const DATA_FOLDER_ID = "188QWfU3Eqjg1QVmZQn7TmWcK979Fz9EJ";
const CAT_INDICADORES_ID = "1BxMNkQByvuGFFNcKMUHddh--9lD4mIg26DcfLUd89VQ";
const CAT_ENTIDADES_ID = "116kMxwBo3m3mtEoPyQ2AQiL8tkxM_A_SHBeCIdkLZhU";
// AAAAMMDD al inicio; el resto del nombre es libre. Debe ser .xlsx.
const FILE_REGEX = /^(\d{8})(?:[_-].*)?\.xlsx$/i;
const GW = "https://connector-gateway.lovable.dev";
const PAGE_ROWS = 20000; // filas por lectura de Sheets

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GOOGLE_DRIVE_API_KEY = Deno.env.get("GOOGLE_DRIVE_API_KEY")!;
const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const driveH = () => ({
  Authorization: `Bearer ${LOVABLE_API_KEY}`,
  "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
});
const sheetsH = () => ({
  Authorization: `Bearer ${LOVABLE_API_KEY}`,
  "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
});

async function updateMeta(patch: Record<string, unknown>) {
  await supabase
    .from("bd_sync_meta")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
}

async function findLatestFile() {
  // Solo .xlsx en la carpeta, no papelera. Ordenamos por nombre desc
  // porque el prefijo AAAAMMDD hace que el nombre alfabéticamente mayor
  // sea siempre el más reciente.
  const q = `'${DATA_FOLDER_ID}' in parents and trashed=false and mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`;
  const url = `${GW}/google_drive/drive/v3/files?fields=${encodeURIComponent(
    "files(id,name,modifiedTime,size,mimeType)"
  )}&orderBy=name%20desc&pageSize=100&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: driveH() });
  if (!res.ok) throw new Error(`Drive list [${res.status}]: ${await res.text()}`);
  const { files } = await res.json();
  const candidates = (files || []).filter((f: any) => FILE_REGEX.test(f.name));
  if (!candidates.length) {
    const seen = (files || []).slice(0, 5).map((f: any) => f.name).join(", ");
    throw new Error(`No .xlsx starting with AAAAMMDD in folder. Seen: [${seen}]`);
  }
  // Desempate: por AAAAMMDD numérico desc, luego modifiedTime desc
  candidates.sort((a: any, b: any) => {
    const da = Number(a.name.match(FILE_REGEX)![1]);
    const db = Number(b.name.match(FILE_REGEX)![1]);
    if (db !== da) return db - da;
    return String(b.modifiedTime).localeCompare(String(a.modifiedTime));
  });
  return candidates[0] as { id: string; name: string; modifiedTime: string; size: string };
}

// Copia el xlsx convirtiéndolo a Google Sheet (Google hace el parseo).
async function convertXlsxToSheet(fileId: string, name: string): Promise<string> {
  const url = `${GW}/google_drive/drive/v3/files/${fileId}/copy?fields=id,name,mimeType`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...driveH(), "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `__tmp_sync_${name.replace(/\.xlsx$/i, "")}`,
      mimeType: "application/vnd.google-apps.spreadsheet",
    }),
  });
  if (!res.ok) throw new Error(`Drive copy [${res.status}]: ${await res.text()}`);
  const j = await res.json();
  return j.id as string;
}

async function deleteFile(fileId: string) {
  try {
    await fetch(`${GW}/google_drive/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: driveH(),
    });
  } catch (e) {
    console.warn("cleanup delete failed:", e);
  }
}

async function sheetMeta(spreadsheetId: string) {
  const url = `${GW}/google_sheets/v4/spreadsheets/${spreadsheetId}?fields=${encodeURIComponent(
    "sheets.properties(title,gridProperties(rowCount,columnCount))"
  )}`;
  const res = await fetch(url, { headers: sheetsH() });
  if (!res.ok) throw new Error(`Sheets meta [${res.status}]: ${await res.text()}`);
  return res.json();
}

async function readRange(spreadsheetId: string, range: string): Promise<any[][]> {
  const url = `${GW}/google_sheets/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`;
  const res = await fetch(url, { headers: sheetsH() });
  if (!res.ok) throw new Error(`Sheets read [${res.status}]: ${await res.text()}`);
  const j = await res.json();
  return (j.values || []) as any[][];
}

function rowsToObjects(rows: any[][]): Record<string, any>[] {
  if (!rows.length) return [];
  const [header, ...rest] = rows;
  return rest
    .filter((r) => r.some((c) => c != null && String(c).trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [String(h).trim(), r[i] ?? ""])));
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

async function chunkedInsert(table: string, rows: any[], chunk = 1000) {
  for (let i = 0; i < rows.length; i += chunk) {
    const { error } = await supabase.from(table).insert(rows.slice(i, i + chunk));
    if (error) throw new Error(`Insert ${table}: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.get("status")) {
    const { data, error } = await supabase.from("bd_sync_meta").select("*").eq("id", 1).single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const permissive = url.searchParams.get("permissive") === "1";
  let tempSheetId: string | null = null;
  try {
    await updateMeta({ status: "running", error_message: null });

    // 1. Ubicar último xlsx
    const file = await findLatestFile();
    console.log(`[sync] latest: ${file.name} (${file.id})`);

    // 2. Leer catálogos
    const [indRows, entRows] = await Promise.all([
      readRange(CAT_INDICADORES_ID, "catalogo_indicadores!A1:Z"),
      readRange(CAT_ENTIDADES_ID, "catalogo_entidades!A1:Z"),
    ]);
    const indicadores = rowsToObjects(indRows);
    const entidades = rowsToObjects(entRows);
    console.log(`[sync] cat: ind=${indicadores.length} ent=${entidades.length}`);

    // 3. Convertir xlsx → Google Sheet (Google parsea)
    tempSheetId = await convertXlsxToSheet(file.id, file.name);
    console.log(`[sync] converted → ${tempSheetId}`);

    // 4. Descubrir hoja y tamaño
    const meta = await sheetMeta(tempSheetId);
    const props = meta?.sheets?.[0]?.properties;
    if (!props) throw new Error("Converted sheet has no worksheets");
    const sheetTitle = props.title as string;
    const totalRows = props.gridProperties?.rowCount ?? 0;
    console.log(`[sync] sheet="${sheetTitle}" rows=${totalRows}`);

    // 5. Leer cabecera
    const headerRows = await readRange(tempSheetId, `'${sheetTitle}'!A1:Z1`);
    const header = (headerRows[0] || []).map((h: any) => String(h ?? "").trim());
    const idx = (k: string) => header.indexOf(k);
    const iInd = idx("cod_indicador"),
      iEnt = idx("cod_entidad"),
      iCat = idx("categoria"),
      iCat2 = idx("categoria_2"),
      iFecha = idx("fecha_actualizacion"),
      iVal = idx("valor"),
      iAnio = idx("anio");
    if (iInd < 0 || iEnt < 0) throw new Error(`Header missing cod_indicador/cod_entidad: ${header.join(",")}`);

    const indSet = new Set(indicadores.map((i) => String(i.cod_indicador).trim()));
    const entSet = new Set(entidades.map((e) => String(e.cod_entidad).trim()));
    const orphansInd = new Set<string>();
    const orphansEnt = new Set<string>();
    const datos: any[] = [];

    // 6. Paginar y normalizar
    for (let start = 2; start <= totalRows; start += PAGE_ROWS) {
      const end = Math.min(start + PAGE_ROWS - 1, totalRows);
      const page = await readRange(tempSheetId, `'${sheetTitle}'!A${start}:Z${end}`);
      for (const r of page) {
        const codInd = r[iInd];
        const codEnt = r[iEnt];
        if (codInd == null || codEnt == null || codInd === "" || codEnt === "") continue;
        const ci = String(codInd).trim();
        const ce = String(codEnt).trim();
        if (!indSet.has(ci)) orphansInd.add(ci);
        if (!entSet.has(ce)) orphansEnt.add(ce);
        datos.push({
          cod_indicador: ci,
          categoria: iCat >= 0 && r[iCat] != null ? String(r[iCat]).trim() : null,
          categoria_2: iCat2 >= 0 && r[iCat2] != null ? String(r[iCat2]).trim() : null,
          cod_entidad: ce,
          fecha_actualizacion: iFecha >= 0 && r[iFecha] != null ? String(r[iFecha]).trim() : null,
          valor: iVal >= 0 ? num(r[iVal]) : null,
          anio: iAnio >= 0 && r[iAnio] != null ? Number(r[iAnio]) : null,
        });
      }
    }
    console.log(`[sync] datos normalizados: ${datos.length}`);

    // 7. Validación referencial DAMA §6
    let orphanWarning: string | null = null;
    if (orphansInd.size || orphansEnt.size) {
      const summary = `Orphan cod_indicador: [${[...orphansInd].slice(0, 20).join(", ")}]. Orphan cod_entidad: [${[...orphansEnt].slice(0, 20).join(", ")}]`;
      if (!permissive) {
        const msg = `Referential integrity failed. ${summary}`;
        await updateMeta({
          status: "error_rollback",
          error_message: msg,
          last_sync_at: new Date().toISOString(),
        });
        await deleteFile(tempSheetId);
        return new Response(JSON.stringify({ ok: false, error: msg }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // modo permissive: filtrar huérfanos
      orphanWarning = `Permissive mode: filtered ${orphansInd.size} orphan indicators and ${orphansEnt.size} orphan entities. ${summary}`;
      console.warn(`[sync] ${orphanWarning}`);
    }

    const datosValidos = permissive
      ? datos.filter((d) => indSet.has(d.cod_indicador) && entSet.has(d.cod_entidad))
      : datos;


    // 8. Volcado: TRUNCATE + INSERT
    await supabase.from("bd_catalogo_indicadores").delete().neq("cod_indicador", "___never___");
    await chunkedInsert(
      "bd_catalogo_indicadores",
      indicadores.map((i) => ({
        cod_indicador: String(i.cod_indicador).trim(),
        indicador: i.indicador ? String(i.indicador) : null,
        dimension: i.dimension ? String(i.dimension) : null,
        seccion: i.seccion ? String(i.seccion) : null,
        periodicidad: i.periodicidad ? String(i.periodicidad) : null,
        fuente: i.fuente ? String(i.fuente) : null,
        unidad_medida: i.unidad_medida ? String(i.unidad_medida) : null,
      }))
    );

    await supabase.from("bd_catalogo_entidades").delete().neq("cod_entidad", "___never___");
    await chunkedInsert(
      "bd_catalogo_entidades",
      entidades.map((e) => ({
        cod_entidad: String(e.cod_entidad).trim(),
        entidad: e.entidad ? String(e.entidad) : null,
      }))
    );

    await supabase.from("bd_datos_cache").delete().neq("id", -1);
    await chunkedInsert("bd_datos_cache", datosValidos);

    // 9. Limpieza
    await deleteFile(tempSheetId);
    tempSheetId = null;

    await updateMeta({
      status: orphanWarning ? "ok_with_warnings" : "ok",
      last_file_id: file.id,
      last_file_name: file.name,
      last_sync_at: new Date().toISOString(),
      rows_ingested: datosValidos.length,
      error_message: orphanWarning,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        file: file.name,
        rows_ingested: datosValidos.length,
        rows_filtered: datos.length - datosValidos.length,
        indicadores: indicadores.length,
        entidades: entidades.length,
        warning: orphanWarning,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync] failed:", msg);
    if (tempSheetId) await deleteFile(tempSheetId);
    await updateMeta({
      status: "error",
      error_message: msg,
      last_sync_at: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
