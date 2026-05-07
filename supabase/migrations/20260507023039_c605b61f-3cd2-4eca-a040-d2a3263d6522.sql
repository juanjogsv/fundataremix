CREATE OR REPLACE FUNCTION public.sync_legacy_from_dama()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Limpieza segura: algunos entornos bloquean borrados sin condición explícita.
  DELETE FROM public.education_indicators WHERE id IS NOT NULL;
  DELETE FROM public.mcv_indicators WHERE id IS NOT NULL;

  -- Educación: indicadores cuya dimensión DAMA es 'Educación'
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
    d.categoria_2
  FROM public.dama_data d
  JOIN public.dama_catalog c ON c.cod_indicador = d.cod_indicador
  LEFT JOIN public.dama_entities e ON e.cod_entidad = d.cod_entidad
  WHERE c.dimension = 'Educación';

  -- MCV: dimensión 'Contexto socioeconómico', remapeando seccion al nombre que usa el frontend
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
$$;

GRANT EXECUTE ON FUNCTION public.sync_legacy_from_dama() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_legacy_from_dama() FROM anon, public;