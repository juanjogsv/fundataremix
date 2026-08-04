CREATE TABLE IF NOT EXISTS public.bd_catalogo_categorias (
  cod_indicador text PRIMARY KEY,
  indicador text,
  categoria text,
  categoria_2 text,
  entidad text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bd_catalogo_categorias TO anon, authenticated;
GRANT ALL ON public.bd_catalogo_categorias TO service_role;

ALTER TABLE public.bd_catalogo_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bd_catalogo_categorias_public_read"
ON public.bd_catalogo_categorias
FOR SELECT
USING (true);

CREATE TRIGGER trg_bd_catalogo_categorias_updated
BEFORE UPDATE ON public.bd_catalogo_categorias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.catalogo_categorias AS
SELECT cod_indicador, indicador, categoria, categoria_2, entidad
FROM public.bd_catalogo_categorias;

GRANT SELECT ON public.catalogo_categorias TO anon, authenticated;