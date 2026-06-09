// Compat helpers: fetch data from the external "Ecosistema de Datos" project
// (catalogo_indicadores, catalogo_entidades, datos_maestros) and reshape rows
// to mimic the legacy `education_indicators` / `mcv_indicators` columns the
// existing components were written against.
//
// This keeps component code minimal — we swap `supabase.from("education_indicators")`
// for `await fetchLegacyIndicators({ codes, ... })` and the row shape is the same.

import { ecosistema } from "./client";

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

export type LegacyEducationRow = {
  id?: string;
  seccion: string | null;
  indicador: string | null;
  cod_indicador: string;
  descripcion?: string | null;
  valor: number | null;
  unidad: string | null;
  departamento: string | null;
  municipio: string | null;
  year: number;
  categoria: string;
  categoria_2: string | null;
};

export type LegacyMCVRow = {
  id?: string;
  base: string;
  seccion: string;
  cod_indicador: string;
  indicador: string;
  categoria: string;
  cod_entidad: string;
  entidad: string;
  dato: number | null;
  year: number;
  periodicidad: string | null;
  fuente: string | null;
  unidad_medida: string | null;
};

// ---------- Catalog / entities (cached per call) -----------------------------

let _catalogCache: Map<string, any> | null = null;
let _entityCache: Map<string, string> | null = null;
let _entityParentCache: Map<string, string> | null = null; // cod_municipio -> cod_dpto

