GRANT SELECT ON public.bd_catalogo_entidades TO anon;
GRANT SELECT ON public.bd_catalogo_indicadores TO anon;

DROP POLICY IF EXISTS "Public read bd_catalogo_entidades" ON public.bd_catalogo_entidades;
CREATE POLICY "Public read bd_catalogo_entidades" ON public.bd_catalogo_entidades FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read bd_catalogo_indicadores" ON public.bd_catalogo_indicadores;
CREATE POLICY "Public read bd_catalogo_indicadores" ON public.bd_catalogo_indicadores FOR SELECT TO anon, authenticated USING (true);