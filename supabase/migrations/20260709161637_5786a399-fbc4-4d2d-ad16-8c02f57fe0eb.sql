
-- Vistas con nombres del Ecosistema apuntando a las tablas caché locales.
CREATE OR REPLACE VIEW public.datos_maestros AS
SELECT cod_indicador, categoria, categoria_2, cod_entidad, fecha_actualizacion, valor, anio
FROM public.bd_datos_cache;

CREATE OR REPLACE VIEW public.catalogo_indicadores AS
SELECT cod_indicador, indicador, dimension, seccion, periodicidad, fuente, unidad_medida
FROM public.bd_catalogo_indicadores;

CREATE OR REPLACE VIEW public.catalogo_entidades AS
SELECT cod_entidad, entidad
FROM public.bd_catalogo_entidades;

GRANT SELECT ON public.datos_maestros TO anon, authenticated, service_role;
GRANT SELECT ON public.catalogo_indicadores TO anon, authenticated, service_role;
GRANT SELECT ON public.catalogo_entidades TO anon, authenticated, service_role;
