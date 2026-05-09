-- 1) Normalize labels in the master DAMA table
UPDATE public.dama_data
SET categoria_2 = 'Escuela Activa'
WHERE categoria_2 ILIKE 'escuela activa urbana';

-- 2) Recreate sync function with normalization built in
CREATE OR REPLACE FUNCTION public.sync_legacy_from_dama()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.education_indicators WHERE id IS NOT NULL;
  DELETE FROM public.mcv_indicators WHERE id IS NOT NULL;

  INSERT INTO public.education_indicators
    (seccion, indicador, descripcion, valor, unidad, departamento, municipio, year, categoria, categoria_2)
  SELECT
    c.seccion,
    c.indicador,
    c.fuente AS descripcion,
    d.valor,
    c.unidad_medida AS unidad,
    CASE WHEN length(d.cod_entidad) <= 2 THEN e.entidad
         WHEN length(d.cod_entidad) = 5 THEN
              (SELECT entidad FROM public.dama_entities WHERE cod_entidad = substring(d.cod_entidad,1,length(d.cod_entidad)-3))
         ELSE e.entidad END AS departamento,
    CASE WHEN length(d.cod_entidad) = 5 THEN e.entidad ELSE NULL END AS municipio,
    d.anio AS year,
    COALESCE(NULLIF(d.categoria,''), 'Total') AS categoria,
    CASE WHEN d.categoria_2 ILIKE 'escuela activa urbana' THEN 'Escuela Activa'
         ELSE d.categoria_2 END AS categoria_2
  FROM public.dama_data d
  JOIN public.dama_catalog c ON c.cod_indicador = d.cod_indicador
  LEFT JOIN public.dama_entities e ON e.cod_entidad = d.cod_entidad
  WHERE c.dimension = 'Educación';

  INSERT INTO public.mcv_indicators
    (base, seccion, cod_indicador, indicador, categoria, cod_entidad, entidad, dato, year, periodicidad, fuente, unidad_medida)
  SELECT
    'Contexto socioeconómico' AS base,
    CASE
      WHEN d.cod_indicador LIKE 'POB_%' THEN 'Demografía'
      WHEN d.cod_indicador IN ('CV_01','CV_02','CV_03') THEN 'Pobreza'
      WHEN d.cod_indicador IN ('CV_04','CV_05') THEN 'Salud'
      WHEN d.cod_indicador LIKE 'ML_%' OR d.cod_indicador LIKE 'MLJ_%' THEN 'Mercado laboral comparativo'
      WHEN d.cod_indicador LIKE 'ECO_%' THEN 'Competitividad'
      ELSE c.seccion
    END AS seccion,
    d.cod_indicador,
    c.indicador,
    COALESCE(NULLIF(d.categoria,''), 'Total') AS categoria,
    d.cod_entidad,
    e.entidad,
    d.valor AS dato,
    d.anio AS year,
    c.periodicidad,
    c.fuente,
    c.unidad_medida
  FROM public.dama_data d
  JOIN public.dama_catalog c ON c.cod_indicador = d.cod_indicador
  LEFT JOIN public.dama_entities e ON e.cod_entidad = d.cod_entidad
  WHERE c.dimension = 'Contexto socioeconómico';
END;
$function$;

-- 3) Run the sync now
SELECT public.sync_legacy_from_dama();