async function getCatalog() {
  if (_catalogCache) return _catalogCache;
  const all: any[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    const from = p * PAGE_SIZE;
    const { data, error } = await ecosistema
      .from("catalogo_indicadores")
      .select("cod_indicador, indicador, seccion, fuente, unidad_medida, periodicidad, dimension")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  _catalogCache = new Map(all.map((c: any) => [c.cod_indicador, c]));
  return _catalogCache;
}

async function getEntities() {
  if (_entityCache) return { byCode: _entityCache, parentByCode: _entityParentCache! };
  const all: any[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    const from = p * PAGE_SIZE;
    const { data, error } = await ecosistema
      .from("catalogo_entidades")
      .select("cod_entidad, entidad")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  _entityCache = new Map(all.map((e: any) => [String(e.cod_entidad), e.entidad]));
  // Map municipality (5-digit) -> department (first 2 digits) entity name
  _entityParentCache = new Map();
  _entityCache.forEach((_name, code) => {
    if (code.length === 5) {
      const dpto = code.substring(0, 2);
      const dptoName = _entityCache!.get(dpto);
      if (dptoName) _entityParentCache!.set(code, dptoName);
    }
  });
  return { byCode: _entityCache, parentByCode: _entityParentCache };
}

// ---------- Generic paginated datos_maestros fetcher ------------------------

async function fetchDataPaginated(builder: (page: number) => any): Promise<any[]> {
  const all: any[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await builder(p).range(from, to);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return all;
}

// ---------- Public API -----------------------------------------------------

export interface FetchLegacyOpts {
  codes: string[];
  year?: number | null;
  yearGte?: number;
  yearLte?: number;
  categoria?: string;
  categoria2?: string;
  cod_entidad?: string;
  // Only return municipalities (cod_entidad with length 5)
  onlyMunicipalities?: boolean;
}

/**
 * Fetches rows from `datos_maestros` and returns them in the legacy
 * `education_indicators` row shape, joining catalog and entities.
 */
export async function fetchLegacyIndicators(opts: FetchLegacyOpts): Promise<LegacyEducationRow[]> {
  const [catalog, entities] = await Promise.all([getCatalog(), getEntities()]);

  const rows = await fetchDataPaginated(() => {
    let q = ecosistema
      .from("datos_maestros")
      .select("cod_indicador, cod_entidad, anio, valor, categoria, categoria_2")
      .in("cod_indicador", opts.codes);
    if (opts.year != null) q = q.eq("anio", opts.year);
    if (opts.yearGte != null) q = q.gte("anio", opts.yearGte);
    if (opts.yearLte != null) q = q.lte("anio", opts.yearLte);
    if (opts.cod_entidad) q = q.eq("cod_entidad", opts.cod_entidad);
    return q;
  });

  const norm = (s: any) => (s ?? "").toString().trim();

  const shaped: LegacyEducationRow[] = rows
    .filter((r) => {
      if (opts.onlyMunicipalities) {
        return String(r.cod_entidad ?? "").length === 5;
      }
      return true;
    })
    .filter((r) => {
      if (opts.categoria != null) {
        const c = norm(r.categoria) || "Total";
        return c.toLowerCase() === opts.categoria.toLowerCase();
      }
      return true;
    })
    .filter((r) => {
      if (opts.categoria2 != null) {
        return norm(r.categoria_2).toLowerCase() === opts.categoria2.toLowerCase();
      }
      return true;
    })
    .map((r) => {
      const cat = catalog.get(r.cod_indicador) as any;
      const codStr = String(r.cod_entidad);
      const entName = entities.byCode.get(codStr) ?? codStr;
      const isMunicipio = codStr.length === 5;
      return {
        seccion: cat?.seccion ?? null,
        indicador: cat?.indicador ?? r.cod_indicador,
        cod_indicador: r.cod_indicador,
        descripcion: cat?.fuente ?? null,
        valor: r.valor != null ? Number(r.valor) : null,
        unidad: cat?.unidad_medida ?? null,
        // Legacy components display `departamento || municipio` — populate
        // `departamento` with the entity's own name so ranking labels match
        // expectations (e.g. "Manizales" not "Caldas").
        departamento: entName,
        municipio: isMunicipio ? entName : null,
        _parentDpto: isMunicipio ? (entities.parentByCode.get(codStr) ?? null) : null,
        year: Number(r.anio),
        categoria: norm(r.categoria) || "Total",
        categoria_2: r.categoria_2 ?? null,
      } as LegacyEducationRow;
    });

  return shaped;
}

// ---------- MCV (socioeconomic) by section --------------------------------

const MCV_SECTION_TO_PREFIXES: Record<string, string[]> = {
  "Demografía": ["POB_"],
  "Pobreza": ["CV_01", "CV_02", "CV_03"],
  "Salud": ["CV_04", "CV_05"],
  "Mercado laboral comparativo": ["ML_", "MLJ_"],
  "Competitividad": ["ECO_"],
};

async function resolveCodesForMCVSection(section: string): Promise<string[]> {
  const prefixes = MCV_SECTION_TO_PREFIXES[section];
  if (!prefixes) return [];
  const catalog = await getCatalog();
  const codes: string[] = [];
  catalog.forEach((_v, code) => {
    if (prefixes.some((p) => (p.endsWith("_") ? code.startsWith(p) : code === p))) {
      codes.push(code);
    }
  });
  return codes;
}

export async function fetchLegacyMCVBySection(
  section: string,
  entityName?: string
): Promise<LegacyMCVRow[]> {
  const [catalog, entities] = await Promise.all([getCatalog(), getEntities()]);
  const codes = await resolveCodesForMCVSection(section);
  if (codes.length === 0) return [];

  // Resolve entity filter to cod_entidad if provided
  let codFilter: string | undefined;
  if (entityName) {
    const target = entityName === "Bogotá, D.C." ? "Bogotá" : entityName;
    for (const [code, name] of entities.byCode.entries()) {
      if (name === target || name === entityName) { codFilter = code; break; }
    }
  }

  const rows = await fetchDataPaginated(() => {
    let q = ecosistema
      .from("datos_maestros")
      .select("cod_indicador, cod_entidad, anio, valor, categoria")
      .in("cod_indicador", codes);
    if (codFilter) q = q.eq("cod_entidad", codFilter);
    return q;
  });

  const normName = (n: string) => (n === "Bogotá" ? "Bogotá, D.C." : n);

  return rows.map((r: any, i: number) => {
    const cat = catalog.get(r.cod_indicador) as any;
    const codStr = String(r.cod_entidad);
    const entName = entities.byCode.get(codStr) ?? codStr;
    return {
      id: `${r.cod_indicador}-${codStr}-${r.anio}-${i}`,
      base: "Contexto socioeconómico",
      seccion: section,
      cod_indicador: r.cod_indicador,
      indicador: cat?.indicador ?? r.cod_indicador,
      categoria: ((r.categoria ?? "").toString().trim() || "Total"),
      cod_entidad: codStr,
      entidad: normName(entName),
      dato: r.valor != null ? Number(r.valor) : null,
      year: Number(r.anio),
      periodicidad: cat?.periodicidad ?? null,
      fuente: cat?.fuente ?? null,
      unidad_medida: cat?.unidad_medida ?? null,
    } as LegacyMCVRow;
  });
}
