
-- 1. Tabla de datos operativos (espejo de datos_maestros)
CREATE TABLE public.bd_datos_cache (
  id bigserial PRIMARY KEY,
  cod_indicador text NOT NULL,
  categoria text,
  categoria_2 text,
  cod_entidad text NOT NULL,
  fecha_actualizacion text,
  valor numeric,
  anio integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bd_datos_cache_cod_indicador ON public.bd_datos_cache(cod_indicador);
CREATE INDEX idx_bd_datos_cache_cod_entidad ON public.bd_datos_cache(cod_entidad);
CREATE INDEX idx_bd_datos_cache_anio ON public.bd_datos_cache(anio);

GRANT SELECT ON public.bd_datos_cache TO anon, authenticated;
GRANT ALL ON public.bd_datos_cache TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.bd_datos_cache_id_seq TO service_role;

ALTER TABLE public.bd_datos_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bd_datos_cache readable by everyone"
  ON public.bd_datos_cache FOR SELECT
  USING (true);

-- 2. Catálogo de indicadores
CREATE TABLE public.bd_catalogo_indicadores (
  cod_indicador text PRIMARY KEY,
  indicador text,
  dimension text,
  seccion text,
  periodicidad text,
  fuente text,
  unidad_medida text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bd_catalogo_indicadores TO anon, authenticated;
GRANT ALL ON public.bd_catalogo_indicadores TO service_role;

ALTER TABLE public.bd_catalogo_indicadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bd_catalogo_indicadores readable by everyone"
  ON public.bd_catalogo_indicadores FOR SELECT
  USING (true);

-- 3. Catálogo de entidades
CREATE TABLE public.bd_catalogo_entidades (
  cod_entidad text PRIMARY KEY,
  entidad text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bd_catalogo_entidades TO anon, authenticated;
GRANT ALL ON public.bd_catalogo_entidades TO service_role;

ALTER TABLE public.bd_catalogo_entidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bd_catalogo_entidades readable by everyone"
  ON public.bd_catalogo_entidades FOR SELECT
  USING (true);

-- 4. Metadatos de sincronización
CREATE TABLE public.bd_sync_meta (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_file_id text,
  last_file_name text,
  last_sync_at timestamptz,
  rows_ingested integer,
  status text,
  error_message text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.bd_sync_meta (id, status) VALUES (1, 'never_synced')
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.bd_sync_meta TO anon, authenticated;
GRANT ALL ON public.bd_sync_meta TO service_role;

ALTER TABLE public.bd_sync_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bd_sync_meta readable by everyone"
  ON public.bd_sync_meta FOR SELECT
  USING (true);
