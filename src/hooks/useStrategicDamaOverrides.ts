import { useQuery } from "@tanstack/react-query";
import { ecosistema } from "@/integrations/ecosistema/client";

const MANIZALES_COD = "17001";

export interface DamaOverride {
  keyword: string;
  value: number;
  year: number;
  codIndicador: string;
}

/**
 * Fuente prioritaria: sincronización de Google Drive (DAMA / datos_maestros).
 * Devuelve el valor real por keyword estratégica para los indicadores
 * que ya existen en la base maestra, por año disponible.
 */
export function useStrategicDamaOverrides() {
  return useQuery({
    queryKey: ["strategic-dama-overrides"],
    queryFn: async (): Promise<DamaOverride[]> => {
      const overrides: DamaOverride[] = [];

      // 1) Lectura 1ero — ATAL_02 (salida), Manizales, categoria Total, grado Primero
      const { data: atal, error: atalErr } = await (ecosistema as any)
        .from("datos_maestros")
        .select("anio, valor")
        .eq("cod_indicador", "ATAL_02")
        .eq("cod_entidad", MANIZALES_COD)
        .ilike("categoria", "total")
        .eq("categoria_2", "Primero");
      if (atalErr) throw atalErr;
      (atal ?? []).forEach((r: any) => {
        if (r.valor === null) return;
        overrides.push({
          keyword: "Lectura 1ero",
          value: Number(r.valor),
          year: Number(r.anio),
          codIndicador: "ATAL_02",
        });
      });

      // 2) Egresados UTC ocupados — MLJ_02, suma de categorías vinculadas
      const { data: mlj, error: mljErr } = await (ecosistema as any)
        .from("datos_maestros")
        .select("anio, valor")
        .eq("cod_indicador", "MLJ_02")
        .eq("cod_entidad", MANIZALES_COD)
        .in("categoria", ["Estudiando y trabajando", "Solo trabajando", "Solo estudiando"]);
      if (mljErr) throw mljErr;
      const mljByYear = new Map<number, number>();
      (mlj ?? []).forEach((r: any) => {
        const y = Number(r.anio);
        mljByYear.set(y, (mljByYear.get(y) ?? 0) + Number(r.valor ?? 0));
      });
      mljByYear.forEach((value, year) =>
        overrides.push({ keyword: "Egresados UTC ocupados", value, year, codIndicador: "MLJ_02" })
      );

      // 3) Beneficiarios Spin Off — GP_02, categoría Formare (spin off) únicamente
      const { data: gp, error: gpErr } = await (ecosistema as any)
        .from("datos_maestros")
        .select("anio, valor")
        .eq("cod_indicador", "GP_02")
        .eq("categoria", "Formare");
      if (gpErr) throw gpErr;
      const gpByYear = new Map<number, number>();
      (gp ?? []).forEach((r: any) => {
        const y = Number(r.anio);
        gpByYear.set(y, (gpByYear.get(y) ?? 0) + Number(r.valor ?? 0));
      });
      gpByYear.forEach((value, year) =>
        overrides.push({ keyword: "Beneficiarios Spin Off", value, year, codIndicador: "GP_02" })
      );

      return overrides;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export const DAMA_STRATEGIC_KEYWORDS = [
  "Lectura 1ero",
  "Egresados UTC ocupados",
  "Beneficiarios Spin Off",
];
